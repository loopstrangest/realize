import React, { useState, useEffect } from "react";
import { TARGET_WORDS } from "../types/game";
import { LevelProps } from "../types/game";
import LevelNavigation from "../components/LevelNavigation";

const LevelPlayPause: React.FC<LevelProps> = ({
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
  const [isPlaying, setIsPlaying] = useState(true);
  const [messageOrder, setMessageOrder] = useState<number[]>([]);
  const [caughtWords, setCaughtWords] = useState<string[]>([]);

  // 8 messages, each containing exactly 2 of the target words
  const messages = [
    "I BELIEVE WHAT WANT MEANS NOW", // I, WANT
    "WE REALIZE ALL THAT IS HERE", // REALIZE, ALL
    "EVERY DAY TO SHARE OF WISDOM", // TO, OF
    "SIMPLE THINGS BECOME MY GREATEST DESIRES", // MY, DESIRES
    "SOME I NEED TO UNDERSTAND BETTER", // I, TO
    "WE ALL WANT NOTHING BUT PEACE", // WANT, ALL
    "KNOW AND REALIZE MOST OF EVERYTHING", // REALIZE, OF
    "FIND MY INNER DESIRES GROWING", // MY, DESIRES
  ];

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

  // Initialize message order - fixed random order
  useEffect(() => {
    const seed = 12345; // Fixed seed for consistent order
    const shuffledOrder = shuffleWithSeed([0, 1, 2, 3, 4, 5, 6, 7], seed);
    setMessageOrder(shuffledOrder);
  }, []);

  // Cycle through messages every 1/8 second when playing
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % 8);
    }, 125); // 1/8 second = 125ms

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Handle word click when paused
  const handleWordClick = (clickedWord: string) => {
    if (isPlaying) return; // Only allow clicks when paused

    const targetWord = TARGET_WORDS[currentWordIndex];

    if (clickedWord.toUpperCase() === targetWord.toUpperCase()) {
      const newCaughtWords = [...caughtWords, targetWord];
      setCaughtWords(newCaughtWords);

      if (currentWordIndex < TARGET_WORDS.length - 1) {
        setCurrentWordIndex((prev) => prev + 1);
      } else {
        // All words caught - level complete!
        onComplete();
      }
    }
  };

  // Render clickable message
  const renderClickableMessage = (message: string) => {
    if (!message) return null;
    const words = message.split(" ");

    return (
      <p className="text-3xl font-bold text-center select-none leading-tight max-w-sm mx-auto">
        {words.map((word, index) => {
          const cleanWord = word.replace(/[.,!?;:]/g, "");
          const targetWord = TARGET_WORDS[currentWordIndex];
          const isClickable =
            cleanWord.toUpperCase() === targetWord.toUpperCase() && !isPlaying;

          return (
            <span key={index}>
              {isClickable ? (
                <span
                  onClick={() => handleWordClick(cleanWord)}
                  className="cursor-pointer"
                >
                  {word}{" "}
                </span>
              ) : (
                <span>{word} </span>
              )}
            </span>
          );
        })}
      </p>
    );
  };

  const currentMessage =
    messageOrder.length > 0
      ? messages[messageOrder[currentMessageIndex]]
      : messages[0];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4 px-8 space-y-6">
        {/* Fixed height message area */}
        <div className="h-32 flex items-center justify-center w-full">
          {renderClickableMessage(currentMessage)}
        </div>

        {/* Fixed height play/pause button */}
        <div className="h-20 flex items-center justify-center">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-20 h-20 rounded-full bg-gray-800 text-white flex items-center justify-center text-4xl hover:bg-gray-700 transition-colors"
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
        </div>

        {/* Fixed height checkmarks area */}
        <div className="h-16 flex items-center justify-center">
          <div className="flex flex-wrap gap-3 justify-center">
            {caughtWords.map((_, index) => (
              <span
                key={index}
                className="text-green-600 text-3xl font-bold leading-none"
              >
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

export default LevelPlayPause;
