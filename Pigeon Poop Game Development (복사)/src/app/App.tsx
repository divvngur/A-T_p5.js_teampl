import { useEffect, useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import IntroScreen from './screens/IntroScreen';
import MainScreen from './screens/MainScreen';
import LoginScreen from './screens/LoginScreen';
import LoadingScreen from './screens/LoadingScreen';
import CameraSetupScreen from './screens/CameraSetupScreen';
import StageSelectScreen from './screens/StageSelectScreen';
import GameScreen from './screens/GameScreen';
import ResultScreen from './screens/ResultScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import EndingScreen from './screens/EndingScreen';

function GameRouter() {
  const { gameState } = useGame();

  switch (gameState.currentScreen) {
    case 'intro':
      return <IntroScreen />;
    case 'main':
      return <MainScreen />;
    case 'login':
      return <LoginScreen />;
    case 'loading':
      return <LoadingScreen />;
    case 'camera-setup':
      return <CameraSetupScreen />;
    case 'stage-select':
      return <StageSelectScreen />;
    case 'game':
      return <GameScreen />;
    case 'result':
      return <ResultScreen />;
    case 'leaderboard':
      return <LeaderboardScreen />;
    case 'ending':
      return <EndingScreen />;
    default:
      return <IntroScreen />;
  }
}

export default function App() {
  return (
    <GameProvider>
      <div className="size-full overflow-hidden">
        <GameRouter />
      </div>
    </GameProvider>
  );
}