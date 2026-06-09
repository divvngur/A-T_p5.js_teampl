let socket;
let myRole = 'WAITING';
let myCurrentRoom = null;

const GAME_W = 1920;
const GAME_H = 1080;
const CAM_W = 640;
const CAM_H = 360;

let video;
let facemesh;
let predictions = [];

let selfieSegmentation;
let segMaskCanvas;
let segReady = false;
let modelsLoaded = 0;

let gameState = 'LOADING';
let calibrationTimer = 0;
let guideX, guideY;

let player;
let poopCooldown = 0;

let rolesStatus = { pigeonTaken: false, targetTaken: false };
let syncStatus = { PIGEON: false, TARGET: false };
let lastSyncEmitMs = 0;

let gameResult = '';
let opponentFaceImg = new Image();

let tempCanvas;
let tCtx;
let faceSendSize = 100;

let uiHit = {};
let clouds = [];

// ── 밝고 쨍한 테마 ──────────────────────────────────
const THEME = {
  sky:        [135, 206, 250],
  card:       [255, 255, 255],
  textDark:   [40,  40,  40 ],
  textSub:    [120, 120, 120],
  btnPrimary: [250, 90,  150],
  btnHover:   [255, 120, 170],
  success:    [80,  200, 120],
  danger:     [255, 80,  80 ],
  warning:    [255, 180, 50 ]
};

let globalState = {
  pigeonX: GAME_W / 2,
  items: [],
  splatters: [],
  eggsEaten: 0,
  poopHits: 0
};

let targetData = {
  x: GAME_W / 2, y: GAME_H * 0.8,
  mouthX: GAME_W / 2, mouthY: GAME_H * 0.8 + 20,
  mouthOpen: false, mouthRadius: 20, faceWidth: 150
};

// ══════════════════════════════════════════════════════
//  SETUP
// ══════════════════════════════════════════════════════
function setup() {
  let canvasMain = createCanvas(GAME_W, GAME_H);
  canvasMain.parent('game-screen');
  canvasMain.id('game-canvas');
  canvasMain.style('object-fit', 'contain');
  frameRate(60);
  pixelDensity(max(1, window.devicePixelRatio || 1));
  textFont('Jua');

  guideX = width / 2;
  guideY = height * 0.75;

  player = new Player();
  initClouds();

  tempCanvas = document.createElement('canvas');
  tempCanvas.width  = faceSendSize;
  tempCanvas.height = faceSendSize;
  tCtx = tempCanvas.getContext('2d', { willReadFrequently: true });

  try {
    const serverUrl = (typeof window !== 'undefined' && window.SOCKET_SERVER)
      ? window.SOCKET_SERVER : undefined;
    socket = serverUrl ? io(serverUrl) : io();
  } catch (e) {
    socket = io();
  }

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket.id);
    const params = new URLSearchParams(window.location.search);
    const rid = params.get('room');
    if (rid) {
      socket.emit('joinRoom', Number(rid), (res) => {
        if (!res || !res.ok) { myCurrentRoom = null; return; }
        myCurrentRoom = res.room.id;
      });
    }
  });

  socket.on('roleStatus',        (status) => { rolesStatus = status; });
  socket.on('calibrationStatus', (status) => {
    syncStatus = status;
    if (gameState === 'WAITING_SYNC' && syncStatus.PIGEON && syncStatus.TARGET)
      gameState = 'PLAYING';
  });
  socket.on('goRoleSelection', () => {
    myRole = 'WAITING'; myCurrentRoom = null; gameResult = '';
    resetGameState(); syncStatus = { PIGEON: false, TARGET: false };
    opponentFaceImg.src = ''; gameState = 'ROLE_SELECTION';
  });
  socket.on('roleAssigned', (role) => { myRole = role; gameState = 'WAITING_OPPONENT'; });
  socket.on('gameReady', () => {
    resetGameState(); syncStatus = { PIGEON: false, TARGET: false };
    if (myRole !== 'WAITING') gameState = 'MAIN';
  });
  socket.on('gameStart', () => { gameState = 'PLAYING'; syncStatus = { PIGEON: true, TARGET: true }; });
  socket.on('opponentLeft', () => {
    if (gameState === 'GAME_OVER') {
      myRole = 'WAITING'; myCurrentRoom = null; gameResult = '';
      resetGameState(); syncStatus = { PIGEON: false, TARGET: false };
      gameState = 'ROLE_SELECTION'; return;
    }
    if (['PLAYING','MAIN','CALIBRATE','WAITING_SYNC'].includes(gameState)) {
      gameState = 'WAITING_OPPONENT';
      resetGameState(); syncStatus = { PIGEON: false, TARGET: false };
    }
  });
  socket.on('gameOverSync', (result) => { gameResult = result; gameState = 'GAME_OVER'; });

  video = createCapture({ audio: false, video: { width: CAM_W, height: CAM_H } }, videoReady);
  video.size(CAM_W, CAM_H);
  video.hide();

  facemesh = ml5.facemesh(video, () => { modelsLoaded++; checkAllModelsReady(); });
  facemesh.on('predict', results => { predictions = results; });

  segMaskCanvas = document.createElement('canvas');
  segMaskCanvas.width  = CAM_W;
  segMaskCanvas.height = CAM_H;

  selfieSegmentation = new SelfieSegmentation({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
  });
  selfieSegmentation.setOptions({ modelSelection: 1, selfieMode: false });
  selfieSegmentation.onResults(onSegResults);

  socket.on('targetDataUpdate', (data)  => { if (myRole === 'PIGEON') targetData  = data;  });
  socket.on('gameStateUpdate',  (state) => { if (myRole === 'TARGET') globalState = state; });
  socket.on('faceImageSync',    (base64) => { opponentFaceImg.src = base64; });
}

