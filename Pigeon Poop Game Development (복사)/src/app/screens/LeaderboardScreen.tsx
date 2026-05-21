import { useGame } from '../context/GameContext';

// Mock leaderboard data
const mockLeaderboard = [
  { rank: 1, name: '김철수', survivalTime: 456000, score: 234 },
  { rank: 2, name: '이영희', survivalTime: 432000, score: 198 },
  { rank: 3, name: '박민수', survivalTime: 398000, score: 176 },
  { rank: 4, name: '최지원', survivalTime: 345000, score: 145 },
  { rank: 5, name: '정수진', survivalTime: 321000, score: 132 },
  { rank: 6, name: '강동현', survivalTime: 298000, score: 121 },
  { rank: 7, name: '윤서아', survivalTime: 276000, score: 109 },
  { rank: 8, name: '임태양', survivalTime: 254000, score: 98 },
  { rank: 9, name: '한별', survivalTime: 234000, score: 87 },
  { rank: 10, name: '오하늘', survivalTime: 212000, score: 76 },
];

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function LeaderboardScreen() {
  const { setCurrentScreen, gameState } = useGame();

  const topThree = mockLeaderboard.slice(0, 3);
  const others = mockLeaderboard.slice(3);

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 overflow-y-auto overflow-x-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-20 left-20 text-6xl animate-twinkle">⭐</div>
        <div className="absolute top-40 right-20 text-6xl animate-twinkle" style={{ animationDelay: '1s' }}>⭐</div>
        <div className="absolute bottom-20 left-1/3 text-6xl animate-twinkle" style={{ animationDelay: '2s' }}>⭐</div>
      </div>

      <div className="relative min-h-full flex flex-col items-center py-8 px-4">
        <div className="text-center mb-8 animate-slide-up">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-3 flex items-center justify-center gap-2 sm:gap-4">
            <span className="text-3xl sm:text-4xl md:text-5xl inline-block animate-bounce-slow">🏆</span>
            <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent drop-shadow-2xl">순위표</span>
            <span className="text-3xl sm:text-4xl md:text-5xl inline-block animate-bounce-slow" style={{ animationDelay: '0.5s' }}>🏆</span>
          </h1>
          <p className="text-base sm:text-lg text-white font-bold drop-shadow-lg">경쟁 모드 최고 기록</p>
        </div>

        {/* Top 3 Podium */}
        <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-4 mb-8 w-full max-w-4xl animate-bounce-in">
          {/* 2nd Place */}
          <div className="w-full md:w-64 bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 rounded-2xl p-5 shadow-2xl md:transform md:scale-95 border-2 border-white/30 hover:scale-100 transition-all duration-300 order-2 md:order-1">
            <div className="text-4xl sm:text-5xl text-center mb-2 animate-float">🥈</div>
            <div className="text-3xl sm:text-4xl font-black text-center text-white mb-1 drop-shadow-lg">2위</div>
            <div className="text-xl sm:text-2xl text-center text-white font-bold mb-3">{topThree[1]?.name}</div>
            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-3 text-center text-white">
              <div className="text-lg sm:text-xl font-black">{formatTime(topThree[1]?.survivalTime || 0)}</div>
              <div className="text-sm sm:text-base font-semibold">{topThree[1]?.score}점 🥚</div>
            </div>
          </div>

          {/* 1st Place */}
          <div className="w-full md:w-72 bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-400 rounded-2xl p-6 shadow-2xl md:transform md:scale-110 border-2 border-white/50 hover:scale-115 transition-all duration-300 animate-pulse-glow order-1 md:order-2">
            <div className="text-5xl sm:text-6xl text-center mb-3 animate-bounce-slow">👑</div>
            <div className="text-4xl sm:text-5xl font-black text-center text-white mb-2 drop-shadow-2xl">1위</div>
            <div className="text-2xl sm:text-3xl text-center text-white font-black mb-4">{topThree[0]?.name}</div>
            <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 text-center text-white">
              <div className="text-xl sm:text-2xl font-black">{formatTime(topThree[0]?.survivalTime || 0)}</div>
              <div className="text-base sm:text-lg font-bold">{topThree[0]?.score}점 🥚</div>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="w-full md:w-60 bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 rounded-2xl p-5 shadow-2xl md:transform md:scale-90 border-2 border-white/30 hover:scale-95 transition-all duration-300 order-3">
            <div className="text-4xl sm:text-5xl text-center mb-2 animate-float" style={{ animationDelay: '1s' }}>🥉</div>
            <div className="text-3xl sm:text-4xl font-black text-center text-white mb-1 drop-shadow-lg">3위</div>
            <div className="text-xl sm:text-2xl text-center text-white font-bold mb-3">{topThree[2]?.name}</div>
            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-3 text-center text-white">
              <div className="text-lg sm:text-xl font-black">{formatTime(topThree[2]?.survivalTime || 0)}</div>
              <div className="text-sm sm:text-base font-semibold">{topThree[2]?.score}점 🥚</div>
            </div>
          </div>
        </div>

        {/* Other rankings */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 sm:p-6 max-w-3xl w-full max-h-80 overflow-y-auto shadow-2xl border-2 border-white/50 mb-6">
          <div className="space-y-2">
            {others.map(player => (
              <div
                key={player.rank}
                className={`flex items-center justify-between p-3 sm:p-4 rounded-xl transition-all hover:scale-102 ${
                  gameState.user?.displayName === player.name
                    ? 'bg-gradient-to-r from-orange-200 to-pink-200 border-2 border-orange-500 shadow-lg'
                    : 'bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-100 hover:to-purple-100 border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="text-lg sm:text-xl font-black text-gray-700 w-10 sm:w-12 text-center bg-white rounded-lg p-1 sm:p-2 shadow-md">
                    #{player.rank}
                  </div>
                  <div className="text-base sm:text-lg font-bold text-gray-800">{player.name}</div>
                </div>
                <div className="flex items-center gap-3 sm:gap-6">
                  <div className="text-right">
                    <div className="text-base sm:text-lg font-black text-gray-800">
                      {formatTime(player.survivalTime)}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-600">{player.score}점 🥚</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={() => setCurrentScreen('main')}
            className="bg-white/95 hover:bg-white backdrop-blur-sm text-gray-800 text-base sm:text-lg font-bold py-3 px-10 rounded-full shadow-2xl border border-gray-200 transition-all hover:scale-105 hover:shadow-3xl"
          >
            메인으로
          </button>
          <button
            onClick={() => setCurrentScreen('ending')}
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white text-base sm:text-lg font-bold py-3 px-10 rounded-full shadow-2xl border border-white/50 transition-all hover:scale-105"
          >
            종료
          </button>
        </div>
      </div>
    </div>
  );
}
