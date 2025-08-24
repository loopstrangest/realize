import { useState, useEffect } from 'react';
import { GameState } from '../types/game';

const STORAGE_KEY = 'realize-game-state';

const DEFAULT_STATE: GameState = {
  currentLevel: 1,
  completedLevels: [],
  maxUnlockedLevel: 1,
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(DEFAULT_STATE);

  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setGameState(parsed);
      } catch (error) {
        console.error('Failed to parse saved game state:', error);
      }
    }
  }, []);

  const saveState = (newState: GameState) => {
    setGameState(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  };

  const completeLevel = (levelNumber: number) => {
    const newCompletedLevels = [...gameState.completedLevels];
    if (!newCompletedLevels.includes(levelNumber)) {
      newCompletedLevels.push(levelNumber);
    }
    
    const newMaxUnlocked = Math.max(gameState.maxUnlockedLevel, levelNumber + 1);
    const newCurrentLevel = levelNumber + 1;

    saveState({
      currentLevel: newCurrentLevel,
      completedLevels: newCompletedLevels,
      maxUnlockedLevel: newMaxUnlocked,
    });
  };

  const navigateToLevel = (levelNumber: number) => {
    if (levelNumber <= gameState.maxUnlockedLevel) {
      saveState({
        ...gameState,
        currentLevel: levelNumber,
      });
    }
  };

  const restartGame = () => {
    localStorage.removeItem(STORAGE_KEY);
    setGameState(DEFAULT_STATE);
  };

  const setMaxUnlockedLevel = (levelNumber: number) => {
    const newState = {
      currentLevel: levelNumber,
      completedLevels: Array.from({ length: levelNumber - 1 }, (_, i) => i + 1),
      maxUnlockedLevel: levelNumber,
    };
    saveState(newState);
  };

  return {
    gameState,
    completeLevel,
    navigateToLevel,
    restartGame,
    setMaxUnlockedLevel,
  };
};