function resetGameState() {
  globalState = { pigeonX: GAME_W / 2, items: [], splatters: [], eggsEaten: 0, poopHits: 0 };
  poopCooldown = 0;
}

// ══════════════════════════════════════════════════════
//  배경 & 구름
// ══════════════════════════════════════════════════════
function initClouds() {
  clouds = [];
  for (let i = 0; i < 15; i++) {
    clouds.push({
      x: random(width), y: random(height * 0.4),
      w: random(100, 250), h: random(40, 80),
      vx: random(0.3, 1.2)
    });
  }
}

function drawSkyBg() {
  // 하늘색 그라디언트
  for (let y = 0; y < height; y += 4) {
    let t = y / height;
    let r = lerp(135, 224, t);
    let g = lerp(206, 247, t);
    let b = lerp(250, 255, t);
    noStroke(); fill(r, g, b); rect(0, y, width, 4);
  }
}

function drawVibrantBg() {
  for (let y = 0; y < height; y += 5) {
    let t = y / height;
    let r, g, b;
    if (t < 0.5) {
      let st = t * 2;
      r = lerp(40, 0, st); g = lerp(100, 220, st); b = lerp(255, 200, st);
    } else {
      let st = (t - 0.5) * 2;
      r = lerp(0, 240, st); g = lerp(220, 230, st); b = lerp(200, 20, st);
    }
    noStroke(); fill(r, g, b); rect(0, y, width, 5);
  }
}

function drawClouds() {
  noStroke();
  fill(255, 255, 255, 200);
  for (let c of clouds) {
    c.x += c.vx * (deltaTime / 16.67);
    if (c.x > width + c.w) c.x = -c.w;
    ellipse(c.x, c.y, c.w, c.h);
    ellipse(c.x + c.w * 0.25, c.y - c.h * 0.3, c.w * 0.65, c.h * 0.75);
  }
}

// ══════════════════════════════════════════════════════
//  UI 컴포넌트
// ══════════════════════════════════════════════════════
function drawLightCard(cx, cy, w, h, alpha = 245, radius = 24) {
  push();
  rectMode(CENTER);
  drawingContext.shadowColor    = 'rgba(0,0,0,0.13)';
  drawingContext.shadowBlur     = 18;
  drawingContext.shadowOffsetY  = 6;
  fill(255, 255, 255, alpha);
  noStroke();
  rect(cx, cy, w, h, radius);
  drawingContext.shadowBlur    = 0;
  drawingContext.shadowOffsetY = 0;
  pop();
}

function pointInCenteredRect(px, py, b) {
  return px >= b.cx - b.w / 2 && px <= b.cx + b.w / 2 &&
         py >= b.cy - b.h / 2 && py <= b.cy + b.h / 2;
}

function drawButton(cx, cy, w, h, label, enabled = true, colorType = 'primary') {
  let hover = enabled && pointInCenteredRect(mouseX, mouseY, { cx, cy, w, h });
  let s = hover ? 1.04 : 1.0;

  push();
  translate(cx, cy); scale(s); rectMode(CENTER); noStroke();

  let col = colorType === 'danger'  ? THEME.danger  :
            colorType === 'success' ? THEME.success :
            THEME.btnPrimary;

  drawingContext.shadowColor   = 'rgba(0,0,0,0.22)';
  drawingContext.shadowBlur    = 12;
  drawingContext.shadowOffsetY = 5;
  fill(col[0], col[1], col[2], enabled ? 255 : 100);
  rect(0, 0, w, h, 32);
  drawingContext.shadowBlur    = 0;
  drawingContext.shadowOffsetY = 0;

  fill(255, enabled ? 255 : 160);
  textAlign(CENTER, CENTER); textSize(32); textStyle(BOLD);
  text(label, 0, 2); textStyle(NORMAL);
  pop();

  return { cx, cy, w, h, enabled };
}

