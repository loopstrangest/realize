import React, { useState, useEffect } from 'react';
import { TARGET_WORDS } from '../types/game';
import { LevelProps } from '../types/game';
import LevelNavigation from '../components/LevelNavigation';

type GameState = 'input' | 'showing' | 'result';

const LevelVowels: React.FC<LevelProps> = ({
  onComplete,
  onNavigate,
  canGoBack,
  canGoForward,
  levelNumber,
  maxUnlockedLevel,
  transitionState = 'idle',
}) => {
  const [gameState, setGameState] = useState<GameState>('input');
  const [userInput, setUserInput] = useState('');
  const [fadeState, setFadeState] = useState('visible');
  const [revealedVowels, setRevealedVowels] = useState(0);
  const [extraEs, setExtraEs] = useState(0);

  // The complete phrase: "I WANT TO REALIZE ALL OF MY DESIRES"
  const fullPhrase = TARGET_WORDS.join(' ');
  
  // All vowels in the phrase in order: I, A, O, E, A, I, E, A, O, E, I, E (12 total)
  const vowelPositions = [
    { word: 'I', position: 0, vowel: 'I' },
    { word: 'WANT', position: 1, vowel: 'A' },
    { word: 'TO', position: 1, vowel: 'O' },
    { word: 'REALIZE', position: 1, vowel: 'E' },
    { word: 'REALIZE', position: 2, vowel: 'A' },
    { word: 'REALIZE', position: 4, vowel: 'I' },
    { word: 'REALIZE', position: 6, vowel: 'E' },
    { word: 'ALL', position: 0, vowel: 'A' },
    { word: 'OF', position: 0, vowel: 'O' },
    { word: 'DESIRES', position: 1, vowel: 'E' },
    { word: 'DESIRES', position: 3, vowel: 'I' },
    { word: 'DESIRES', position: 5, vowel: 'E' }
  ];

  const numberButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  // Handle keyboard input
  useEffect(() => {
    if (gameState !== 'input') return;

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key >= '0' && event.key <= '9' && userInput.length < 4) {
        setUserInput(prev => prev + event.key);
      } else if (event.key === 'Backspace') {
        setUserInput(prev => prev.slice(0, -1));
      } else if (event.key === 'Enter' && userInput.length > 0) {
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, userInput]);

  const handleNumberClick = (number: string) => {
    if (userInput.length < 4) {
      setUserInput(prev => prev + number);
    }
  };

  const handleBackspace = () => {
    setUserInput(prev => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (userInput.length === 0) return;
    
    const numVowels = parseInt(userInput);
    
    // Start fade transition
    setFadeState('hidden');
    
    setTimeout(() => {
      setGameState('showing');
      setRevealedVowels(0);
      
      if (numVowels > 12) {
        setExtraEs(numVowels - 12);
      } else {
        setExtraEs(0);
      }
      
      setFadeState('visible');
      
      // Start revealing vowels
      if (numVowels > 0) {
        revealVowelsSequentially(numVowels);
      } else {
        // No vowels to reveal, show result immediately
        setTimeout(() => showResult(numVowels), 1000);
      }
    }, 500);
  };

  const revealVowelsSequentially = (totalVowels: number) => {
    let count = 0;
    const maxVowels = Math.min(totalVowels, 25); // Cap at 25
    
    const revealNext = () => {
      if (count < maxVowels) {
        count++;
        setRevealedVowels(count);
        
        // For >12 vowels: Show X immediately when we start adding extra E's (after 12th vowel)
        if (totalVowels > 12 && count === 13) {
          setGameState('result');
          // Start restart process while animation continues
          setTimeout(() => {
            setFadeState('hidden');
            setTimeout(() => {
              setGameState('input');
              setUserInput('');
              setRevealedVowels(0);
              setExtraEs(0);
              setFadeState('visible');
            }, 500);
          }, 1500); // Shorter timeout so it cuts off the animation
        }
        
        if (count < maxVowels) {
          setTimeout(revealNext, 300); // 300ms between each vowel reveal
        } else if (totalVowels <= 12) {
          setTimeout(() => showResult(totalVowels), 1000);
        }
      }
    };
    
    setTimeout(revealNext, 500);
  };

  const showResult = (numVowels: number) => {
    if (numVowels === 12) {
      // Correct! Complete the level
      setTimeout(() => {
        onComplete();
      }, 250);
    } else {
      // Incorrect - show X and restart
      setGameState('result');
      
      setTimeout(() => {
        // Reset everything
        setFadeState('hidden');
        setTimeout(() => {
          setGameState('input');
          setUserInput('');
          setRevealedVowels(0);
          setExtraEs(0);
          setFadeState('visible');
        }, 500);
      }, 2000);
    }
  };

  const renderWordWithVowels = (word: string, wordIndex: number) => {
    const letters = word.split('');
    
    return letters.map((letter, letterIndex) => {
      // Check if this position should show a vowel
      const vowelInfo = vowelPositions.find(v => 
        v.word === word && v.position === letterIndex
      );
      
      if (vowelInfo) {
        const vowelOrderIndex = vowelPositions.indexOf(vowelInfo);
        const shouldShow = vowelOrderIndex < revealedVowels;
        
        if (letter.match(/[AEIOU]/i)) {
          return (
            <span key={`${wordIndex}-${letterIndex}`} className="inline-block">
              {shouldShow ? letter : ''}
            </span>
          );
        }
      }
      
      // Regular consonant
      return (
        <span key={`${wordIndex}-${letterIndex}`} className="inline-block">
          {letter}
        </span>
      );
    });
  };

  const renderPhrase = () => {
    return (
      <div className="text-4xl font-bold text-center leading-relaxed">
        {TARGET_WORDS.map((word, index) => (
          <span key={index}>
            {renderWordWithVowels(word, index)}
            {word === 'DESIRES' && extraEs > 0 && revealedVowels > 12 && (
              <span>
                {'E'.repeat(Math.min(extraEs, Math.max(0, revealedVowels - 12)))}
              </span>
            )}
            {index < TARGET_WORDS.length - 1 && ' '}
          </span>
        ))}
      </div>
    );
  };

  if (gameState === 'input') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className={`flex-1 flex flex-col items-center justify-center p-8 transition-opacity duration-500 ${fadeState === 'hidden' ? 'opacity-0' : 'opacity-100'}`}>
          
          <div className="text-3xl font-bold text-center mb-8">
            How many vowels do you want?
          </div>
          
          <div className="text-4xl font-bold text-center mb-8 min-h-16 flex items-center justify-center">
            <span>{userInput || '0'}</span>
          </div>
          
          {/* Number buttons */}
          <div className="grid grid-cols-5 gap-3 mb-4">
            {numberButtons.map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                className="w-12 h-12 text-xl font-bold rounded border-2 border-gray-300 hover:bg-gray-100 transition-colors"
              >
                {num}
              </button>
            ))}
          </div>
          
          {/* Backspace button */}
          <button
            onClick={handleBackspace}
            className="w-24 h-12 text-lg font-bold rounded border-2 border-gray-300 hover:bg-gray-100 transition-colors mb-4"
          >
            ⌫
          </button>
          
          {/* Submit button - fixed space */}
          <div className="h-12 flex items-center justify-center">
            {userInput.length > 0 ? (
              <button
                onClick={handleSubmit}
                className="px-6 py-3 text-lg font-bold bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Submit
              </button>
            ) : (
              <div></div>
            )}
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
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className={`flex-1 flex flex-col items-center justify-center p-8 transition-opacity duration-500 ${fadeState === 'hidden' ? 'opacity-0' : 'opacity-100'}`}>
        
        {renderPhrase()}
        
        {/* Fixed space for result */}
        <div className="mt-8 h-20 flex items-center justify-center">
          {gameState === 'result' && parseInt(userInput) !== 12 && (
            <div className="text-6xl font-bold text-red-500">
              ✗
            </div>
          )}
          {gameState === 'showing' && parseInt(userInput) === 12 && revealedVowels === 12 && (
            <div className="text-6xl font-bold text-green-500">
              ✓
            </div>
          )}
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

export default LevelVowels;