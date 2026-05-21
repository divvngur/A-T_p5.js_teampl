import { createContext, useContext, useState, ReactNode } from 'react';
import { GameState, ScreenType, GameMode } from '../types/game';

interface GameContextType {
  gameState: GameState;
  setCurrentScreen: (screen: ScreenType) => void;
  setGameMode: (mode: GameMode) => void;
  setSelectedStage: (stage: number) => void;
  setUser: (user: { uid: string; displayName: string } | undefined) => void;
  setScore: (score: number) => void;
  setLives: (lives: number) => void;
  setSurvivalTime: (time: number) => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const initialState: GameState = {
  currentScreen: 'intro',
  isLoggedIn: false,
  score: 0,
  lives: 3,
  survivalTime: 0,
};

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(initialState);

  const setCurrentScreen = (screen: ScreenType) => {
    setGameState(prev => ({ ...prev, currentScreen: screen }));
  };

  const setGameMode = (mode: GameMode) => {
    setGameState(prev => ({ ...prev, gameMode: mode }));
  };

  const setSelectedStage = (stage: number) => {
    setGameState(prev => ({ ...prev, selectedStage: stage }));
  };

  const setUser = (user: { uid: string; displayName: string } | undefined) => {
    setGameState(prev => ({ ...prev, user, isLoggedIn: !!user }));
  };

  const setScore = (score: number) => {
    setGameState(prev => ({ ...prev, score }));
  };

  const setLives = (lives: number) => {
    setGameState(prev => ({ ...prev, lives }));
  };

  const setSurvivalTime = (time: number) => {
    setGameState(prev => ({ ...prev, survivalTime: time }));
  };

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      score: 0,
      lives: 3,
      survivalTime: 0,
    }));
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        setCurrentScreen,
        setGameMode,
        setSelectedStage,
        setUser,
        setScore,
        setLives,
        setSurvivalTime,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}
