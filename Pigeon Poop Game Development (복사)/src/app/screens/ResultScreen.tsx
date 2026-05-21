import { useGame } from '../context/GameContext';

export default function ResultScreen() {
  const { gameState, setCurrentScreen, resetGame } = useGame();

  const isCleared = gameState.lives > 0;

  const handlePlayAgain = () => {
    resetGame();
    if (gameState.gameMode === 'stage') {
      setCurrentScreen('stage-select');
    } else {
      setCurrentScreen('loading');
    }
  };

  return (
    <div className={`relative w-full h-screen flex items-center justify-center overflow-hidden p-4 ${
      isCleared
        ? 'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600'
        : 'bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800'
    }`}>
      {/* Confetti/particles background */}
      {isCleared && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute text-2xl sm:text-3xl animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              {['🎉', '🎊', '⭐', '✨', '🏆'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-6 sm:p-10 max-w-2xl w-full shadow-2xl text-center border-2 border-white/50 animate-bounce-in">
        {isCleared ? (
          <>
            <div className="text-5xl sm:text-6xl mb-4">
              <span className="inline-block animate-bounce-slow">🎉</span>
              <span className="inline-block animate-bounce-slow" style={{ animationDelay: '0.3s' }}>🏆</span>
              <span className="inline-block animate-bounce-slow" style={{ animationDelay: '0.6s' }}>🎉</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 bg-clip-text text-transparent mb-4 drop-shadow-lg">
              STAGE CLEAR!
            </h1>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6">
              {gameState.score > 0 && (
                <div className="text-3xl sm:text-4xl font-bold text-gray-800 flex items-center justify-center gap-3">
                  <span className="text-4xl sm:text-5xl">🥚</span>
                  <span>{gameState.score}개</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="text-5xl sm:text-6xl mb-4 animate-shake">💀</div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black bg-gradient-to-r from-red-500 via-orange-500 to-pink-500 bg-clip-text text-transparent mb-4 drop-shadow-lg">
              GAME OVER
            </h1>
            <div className="bg-gradient-to-r from-gray-50 to-red-50 rounded-xl p-6 mb-6 space-y-3">
              <div className="text-3xl sm:text-4xl font-bold text-gray-800 flex items-center justify-center gap-3">
                <span className="text-4xl sm:text-5xl">🥚</span>
                <span>{gameState.score}개</span>
              </div>
              {gameState.gameMode === 'competitive' && (
                <div className="text-2xl sm:text-3xl font-bold text-gray-700 flex items-center justify-center gap-3">
                  <span className="text-3xl sm:text-4xl">⏱️</span>
                  <span>
                    {Math.floor(gameState.survivalTime / 60000)}:
                    {((gameState.survivalTime % 60000) / 1000).toFixed(0).padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>
          </>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={handlePlayAgain}
            className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white text-lg sm:text-xl font-black py-4 px-10 rounded-full shadow-2xl border-2 border-white/50 transition-all hover:scale-105 active:scale-95"
          >
            🔄 다시 하기
          </button>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setCurrentScreen('main')}
              className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white text-base sm:text-lg font-bold py-3 px-8 rounded-full shadow-lg border border-white/30 transition-all hover:scale-105"
            >
              🏠 메인으로
            </button>
            {gameState.gameMode === 'competitive' && (
              <button
                onClick={() => setCurrentScreen('leaderboard')}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-base sm:text-lg font-bold py-3 px-8 rounded-full shadow-lg border border-white/30 transition-all hover:scale-105"
              >
                🏅 순위표
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
