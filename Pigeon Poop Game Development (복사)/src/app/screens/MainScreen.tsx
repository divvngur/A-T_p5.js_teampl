import { useState } from 'react';
import { useGame } from '../context/GameContext';

export default function MainScreen() {
  const { gameState, setCurrentScreen, setGameMode } = useGame();
  const [showWarning, setShowWarning] = useState(false);
  const [pendingMode, setPendingMode] = useState<'stage' | 'competitive' | null>(null);

  const handleModeSelect = (mode: 'stage' | 'competitive') => {
    if (!gameState.isLoggedIn) {
      setPendingMode(mode);
      setShowWarning(true);
    } else {
      setGameMode(mode);
      if (mode === 'stage') {
        setCurrentScreen('stage-select');
      } else {
        setCurrentScreen('loading');
      }
    }
  };

  const handleContinueWithoutLogin = () => {
    if (pendingMode) {
      setGameMode(pendingMode);
      if (pendingMode === 'stage') {
        setCurrentScreen('stage-select');
      } else {
        setCurrentScreen('loading');
      }
    }
    setShowWarning(false);
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-sky-400 via-blue-300 to-amber-200 overflow-y-auto overflow-x-hidden">
      {/* Background clouds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-20 left-10 text-6xl animate-float">☁️</div>
        <div className="absolute bottom-20 right-10 text-6xl animate-float" style={{ animationDelay: '1.5s' }}>☁️</div>
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 md:p-6 z-10">
        <div className="flex items-center justify-center sm:justify-start gap-3">
          <div className="text-4xl md:text-5xl animate-float">🕊️</div>
          <div className="hidden sm:block">
            <h1 className="text-lg md:text-xl font-black text-white drop-shadow-lg leading-tight">
              PIGEON ATTACK!
            </h1>
            <p className="text-xs text-white/90 drop-shadow">입벌려! 비둘기 똥 들어간다~</p>
          </div>
        </div>

        {/* User info - moved to top right */}
        <div className="absolute top-4 md:top-6 right-4 md:right-6">
          {gameState.isLoggedIn ? (
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full shadow-xl border border-white/50">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg">
                {gameState.user?.displayName.charAt(0) || '?'}
              </div>
              <span className="font-bold text-gray-800 text-sm hidden sm:inline">{gameState.user?.displayName}</span>
            </div>
          ) : (
            <button
              onClick={() => setCurrentScreen('login')}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 sm:px-6 py-2 rounded-full font-bold shadow-xl border border-white/50 transition-all hover:scale-105 text-sm"
            >
              로그인
            </button>
          )}
        </div>
      </div>

      {/* Back to intro button - moved to bottom */}
      <button
        onClick={() => setCurrentScreen('intro')}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 hover:bg-white backdrop-blur-sm text-gray-800 font-bold py-3 px-6 rounded-full shadow-lg transition-all hover:scale-105 z-20 text-sm"
      >
        ← 처음으로
      </button>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center min-h-screen gap-8 pt-20 pb-8 px-4">
        {/* Title visual */}
        <div className="text-center animate-slide-up">
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="text-6xl sm:text-7xl animate-bounce-slow">🐦</div>
            <div className="text-6xl sm:text-7xl animate-bounce-slow" style={{ animationDelay: '0.5s' }}>💩</div>
            <div className="text-6xl sm:text-7xl animate-bounce-slow" style={{ animationDelay: '1s' }}>🥚</div>
          </div>
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 drop-shadow-2xl">
            모드 선택
          </h2>
          <p className="text-xl sm:text-2xl text-white/90 font-semibold drop-shadow-lg">원하는 게임 모드를 선택하세요</p>
        </div>

        {/* Mode selection buttons */}
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 w-full max-w-4xl animate-bounce-in">
          <button
            onClick={() => handleModeSelect('stage')}
            className="group relative bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 hover:from-green-500 hover:via-emerald-600 hover:to-teal-700 text-white rounded-3xl shadow-2xl transform transition-all duration-300 hover:scale-105 active:scale-95 border-4 border-white/30 overflow-hidden flex-1"
          >
            <div className="relative z-10 p-8 sm:p-10">
              <div className="text-6xl sm:text-7xl mb-4 group-hover:scale-110 transition-transform">🎯</div>
              <div className="text-2xl sm:text-3xl font-black mb-2">스테이지 모드</div>
              <div className="text-base sm:text-lg font-medium opacity-90">단계별 도전</div>
              <div className="mt-4 text-sm bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 inline-block">
                6-8개 레벨
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>

          <button
            onClick={() => handleModeSelect('competitive')}
            className="group relative bg-gradient-to-br from-purple-400 via-fuchsia-500 to-pink-600 hover:from-purple-500 hover:via-fuchsia-600 hover:to-pink-700 text-white rounded-3xl shadow-2xl transform transition-all duration-300 hover:scale-105 active:scale-95 border-4 border-white/30 overflow-hidden flex-1"
          >
            <div className="relative z-10 p-8 sm:p-10">
              <div className="text-6xl sm:text-7xl mb-4 group-hover:scale-110 transition-transform">🏆</div>
              <div className="text-2xl sm:text-3xl font-black mb-2">경쟁 모드</div>
              <div className="text-base sm:text-lg font-medium opacity-90">최고 기록 도전</div>
              <div className="mt-4 text-sm bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 inline-block">
                순위표 기록
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>

        {/* Leaderboard button */}
        <button
          onClick={() => setCurrentScreen('leaderboard')}
          className="group bg-white/95 hover:bg-white backdrop-blur-sm text-gray-800 text-xl sm:text-2xl font-bold py-4 px-12 rounded-full shadow-xl border-2 border-gray-200 transition-all hover:scale-105 hover:shadow-2xl flex items-center gap-3"
        >
          <span className="text-3xl group-hover:animate-bounce">🏅</span>
          순위표 보기
        </button>
      </div>

      {/* Warning Modal */}
      {showWarning && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl transform animate-pop border-2 border-orange-200">
            <div className="text-5xl text-center mb-4 animate-shake">⚠️</div>
            <h2 className="text-2xl sm:text-3xl font-black text-center mb-4 text-gray-800">알림</h2>
            <p className="text-base sm:text-lg text-gray-700 text-center mb-6 leading-relaxed font-medium">
              로그인하지 않으면 게임 기록이 저장되지 않으며
              <br />
              <span className="text-red-500 font-bold">순위표에 표시되지 않습니다</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowWarning(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl transition-all hover:scale-105 text-sm sm:text-base shadow-md"
              >
                메인으로 돌아가기
              </button>
              <button
                onClick={handleContinueWithoutLogin}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 rounded-xl transition-all hover:scale-105 text-sm sm:text-base shadow-lg border border-white"
              >
                계속 진행하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
