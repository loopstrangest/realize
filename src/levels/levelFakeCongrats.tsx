import React, { useState } from "react";
import { TARGET_WORDS } from "../types/game";
import { LevelProps } from "../types/game";
import LevelNavigation from "../components/LevelNavigation";

const LevelFakeCongrats: React.FC<LevelProps> = ({
  onComplete,
  onNavigate,
  canGoBack,
  canGoForward,
  levelNumber,
  maxUnlockedLevel,
  transitionState = "idle",
}) => {
  const [showSurvey, setShowSurvey] = useState(false);
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
  const [caughtWords, setCaughtWords] = useState<string[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: number;
  }>({});

  // Survey questions with target words hidden throughout
  const surveyQuestions = [
    {
      question: "What aspects should be improved?",
      options: [
        "Graphics and visual design",
        "Audio of the sound effects", // of (word 6)
        "Level difficulty progression",
        "User interface design",
      ],
    },
    {
      question: "How would you rate your overall experience?",
      options: [
        "Excellent - enjoyed every level",
        "Good - I would play more games like this", // I (word 1)
        "Fair - it was okay",
        "Poor - not preferable",
      ],
    },
    {
      question: "Which level type was most engaging?",
      options: [
        "Word search puzzles",
        "Interactive dialogue scenes",
        "Pattern recognition helped realize solutions", // realize (word 4)
        "Puzzle variety combinations",
      ],
    },
    {
      question: "What would motivate future play?",
      options: [
        "More levels and content",
        "Multiplayer features",
        "Achievement system fulfilling desires", // desires (word 8)
        "Social sharing options",
      ],
    },
    {
      question: "What kept you engaged?",
      options: [
        "The creative level designs",
        "Challenge and difficulty to overcome", // to (word 3)
        "Curiosity about the story",
        "Entertainment value",
      ],
    },
    {
      question: "Did the game meet expectations?",
      options: [
        "Exceeded expectations completely",
        "Met my personal expectations", // my (word 7)
        "Partially met expectations",
        "Below expectations",
      ],
    },
    {
      question: "Would you recommend the game?",
      options: [
        "Very likely - want other people's opinions", // want (word 2)
        "Somewhat likely - maybe share with a few friends",
        "Neutral - no strong feelings",
        "Unlikely - don't think others would enjoy it",
      ],
    },
    {
      question: "How would you describe the difficulty?",
      options: [
        "Too easy overall",
        "Just right for all skill levels", // all (word 5)
        "Challenging but fair",
        "Too difficult",
      ],
    },
  ];

  // Handle word click - must be in sequence
  const handleWordClick = (
    clickedWord: string,
    questionIndex?: number,
    optionIndex?: number
  ) => {
    const targetWord = TARGET_WORDS[currentTargetIndex];

    // Also handle radio button selection if this click is in the survey
    if (questionIndex !== undefined && optionIndex !== undefined) {
      handleRadioChange(questionIndex, optionIndex);
    }

    if (clickedWord.toUpperCase() === targetWord.toUpperCase()) {
      const newCaughtWords = [...caughtWords, targetWord];
      setCaughtWords(newCaughtWords);

      if (currentTargetIndex < TARGET_WORDS.length - 1) {
        setCurrentTargetIndex((prev) => prev + 1);
      } else {
        // All words found - complete the level!
        setTimeout(() => {
          onComplete();
        }, 1000);
      }
    }
  };

  // Render text with clickable target words
  const renderClickableText = (
    text: string,
    questionIndex?: number,
    optionIndex?: number
  ) => {
    const words = text.split(" ");

    return words.map((word, index) => {
      const cleanWord = word.replace(/[.,!?;:-]/g, "");
      const targetWord = TARGET_WORDS[currentTargetIndex];
      const isClickable = cleanWord.toUpperCase() === targetWord.toUpperCase();
      const isAlreadyClicked = caughtWords.some(
        (caughtWord) => caughtWord.toUpperCase() === cleanWord.toUpperCase()
      );

      return (
        <span key={index}>
          {isClickable ? (
            <span
              onClick={() =>
                handleWordClick(cleanWord, questionIndex, optionIndex)
              }
              className="cursor-pointer"
            >
              {word}
            </span>
          ) : isAlreadyClicked ? (
            <span className="bg-yellow-300">{word}</span>
          ) : (
            <span>{word}</span>
          )}
          {index < words.length - 1 && " "}
        </span>
      );
    });
  };

  const handleRadioChange = (questionIndex: number, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const allQuestionsAnswered = Object.keys(selectedAnswers).length === 8;

  return (
    <div className="min-h-screen bg-white flex flex-col select-none">
      <div className="flex-1 p-8">
        {/* Checkmarks display */}
        <div className="fixed top-4 left-4 flex flex-wrap gap-2 z-50">
          {caughtWords.map((_, index) => (
            <span
              key={index}
              className="text-green-600 text-2xl font-bold leading-none"
            >
              ✓
            </span>
          ))}
        </div>

        {/* Main congratulations content */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-6xl mb-8">🎉</div>

          <h1 className="text-4xl font-bold mb-8 text-black">
            Congratulations!
          </h1>

          <p className="text-xl text-black mb-8 leading-relaxed">
            You completed the word-finding journey!
          </p>

          <div className="text-lg text-black mb-8">
            Please fill out this short feedback survey:
          </div>

          <button
            onClick={() => setShowSurvey(!showSurvey)}
            className="bg-black text-white px-8 py-3 text-lg font-bold hover:bg-gray-800 transition-colors font-primary"
          >
            {showSurvey ? "Hide Survey" : "Show Survey"}
          </button>
        </div>

        {/* Survey section */}
        {showSurvey && (
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {surveyQuestions.map((q, qIndex) => (
                <div key={qIndex} className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">
                    {qIndex + 1}. {renderClickableText(q.question, qIndex)}
                  </h3>

                  <div className="space-y-3">
                    {q.options.map((option, oIndex) => (
                      <label
                        key={oIndex}
                        className="flex items-center space-x-3 cursor-pointer"
                        onClick={() => handleRadioChange(qIndex, oIndex)}
                      >
                        <input
                          type="radio"
                          name={`question-${qIndex}`}
                          className="w-4 h-4 pointer-events-none"
                          checked={selectedAnswers[qIndex] === oIndex}
                          readOnly
                        />
                        <span className="text-gray-600">
                          {renderClickableText(option, qIndex, oIndex)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <button
                onClick={() => {}} // Fake submit - does nothing
                className={`px-8 py-3 text-lg font-bold transition-colors font-primary ${
                  allQuestionsAnswered
                    ? "bg-black text-white hover:bg-gray-800"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                disabled={!allQuestionsAnswered}
              >
                Submit Survey
              </button>
            </div>
          </div>
        )}
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

export default LevelFakeCongrats;
