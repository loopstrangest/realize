import React, { useState, useEffect, useRef } from 'react';
import { TARGET_WORDS } from '../types/game';
import { LevelProps } from '../types/game';
import LevelNavigation from '../components/LevelNavigation';

const LevelScreensaver: React.FC<LevelProps> = ({
  onComplete,
  onNavigate,
  canGoBack,
  canGoForward,
  levelNumber,
  maxUnlockedLevel,
  transitionState = 'idle',
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  
  const getRandomPosition = () => {
    if (!containerRef.current) {
      // Fallback for initial render before container is available
      return { 
        x: Math.random() * 400 + 100, // Random x between 100-500
        y: Math.random() * 300 + 100  // Random y between 100-400
      };
    }
    const container = containerRef.current.getBoundingClientRect();
    return {
      x: Math.random() * (container.width - 200) + 100, // Random x across screen width
      y: Math.random() * (container.height - 100) + 50, // Random y across screen height
    };
  };

  const getRandomVelocity = () => {
    const directions = [
      { x: 2, y: 2 },   // Southeast
      { x: 2, y: -2 },  // Northeast  
      { x: -2, y: 2 },  // Southwest
      { x: -2, y: -2 }, // Northwest
    ];
    return directions[Math.floor(Math.random() * directions.length)];
  };

  const [position, setPosition] = useState(() => ({
    x: Math.random() * 400 + 100,
    y: Math.random() * 300 + 100
  }));
  // const [velocity, setVelocity] = useState(getRandomVelocity);
  const velocityRef = useRef(getRandomVelocity());

  const currentWord = TARGET_WORDS[currentWordIndex];

  const handleWordClick = () => {
    if (currentWordIndex < TARGET_WORDS.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      // Reset position and velocity for next word
      setPosition(getRandomPosition());
      const newVelocity = getRandomVelocity();
      // setVelocity(newVelocity);
      velocityRef.current = newVelocity;
    } else {
      onComplete();
    }
  };

  useEffect(() => {
    const animate = () => {
      if (!containerRef.current || !wordRef.current) return;

      const container = containerRef.current;
      const word = wordRef.current;
      const containerRect = container.getBoundingClientRect();
      const wordRect = word.getBoundingClientRect();

      setPosition(prevPosition => {
        const currentVel = velocityRef.current;
        let newX = prevPosition.x + currentVel.x;
        let newY = prevPosition.y + currentVel.y;
        let newVelX = currentVel.x;
        let newVelY = currentVel.y;
        let bounced = false;

        const wordWidth = wordRect.width;
        const wordHeight = wordRect.height;

        // Check for wall collisions and bounce
        // Left wall collision - reverse X direction only
        if (newX <= 0) {
          newX = 1; // Move slightly away from wall
          newVelX = -currentVel.x; // Reverse X direction
          bounced = true;
        }
        
        // Right wall collision - reverse X direction only
        if (newX + wordWidth >= containerRect.width) {
          newX = containerRect.width - wordWidth - 1; // Move slightly away from wall
          newVelX = -currentVel.x; // Reverse X direction
          bounced = true;
        }
        
        // Top wall collision - reverse Y direction only
        if (newY <= 0) {
          newY = 1; // Move slightly away from wall
          newVelY = -currentVel.y; // Reverse Y direction
          bounced = true;
        }
        
        // Bottom wall collision - reverse Y direction only
        if (newY + wordHeight >= containerRect.height) {
          newY = containerRect.height - wordHeight - 1; // Move slightly away from wall
          newVelY = -currentVel.y; // Reverse Y direction
          bounced = true;
        }

        // Update velocity if bounced
        if (bounced) {
          const newVelocity = { x: newVelX, y: newVelY };
          velocityRef.current = newVelocity;
          // setVelocity(newVelocity);
        }

        return { x: newX, y: newY };
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentWordIndex]);

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
        style={{ minHeight: 'calc(100vh - 80px)' }}
      >
        <div
          ref={wordRef}
          className="absolute cursor-pointer select-none"
          style={{
            left: position.x,
            top: position.y,
            padding: currentWord === 'I' ? '20px 30px' : '8px 12px',
          }}
          onClick={handleWordClick}
        >
          <span className="text-4xl font-bold text-black font-primary hover:text-gray-600 transition-colors">
            {currentWord}
          </span>
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

export default LevelScreensaver;