function drawScreenTitle(main, sub) {
  textAlign(CENTER, CENTER);
  drawingContext.shadowColor   = 'rgba(0,0,0,0.28)';
  drawingContext.shadowBlur    = 12;
  drawingContext.shadowOffsetY = 4;
  fill(255); textStyle(BOLD); textSize(84);
  text(main, width / 2, 130);
  drawingContext.shadowBlur    = 0;
  drawingContext.shadowOffsetY = 0;
  textStyle(NORMAL); fill(255, 255, 255, 220); textSize(32);
  text(sub, width / 2, 210);
}

// ══════════════════════════════════════════════════════
//  카메라 & 세그멘테이션
// ══════════════════════════════════════════════════════
function videoReady() { sendFrameToSegmentation(); }

async function sendFrameToSegmentation() {
  if (video.elt.readyState >= 2)
    await selfieSegmentation.send({ image: video.elt });
  setTimeout(sendFrameToSegmentation, 33);
}

function onSegResults(results) {
  if (!segReady) { segReady = true; modelsLoaded++; checkAllModelsReady(); }
  let ctx = segMaskCanvas.getContext('2d', { willReadFrequently: true });
  ctx.save();
  ctx.clearRect(0, 0, CAM_W, CAM_H);
  ctx.drawImage(results.segmentationMask, 0, 0, CAM_W, CAM_H);
  ctx.globalCompositeOperation = 'source-in';
  ctx.drawImage(results.image, 0, 0, CAM_W, CAM_H);
  ctx.restore();
}

function checkAllModelsReady() {
  if (modelsLoaded >= 2) gameState = 'ROLE_SELECTION';
}

// ══════════════════════════════════════════════════════
//  DRAW 메인 루프
// ══════════════════════════════════════════════════════
function draw() {
  uiHit = {};
  switch (gameState) {
    case 'LOADING':          drawLoadingScreen();      break;
    case 'ROLE_SELECTION':   drawRoleSelectionScreen(); break;
    case 'WAITING_OPPONENT': drawWaitingScreen();       break;
    case 'MAIN':             drawMainScreen();          break;
    case 'CALIBRATE':        drawCalibrateScreen();     break;
    case 'WAITING_SYNC':     drawWaitingSyncScreen();   break;
    case 'PLAYING':          playGame();                break;
    case 'GAME_OVER':        drawGameOverScreen();      break;
  }
}

// ══════════════════════════════════════════════════════
//  게임 플레이
// ══════════════════════════════════════════════════════
function playGame() {
  drawSkyBg();
  drawClouds();
  noTint(); // tint 잔재 방지

  if (poopCooldown > 0) poopCooldown--;

  if (predictions.length > 0) {
    player.update(predictions[0].scaledMesh);
    if (frameCount % 15 === 0) sendMyFaceImage();

    if (myRole === 'PIGEON') {
      globalState.pigeonX = lerp(globalState.pigeonX, player.x, 0.3);
      if (player.mouthOpen && poopCooldown === 0) { dropItem(); poopCooldown = 20; }
      if (globalState.eggsEaten >= 5) socket.emit('gameOverTrigger', 'TARGET_WIN');
      else if (globalState.poopHits >= 5) socket.emit('gameOverTrigger', 'PIGEON_WIN');
    } else if (myRole === 'TARGET') {
      targetData = {
        x: player.x, y: player.y,
        mouthX: player.mouthX, mouthY: player.mouthY,
        mouthOpen: player.mouthOpen, mouthRadius: player.mouthRadius,
        faceWidth: player.faceScreenWidth
      };
      if (frameCount % 2 === 0) socket.emit('targetSync', targetData);
    }
  }

  if (myRole === 'PIGEON') {
    updatePhysics();
    if (frameCount % 2 === 0) socket.emit('hostSync', globalState);
  }

  drawSplatters();

  if (myRole === 'TARGET') {
    player.show('PLAYING');
    drawPigeonAvatar(globalState.pigeonX);
  } else if (myRole === 'PIGEON') {
    drawTargetAvatar();
    drawPigeonAvatar(globalState.pigeonX);
  }

  drawItems();
  drawGameUI();
}

