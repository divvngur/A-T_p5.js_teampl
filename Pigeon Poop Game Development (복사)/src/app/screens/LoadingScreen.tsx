import { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';

const tips = [
  '비둘기는 하루에 최대 50번 배변합니다 🐦',
  '알을 받으면 점수가 올라가요! 입을 크게 벌리세요! 👄',
  '똥을 맞으면 하트가 줄어요! 잘 피하세요 💩',
  '보스는 특별한 공격 패턴을 가지고 있어요! 🎯',
  '카메라 앞에서 움직임이 자연스러울수록 좋아요! 📸',
];

export default function LoadingScreen() {
  const { setCurrentScreen } = useGame();
  const [progress, setProgress] = useState(0);
  const [tip] = useState(tips[Math.floor(Math.random() * tips.length)]);

  useEffect(() => {
    // Simulate loading
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 2;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setCurrentScreen('camera-setup');
          }, 500);
          return 100;
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [setCurrentScreen]);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-sky-400 to-blue-300 flex flex-col items-center justify-center overflow-hidden p-4">
      {/* Walking pigeon animation */}
      <div className="mb-16 relative w-full max-w-4xl">
        <div
          className="absolute transition-all duration-100 ease-linear"
          style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}
        >
          <div className="text-7xl animate-bounce-slow">🐦</div>
        </div>
      </div>

      {/* Loading bar */}
      <div className="w-full max-w-2xl">
        <div className="mb-6 text-center">
          <p className="text-2xl font-bold text-white drop-shadow-lg mb-2">
            Loading... {Math.floor(progress)}%
          </p>
        </div>

        <div className="relative bg-white/30 backdrop-blur-sm rounded-full h-8 overflow-hidden border-2 border-white/50 shadow-xl">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-100 ease-linear rounded-full"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/50 to-transparent animate-pulse" />
          </div>
        </div>
      </div>

      {/* Tip */}
      <div className="mt-12 max-w-2xl">
        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border-2 border-white/30 shadow-lg">
          <p className="text-lg text-white text-center font-semibold">
            💡 {tip}
          </p>
        </div>
      </div>
    </div>
  );
}
