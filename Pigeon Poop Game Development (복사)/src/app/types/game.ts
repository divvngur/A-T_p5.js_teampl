export type ScreenType =
  | 'intro'
  | 'main'
  | 'login'
  | 'loading'
  | 'camera-setup'
  | 'stage-select'
  | 'game'
  | 'result'
  | 'leaderboard'
  | 'ending';

export type GameMode = 'stage' | 'competitive';

export interface GameState {
  currentScreen: ScreenType;
  gameMode?: GameMode;
  selectedStage?: number;
  isLoggedIn: boolean;
  user?: {
    uid: string;
    displayName: string;
  };
  score: number;
  lives: number;
  survivalTime: number;
}

export interface StageConfig {
  stage: number;
  targetEggs: number;
  pigeonCount: number;
  fallSpeed: number;
  poopRatio: number;
  hasBoss: boolean;
}

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'egg' | 'poop' | 'laser' | 'curve' | 'giant_poop';
  radius: number;
  active: boolean;
}

export interface Pigeon {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'normal' | 'miniboss' | 'boss';
  health: number;
  dropTimer: number;
}