function sendMyFaceImage() {
  if (!segReady || player.faceWidth <= 0) return;
  tCtx.clearRect(0, 0, faceSendSize, faceSendSize);
  let cropBase = max(player.faceWidth, player.faceHeight) * 1.3;
  let sx = player.faceCenterX - cropBase / 2;
  let sy = player.faceCenterY - cropBase * 0.6;
  tCtx.save();
  tCtx.translate(faceSendSize, 0); tCtx.scale(-1, 1);
  tCtx.beginPath();
  tCtx.arc(faceSendSize / 2, faceSendSize / 2, faceSendSize / 2, 0, Math.PI * 2);
  tCtx.clip();
  tCtx.drawImage(segMaskCanvas, sx, sy, cropBase, cropBase, 0, 0, faceSendSize, faceSendSize);
  tCtx.restore();
  socket.emit('faceImageSync', tempCanvas.toDataURL('image/webp', 0.3));
}

function dropItem() {
  let type = random() > 0.8 ? 'EGG' : 'POOP';
  let x = player && player.x ? player.x : globalState.pigeonX;
  globalState.items.push({ x, y: 160, type });
}

function updatePhysics() {
  for (let i = globalState.items.length - 1; i >= 0; i--) {
    let item = globalState.items[i];
    item.y += 23 * (deltaTime / 16.67);

    let dMouth = dist(item.x, item.y, targetData.mouthX, targetData.mouthY);
    let dFace  = dist(item.x, item.y, targetData.x,      targetData.y);
    let headHitRadius  = max(targetData.faceWidth, 120) * 0.45;
    let mouthHitRadius = max(targetData.mouthRadius, 26) * 1.5;

    if (item.type === 'EGG') {
      if (dMouth < mouthHitRadius && targetData.mouthOpen) {
        globalState.eggsEaten = min(globalState.eggsEaten + 1, 5);
        globalState.items.splice(i, 1); continue;
      }
    } else if (item.type === 'POOP') {
      if (dFace < headHitRadius) {
        globalState.poopHits = min(globalState.poopHits + 1, 5);
        globalState.splatters.push({ x: item.x, y: item.y, size: random(150, 350) });
        globalState.items.splice(i, 1); continue;
      }
    }
    if (item.y > GAME_H + 50) globalState.items.splice(i, 1);
  }
}

// ══════════════════════════════════════════════════════
//  플레이어 클래스
// ══════════════════════════════════════════════════════
class Player {
  constructor() {
    this.x = width / 2; this.y = height / 2;
    this.mouthX = width / 2; this.mouthY = height / 2 + 20;
    this.mouthOpen = false; this.mouthRadius = width * 0.03;
    this.faceWidth = 0; this.faceHeight = 0;
    this.faceCenterX = 0; this.faceCenterY = 0;
    this.faceScreenWidth = 0; this.lockedDisplaySize = 0;
  }

  update(keypoints) {
    let minX = CAM_W, minY = CAM_H, maxX = 0, maxY = 0;
    for (let i = 0; i < keypoints.length; i++) {
      let px = keypoints[i][0], py = keypoints[i][1];
      if (px < minX) minX = px; if (px > maxX) maxX = px;
      if (py < minY) minY = py; if (py > maxY) maxY = py;
    }
    this.faceWidth   = maxX - minX;
    this.faceHeight  = maxY - minY;
    this.faceCenterX = (minX + maxX) * 0.5;
    this.faceCenterY = (minY + maxY) * 0.5;

    this.x = lerp(this.x, map(this.faceCenterX, 0, CAM_W, width,  0), 0.18);
    this.y = lerp(this.y, map(this.faceCenterY, 0, CAM_H, 0, height), 0.18);
    this.faceScreenWidth = this.faceWidth * width / CAM_W;

    let targetSize = this.faceScreenWidth * 0.9;
    this.lockedDisplaySize = this.lockedDisplaySize <= 0
      ? targetSize : lerp(this.lockedDisplaySize, targetSize, 0.03);

    let ul = keypoints[13], ll = keypoints[14];
    this.mouthX = lerp(this.mouthX, map((ul[0]+ll[0])/2, 0, CAM_W, width, 0), 0.18);
    this.mouthY = lerp(this.mouthY, map((ul[1]+ll[1])/2, 0, CAM_H, 0, height), 0.18);

    let md = dist(ul[0], ul[1], ll[0], ll[1]);
    this.mouthOpen   = md > 6;
    this.mouthRadius = map(constrain(md, 3, 20), 3, 20, 20, 50);
  }

