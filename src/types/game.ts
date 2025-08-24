export const TARGET_WORDS = ['I', 'WANT', 'TO', 'REALIZE', 'ALL', 'OF', 'MY', 'DESIRES'] as const;

export interface GameState {
  currentLevel: number;
  completedLevels: number[];
  maxUnlockedLevel: number;
}

export interface LevelProps {
  onComplete: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  canGoBack: boolean;
  canGoForward: boolean;
  levelNumber: number;
  maxUnlockedLevel: number;
  transitionState?: TransitionState;
}

export type TransitionState = 'idle' | 'fadeOut' | 'fadeIn';