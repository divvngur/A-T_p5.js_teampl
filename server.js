const express = require('express');
const path = require('path');
const app = express();
const http = require('http').createServer(app);

// Socket.IO with CORS for cloud deployment
const io = require('socket.io')(http, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// === IMPORTANT: Routes MUST come before static middleware ===

// Root (/) → original SPA with all menus (intro, main, multiplayer, etc.)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// /multiplayer → p5 multiplayer game client (public/multiplayer.html)
app.get('/multiplayer', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'multiplayer.html'));
});

// /single → original SPA (same as root for now)
app.get('/single', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// === Static file serving (after routes) ===
// Serve source and styles for the single-player SPA
app.use('/src', express.static(path.join(__dirname, 'src')));
app.use('/styles', express.static(path.join(__dirname, 'src', 'styles')));

// Serve static files from public (sketch.js, etc.)
app.use(express.static('public', { 
  index: false // Don't auto-serve index.html
}));

// --- Room management ---
let NEXT_ROOM_ID = 1;
const ROOMS = new Map();

function createRoom(name) {
  const id = NEXT_ROOM_ID++;
  const room = {
    id,
    name: name || `Room ${id}`,
    players: [],
    started: false,
    roles: { PIGEON: null, TARGET: null },
    calibrated: { PIGEON: false, TARGET: false }
  };
  ROOMS.set(id, room);
  return room;
}

function removeSocketFromRoom(socket) {
  const rid = socket.currentRoom;
  if (!rid) return;
  const room = ROOMS.get(rid);
  if (!room) return;
  room.players = room.players.filter(id => id !== socket.id);
  // release roles
  if (room.roles.PIGEON === socket.id) room.roles.PIGEON = null;
  if (room.roles.TARGET === socket.id) room.roles.TARGET = null;
  room.calibrated.PIGEON = false;
  room.calibrated.TARGET = false;
  socket.leave(`room-${rid}`);
  socket.currentRoom = null;
  if (room.players.length === 0) {
    ROOMS.delete(rid);
  }
}

function broadcastRoomList() {
  const list = Array.from(ROOMS.values()).map(r => ({ id: r.id, name: r.name, players: r.players.length, started: r.started }));
  io.emit('roomList', list);
}

function broadcastRoomState(room) {
  console.log(`[ROOM STATE] Room ${room.id}: ${room.players.length} players, roles: PIGEON=${room.roles.PIGEON ? '✓' : '✗'} TARGET=${room.roles.TARGET ? '✓' : '✗'}`);
  
  io.to(`room-${room.id}`).emit('roomState', {
    id: room.id,
    players: room.players.length,
    roles: {
      pigeonTaken: room.roles.PIGEON !== null,
      targetTaken: room.roles.TARGET !== null
    },
    calibrated: room.calibrated,
    started: room.started
  });
  // Also broadcast legacy events for client compatibility
  io.to(`room-${room.id}`).emit('roleStatus', {
    pigeonTaken: room.roles.PIGEON !== null,
    targetTaken: room.roles.TARGET !== null
  });
  io.to(`room-${room.id}`).emit('calibrationStatus', {
    PIGEON: room.calibrated.PIGEON,
    TARGET: room.calibrated.TARGET
  });
}

io.on('connection', (socket) => {
  console.log('유저 접속:', socket.id);

  // send current room list on connect
  broadcastRoomList();

  socket.on('listRooms', () => {
    broadcastRoomList();
  });

  socket.on('createRoom', (name) => {
    const room = createRoom(name);
    console.log('room created', room.id, room.name);
    broadcastRoomList();
  });

  socket.on('joinRoom', (id, cb) => {
    console.log(`\n[JOIN] ${socket.id} attempting to join room: ${id}`);
    
    const room = ROOMS.get(Number(id));
    if (!room) {
      console.log(`  ❌ Room not found: ${id}`);
      return cb && cb({ ok: false, err: 'not_found' });
    }
    if (room.players.length >= 2) {
      console.log(`  ❌ Room full: ${room.players.length}/2`);
      return cb && cb({ ok: false, err: 'full' });
    }

    room.players.push(socket.id);
    socket.currentRoom = room.id;
    socket.join(`room-${room.id}`);
    console.log(`  ✅ Joined! Room ${room.id}: ${room.players.length} players`);

    broadcastRoomList();
    broadcastRoomState(room);

    cb && cb({ ok: true, room: { id: room.id, name: room.name } });
  });

  socket.on('leaveRoom', () => {
    const rid = socket.currentRoom;
    if (!rid) return;
    const room = ROOMS.get(rid);
    removeSocketFromRoom(socket);
    if (room) {
      broadcastRoomList();
      if (room.players.length > 0) broadcastRoomState(room);
    } else {
      broadcastRoomList();
    }
  });

  socket.on('selectRole', (role) => {
    console.log(`\n[ROLE] ${socket.id} selecting role: ${role}`);
    
    const rid = socket.currentRoom;
    if (!rid) {
      console.log(`  ❌ No currentRoom set!`);
      return socket.emit('roleAssigned', null);
    }
    
    const room = ROOMS.get(rid);
    if (!room) {
      console.log(`  ❌ Room ${rid} not found!`);
      return socket.emit('roleAssigned', null);
    }
    
    if (socket.role) {
      console.log(`  ⚠️ Already has role: ${socket.role}`);
      socket.emit('roleAssigned', socket.role);
      return;
    }
    
    if (role !== 'PIGEON' && role !== 'TARGET') {
      console.log(`  ❌ Invalid role: ${role}`);
      return;
    }
    
    if (room.roles[role]) {
      console.log(`  ❌ ${role} already taken!`);
      broadcastRoomState(room);
      return;
    }
    
    room.roles[role] = socket.id;
    socket.role = role;
    console.log(`  ✅ Assigned ${role} to room ${rid}`);
    socket.emit('roleAssigned', role);
    broadcastRoomState(room);

    if (room.roles.PIGEON && room.roles.TARGET) {
      console.log(`  🎮 Both players ready! Starting game...`);
      room.calibrated.PIGEON = false;
      room.calibrated.TARGET = false;
      broadcastRoomState(room);
      io.to(`room-${room.id}`).emit('gameReady');
    }
  });

  socket.on('calibrationComplete', () => {
    const rid = socket.currentRoom;
    if (!rid) return;
    const room = ROOMS.get(rid);
    if (!room) return;
    const role = socket.role;
    if (!role) return;
    if (!room.roles.PIGEON || !room.roles.TARGET) return;

    room.calibrated[role] = true;
    console.log(`${role} in room ${room.id} calibration complete`);
    broadcastRoomState(room);

    if (room.calibrated.PIGEON && room.calibrated.TARGET) {
      console.log('both calibrated in room', room.id);
      io.to(`room-${room.id}`).emit('gameStart');
    }
  });

  socket.on('restartToRoleSelection', () => {
    const rid = socket.currentRoom;
    if (!rid) return;
    const room = ROOMS.get(rid);
    if (!room) return;
    room.roles.PIGEON = null;
    room.roles.TARGET = null;
    room.calibrated.PIGEON = false;
    room.calibrated.TARGET = false;
    room.started = false;
    for (const sid of room.players) {
      const s = io.sockets.sockets.get(sid);
      if (s) s.role = null;
    }
    broadcastRoomState(room);
    io.to(`room-${room.id}`).emit('goRoleSelection');
  });

  socket.on('hostSync', (state) => {
    const rid = socket.currentRoom;
    if (!rid) return;
    socket.to(`room-${rid}`).emit('gameStateUpdate', state);
  });
  socket.on('targetSync', (data) => {
    const rid = socket.currentRoom;
    if (!rid) return;
    socket.to(`room-${rid}`).emit('targetDataUpdate', data);
  });
  socket.on('faceImageSync', (base64) => {
    const rid = socket.currentRoom;
    if (!rid) return;
    socket.to(`room-${rid}`).emit('faceImageSync', base64);
  });
  socket.on('gameOverTrigger', (result) => {
    const rid = socket.currentRoom;
    if (!rid) return;
    io.to(`room-${rid}`).emit('gameOverSync', result);
  });

  socket.on('disconnect', () => {
    console.log('유저 퇴장:', socket.id);
    const rid = socket.currentRoom;
    let roleLost = false;
    if (rid) {
      const room = ROOMS.get(rid);
      if (room) {
        if (room.roles.PIGEON === socket.id) { room.roles.PIGEON = null; roleLost = true; }
        if (room.roles.TARGET === socket.id) { room.roles.TARGET = null; roleLost = true; }
      }
    }
    removeSocketFromRoom(socket);
    broadcastRoomList();
    if (rid) {
      const room = ROOMS.get(rid);
      if (room) broadcastRoomState(room);
      if (roleLost) io.to(`room-${rid}`).emit('opponentLeft');
    }
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`🚀 서버 열림: http://localhost:${PORT}`);
});