  show(mode) {
    if (segReady) this._drawFaceOnly();
    let pulse = sin(frameCount * 0.15) * 4;
    if (this.mouthOpen) {
      fill(250, 90, 150, mode === 'CALIBRATE' ? 120 : 80);
      noStroke();
      ellipse(this.mouthX, this.mouthY, this.mouthRadius * 3 + pulse, this.mouthRadius * 3 + pulse);
      if (mode === 'CALIBRATE') {
        noFill(); stroke(250, 90, 150, 200); strokeWeight(2);
        ellipse(this.mouthX, this.mouthY, this.mouthRadius * 3 + pulse, this.mouthRadius * 3 + pulse);
        noStroke();
      }
    } else {
      if (mode === 'CALIBRATE') {
        noFill(); stroke(250, 90, 150, 150); strokeWeight(3);
        ellipse(this.mouthX, this.mouthY, 30, 30); noStroke();
      } else {
        fill(250, 90, 150, 100); noStroke();
        ellipse(this.mouthX, this.mouthY, 15, 15);
      }
    }
  }

  _drawFaceOnly() {
    if (!segReady || this.faceWidth <= 0) return;
    let cropBase = max(this.faceWidth, this.faceHeight) * 1.3;
    let sx = this.faceCenterX - cropBase / 2;
    let sy = this.faceCenterY - cropBase * 0.6;
    let drawSize = this.lockedDisplaySize;
    push();
    translate(width, 0); scale(-1, 1);
    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.arc(width - this.x, this.y, drawSize * 0.52, 0, TWO_PI);
    drawingContext.clip();
    drawingContext.drawImage(segMaskCanvas, sx, sy, cropBase, cropBase,
      width - this.x - drawSize / 2, this.y - drawSize / 2, drawSize, drawSize);
    drawingContext.restore();
    pop();
  }
}

// ══════════════════════════════════════════════════════
//  아바타 그리기
// ══════════════════════════════════════════════════════
function drawPigeonAvatar(x) {
  if (opponentFaceImg.src && myRole === 'TARGET') {
    drawingContext.drawImage(opponentFaceImg, x - 80, 60, 160, 160);
  } else if (myRole === 'PIGEON') {
    let saved = { x: player.x, y: player.y, sz: player.lockedDisplaySize };
    player.x = x; player.y = 140; player.lockedDisplaySize = 160;
    player._drawFaceOnly();
    player.x = saved.x; player.y = saved.y; player.lockedDisplaySize = saved.sz;
  } else {
    push(); textSize(140); textAlign(CENTER, CENTER);
    text('🕊️', x, 140); pop();
  }
}

function drawTargetAvatar() {
  let drawSize = max(targetData.faceWidth * 0.9, 80);
  if (opponentFaceImg.src) {
    drawingContext.drawImage(opponentFaceImg,
      targetData.x - drawSize / 2, targetData.y - drawSize / 2, drawSize, drawSize);
  } else {
    noStroke(); fill(255, 200, 200, 120);
    ellipse(targetData.x, targetData.y, targetData.faceWidth * 0.45 * 2);
  }
  if (targetData.mouthOpen) {
    fill(250, 90, 150, 80); stroke(80, 200, 120, 150); strokeWeight(2);
    let pulse = sin(frameCount * 0.2) * 4;
    ellipse(targetData.mouthX, targetData.mouthY,
      targetData.mouthRadius * 3 + pulse, targetData.mouthRadius * 3 + pulse);
    noStroke();
  } else {
    fill(250, 90, 150, 100); noStroke();
    ellipse(targetData.mouthX, targetData.mouthY, 15, 15);
  }
}

function drawItems() {
  push(); textSize(90); textAlign(CENTER, CENTER);
  for (let item of globalState.items)
    text(item.type === 'EGG' ? '🥚' : '💩', item.x, item.y);
  pop();
}

function drawSplatters() {
  noStroke();
  for (let s of globalState.splatters) {
    fill(101, 67, 33, 200);
    ellipse(s.x, s.y, s.size, s.size * 0.8);
    ellipse(s.x + 20, s.y - 10, s.size * 0.6, s.size * 0.6);
  }
}

// ══════════════════════════════════════════════════════
//  인게임 HUD
// ══════════════════════════════════════════════════════
function drawGameUI() {
  // 중앙 상단: 점수
  drawLightCard(width / 2, 60, 620, 72, 235, 30);
  fill(THEME.textDark[0]); textAlign(CENTER, CENTER); textSize(26); textStyle(BOLD);
  text(`😲 먹은 알: ${globalState.eggsEaten}/5   |   💩 맞은 똥: ${globalState.poopHits}/5`, width / 2, 62);
  textStyle(NORMAL);

  // 우측 상단: 역할
  drawLightCard(width - 175, 60, 320, 72, 235, 30);
  fill(THEME.textDark[0]); textSize(26); textStyle(BOLD);
  text(`역할: ${myRole === 'PIGEON' ? '비둘기 🕊️' : '사람 😲'}`, width - 175, 62);
  textStyle(NORMAL);

  // 비둘기 역할: 쿨타임 표시
  if (myRole === 'PIGEON') {
    drawLightCard(width / 2, 118, 340, 52, 220, 26);
    fill(THEME.textSub[0]); textSize(22);
    let coolSec = max(0, ceil(poopCooldown / 60 * 10) / 10).toFixed(1);
    text(`투척 쿨타임: ${poopCooldown > 0 ? coolSec + 's' : '준비!'}`, width / 2, 118);
  }

  // 역할 안내 (하단)
  let guideMsg = myRole === 'PIGEON'
    ? '입을 벌리면 아이템 투척! 클릭도 가능'
    : '알은 입으로 받고, 똥은 피하세요!';
  fill(255, 255, 255, 180); textSize(22); textAlign(CENTER, CENTER);
  text(guideMsg, width / 2, height - 36);
}

