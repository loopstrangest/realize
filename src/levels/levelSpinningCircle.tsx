import React, { useState } from 'react';
import { TARGET_WORDS } from '../types/game';
import { LevelProps } from '../types/game';
import LevelNavigation from '../components/LevelNavigation';

const LevelSpinningCircle: React.FC<LevelProps> = ({
  onComplete,
  onNavigate,
  canGoBack,
  canGoForward,
  levelNumber,
  maxUnlockedLevel,
  transitionState = 'idle',
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const handleWordClick = () => {
    if (currentWordIndex < TARGET_WORDS.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      onComplete();
    }
  };

  const radius = 120;
  const centerX = 200;
  const centerY = 200;

  const getWordStartAngle = (wordIndex: number) => {
    // Calculate total character count for proper spacing
    const totalChars = TARGET_WORDS.reduce((sum, word) => sum + word.length + 1, 0) - 1; // -1 for no space after last word
    
    // Calculate starting position for this word
    let charsBefore = 0;
    for (let i = 0; i < wordIndex; i++) {
      charsBefore += TARGET_WORDS[i].length + (i > 0 ? 1 : 0); // +1 for space, except before first word
    }
    
    return (charsBefore / totalChars) * 2 * Math.PI - Math.PI / 2;
  };

  const getLetterPosition = (wordIndex: number, letterIndex: number, totalLetters: number) => {
    const totalChars = TARGET_WORDS.reduce((sum, word) => sum + word.length + 1, 0) - 1;
    const startAngle = getWordStartAngle(wordIndex);
    const letterAngle = startAngle + (letterIndex / totalChars) * 2 * Math.PI;
    
    const x = centerX + radius * Math.cos(letterAngle);
    const y = centerY + radius * Math.sin(letterAngle);
    
    return { x, y, angle: letterAngle };
  };

  const currentWord = TARGET_WORDS[currentWordIndex];

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <div className="relative w-96 h-96">
          <div 
            className="absolute inset-0 animate-spin-slow"
            style={{ animationDuration: '8s' }}
          >
            {TARGET_WORDS.map((word, wordIndex) => {
              const isCurrentWord = wordIndex === currentWordIndex && word === currentWord;
              
              if (!isCurrentWord) return null;
              
              // Calculate word bounds for clickable area
              const firstLetterPos = getLetterPosition(wordIndex, 0, word.length);
              const lastLetterPos = getLetterPosition(wordIndex, word.length - 1, word.length);
              
              // Calculate clickable area dimensions
              // const centerX = 200;
              // const centerY = 200;
              const clickableWidth = word === 'I' ? 60 : Math.abs(lastLetterPos.x - firstLetterPos.x) + 40;
              const clickableHeight = 40;
              
              // Calculate word center position
              const wordCenterX = (firstLetterPos.x + lastLetterPos.x) / 2;
              const wordCenterY = (firstLetterPos.y + lastLetterPos.y) / 2;
              const wordAngle = (firstLetterPos.angle + lastLetterPos.angle) / 2;

              return (
                <div key={wordIndex} className="absolute inset-0">
                  {/* Render letters */}
                  {word.split('').map((letter, letterIndex) => {
                    const position = getLetterPosition(wordIndex, letterIndex, word.length);
                    
                    return (
                      <div
                        key={`${wordIndex}-${letterIndex}`}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                        style={{
                          left: position.x,
                          top: position.y,
                          transform: `translate(-50%, -50%) rotate(${position.angle + Math.PI / 2}rad)`,
                        }}
                      >
                        <span className="text-2xl font-bold text-black font-primary select-none">
                          {letter}
                        </span>
                      </div>
                    );
                  })}
                  
                  {/* Clickable area for whole word */}
                  <button
                    onClick={handleWordClick}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    style={{
                      left: wordCenterX,
                      top: wordCenterY,
                      width: clickableWidth,
                      height: clickableHeight,
                      transform: `translate(-50%, -50%) rotate(${wordAngle + Math.PI / 2}rad)`,
                    }}
                    aria-label={`Click ${word}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <LevelNavigation
        levelNumber={levelNumber}
        onNavigate={onNavigate}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
      />
    </div>
  );
};

export default LevelSpinningCircle;