import { useGame } from '../context/GameContext';

export default function IntroScreen() {
  const { setCurrentScreen } = useGame();

  const handleStart = () => {
    // Request fullscreen
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(err => {
        console.log('Fullscreen request failed:', err);
      });
    }
    setCurrentScreen('main');
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-sky-400 via-blue-300 to-amber-200 flex flex-col items-center justify-center overflow-hidden">
      {/* Animated clouds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-20 left-10 text-6xl animate-float" style={{ animationDelay: '0s' }}>☁️</div>
        <div className="absolute top-40 right-20 text-5xl animate-float" style={{ animationDelay: '1s' }}>☁️</div>
        <div className="absolute bottom-32 left-1/4 text-5xl animate-float" style={{ animationDelay: '2s' }}>☁️</div>
      </div>

      {/* Animated pigeons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="animate-fly-across absolute text-4xl" style={{ top: '15%' }}>🐦</div>
        <div className="animate-fly-across-slow absolute text-3xl" style={{ top: '35%' }}>🐦</div>
        <div className="animate-fly-across-delayed absolute text-4xl" style={{ top: '55%' }}>🐦</div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4 max-w-6xl w-full animate-slide-up">
        {/* Title */}
        <div className="mb-6">
          <div className="text-8xl sm:text-9xl mb-4 animate-bounce-slow filter drop-shadow-2xl">🕊️</div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-3 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent drop-shadow-2xl leading-tight">
            입벌려!
          </h1>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
            비둘기 똥 들어간다~
          </h2>
          <p className="text-xl sm:text-2xl text-white/90 mt-3 font-semibold drop-shadow-md">PIGEON ATTACK!</p>
        </div>

        {/* Game instructions */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 mb-6 shadow-2xl border-4 border-white/50 max-w-4xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-bold mb-5 text-gray-800 flex items-center justify-center gap-3">
            <span className="text-3xl">🎮</span>
            게임 방법
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all">
              <span className="text-3xl min-w-[40px] text-center">1️⃣</span>
              <div>
                <p className="text-base sm:text-lg font-bold text-gray-800 mb-1">웹캠 허용</p>
                <p className="text-sm text-gray-600">카메라 권한을 허용하고 화면에 얼굴을 맞추세요</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-all">
              <span className="text-3xl min-w-[40px] text-center">2️⃣</span>
              <div>
                <p className="text-base sm:text-lg font-bold text-gray-800 mb-1">입 벌려서 알 받기 🥚</p>
                <p className="text-sm text-gray-600">비둘기가 떨어뜨리는 알을 입으로 받으세요!</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-all">
              <span className="text-3xl min-w-[40px] text-center">3️⃣</span>
              <div>
                <p className="text-base sm:text-lg font-bold text-gray-800 mb-1">똥 피하기 💩</p>
                <p className="text-sm text-gray-600">비둘기 똥을 맞으면 하트가 줄어듭니다!</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-all">
              <span className="text-3xl min-w-[40px] text-center">4️⃣</span>
              <div>
                <p className="text-base sm:text-lg font-bold text-gray-800 mb-1">최고 점수 도전 🏆</p>
                <p className="text-sm text-gray-600">경쟁 모드로 순위표 1위에 도전하세요!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={handleStart}
          className="group relative bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white text-3xl sm:text-4xl font-black py-6 sm:py-8 px-16 sm:px-20 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-110 active:scale-95 border-4 border-white/50 overflow-hidden mb-4"
        >
          <span className="relative z-10 flex items-center gap-4">
            <span className="text-4xl sm:text-5xl">🎮</span>
            시작하기
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        </button>

        {/* Credits */}
        <div className="text-sm sm:text-base text-white/80 bg-black/20 backdrop-blur-sm rounded-2xl p-4 max-w-md mx-auto border-2 border-white/30">
          <p className="font-bold mb-1">제작</p>
          <p className="font-medium">Interactive Media Game Project</p>
          <p className="text-sm mt-1">2026년 5월</p>
        </div>
      </div>
    </div>
  );
}