// ══════════════════════════════════════════════════════
//  화면들
// ══════════════════════════════════════════════════════
function drawLoadingScreen() {
  drawVibrantBg(); drawClouds();
  drawScreenTitle('입벌려! 비둘기 똥 들어간다~', 'AI 모델을 불러오는 중...');
  drawLightCard(width / 2, height / 2 + 50, 660, 270, 245, 30);

  fill(THEME.textDark[0]); textAlign(CENTER, CENTER); textSize(44); textStyle(BOLD);
  text('모델 로딩 중...', width / 2, height / 2 - 5); textStyle(NORMAL);

  let pct = constrain(modelsLoaded / 2, 0, 1);
  noStroke();
  fill(220); rect(width / 2 - 220, height / 2 + 55, 440, 26, 999);
  fill(THEME.btnPrimary[0], THEME.btnPrimary[1], THEME.btnPrimary[2]);
  rect(width / 2 - 220, height / 2 + 55, 440 * pct, 26, 999);

  fill(THEME.textSub[0]); textSize(26);
  text(`(${modelsLoaded}/2)`, width / 2, height / 2 + 112);

  push(); translate(width / 2, height / 2 + 170);
  noFill(); stroke(THEME.btnPrimary[0], THEME.btnPrimary[1], THEME.btnPrimary[2]); strokeWeight(8);
  arc(0, 0, 46, 46, frameCount * 0.08, frameCount * 0.08 + PI * 1.4);
  pop();
}

function drawRoleCard(cfg) {
  let hover = cfg.enabled && pointInCenteredRect(mouseX, mouseY, cfg);
  push(); translate(cfg.cx, cfg.cy); scale(hover ? 1.03 : 1.0);

  drawLightCard(0, 0, cfg.w, cfg.h, 245, 30);
  if (cfg.enabled) {
    noFill(); stroke(THEME.btnPrimary[0], THEME.btnPrimary[1], THEME.btnPrimary[2], 180);
    strokeWeight(4); rectMode(CENTER); rect(0, 0, cfg.w - 10, cfg.h - 10, 26);
  }

  fill(255); textAlign(CENTER, CENTER); textSize(90); text(cfg.emoji, 0, -50);
  fill(THEME.textDark[0]); textSize(42); textStyle(BOLD); text(cfg.title, 0, 30); textStyle(NORMAL);
  fill(THEME.textSub[0]); textSize(24); text(cfg.desc, 0, 80);

  if (!cfg.enabled) {
    fill(240, 240, 240, 200); rectMode(CENTER); rect(0, 0, cfg.w, cfg.h, 30);
    fill(THEME.danger[0], THEME.danger[1], THEME.danger[2]);
    textSize(34); textStyle(BOLD); text('선택 불가', 0, 0); textStyle(NORMAL);
  }
  pop();
}

function drawRoleSelectionScreen() {
  drawVibrantBg(); drawClouds();
  drawScreenTitle('역할 선택', '원하는 캐릭터를 선택하세요');

  let cy = height * 0.56, cardW = 420, cardH = 360;
  let leftX = width / 2 - 280, rightX = width / 2 + 280;

  let pCard = { cx: leftX,  cy, w: cardW, h: cardH, enabled: !rolesStatus.pigeonTaken, emoji: '🕊️', title: '비둘기', desc: '입을 벌려 똥/알 투척',  type: 'PIGEON' };
  let tCard = { cx: rightX, cy, w: cardW, h: cardH, enabled: !rolesStatus.targetTaken, emoji: '😲', title: '사람',   desc: '똥을 피하고 알을 먹기', type: 'TARGET' };

  drawRoleCard(pCard); drawRoleCard(tCard);
  uiHit.rolePigeon = pCard; uiHit.roleTarget = tCard;
}

