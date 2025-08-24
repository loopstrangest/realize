import React, { useState } from 'react';
import { useGameState } from '../hooks/useGameState';
import { getLevelById } from '../utils/levelRegistry';
import { TransitionState } from '../types/game';
import DevTool from './DevTool';

const Game: React.FC = () => {
  const { gameState, completeLevel, navigateToLevel, restartGame, setMaxUnlockedLevel } = useGameState();
  const [transitionState, setTransitionState] = useState<TransitionState>('idle');
  const [, setNextLevel] = useState<number | null>(null);
  const [transitionStartMaxLevel, setTransitionStartMaxLevel] = useState<number>(1);

  const currentLevelConfig = getLevelById(gameState.currentLevel);

  const handleLevelComplete = () => {
    const nextLevelNumber = gameState.currentLevel + 1;
    const nextLevelConfig = getLevelById(nextLevelNumber);
    
    if (nextLevelConfig) {
      // Time 0: Start fade out only, capture current state
      setTransitionStartMaxLevel(gameState.maxUnlockedLevel);
      setTransitionState('fadeOut');
      setNextLevel(nextLevelNumber);
      
      // Time 250ms: Swap logic - level 1 beaten, now on level 2
      setTimeout(() => {
        completeLevel(gameState.currentLevel);
        setTransitionState('fadeIn');
        
        // Time 500ms: Fade in complete
        setTimeout(() => {
          setTransitionState('idle');
          setNextLevel(null);
        }, 250);
      }, 250);
    } else {
      // No next level, just complete normally
      completeLevel(gameState.currentLevel);
    }
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    const targetLevel = direction === 'next' 
      ? gameState.currentLevel + 1 
      : gameState.currentLevel - 1;

    if (targetLevel >= 1 && targetLevel <= gameState.maxUnlockedLevel) {
      setTransitionStartMaxLevel(gameState.maxUnlockedLevel);
      setTransitionState('fadeOut');
      setNextLevel(targetLevel);
      
      setTimeout(() => {
        navigateToLevel(targetLevel);
        setTransitionState('fadeIn');
        
        setTimeout(() => {
          setTransitionState('idle');
          setNextLevel(null);
        }, 250);
      }, 250);
    }
  };

  const canGoBack = gameState.currentLevel > 1;
  const canGoForward = gameState.currentLevel < gameState.maxUnlockedLevel;

  if (!currentLevelConfig) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-black mb-8 font-primary">
            CONGRATULATIONS!
          </h1>
          <p className="text-xl text-black mb-8 font-primary">
            You've completed all levels!
          </p>
          <button
            onClick={restartGame}
            className="bg-black text-white px-8 py-3 text-lg font-bold hover:bg-gray-800 transition-colors font-primary"
          >
            RESTART GAME
          </button>
        </div>
      </div>
    );
  }

  const LevelComponent = currentLevelConfig.component;

  return (
    <>
      <div 
        className="min-h-screen transition-colors duration-[250ms]"
        style={{
          backgroundColor: transitionState !== 'idle' ? '#000000' : '#ffffff'
        }}
      >
        <div 
          className="min-h-screen transition-opacity duration-[250ms]"
          style={{
            opacity: transitionState === 'fadeOut' ? 0 : 1
          }}
        >
          <LevelComponent
            onComplete={handleLevelComplete}
            onNavigate={handleNavigate}
            canGoBack={canGoBack}
            canGoForward={canGoForward}
            levelNumber={gameState.currentLevel}
            maxUnlockedLevel={transitionState === 'fadeOut' ? transitionStartMaxLevel : gameState.maxUnlockedLevel}
            transitionState={transitionState}
          />
        </div>
      </div>
      
      <DevTool 
        maxUnlockedLevel={gameState.maxUnlockedLevel}
        onSetMaxUnlockedLevel={setMaxUnlockedLevel}
      />
    </>
  );
};

export default Game;