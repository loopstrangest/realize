import React, { useState, useEffect, useRef } from 'react';
import { TARGET_WORDS } from '../types/game';
import { LevelProps } from '../types/game';
import LevelNavigation from '../components/LevelNavigation';

const LevelSpotlight: React.FC<LevelProps> = ({
  onComplete,
  onNavigate,
  canGoBack,
  canGoForward,
  levelNumber,
  maxUnlockedLevel,
  transitionState = 'idle',
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [spotlightPosition, setSpotlightPosition] = useState({ x: 0, y: 0 });
  const [spotlightRadius, setSpotlightRadius] = useState(0);
  const [wordPosition, setWordPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const currentWord = TARGET_WORDS[currentWordIndex];

  // Calculate font size - largest for "I", smallest for "DESIRES"
  const getFontSize = (wordIndex: number) => {
    const baseSizes = [64, 56, 48, 42, 38, 34, 30, 26]; // Decreasing sizes
    return baseSizes[wordIndex] || 26;
  };

  // Generate random position for current word
  const generateWordPosition = () => {
    if (!containerRef.current) return { x: 0, y: 0 };
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    // Give extra padding for words to ensure they're fully within bounds
    const padding = 100;
    const x = Math.random() * (containerRect.width - padding * 2) + padding;
    const y = Math.random() * (containerRect.height - padding * 2) + padding;
    
    return { x, y };
  };

  // Calculate spotlight radius based on viewport
  const calculateSpotlightRadius = () => {
    if (!containerRef.current) return 0;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const smallerDimension = Math.min(containerRect.width, containerRect.height);
    
    return smallerDimension / 6; // Diameter = 1/3, so radius = 1/6
  };

  // Handle mouse/touch movement
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    setSpotlightPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current || e.touches.length === 0) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const touch = e.touches[0];
    
    setSpotlightPosition({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
  };

  // Handle word click
  const handleWordClick = () => {
    if (currentWordIndex < TARGET_WORDS.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      // Generate new position for next word
      setWordPosition(generateWordPosition());
    } else {
      onComplete();
    }
  };

  // Initialize word position and spotlight radius on mount and window resize
  useEffect(() => {
    const updateLayout = () => {
      setWordPosition(generateWordPosition());
      setSpotlightRadius(calculateSpotlightRadius());
    };

    updateLayout();
    
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  // Update word position when currentWordIndex changes (but only if container exists)
  useEffect(() => {
    if (containerRef.current) {
      setWordPosition(generateWordPosition());
    }
  }, [currentWordIndex]);

  return (
    <div className="min-h-screen bg-black flex flex-col overflow-hidden">
      <div 
        ref={containerRef}
        className="flex-1 relative cursor-none"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        style={{ minHeight: 'calc(100vh - 80px)' }}
      >
        {/* Spotlight effect using CSS mask */}
        <div 
          className="absolute inset-0 bg-white"
          style={{
            maskImage: `radial-gradient(circle at ${spotlightPosition.x}px ${spotlightPosition.y}px, white ${spotlightRadius}px, transparent ${spotlightRadius + 1}px)`,
            WebkitMaskImage: `radial-gradient(circle at ${spotlightPosition.x}px ${spotlightPosition.y}px, white ${spotlightRadius}px, transparent ${spotlightRadius + 1}px)`,
          }}
        />
        
        {/* Current word - black text that becomes visible through spotlight */}
        <div
          className="absolute cursor-pointer select-none"
          style={{
            left: wordPosition.x,
            top: wordPosition.y,
            transform: 'translate(-50%, -50%)',
            fontSize: `${getFontSize(currentWordIndex)}px`,
            padding: currentWord === 'I' ? '20px 30px' : '10px 15px',
          }}
          onClick={handleWordClick}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleWordClick();
          }}
        >
          <span className="font-bold text-black font-primary">
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

export default LevelSpotlight;