function drawWaitingScreen() {
  drawVibrantBg(); drawClouds();
  drawScreenTitle('매칭 대기 중', '상대가 들어오면 자동으로 다음 단계로 이동합니다');
  drawLightCard(width / 2, height / 2 + 80, 860, 260, 245, 30);

  fill(THEME.textDark[0]); textAlign(CENTER, CENTER); textSize(42); textStyle(BOLD);
  text('상대방 접속을 기다리는 중...', width / 2, height / 2 + 30); textStyle(NORMAL);
  fill(THEME.textSub[0]); textSize(30);
  text(`내 역할: ${myRole === 'PIGEON' ? '비둘기 🕊️' : '사람 😲'}`, width / 2, height / 2 + 95);

  for (let i = 0; i < 3; i++) {
    let a = 90 + 130 * max(0, sin(frameCount * 0.09 - i * 0.8));
    fill(THEME.btnPrimary[0], THEME.btnPrimary[1], THEME.btnPrimary[2], a);
    ellipse(width / 2 - 54 + i * 54, height / 2 + 160, 20, 20);
  }
}

function drawMainScreen() {
  drawVibrantBg(); drawClouds();
  drawScreenTitle('게임 시작 준비', '버튼을 누른 뒤 얼굴을 가이드 박스에 맞춰주세요');
  drawLightCard(width / 2, height / 2 + 40, 1020, 300, 245, 30);

  fill(THEME.textDark[0]); textAlign(CENTER, CENTER); textSize(52); textStyle(BOLD);
  text('입벌려! 비둘기 똥 들어간다~', width / 2, height / 2 - 18); textStyle(NORMAL);
  fill(THEME.textSub[0]); textSize(30);
  text('가이드 박스에 얼굴을 맞추고 3초 유지하세요', width / 2, height / 2 + 45);

  uiHit.startBtn = drawButton(width / 2, height / 2 + 140, 360, 78, '시작하기', true, 'primary');
}

function drawCalibrateScreen() {
  background(240, 248, 255);
  // 카메라 좌우 반전
  push();
  tint(255, 220); // 약간 투명하게
  translate(width, 0); scale(-1, 1);
  image(video, 0, 0, width, height);
  pop();
  noTint(); // ← 반드시 해제

  // 밝은 오버레이
  fill(255, 255, 255, 120); noStroke(); rect(0, 0, width, height);

  if (predictions.length > 0) player.update(predictions[0].scaledMesh);
  player.show('CALIBRATE');

  let targetFaceWidth = width / 8;
  let guideW = targetFaceWidth, guideH = targetFaceWidth * 1.4;
  let sizeOk  = player.faceScreenWidth > 0 &&
                abs(player.faceScreenWidth - targetFaceWidth) < targetFaceWidth * 0.25;
  let posOk   = dist(player.x, player.y, guideX, guideY) < guideW * 0.6;
  let aligned = sizeOk && posOk && predictions.length > 0;

  aligned ? calibrationTimer += deltaTime : calibrationTimer = 0;

  if (calibrationTimer >= 3000) {
    noTint(); // 상태 전환 전 강제 해제
    gameState = 'WAITING_SYNC';
    calibrationTimer = 0; lastSyncEmitMs = 0;
    socket.emit('calibrationComplete');
    return;
  }

  // 상단 안내 카드
  drawLightCard(width / 2, 86, 800, 118, 240, 22);
  textAlign(CENTER, CENTER); fill(THEME.textDark[0]); textSize(34); textStyle(BOLD);
  text('얼굴을 가이드 박스에 맞춰 3초 유지하세요', width / 2, 68); textStyle(NORMAL);

  let remain = max(0, ceil((3000 - calibrationTimer) / 1000));
  fill(aligned ? THEME.success[0] : THEME.warning[0],
       aligned ? THEME.success[1] : THEME.warning[1],
       aligned ? THEME.success[2] : THEME.warning[2]);
  textSize(46); textStyle(BOLD);
  text(aligned ? remain : '정렬 중...', width / 2, 112); textStyle(NORMAL);

  // 가이드 박스
  rectMode(CENTER); noFill(); strokeWeight(8);
  stroke(aligned ? color(80, 200, 120, 255) : color(250, 90, 150, 230));
  rect(guideX, guideY, guideW, guideH, 30);
  noStroke(); fill(255, 255, 255, 60);
  rect(guideX, guideY, guideW * 0.95, guideH * 0.95, 26);

  // 진행 바
  if (aligned) {
    let prog = constrain(calibrationTimer / 3000, 0, 1);
    noStroke(); fill(220, 220, 220, 200);
    rect(width / 2 - 180, guideY + guideH / 2 + 30, 360, 14, 999);
    fill(THEME.success[0], THEME.success[1], THEME.success[2]);
    rect(width / 2 - 180, guideY + guideH / 2 + 30, 360 * prog, 14, 999);
  }

  rectMode(CORNER);
}

