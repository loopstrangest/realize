import React, { useState, useEffect, useRef } from 'react';
import { TARGET_WORDS } from '../types/game';
import { LevelProps } from '../types/game';
import LevelNavigation from '../components/LevelNavigation';

interface PhoneButton {
  number: string;
  letters: string;
}

const LevelT9Phone: React.FC<LevelProps> = ({
  onComplete,
  onNavigate,
  canGoBack,
  canGoForward,
  levelNumber,
  maxUnlockedLevel,
  transitionState = 'idle',
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [completedWords, setCompletedWords] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLetterLocked, setIsLetterLocked] = useState(true);
  const [lastButtonPressed, setLastButtonPressed] = useState<string>('');
  const [letterIndex, setLetterIndex] = useState(0);
  const lockTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const phoneButtons: PhoneButton[] = [
    { number: '1', letters: '' },
    { number: '2', letters: 'ABC' },
    { number: '3', letters: 'DEF' },
    { number: '4', letters: 'GHI' },
    { number: '5', letters: 'JKL' },
    { number: '6', letters: 'MNO' },
    { number: '7', letters: 'PQRS' },
    { number: '8', letters: 'TUV' },
    { number: '9', letters: 'WXYZ' },
    { number: '*', letters: '' },
    { number: '0', letters: ' ' },
    { number: '#', letters: '' }
  ];

  const currentWord = TARGET_WORDS[currentWordIndex];

  // Clear timeout on component unmount
  useEffect(() => {
    return () => {
      if (lockTimeoutRef.current) {
        clearTimeout(lockTimeoutRef.current);
      }
    };
  }, []);

  const handleButtonPress = (button: PhoneButton) => {
    if (button.letters === '' || button.number === '*' || button.number === '0' || button.number === '#' || button.number === '1') return; // Skip buttons without letters and special buttons

    // Clear existing timeout
    if (lockTimeoutRef.current) {
      clearTimeout(lockTimeoutRef.current);
    }

    const buttonLetters = button.letters;
    
    if (button.number === lastButtonPressed && !isLetterLocked) {
      // Same button pressed again, cycle to next letter
      const nextIndex = (letterIndex + 1) % buttonLetters.length;
      setLetterIndex(nextIndex);
      
      // Replace the last character with the new one
      const newInput = currentInput.slice(0, -1) + buttonLetters[nextIndex];
      setCurrentInput(newInput);
    } else {
      // Different button or letter was locked, add new letter
      const newLetter = buttonLetters[0];
      setCurrentInput(prev => prev + newLetter);
      setLastButtonPressed(button.number);
      setLetterIndex(0);
    }

    // Set letter as unlocked (gray) initially
    setIsLetterLocked(false);

    // Lock the letter after 750ms
    lockTimeoutRef.current = setTimeout(() => {
      setIsLetterLocked(true);
      setLastButtonPressed('');
    }, 750);
  };

  const handleWordTap = () => {
    if (currentInput.toLowerCase() === currentWord.toLowerCase()) {
      // Correct word
      const newCompletedWords = [...completedWords, currentWord];
      setCompletedWords(newCompletedWords);
      setCurrentInput('');
      setIsLetterLocked(true);
      setLastButtonPressed('');
      setLetterIndex(0);
      
      if (lockTimeoutRef.current) {
        clearTimeout(lockTimeoutRef.current);
      }

      if (currentWordIndex + 1 < TARGET_WORDS.length) {
        setCurrentWordIndex(currentWordIndex + 1);
      } else {
        onComplete();
      }
    } else {
      // Incorrect word - clear input
      setCurrentInput('');
      setIsLetterLocked(true);
      setLastButtonPressed('');
      setLetterIndex(0);
      
      if (lockTimeoutRef.current) {
        clearTimeout(lockTimeoutRef.current);
      }
    }
  };


  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center p-4 pb-2">
        <div className="max-w-sm w-full flex flex-col items-center space-y-4">

          {/* Phone keypad */}
          <div className="flex justify-center">
            <div className="grid grid-cols-3 gap-3">
              {phoneButtons.map((button, index) => (
                <button
                  key={button.number}
                  onClick={() => handleButtonPress(button)}
                  className="w-16 h-16 rounded-full bg-gray-100 border-2 border-gray-300 flex flex-col items-center justify-center hover:bg-gray-200 transition-colors active:bg-gray-300"
                >
                  <span className="text-xl font-bold text-black">{button.number}</span>
                  {button.letters && (
                    <span className="text-xs text-gray-600 font-medium">{button.letters}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Current input display */}
          <div className="text-center h-12 flex items-center justify-center w-full">
            {currentInput ? (
              <button
                onClick={handleWordTap}
                className={`text-4xl font-bold px-4 py-2 cursor-pointer ${
                  isLetterLocked ? 'text-black' : 'text-gray-400'
                }`}
              >
                {currentInput}
              </button>
            ) : (
              <div className="h-12"></div>
            )}
          </div>

          {/* Progress checkmarks */}
          <div className="flex justify-center space-x-2 h-6 items-center min-h-[24px]">
            {Array.from({ length: completedWords.length }, (_, index) => (
              <span key={index} className="text-xl text-green-500">
                ✓
              </span>
            ))}
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

export default LevelT9Phone;