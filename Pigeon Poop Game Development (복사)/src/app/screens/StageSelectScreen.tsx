import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { STAGE_CONFIGS } from '../config/stageConfig';

export default function StageSelectScreen() {
  const { setCurrentScreen, setSelectedStage } = useGame();
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingStage, setPendingStage] = useState<number | null>(null);

  const handleStageSelect = (stageNum: number) => {
    setPendingStage(stageNum);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (pendingStage !== null) {
      setSelectedStage(pendingStage);
      setCurrentScreen('loading');
    }
  };

  const getDifficultyStars = (stage: number) => {
    return '⭐'.repeat(Math.min(stage, 5));
  };

  const getDifficultyColor = (stage: number) => {
    if (stage <= 2) return 'from-green-400 to-emerald-500';
    if (stage <= 4) return 'from-yellow-400 to-orange-500';
    if (stage <= 6) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-purple-600';
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 overflow-hidden flex items-center justify-center">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
        <div className="absolute top-20 left-20 text-6xl animate-float">🎯</div>
        <div className="absolute bottom-20 right-20 text-6xl animate-float" style={{ animationDelay: '1s' }}>🏆</div>
      </div>

      <div className="relative flex flex-col items-center justify-center h-full w-full px-4 py-8">
        <div className="text-center mb-6 animate-slide-up">
          <div className="text-5xl sm:text-6xl mb-3 animate-bounce-slow">🎯</div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent drop-shadow-2xl mb-2">
            스테이지 선택
          </h1>
          <p className="text-base sm:text-lg text-white font-semibold drop-shadow-lg">원하는 레벨을 선택하세요</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 max-w-6xl mb-6 animate-bounce-in w-full">
          {STAGE_CONFIGS.map((config) => (
            <button
              key={config.stage}
              onClick={() => handleStageSelect(config.stage)}
              className={`group relative bg-gradient-to-br ${getDifficultyColor(config.stage)} hover:scale-105 rounded-2xl p-4 sm:p-5 shadow-2xl transform transition-all duration-300 hover:shadow-3xl border-3 border-white/30 overflow-hidden`}
            >
              <div className="relative z-10">
                <div className="text-xl sm:text-2xl font-black text-white mb-2 drop-shadow-lg">
                  Stage {config.stage}
                </div>
                <div className="text-lg sm:text-xl mb-2">{getDifficultyStars(config.stage)}</div>
                <div className="space-y-1 text-white font-bold text-xs sm:text-sm">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">
                    목표: {config.targetEggs}개 🥚
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">
                    비둘기: {config.pigeonCount}마리 🐦
                  </div>
                  {config.hasBoss && (
                    <div className="bg-red-600/80 backdrop-blur-sm rounded-lg px-2 py-1 animate-pulse">
                      ⚠️ 보스!
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          ))}
        </div>

        <button
          onClick={() => setCurrentScreen('main')}
          className="bg-white/95 hover:bg-white backdrop-blur-sm text-gray-800 text-sm sm:text-base font-bold py-2 px-8 rounded-full shadow-2xl border border-gray-200 transition-all hover:scale-105 hover:shadow-3xl"
        >
          뒤로가기
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-pop border-2 border-blue-200">
            <div className="text-5xl text-center mb-4">ℹ️</div>
            <h2 className="text-2xl sm:text-3xl font-black text-center mb-4 text-gray-800">안내</h2>
            <p className="text-base sm:text-lg text-gray-700 text-center mb-6 leading-relaxed font-medium">
              스테이지 모드는 <span className="font-bold text-orange-500">순위표에 기록되지 않습니다</span>
              <br />
              계속하시겠습니까?
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl transition-all hover:scale-105 text-sm sm:text-base shadow-md"
              >
                취소
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 rounded-xl transition-all hover:scale-105 text-sm sm:text-base shadow-lg border border-white"
              >
                시작하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
