import React, { useState } from "react";
import { TARGET_WORDS } from "../types/game";
import { LevelProps } from "../types/game";
import LevelNavigation from "../components/LevelNavigation";

interface HangmanState {
  phrase: string;
  guessedLetters: Set<string>;
  wrongGuesses: number;
  isComplete: boolean;
}

const LevelHangman: React.FC<LevelProps> = ({
  onComplete,
  onNavigate,
  canGoBack,
  canGoForward,
  levelNumber,
  maxUnlockedLevel,
  transitionState = "idle",
}) => {
  const [phase, setPhase] = useState<1 | 2>(1);
  const [showCheckmark, setShowCheckmark] = useState(false);

  // Phase 1: "A LOSS IN HANGMAN CAN BE SO IRKSOME"
  const phrase1 = "A LOSS IN HANGMAN CAN BE SO IRKSOME";
  // Phase 2: "I WANT TO REALIZE ALL OF MY DESIRES"
  const phrase2 = TARGET_WORDS.join(" ");

  const [hangman, setHangman] = useState<HangmanState>({
    phrase: phrase1,
    guessedLetters: new Set(),
    wrongGuesses: 0,
    isComplete: false,
  });

  const maxWrongGuesses = 6; // head, body, left arm, right arm, left leg, right leg

  // Mobile keyboard layout
  const keyboardRows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"],
  ];

  // Word pattern for display: [1, 4, 2, 7, 3, 2, 2, 7] letters per word
  const getWordPattern = (currentPhrase: string) => {
    if (currentPhrase === phrase1) {
      // "A LOSS IN HANGMAN CAN BE SO IRKSOME"
      return [
        { word: "A", length: 1 },
        { word: "LOSS", length: 4 },
        { word: "IN", length: 2 },
        { word: "HANGMAN", length: 7 },
        { word: "CAN", length: 3 },
        { word: "BE", length: 2 },
        { word: "SO", length: 2 },
        { word: "IRKSOME", length: 7 },
      ];
    } else {
      // "I WANT TO REALIZE ALL OF MY DESIRES"
      return [
        { word: "I", length: 1 },
        { word: "WANT", length: 4 },
        { word: "TO", length: 2 },
        { word: "REALIZE", length: 7 },
        { word: "ALL", length: 3 },
        { word: "OF", length: 2 },
        { word: "MY", length: 2 },
        { word: "DESIRES", length: 7 },
      ];
    }
  };

  const wordPattern = getWordPattern(hangman.phrase);

  const handleLetterGuess = (letter: string) => {
    if (hangman.guessedLetters.has(letter) || hangman.isComplete) return;

    const newGuessedLetters = new Set(hangman.guessedLetters).add(letter);
    const isCorrectGuess = hangman.phrase.includes(letter);
    const newWrongGuesses = isCorrectGuess
      ? hangman.wrongGuesses
      : hangman.wrongGuesses + 1;

    // Check if phrase is complete
    const isPhraseSolved = hangman.phrase
      .split("")
      .every((char) => char === " " || newGuessedLetters.has(char));

    const gameOver = newWrongGuesses >= maxWrongGuesses;

    setHangman({
      phrase: hangman.phrase,
      guessedLetters: newGuessedLetters,
      wrongGuesses: newWrongGuesses,
      isComplete: isPhraseSolved || gameOver,
    });

    // Handle phrase completion
    if (isPhraseSolved && !gameOver) {
      if (phase === 1) {
        // Show checkmark and transition to phase 2
        setShowCheckmark(true);
        setTimeout(() => {
          setShowCheckmark(false);
          setPhase(2);
          setHangman({
            phrase: phrase2,
            guessedLetters: new Set(),
            wrongGuesses: 0,
            isComplete: false,
          });
        }, 2000);
      } else {
        // Phase 2 complete - finish level
        setTimeout(() => {
          onComplete();
        }, 1000);
      }
    }

    // Handle game over
    if (gameOver) {
      setTimeout(() => {
        // Reset current phase
        setHangman({
          phrase: hangman.phrase,
          guessedLetters: new Set(),
          wrongGuesses: 0,
          isComplete: false,
        });
      }, 2000);
    }
  };

  // Hangman SVG component
  const HangmanSVG = ({ wrongGuesses }: { wrongGuesses: number }) => (
    <svg width="200" height="250" viewBox="0 0 200 250" className="mx-auto">
      {/* Gallows */}
      <line x1="10" y1="230" x2="150" y2="230" stroke="black" strokeWidth="4" />
      <line x1="30" y1="230" x2="30" y2="20" stroke="black" strokeWidth="4" />
      <line x1="30" y1="20" x2="120" y2="20" stroke="black" strokeWidth="4" />
      <line x1="120" y1="20" x2="120" y2="50" stroke="black" strokeWidth="4" />

      {/* Head */}
      {wrongGuesses >= 1 && (
        <circle
          cx="120"
          cy="70"
          r="20"
          stroke="black"
          strokeWidth="2"
          fill="none"
        />
      )}

      {/* Body */}
      {wrongGuesses >= 2 && (
        <line
          x1="120"
          y1="90"
          x2="120"
          y2="170"
          stroke="black"
          strokeWidth="2"
        />
      )}

      {/* Left arm */}
      {wrongGuesses >= 3 && (
        <line
          x1="120"
          y1="110"
          x2="90"
          y2="140"
          stroke="black"
          strokeWidth="2"
        />
      )}

      {/* Right arm */}
      {wrongGuesses >= 4 && (
        <line
          x1="120"
          y1="110"
          x2="150"
          y2="140"
          stroke="black"
          strokeWidth="2"
        />
      )}

      {/* Left leg */}
      {wrongGuesses >= 5 && (
        <line
          x1="120"
          y1="170"
          x2="90"
          y2="200"
          stroke="black"
          strokeWidth="2"
        />
      )}

      {/* Right leg */}
      {wrongGuesses >= 6 && (
        <line
          x1="120"
          y1="170"
          x2="150"
          y2="200"
          stroke="black"
          strokeWidth="2"
        />
      )}
    </svg>
  );

  // Word display component
  const WordDisplay = () => (
    <div className="flex flex-wrap justify-center items-center gap-6 my-8">
      {wordPattern.map((wordInfo, wordIndex) => (
        <div key={wordIndex} className="flex gap-1">
          {Array.from({ length: wordInfo.length }, (_, letterIndex) => {
            const letter = wordInfo.word[letterIndex];
            const isGuessed = hangman.guessedLetters.has(letter);

            return (
              <div
                key={letterIndex}
                className="w-8 h-8 border-b-2 border-black flex items-center justify-center"
              >
                {isGuessed ? (
                  <span className="text-xl font-bold text-black">{letter}</span>
                ) : null}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );

  // Keyboard component
  const Keyboard = () => (
    <div className="space-y-2">
      {keyboardRows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1">
          {row.map((letter) => {
            const isGuessed = hangman.guessedLetters.has(letter);
            const isCorrect = isGuessed && hangman.phrase.includes(letter);
            const isIncorrect = isGuessed && !hangman.phrase.includes(letter);

            return (
              <button
                key={letter}
                onClick={() => handleLetterGuess(letter)}
                disabled={isGuessed}
                className={`w-8 h-10 text-sm font-bold rounded border-2 transition-colors ${
                  isCorrect
                    ? "bg-green-200 border-green-400 text-green-800"
                    : isIncorrect
                    ? "bg-red-200 border-red-400 text-red-800"
                    : isGuessed
                    ? "bg-gray-200 border-gray-400 text-gray-600"
                    : "bg-white border-gray-300 text-black hover:bg-gray-100"
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 p-4 pt-16">
        {/* Checkmark overlay */}
        {showCheckmark && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-full p-8">
              <div className="text-6xl text-green-500">✓</div>
            </div>
          </div>
        )}

        {/* Top: Hangman display */}
        <div className="flex justify-center mb-8">
          <HangmanSVG wrongGuesses={hangman.wrongGuesses} />
        </div>

        {/* Middle: Word blanks */}
        <WordDisplay />

        {/* Game over message */}
        {hangman.isComplete && hangman.wrongGuesses >= maxWrongGuesses && (
          <div className="text-center text-red-600 text-xl font-bold mb-4">
            Game Over! Try Again...
          </div>
        )}

        {/* Phase indicator */}
        <div className="text-center text-gray-600 text-sm mb-4">
          Phase {phase} of 2
        </div>

        {/* Bottom: Keyboard */}
        <div className="mt-8">
          <Keyboard />
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

export default LevelHangman;
