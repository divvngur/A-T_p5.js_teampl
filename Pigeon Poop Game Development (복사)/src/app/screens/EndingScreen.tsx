import { useGame } from '../context/GameContext';

export default function EndingScreen() {
  const { setCurrentScreen } = useGame();

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-y-auto overflow-x-hidden flex items-center justify-center p-4">
      {/* Animated stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(80)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Floating pigeons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute text-5xl sm:text-6xl animate-float" style={{ top: '10%', left: '10%' }}>🕊️</div>
        <div className="absolute text-4xl sm:text-5xl animate-float" style={{ top: '60%', right: '15%', animationDelay: '1s' }}>🕊️</div>
        <div className="absolute text-4xl sm:text-5xl animate-float" style={{ bottom: '20%', left: '70%', animationDelay: '2s' }}>🕊️</div>
      </div>

      {/* Credits content */}
      <div className="relative z-10 max-w-4xl w-full">
        <div className="text-center mb-8 animate-slide-up">
          <div className="flex items-center justify-center gap-4 sm:gap-6 mb-4">
            <span className="text-4xl sm:text-5xl md:text-6xl animate-bounce-slow">🏆</span>
            <span className="text-4xl sm:text-5xl md:text-6xl animate-bounce-slow" style={{ animationDelay: '0.5s' }}>🎉</span>
            <span className="text-4xl sm:text-5xl md:text-6xl animate-bounce-slow" style={{ animationDelay: '1s' }}>🏆</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent drop-shadow-2xl mb-3">
            감사합니다!
          </h1>
          <p className="text-lg sm:text-xl text-white/90 font-bold drop-shadow-lg">게임을 플레이해주셔서 감사합니다</p>
        </div>

        <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-6 sm:p-8 mb-8 border-2 border-white/20 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-8 bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
            CREDITS
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-white mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-yellow-300/30">
              <h3 className="text-xl sm:text-2xl font-black text-yellow-300 mb-3 flex items-center gap-2">
                <span className="text-2xl sm:text-3xl">📋</span>
                기획
              </h3>
              <div className="space-y-2 text-sm sm:text-base font-medium">
                <p>• 카메라 인터랙션 구상</p>
                <p>• 스토리보드 작성</p>
                <p>• 게임 컨셉 작성</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-green-300/30">
              <h3 className="text-xl sm:text-2xl font-black text-green-300 mb-3 flex items-center gap-2">
                <span className="text-2xl sm:text-3xl">💻</span>
                개발
              </h3>
              <div className="space-y-2 text-sm sm:text-base font-medium">
                <p>• 게임 로직 & 스테이지 모드</p>
                <p>• Firebase & 경쟁 모드</p>
                <p>• ml5.js FaceMesh 구현</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-pink-300/30">
              <h3 className="text-xl sm:text-2xl font-black text-pink-300 mb-3 flex items-center gap-2">
                <span className="text-2xl sm:text-3xl">🎨</span>
                디자인
              </h3>
              <div className="space-y-2 text-sm sm:text-base font-medium">
                <p>• 메인 & 스테이지 선택</p>
                <p>• 로그인 & 순위표 화면</p>
                <p>• 게임 오브젝트 & 배경</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/20 text-center mb-6">
            <h3 className="text-xl sm:text-2xl font-black text-orange-300 mb-2">Special Thanks</h3>
            <p className="text-base sm:text-lg text-white font-bold">비둘기 🐦 (영감의 원천)</p>
          </div>

          <div className="text-center text-white/70">
            <p className="text-base sm:text-lg font-bold">Interactive Media Game Project</p>
            <p className="text-base sm:text-lg font-semibold">PIGEON ATTACK!</p>
            <p className="text-sm sm:text-base mt-1">2026년 5월</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button
            onClick={() => setCurrentScreen('main')}
            className="group bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white text-base sm:text-lg font-black py-4 px-10 rounded-full shadow-2xl border-2 border-white/50 transform transition-all hover:scale-105 active:scale-95"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="text-xl sm:text-2xl group-hover:animate-bounce">🎮</span>
              다시 시작
            </span>
          </button>
          <button
            onClick={() => setCurrentScreen('intro')}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-base sm:text-lg font-bold py-4 px-10 rounded-full shadow-2xl border-2 border-white/30 transform transition-all hover:scale-105 active:scale-95"
          >
            처음으로
          </button>
        </div>
      </div>
    </div>
  );
}
