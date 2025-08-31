import React, { useState } from 'react';
import { TARGET_WORDS } from '../types/game';
import { LevelProps } from '../types/game';
import LevelNavigation from '../components/LevelNavigation';

const LevelGettysburg: React.FC<LevelProps> = ({
  onComplete,
  onNavigate,
  canGoBack,
  canGoForward,
  levelNumber,
  maxUnlockedLevel,
  transitionState = 'idle',
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [clickedWords, setClickedWords] = useState<Set<string>>(new Set());

  const currentTargetWord = TARGET_WORDS[currentWordIndex];

  // Modified Gettysburg Address with target words dispersed throughout naturally
  const gettysburgText = `Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal.

Now we are engaged in a great civil war, testing whether that nation, or any nation so conceived and so dedicated, can long endure. We are met on a great battle-field. I believe we have come to dedicate a portion of that field, as a final resting place for those who here gave their lives that that nation might live. It is altogether fitting and proper that we should do this.

But, in a larger sense, we can not dedicate—we can not consecrate—we can not hallow—this ground. The brave men, living and dead, who struggled here, have consecrated it, far above our poor power to add or detract. Many want the world to little note, nor long remember what we say here, but it can never forget what they did here. It is for us the living, rather, to be dedicated here to the unfinished work which they who fought here have thus far so nobly advanced.

It is rather for us to be here dedicated to the great task remaining before us—that from these honored dead we take increased devotion to that cause for which they gave the last full measure and realize that these dead shall not have died in vain—that this nation, under God, shall have a new birth concerning freedom, and all the hopes within my heart know these desires for peace shall guide us—that government of the people, by the people, for the people, shall not perish from the earth.`;

  // Function to split text into words while preserving punctuation and spacing
  const parseTextIntoWords = (text: string) => {
    const words = [];
    const regex = /(\S+|\s+)/g;
    let match;
    let wordId = 0;

    while ((match = regex.exec(text)) !== null) {
      const token = match[1];
      if (token.trim()) {
        // It's a word (possibly with punctuation)
        const cleanWord = token.replace(/[^\w]/g, '').toUpperCase();
        words.push({
          id: wordId++,
          original: token,
          clean: cleanWord,
          isTarget: TARGET_WORDS.includes(cleanWord as any),
          isSpace: false,
        });
      } else {
        // It's whitespace
        words.push({
          id: wordId++,
          original: token,
          clean: '',
          isTarget: false,
          isSpace: true,
        });
      }
    }

    return words;
  };

  const words = parseTextIntoWords(gettysburgText);

  const handleWordClick = (wordData: any) => {
    if (!wordData.isTarget || wordData.clean !== currentTargetWord) return;

    const wordKey = `${wordData.clean}-${wordData.id}`;
    setClickedWords(prev => new Set(prev).add(wordKey));

    if (currentWordIndex < TARGET_WORDS.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      onComplete();
    }
  };

  const getWordClassName = (wordData: any) => {
    const wordKey = `${wordData.clean}-${wordData.id}`;
    const isClicked = clickedWords.has(wordKey);

    if (wordData.isSpace) {
      return '';
    }
    
    if (isClicked) {
      return 'bg-yellow-200';
    }

    return '';
  };

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-y-auto overflow-x-hidden">
      <div className="flex-1 pt-16 pb-32 px-[5%]">
        <div className="max-w-[600px] mx-auto">
          <div className="text-lg leading-relaxed text-gray-800 font-serif min-h-[120vh] text-left break-words select-none">
            {words.map((wordData) => {
              if (wordData.isSpace) {
                return (
                  <span key={wordData.id} className="whitespace-pre-wrap">
                    {wordData.original}
                  </span>
                );
              }

              return (
                <span
                  key={wordData.id}
                  className={getWordClassName(wordData)}
                  onClick={() => handleWordClick(wordData)}
                >
                  {wordData.original}
                </span>
              );
            })}
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

export default LevelGettysburg;