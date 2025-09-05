import React, { useState, useEffect } from "react";
import { useGameState } from "../hooks/useGameState";
import { getLevelById, getTotalLevels } from "../utils/levelRegistry";
import { TransitionState } from "../types/game";
import DevTool from "./DevTool";

const Game: React.FC = () => {
  const {
    gameState,
    completeLevel,
    navigateToLevel,
    restartGame,
    setMaxUnlockedLevel,
  } = useGameState();
  const [transitionState, setTransitionState] =
    useState<TransitionState>("idle");
  const [, setNextLevel] = useState<number | null>(null);
  const [transitionStartMaxLevel, setTransitionStartMaxLevel] =
    useState<number>(1);

  const currentLevelConfig = getLevelById(gameState.currentLevel);

  const handleLevelComplete = () => {
    const nextLevelNumber = gameState.currentLevel + 1;
    const nextLevelConfig = getLevelById(nextLevelNumber);

    if (nextLevelConfig) {
      // Time 0: Start fade out only, capture current state
      setTransitionStartMaxLevel(gameState.maxUnlockedLevel);
      setTransitionState("fadeOut");
      setNextLevel(nextLevelNumber);

      // Time 250ms: Swap logic - level 1 beaten, now on level 2
      setTimeout(() => {
        completeLevel(gameState.currentLevel);
        setTransitionState("fadeIn");

        // Time 500ms: Fade in complete
        setTimeout(() => {
          setTransitionState("idle");
          setNextLevel(null);
        }, 250);
      }, 250);
    } else {
      // No next level, just complete normally
      completeLevel(gameState.currentLevel);
    }
  };

  const handleNavigate = (direction: "prev" | "next") => {
    const targetLevel =
      direction === "next"
        ? gameState.currentLevel + 1
        : gameState.currentLevel - 1;

    // Special handling for navigating from congratulations screen (currentLevel > totalLevels)
    const totalLevels = getTotalLevels();
    const isFromCongrats = !currentLevelConfig && direction === "prev";
    const actualTargetLevel = isFromCongrats ? totalLevels : targetLevel;

    if (actualTargetLevel >= 1 && (actualTargetLevel <= gameState.maxUnlockedLevel || isFromCongrats)) {
      setTransitionStartMaxLevel(gameState.maxUnlockedLevel);
      setTransitionState("fadeOut");
      setNextLevel(actualTargetLevel);

      setTimeout(() => {
        navigateToLevel(actualTargetLevel);
        setTransitionState("fadeIn");

        setTimeout(() => {
          setTransitionState("idle");
          setNextLevel(null);
        }, 250);
      }, 250);
    }
  };

  const canGoBack = gameState.currentLevel > 1;
  const canGoForward = gameState.currentLevel < gameState.maxUnlockedLevel;

  // Function to jump directly to congratulations screen
  const handleGoToCongrats = () => {
    // Set current level to beyond the last level to trigger congratulations
    const totalLevels = getTotalLevels();
    setMaxUnlockedLevel(totalLevels + 1); // This will set currentLevel to totalLevels + 1
  };

  // Confetti animation state
  const [showConfetti, setShowConfetti] = useState(false);

  // Restart confirmation state
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

  // Trigger confetti when reaching congratulations page
  useEffect(() => {
    if (!currentLevelConfig) {
      setShowConfetti(false); // Reset first
      const triggerTimer = setTimeout(() => {
        setShowConfetti(true);
      }, 100);
      const hideTimer = setTimeout(() => {
        setShowConfetti(false);
      }, 6000);
      return () => {
        clearTimeout(triggerTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [currentLevelConfig]);

  // Enhanced confetti piece
  const ConfettiPiece: React.FC<{
    delay: number;
    color: string;
    size: number;
    xOffset: number;
    shape: string;
    rotateSpeed: number;
  }> = ({ delay, color, size, xOffset, shape, rotateSpeed }) => {
    const [isVisible, setIsVisible] = useState(false);
    
    useEffect(() => {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    }, [delay]);

    return (
      <div
        className="absolute"
        style={{
          left: `${xOffset}%`,
          top: "-30px",
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: color,
          borderRadius: shape === 'circle' ? "50%" : shape === 'square' ? "0" : "25%",
          transform: isVisible ? `translateY(110vh) rotate(${rotateSpeed * 3}deg)` : 'translateY(-30px) rotate(0deg)',
          transition: `all ${3000 + Math.random() * 2000}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          zIndex: 40,
        }}
      />
    );
  };

  const renderConfetti = () => {
    const confettiPieces = [];
    const colors = [
      "#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57", 
      "#ff9ff3", "#54a0ff", "#5f27cd", "#fd79a8", "#fdcb6e",
      "#e17055", "#74b9ff", "#0984e3", "#00cec9", "#6c5ce7",
      "#ff7675", "#fd79a8", "#fdcb6e", "#e84393", "#a29bfe"
    ];
    const shapes = ['circle', 'square', 'rounded'];

    for (let i = 0; i < 120; i++) {
      confettiPieces.push(
        <ConfettiPiece
          key={`confetti-${i}-${Date.now()}`}
          delay={Math.random() * 3000}
          color={colors[Math.floor(Math.random() * colors.length)]}
          size={Math.random() * 12 + 8}
          xOffset={Math.random() * 100}
          shape={shapes[Math.floor(Math.random() * shapes.length)]}
          rotateSpeed={Math.random() * 360}
        />
      );
    }
    return confettiPieces;
  };

  if (!currentLevelConfig) {
    return (
      <div 
        className="min-h-screen flex flex-col relative overflow-hidden transition-colors duration-[250ms]"
        style={{
          backgroundColor: transitionState !== "idle" ? "#000000" : "#ffffff"
        }}
      >
        <div 
          className="min-h-screen flex flex-col relative overflow-hidden transition-opacity duration-[250ms]"
          style={{
            opacity: transitionState === "fadeOut" ? 0 : 1
          }}
        >
        {/* Confetti Animation */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-40" style={{ overflow: 'hidden' }}>
            {renderConfetti()}
          </div>
        )}

        <div className="flex-1 p-8">
          <div className="text-center max-w-2xl mx-auto mb-12 select-none">
            <div className="text-6xl mb-8">🎉</div>

            <h1 className="text-4xl font-bold mb-8 text-black">
              Congratulations!
            </h1>

            <p className="text-xl text-black mb-0 leading-relaxed">
              You completed the word-finding journey!
            </p>

            <div className="text-lg text-black mb-8">(for real this time)</div>

            {/* Social Links */}
            <div className="flex justify-center items-center space-x-8 mb-8">
              <a
                href="https://www.instagram.com/strangest.loop/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-gray-600 transition-colors"
                title="Instagram"
              >
                <i className="fab fa-instagram" style={{ fontSize: '52.5px' }}></i>
              </a>
              <a
                href="https://buymeacoffee.com/loopy"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-70 transition-opacity"
                title="Buy Me a Coffee"
              >
                <img 
                  src="/buymeacoffee.png" 
                  alt="Buy Me a Coffee" 
                  className="object-contain"
                  style={{ 
                    filter: 'brightness(0)',
                    width: '60px',
                    height: '60px'
                  }}
                />
              </a>
              <a
                href="https://x.com/strangestloop"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-gray-600 transition-colors"
                title="Twitter"
              >
                <i className="fab fa-twitter" style={{ fontSize: '52.5px' }}></i>
              </a>
            </div>

            {!showRestartConfirm ? (
              <button
                onClick={() => setShowRestartConfirm(true)}
                className="bg-black text-white px-8 py-3 text-lg font-bold hover:bg-gray-800 transition-colors font-primary"
              >
                Restart Game
              </button>
            ) : (
              <div className="text-center">
                <div className="text-lg text-black mb-4">Are you sure?</div>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={restartGame}
                    className="bg-black text-white px-6 py-2 text-lg font-bold hover:bg-gray-800 transition-colors font-primary"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowRestartConfirm(false)}
                    className="bg-black text-white px-6 py-2 text-lg font-bold hover:bg-gray-800 transition-colors font-primary"
                  >
                    No
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation with only left arrow, no level number */}
        <div className="fixed bottom-0 left-0 right-0 bg-transparent p-4 flex justify-between items-center">
          <button
            onClick={() => handleNavigate("prev")}
            className="w-12 h-12 flex items-center justify-center text-2xl font-bold text-black hover:bg-gray-100 rounded-full transition-colors"
          >
            ←
          </button>
          <div className="w-12 h-12"></div>
          <div className="w-12 h-12"></div>
        </div>
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
          backgroundColor: transitionState !== "idle" ? "#000000" : "#ffffff",
        }}
      >
        <div
          className="min-h-screen transition-opacity duration-[250ms]"
          style={{
            opacity: transitionState === "fadeOut" ? 0 : 1,
          }}
        >
          <LevelComponent
            onComplete={handleLevelComplete}
            onNavigate={handleNavigate}
            canGoBack={canGoBack}
            canGoForward={canGoForward}
            levelNumber={gameState.currentLevel}
            maxUnlockedLevel={
              transitionState === "fadeOut"
                ? transitionStartMaxLevel
                : gameState.maxUnlockedLevel
            }
            transitionState={transitionState}
          />
        </div>
      </div>

      <DevTool
        maxUnlockedLevel={gameState.maxUnlockedLevel}
        onSetMaxUnlockedLevel={setMaxUnlockedLevel}
        onGoToCongrats={handleGoToCongrats}
      />
    </>
  );
};

export default Game;
