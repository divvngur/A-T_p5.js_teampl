import { useState } from 'react';
import { useGame } from '../context/GameContext';

export default function CameraSetupScreen() {
  const { setCurrentScreen } = useGame();
  const [isReady, setIsReady] = useState(false);

  const handleStart = () => {
    setCurrentScreen('game');
  };

  return (
    <div className="w-full h-screen bg-gradient-to-b from-purple-500 to-pink-500 flex items-center justify-center relative overflow-hidden">
      {/* Demo camera frame */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Guide box */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full p-4">
        <div className="relative">
          {/* Camera guide box */}
          <div className="w-80 sm:w-96 md:w-[500px] h-96 sm:h-[500px] md:h-[600px] border-4 border-green-400 rounded-3xl relative shadow-2xl bg-white/5 backdrop-blur-sm">
            {/* Corner markers */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-6 border-l-6 border-green-400 rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-12 h-12 border-t-6 border-r-6 border-green-400 rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-6 border-l-6 border-green-400 rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-6 border-r-6 border-green-400 rounded-br-2xl" />

            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-9xl opacity-40 animate-pulse">👤</div>
            </div>

            {/* Face detected indicator */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-500 px-6 py-2 rounded-full shadow-lg animate-pulse">
              <p className="text-white font-bold text-sm">✓ 얼굴 인식됨</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-center">
          <div className="bg-white/90 backdrop-blur-md px-8 py-4 rounded-2xl shadow-xl border-2 border-white mb-6">
            <p className="text-xl sm:text-2xl font-bold text-gray-800">
              ✅ 완벽합니다! 이 자세를 유지하세요
            </p>
          </div>

          {/* Start button */}
          <button
            onClick={handleStart}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-2xl font-black py-6 px-16 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 border-4 border-white/50 animate-pulse"
          >
            🎮 게임 시작하기
          </button>
        </div>
      </div>

      {/* Back button */}
      <button
        onClick={() => setCurrentScreen('main')}
        className="absolute top-4 left-4 bg-white/90 hover:bg-white text-gray-800 font-bold py-2 px-6 rounded-full shadow-lg transition-all hover:scale-105 z-20"
      >
        ← 뒤로가기
      </button>
    </div>
  );
}
