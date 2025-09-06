import React, { useState } from 'react';
import { TARGET_WORDS } from '../types/game';
import { LevelProps } from '../types/game';
import LevelNavigation from '../components/LevelNavigation';

const LevelIntro: React.FC<LevelProps> = ({
  onComplete,
  onNavigate,
  canGoBack,
  canGoForward,
  levelNumber,
  maxUnlockedLevel,
  transitionState = 'idle',
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  // const [showNavigation, setShowNavigation] = useState(false);

  const rows = [
    ['I', 'WANT'],
    ['TO', 'REALIZE'],
    ['ALL', 'OF'],
    ['MY', 'DESIRES']
  ];

  const handleWordClick = () => {
    if (currentWordIndex < TARGET_WORDS.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      // Call onComplete immediately when DESIRES is clicked
      onComplete();
    }
  };

  const getCurrentRow = () => {
    if (currentWordIndex < 2) return 0;
    if (currentWordIndex < 4) return 1;
    if (currentWordIndex < 6) return 2;
    return 3;
  };

  const getCurrentPositionInRow = () => {
    return currentWordIndex % 2;
  };

  const currentWord = TARGET_WORDS[currentWordIndex];

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="max-w-sm space-y-8">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center space-x-8">
              {row.map((word, wordInRowIndex) => {
                const isCurrentWord = 
                  rowIndex === getCurrentRow() && 
                  wordInRowIndex === getCurrentPositionInRow() &&
                  word === currentWord;

                return (
                  <div
                    key={`${rowIndex}-${wordInRowIndex}`}
                    className="w-24 h-16 flex items-center justify-center relative"
                  >
                    {isCurrentWord && (
                      <button
                        onClick={handleWordClick}
                        className="text-4xl font-bold text-black hover:text-gray-600 transition-colors cursor-pointer select-none font-primary"
                      >
                        {word}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {(maxUnlockedLevel > 1 && transitionState !== 'fadeOut') && (
        <LevelNavigation
          levelNumber={levelNumber}
          onNavigate={onNavigate}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
        />
      )}
    </div>
  );
};

export default LevelIntro;