function drawWaitingSyncScreen() {
  drawVibrantBg(); drawClouds();
  drawScreenTitle('인식 완료', '상대방 인식 완료를 기다리는 중입니다');
  drawLightCard(width / 2, height / 2 + 40, 860, 320, 245, 30);

  textAlign(CENTER, CENTER); fill(THEME.textDark[0]); textSize(44); textStyle(BOLD);
  text('동기화 중...', width / 2, height / 2 - 48); textStyle(NORMAL);

  let pReady = syncStatus.PIGEON, tReady = syncStatus.TARGET;
  fill(pReady ? THEME.success[0] : THEME.textSub[0],
       pReady ? THEME.success[1] : THEME.textSub[1],
       pReady ? THEME.success[2] : THEME.textSub[2]);
  textSize(34); text(`비둘기: ${pReady ? '✅ 완료' : '⏳ 대기중'}`, width / 2, height / 2 + 20);

  fill(tReady ? THEME.success[0] : THEME.textSub[0],
       tReady ? THEME.success[1] : THEME.textSub[1],
       tReady ? THEME.success[2] : THEME.textSub[2]);
  text(`사람: ${tReady ? '✅ 완료' : '⏳ 대기중'}`, width / 2, height / 2 + 72);

  noStroke(); fill(220);
  rect(width / 2 - 220, height / 2 + 122, 440, 22, 999);
  let syncCount = (pReady ? 1 : 0) + (tReady ? 1 : 0);
  fill(THEME.btnPrimary[0], THEME.btnPrimary[1], THEME.btnPrimary[2]);
  rect(width / 2 - 220, height / 2 + 122, 440 * (syncCount / 2), 22, 999);

  if (millis() - lastSyncEmitMs > 1000) {
    socket.emit('calibrationComplete');
    lastSyncEmitMs = millis();
  }
}

function drawGameOverScreen() {
  let win = (gameResult === 'TARGET_WIN' && myRole === 'TARGET') ||
            (gameResult === 'PIGEON_WIN' && myRole === 'PIGEON');
  win ? background(180, 255, 200) : background(255, 180, 180);
  drawClouds();
  drawLightCard(width / 2, height / 2, 980, 540, 245, 32);

  fill(win ? THEME.success[0] : THEME.danger[0],
       win ? THEME.success[1] : THEME.danger[1],
       win ? THEME.success[2] : THEME.danger[2]);
  textAlign(CENTER, CENTER); textSize(170); textStyle(BOLD);
  text(win ? 'WIN 🎉' : 'LOSE 😢', width / 2, height / 2 - 120); textStyle(NORMAL);

  fill(THEME.textDark[0]); textSize(40); textStyle(BOLD);
  if (gameResult === 'TARGET_WIN') text('사람이 알 5개를 먹었습니다! 😲', width / 2, height / 2 + 10);
  else                             text('사람이 똥을 5번 맞았습니다! 🕊️',  width / 2, height / 2 + 10);
  textStyle(NORMAL);

  fill(THEME.textSub[0]); textSize(26);
  text('다시하기를 누르면 역할 선택으로 돌아갑니다', width / 2, height / 2 + 72);

  uiHit.restartBtn = drawButton(width / 2, height / 2 + 164, 290, 74, '다시하기', true, 'primary');
}

// ══════════════════════════════════════════════════════
//  마우스 클릭
// ══════════════════════════════════════════════════════
function mousePressed() {
  if (gameState === 'ROLE_SELECTION') {
    if (uiHit.rolePigeon && uiHit.rolePigeon.enabled &&
        pointInCenteredRect(mouseX, mouseY, uiHit.rolePigeon)) {
      socket.emit('selectRole', 'PIGEON'); return;
    }
    if (uiHit.roleTarget && uiHit.roleTarget.enabled &&
        pointInCenteredRect(mouseX, mouseY, uiHit.roleTarget)) {
      socket.emit('selectRole', 'TARGET'); return;
    }
  } else if (gameState === 'MAIN') {
    if (uiHit.startBtn && pointInCenteredRect(mouseX, mouseY, uiHit.startBtn)) {
      gameState = 'CALIBRATE'; calibrationTimer = 0;
      syncStatus = { PIGEON: false, TARGET: false }; return;
    }
  } else if (gameState === 'PLAYING' && myRole === 'PIGEON' && poopCooldown === 0) {
    dropItem(); poopCooldown = 20;
  } else if (gameState === 'GAME_OVER') {
    if (uiHit.restartBtn && pointInCenteredRect(mouseX, mouseY, uiHit.restartBtn)) {
      socket.emit('restartToRoleSelection'); return;
    }
  }
}