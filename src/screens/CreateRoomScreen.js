window.CreateRoomScreen = {
  init() {
    const screen = document.getElementById('create-room-screen');
    screen.innerHTML = `
      <div class="ui-screen bg-main flex-center">
        <header class="top-header">
          <div class="brand-mark">
            <div class="brand-icon">🕊️</div>
            <div class="brand-title">
              <div style="font-size:22px;">PIGEON ATTACK!</div>
              <div style="font-size:12px; opacity:.9;">방 만들기</div>
            </div>
          </div>
        </header>

        <main class="screen-center flex-center container-animated">
          <div class="panel form-card space-y-container">
            <div class="form-card-header">
              <h2 class="form-title">🆕 새로운 방 생성</h2>
              <p class="form-subtitle">친구와 함께 대결할 방 정보를 입력하세요.</p>
            </div>

            <div class="form-section">
              <label for="room-name-input">📝 방 이름</label>
              <input type="text" id="room-name-input" class="input-field" placeholder="방 이름을 입력하세요 (예: 똥피하기 고수만)" maxlength="15">
              <div class="hint">최대 15자까지 입력 가능합니다.</div>
            </div>

            <div class="form-actions-row">
              <button id="create-room-cancel" class="btn btn-muted">취소</button>
              <button id="create-room-submit" class="btn btn-primary">🔥 방 생성하기</button>
            </div>
          </div>
        </main>
      </div>
    `;

    document.getElementById('create-room-cancel').onclick = () => {
      MultiplayerScreen.init();
      showScreen('multiplayer-screen');
    };

    document.getElementById('create-room-submit').onclick = () => {
      const input = document.getElementById('room-name-input');
      const name = input.value.trim();
      if (!name) {
        showModal('방 이름을 입력해주세요!', [{ label: '확인', cls: 'btn-primary' }]);
        return;
      }
      const socket = window.SPA_SOCKET;
      if (!socket) {
        showModal('서버에 연결되어 있지 않습니다.', [{ label: '확인', cls: 'btn-muted' }]);
        return;
      }
      socket.emit('createRoom', name);
      showModal(`<b>[${name}]</b> 방이 생성되었습니다!`, [
        {
          label: '확인',
          cls: 'btn-primary',
          cb: () => {
            MultiplayerScreen.init();
            showScreen('multiplayer-screen');
          }
        }
      ]);
    };
  }
};