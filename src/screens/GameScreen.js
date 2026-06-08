window.GameScreen = {
  init() {
    if (window.bgm) {
      window.bgm.pause();
      window.bgm.currentTime = 0;
    }

    const hud = document.getElementById('game-hud');
    hud.style.display = 'flex';

    const pauseOverlay = document.getElementById('pause-overlay');
    if (pauseOverlay) pauseOverlay.style.display = 'none';

    const finishGame = ({ cleared, score, lives, survivalTime, stage, quit = false }) => {
      /*
      if (APP.mode === 'competitive' && !quit) {
        MockLeaderboard.add({
          uid: APP.currentUser ? APP.currentUser.uid : 'guest',
          displayName: APP.displayName || 'Guest',
          score,
          survivalTime,
        });
      }
      */

      APP.lastResult = {
        cleared,
        score,
        hp: lives,
        survivalTime,
        mode: APP.mode,
        stage,
        quit,
      };

      ResultScreen.init();
      showScreen('result-screen');
    };

    if (window.bgm) {
      window.bgm.pause();
      window.bgm.currentTime = 0;
      window.bgm = null;
    }

    // ★ 핵심 수정: display:none → flex 전환 후 브라우저 레이아웃 계산이
    //   완료되기 전에 clientWidth/clientHeight를 읽으면 캔버스가 작은 크기로
    //   생성되고 CSS 100%로 확대되면서 흐려짐.
    //   rAF 두 겹으로 감싸 레이아웃 확정 후 캔버스 생성.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        APP.p5Instance = HDFaceGame({
          containerId: 'game-screen',
          mode: APP.mode,
          selectedStage: APP.selectedStage,
          onHudUpdate({ score, lives, elapsed }) {
            document.getElementById('hud-hearts').textContent =
              lives > 0 ? '❤️'.repeat(lives) : '🖤';
            document.getElementById('hud-center').textContent =
              `🥚 ${score}점 | ${formatTime(elapsed)}`;
          },
          onQuit(score, lives, survivalTime) {
            finishGame({
              cleared: false,
              score,
              lives,
              survivalTime,
              quit: true,
            });
          },
          onFinish(result) {
            finishGame(result);
          },
        });
      });
    });
  }
};