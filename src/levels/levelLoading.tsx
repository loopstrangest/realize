import React, { useState, useEffect } from "react";
import { TARGET_WORDS } from "../types/game";
import { LevelProps } from "../types/game";
import LevelNavigation from "../components/LevelNavigation";

const LevelLoading: React.FC<LevelProps> = ({
  onComplete,
  onNavigate,
  canGoBack,
  canGoForward,
  levelNumber,
  maxUnlockedLevel,
  transitionState = "idle",
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [messageOrder, setMessageOrder] = useState<number[]>([]);

  // Loading messages for each target word - only one contains the target word
  const loadingMessages = {
    I: [
      "I am loading...",
      "Level loading...",
      "Loading next level...",
      "Currently loading...",
      "System loading...",
    ],
    WANT: [
      "Loading preferences...",
      "Classifying want data...",
      "Fetching requirements...",
      "Processing request...",
      "Initializing system...",
    ],
    TO: [
      "Loading to do list...",
      "Connecting server...",
      "Preparing interface...",
      "Downloading files...",
      "Starting process...",
    ],
    REALIZE: [
      "Loading modules...",
      "Creating realize tests...",
      "Compiling resources...",
      "Establishing connection...",
      "Verifying credentials...",
    ],
    ALL: [
      "Loading all components...",
      "Scanning files...",
      "Building interface...",
      "Checking dependencies...",
      "Optimizing performance...",
    ],
    OF: [
      "Loading library of functions...",
      "Parsing data...",
      "Rendering elements...",
      "Synchronizing state...",
      "Validating input...",
    ],
    MY: [
      "Loading my profile...",
      "Authenticating user...",
      "Configuring settings...",
      "Updating cache...",
      "Preparing workspace...",
    ],
    DESIRES: [
      "Fulfilling desires...",
      "Loading preferences...",
      "Customizing experience...",
      "Personalizing content...",
      "Optimizing results...",
    ],
  };

  // Shuffle array using Fisher-Yates algorithm with fixed seed for consistency
  const shuffleWithSeed = (array: number[], seed: number): number[] => {
    const arr = [...array];
    let random = seed;

    for (let i = arr.length - 1; i > 0; i--) {
      random = (random * 9301 + 49297) % 233280;
      const j = Math.floor((random / 233280) * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Initialize message order for current word
  useEffect(() => {
    const currentWord = TARGET_WORDS[currentWordIndex];
    const seed = currentWord
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const shuffledOrder = shuffleWithSeed([0, 1, 2, 3, 4], seed);
    setMessageOrder(shuffledOrder);
    setCurrentMessageIndex(0);
  }, [currentWordIndex]);

  // Rotate through messages every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % 5);
    }, 1750);

    return () => clearInterval(interval);
  }, []);

  // Handle word click
  const handleWordClick = (clickedWord: string) => {
    const targetWord = TARGET_WORDS[currentWordIndex];

    if (clickedWord.toUpperCase() === targetWord.toUpperCase()) {
      if (currentWordIndex < TARGET_WORDS.length - 1) {
        // Move to next word
        setCurrentWordIndex((prev) => prev + 1);
      } else {
        // Level complete!
        onComplete();
      }
    }
  };

  // Render clickable message
  const renderClickableMessage = (message: string) => {
    if (!message) return null;
    const words = message.split(" ");

    return (
      <div className="text-xl text-gray-600 text-center select-none">
        {words.map((word, index) => {
          const cleanWord = word.replace(/[.,!?;:]/g, "");
          const targetWord = TARGET_WORDS[currentWordIndex];
          const isClickable = cleanWord.toUpperCase() === targetWord.toUpperCase();

          return (
            <span key={index}>
              {isClickable ? (
                <span
                  onClick={() => handleWordClick(cleanWord)}
                  className="mx-1 cursor-pointer"
                >
                  {word}
                </span>
              ) : (
                <span className="mx-1">{word}</span>
              )}
            </span>
          );
        })}
      </div>
    );
  };

  const currentWord = TARGET_WORDS[currentWordIndex];
  const messages = loadingMessages[currentWord as keyof typeof loadingMessages];
  const currentMessage =
    messageOrder.length > 0
      ? messages[messageOrder[currentMessageIndex]]
      : messages[0];
  const progress = ((currentWordIndex + 1) / 9) * 100; // 1/9 to 8/9

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Loading Bar */}
        <div className="w-full max-w-md mb-2">
          <div className="bg-gray-200 rounded-full h-6 overflow-hidden">
            <div
              className="bg-green-500 h-full transition-all duration-500 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              {/* Animated diagonal stripes */}
              <div
                className="absolute inset-0 opacity-30 animate-loading-stripes overflow-hidden"
                style={{
                  width: '1200%',
                  left: '0%',
                  background:
                    "repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.3) 8px, rgba(255,255,255,0.3) 16px)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Loading Message */}
        <div className="min-h-16 flex items-center justify-center mt-0">
          {renderClickableMessage(currentMessage)}
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

export default LevelLoading;
