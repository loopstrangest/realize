import React, { useState, useEffect, useRef } from 'react';
import { TARGET_WORDS } from '../types/game';
import { LevelProps } from '../types/game';
import LevelNavigation from '../components/LevelNavigation';

interface FallingWord {
  id: number;
  word: string;
  letters: string[];
  x: number;
  y: number;
  speed: number;
  isTarget: boolean;
}

const LevelBasket: React.FC<LevelProps> = ({
  onComplete,
  onNavigate,
  canGoBack,
  canGoForward,
  levelNumber,
  maxUnlockedLevel,
  transitionState = 'idle',
}) => {
  const [basketX, setBasketX] = useState(0);
  const [fallingWords, setFallingWords] = useState<FallingWord[]>([]);
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [caughtWords, setCaughtWords] = useState<string[]>([]);
  const [gameState, setGameState] = useState<'playing' | 'restarting'>('playing');
  const [wordIdCounter, setWordIdCounter] = useState(0);
  const [wordsSinceLastTarget, setWordsSinceLastTarget] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  const wordSpawnTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Decoy words - synonyms and related words
  const decoyWords = [
    'ME', 'WISH', 'NEED', 'GET', 'ACHIEVE', 'HAVE', 'REACH', 'GAIN',
    'EVERY', 'EACH', 'SOME', 'ABOUT', 'DREAMS', 'WANTS', 'HOPES',
    'YOUR', 'OUR', 'HIS', 'HER', 'THEIR', 'GOALS', 'WISHES'
  ];

  const currentTargetWord = TARGET_WORDS[currentTargetIndex];

  // Convert word to vertical letters array
  const wordToVerticalLetters = (word: string): string[] => {
    return word.split('');
  };

  // Generate random falling word
  const generateFallingWord = React.useCallback((): FallingWord => {
    // Guarantee target word in last 5 words if it hasn't appeared
    const shouldForceTarget = wordsSinceLastTarget >= 4;
    const shouldBeTarget = shouldForceTarget || Math.random() < 0.4; // 40% chance for target word
    const word = shouldBeTarget ? currentTargetWord : decoyWords[Math.floor(Math.random() * decoyWords.length)];
    
    const containerWidth = containerRef.current?.clientWidth || 800;
    const wordWidth = 40; // Reduced width for tighter collision detection
    
    return {
      id: wordIdCounter,
      word,
      letters: wordToVerticalLetters(word),
      x: Math.random() * (containerWidth - wordWidth),
      y: -100,
      speed: 3 + Math.random() * 3, // Speed between 3-6
      isTarget: shouldBeTarget && word === currentTargetWord,
    };
  }, [currentTargetWord, wordIdCounter, wordsSinceLastTarget]);

  // Handle mouse movement for basket
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - 80; // Center basket (80px is half basket width)
    setBasketX(Math.max(0, Math.min(newX, rect.width - 160))); // Keep basket within bounds
  };

  // Handle touch movement for basket
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current || e.touches.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const newX = touch.clientX - rect.left - 80;
    setBasketX(Math.max(0, Math.min(newX, rect.width - 160)));
  };

  // Check collision between basket and word - more strict hitbox
  const checkCollision = React.useCallback((word: FallingWord): boolean => {
    const basketWidth = 160;
    const basketHeight = 70;
    const basketY = (containerRef.current?.clientHeight || 600) - 120; // Basket position from bottom
    
    // Tighter collision detection - word must be more centered in basket
    const wordWidth = 40; // Reduced from 60 for stricter detection
    const wordCenterX = word.x + wordWidth / 2;
    const basketCenterX = basketX + basketWidth / 2;
    const basketInnerWidth = basketWidth * 0.7; // Only use inner 70% of basket for collision
    const wordHeight = word.letters.length * 30;
    
    // Check if word center is within basket inner area
    const isWithinBasketX = Math.abs(wordCenterX - basketCenterX) < basketInnerWidth / 2;
    const isWithinBasketY = word.y < basketY + basketHeight && word.y + wordHeight > basketY;
    
    return isWithinBasketX && isWithinBasketY;
  }, [basketX]);

  // Handle word catch
  const handleWordCatch = React.useCallback((word: FallingWord) => {
    if (word.isTarget && word.word === currentTargetWord) {
      // Correct word in correct order
      const newCaughtWords = [...caughtWords, word.word];
      setCaughtWords(newCaughtWords);
      
      if (currentTargetIndex + 1 < TARGET_WORDS.length) {
        setCurrentTargetIndex(currentTargetIndex + 1);
        setWordsSinceLastTarget(0); // Reset counter for next word
      } else {
        // All words caught - level complete!
        onComplete();
      }
    } else {
      // Wrong word or wrong order - lose a life
      const newLives = lives - 1;
      setLives(newLives);
      
      // Lives can go negative - no game over!
    }
  }, [currentTargetWord, caughtWords, currentTargetIndex, lives, onComplete]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = () => {
      setFallingWords(prevWords => {
        const updatedWords = prevWords.map(word => ({
          ...word,
          y: word.y + word.speed,
        }));

        // Check collisions
        const wordsToRemove: number[] = [];
        updatedWords.forEach(word => {
          if (checkCollision(word)) {
            handleWordCatch(word);
            wordsToRemove.push(word.id);
          }
        });

        // Remove caught words and words that fell off screen
        return updatedWords.filter(word => 
          !wordsToRemove.includes(word.id) && 
          word.y < (containerRef.current?.clientHeight || 600) + 100
        );
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [basketX, currentTargetIndex, lives, caughtWords, gameState, wordsSinceLastTarget, checkCollision, handleWordCatch]);

  // Word spawning
  useEffect(() => {
    if (gameState !== 'playing') return;

    const spawnWord = () => {
      setWordIdCounter(prev => prev + 1);
      const newWord = generateFallingWord();
      setFallingWords(prev => [...prev, newWord]);
      
      // Track words since last target
      if (newWord.isTarget) {
        setWordsSinceLastTarget(0);
      } else {
        setWordsSinceLastTarget(prev => prev + 1);
      }
    };

    const spawnInterval = setInterval(spawnWord, 800); // Spawn word every 0.8 seconds
    wordSpawnTimerRef.current = spawnInterval;

    return () => {
      if (wordSpawnTimerRef.current) {
        clearInterval(wordSpawnTimerRef.current);
      }
    };
  }, [generateFallingWord, gameState]);

  // Initialize basket position
  useEffect(() => {
    if (containerRef.current) {
      setBasketX(containerRef.current.clientWidth / 2 - 80);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden">
      <div 
        ref={containerRef}
        className="flex-1 relative cursor-none"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        style={{ minHeight: 'calc(100vh - 80px)' }}
      >
        {/* Game over transition flash */}
        {gameState === 'restarting' && (
          <div className="absolute inset-0 bg-black z-20 transition-colors duration-250">
          </div>
        )}

        {/* Falling words */}
        {fallingWords.map(word => (
          <div
            key={word.id}
            className="absolute flex flex-col items-center pointer-events-none"
            style={{
              left: word.x,
              top: word.y,
            }}
          >
            {word.letters.map((letter, index) => (
              <div
                key={index}
                className="text-2xl font-bold font-primary text-black"
              >
                {letter}
              </div>
            ))}
          </div>
        ))}

        {/* Basket */}
        <div
          className="absolute"
          style={{
            left: basketX,
            bottom: 100,
            width: 160,
            height: 70,
          }}
        >
          {/* Wider basket-shaped SVG - flipped right-side up */}
          <svg width="160" height="70" viewBox="0 0 160 70">
            {/* Main basket shape - right-side up with curved bottom */}
            <path
              d="M25 15 Q25 10 30 10 L130 10 Q135 10 135 15 L140 25 Q140 60 135 60 L25 60 Q20 60 20 25 Z"
              fill="white"
              stroke="black"
              strokeWidth="2"
            />
            {/* Vertical stripes */}
            <line x1="30" y1="15" x2="27" y2="55" stroke="black" strokeWidth="1"/>
            <line x1="40" y1="12" x2="37" y2="57" stroke="black" strokeWidth="1"/>
            <line x1="50" y1="11" x2="47" y2="58" stroke="black" strokeWidth="1"/>
            <line x1="60" y1="11" x2="57" y2="58" stroke="black" strokeWidth="1"/>
            <line x1="70" y1="11" x2="73" y2="58" stroke="black" strokeWidth="1"/>
            <line x1="80" y1="11" x2="83" y2="58" stroke="black" strokeWidth="1"/>
            <line x1="90" y1="11" x2="93" y2="58" stroke="black" strokeWidth="1"/>
            <line x1="100" y1="11" x2="103" y2="58" stroke="black" strokeWidth="1"/>
            <line x1="110" y1="11" x2="113" y2="58" stroke="black" strokeWidth="1"/>
            <line x1="120" y1="12" x2="123" y2="57" stroke="black" strokeWidth="1"/>
            <line x1="130" y1="15" x2="133" y2="55" stroke="black" strokeWidth="1"/>
            {/* Horizontal stripes */}
            <line x1="25" y1="20" x2="135" y2="20" stroke="black" strokeWidth="1"/>
            <line x1="26" y1="30" x2="134" y2="30" stroke="black" strokeWidth="1"/>
            <line x1="27" y1="40" x2="133" y2="40" stroke="black" strokeWidth="1"/>
            <line x1="29" y1="50" x2="131" y2="50" stroke="black" strokeWidth="1"/>
          </svg>
          
        </div>

        {/* Lives indicator - single heart with counter */}
        <div className="absolute top-4 left-4">
          <div className="flex items-center text-2xl font-bold">
            <div className="w-8 h-8 mr-1">
              <svg viewBox="0 0 24 24" fill="black">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <span>X {lives}</span>
          </div>
          
          {/* Checkmarks display - larger and below heart counter */}
          <div className="mt-2 flex flex-wrap gap-2 max-w-32">
            {caughtWords.map((_, index) => (
              <span key={index} className="text-green-600 text-2xl font-bold leading-none">
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

export default LevelBasket;