window.MultiplayerScreen = {
  init() {
    const screen = document.getElementById('multiplayer-screen');
    window.MULTI_ROOMS = window.MULTI_ROOMS || [];

    // Use existing SPA socket (initialized in main.js)
    const socket = window.SPA_SOCKET;
    if (!socket || !socket.connected) {
      console.warn('[MultiplayerScreen] Socket not connected:', socket);
    }
    if (socket) {
      socket.off('roomList');
      socket.on('roomList', (list) => {
        window.MULTI_ROOMS = list || [];
        renderRoomList();
      });
      // request fresh list
      socket.emit('listRooms');
    }

    screen.innerHTML = `
      <div class="ui-screen bg-main flex-center">
        <div class="bg-clouds">
          <div class="bg-cloud" style="top:12%; left:8%;">☁️</div>
          <div class="bg-cloud" style="bottom:14%; right:8%; animation-delay:1.4s;">☁️</div>
        </div>

        <header class="top-header">
          <div class="brand-mark">
            <div class="brand-icon">🕊️</div>
            <div class="brand-title">
              <div style="font-size:22px;">PIGEON ATTACK!</div>
              <div style="font-size:12px; opacity:.9;">입벌려! 비둘기 똥 들어간다~</div>
            </div>
          </div>
          <div id="main-user-area"></div>
        </header>

        <button id="multiplayer-back" class="btn btn-muted bottom-back">← 메인으로</button>

        <main class="screen-center container-animated">
          <div class="title-stack">
            <h1 class="section-title gradient-text">👥 멀티플레이</h1>
            <p class="support-copy">함께 똥을 피할 방을 선택하거나 생성하세요!</p>
          </div>

          <div class="panel room-panel-container">
            <div class="room-panel-header">
              <span class="panel-subtitle">📡 참여 가능한 대기실</span>
              <button id="create-room-btn" class="btn btn-primary btn-sm">➕ 방 만들기</button>
            </div>

            <div id="room-list" class="room-scroll-area">
              </div>
          </div>
        </main>
      </div>
    `;

    updateMainLoginBtn();

    const renderRoomList = () => {
      const container = document.getElementById('room-list');
      if (!window.MULTI_ROOMS || window.MULTI_ROOMS.length === 0) {
        container.innerHTML = `
          <div class="empty-room-state">
            <div style="font-size: 48px; margin-bottom: 12px;">📭</div>
            <p>현재 생성된 방이 없습니다.<br>첫 번째 방을 만들어보세요!</p>
          </div>
        `;
        return;
      }

      container.innerHTML = window.MULTI_ROOMS.map(r => `
        <div class="room-item-card">
          <div class="room-card-main">
            <div class="room-card-title">🕊️ ${r.name}</div>
            <div class="room-card-meta">
              <span class="badge badge-players">👤 ${r.players || 1} / 2 명</span>
              <span class="badge ${r.started ? 'badge-danger' : 'badge-success'}">
                ${r.started ? '🎮 게임중' : '⏳ 대기중'}
              </span>
            </div>
          </div>
          <div class="room-card-action">
            <button class="btn ${r.started ? 'btn-muted' : 'btn-purple'} join-room" data-id="${r.id}" ${r.started ? 'disabled' : ''}>
              ${r.started ? '마감' : '입장하기'}
            </button>
          </div>
        </div>
      `).join('');

      // 입장 핸들러 연결
      Array.from(container.querySelectorAll('.join-room')).forEach(btn => {
        btn.onclick = (e) => {
          const id = Number(btn.getAttribute('data-id'));
          const room = window.MULTI_ROOMS.find(x => x.id === id);
          if (!room) return;
          if (!socket) {
            showModal('서버에 연결되어 있지 않습니다.', [{ label:'확인', cls:'btn-muted' }]);
            return;
          }
          showModal(`방에 입장합니다.<br/><b>${room.name}</b>`, [
            { label:'입장', cls:'btn-primary', cb:() => {
              socket.emit('joinRoom', id, (res) => {
                if (!res || !res.ok) {
                  showModal('방 입장에 실패했습니다: ' + (res && res.err ? res.err : 'unknown'), [{ label:'확인', cls:'btn-muted' }]);
                  return;
                }
                // Navigate to p5 multiplayer client (SPA socket stays connected for others)
                window.location.href = '/multiplayer?room=' + id;
              });
            } },
            { label:'취소', cls:'btn-muted' }
          ]);
        };
      });
    };

    document.getElementById('create-room-btn').onclick = () => {
      CreateRoomScreen.init();
      showScreen('create-room-screen');
    };

    document.getElementById('multiplayer-back').onclick = () => {
      MainScreen.init();
      showScreen('main-screen');
    };

    renderRoomList();
  }
};