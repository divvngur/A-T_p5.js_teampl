import { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';

export default function GameScreen() {
  const { gameState, setCurrentScreen, setScore, setLives } = useGame();
  const [score, setLocalScore] = useState(0);
  const [lives, setLocalLives] = useState(3);
  const [isPaused, setIsPaused] = useState(false);

  // Demo: auto increment score
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        setLocalScore(prev => prev + 1);
        setScore(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, setScore]);

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleQuit = () => {
    setCurrentScreen('result');
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-sky-300 to-blue-400 overflow-hidden">
      {/* Demo background */}
      <div className="absolute inset-0">
        {/* Sky */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-300 to-blue-200" />

        {/* Clouds */}
        <div className="absolute top-20 left-10 text-6xl opacity-80 animate-float">☁️</div>
        <div className="absolute top-40 right-20 text-5xl opacity-70 animate-float" style={{ animationDelay: '1s' }}>☁️</div>
        <div className="absolute top-60 left-1/3 text-7xl opacity-60 animate-float" style={{ animationDelay: '2s' }}>☁️</div>

        {/* Demo pigeons */}
        <div className="absolute top-32 left-1/4 text-5xl animate-bounce-slow">🐦</div>
        <div className="absolute top-48 right-1/3 text-6xl animate-bounce-slow" style={{ animationDelay: '0.5s' }}>🐦</div>

        {/* Demo eggs falling - positioned to avoid overlap with buttons */}
        <div className="absolute top-1/3 left-1/4 text-4xl animate-bounce">🥚</div>
        <div className="absolute top-1/2 left-1/3 text-3xl animate-bounce" style={{ animationDelay: '0.3s' }}>💩</div>
        <div className="absolute top-2/3 right-1/3 text-4xl animate-bounce" style={{ animationDelay: '0.6s' }}>🥚</div>
      </div>

      {/* HUD */}
      <div className="absolute top-20 left-0 right-0 p-4 z-10">
        <div className="flex items-center justify-between">
          {/* Lives */}
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <span key={i} className="text-4xl">
                {i < lives ? '❤️' : '🖤'}
              </span>
            ))}
          </div>

          {/* Score */}
          <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
            <span className="text-2xl font-black text-gray-800">
              🥚 {score}개
            </span>
          </div>
        </div>
      </div>

      {/* Demo player (face placeholder) */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-8xl z-10 animate-bounce-slow">
        😮
      </div>

      {/* Game controls */}
      <div className="absolute top-4 right-4 flex gap-2 z-20">
        <button
          onClick={handlePause}
          className="bg-white/90 hover:bg-white text-gray-800 font-bold py-2 px-4 rounded-full shadow-lg transition-all hover:scale-105"
        >
          {isPaused ? '▶️ 재개' : '⏸️ 일시정지'}
        </button>
        <button
          onClick={handleQuit}
          className="bg-red-500/90 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-full shadow-lg transition-all hover:scale-105"
        >
          ✕ 종료
        </button>
      </div>

      {/* Pause overlay */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="bg-white rounded-3xl p-12 text-center shadow-2xl">
            <div className="text-6xl font-black text-gray-800 mb-6">PAUSED</div>
            <button
              onClick={handlePause}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-xl font-bold py-4 px-12 rounded-full transition-all hover:scale-105 shadow-lg"
            >
              ▶️ 계속하기
            </button>
          </div>
        </div>
      )}

      {/* Demo instruction */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-6 py-3 rounded-full z-10">
        <p className="text-white text-sm font-bold">
          💡 UI 데모: 자동으로 점수가 올라갑니다
        </p>
      </div>
    </div>
  );
}
