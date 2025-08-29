import React, { useState } from 'react';
import { TARGET_WORDS } from '../types/game';
import { LevelProps } from '../types/game';
import LevelNavigation from '../components/LevelNavigation';

// Define parts of speech categorization for target words
const WORD_CATEGORIES = {
  'I': 'pronouns',
  'WANT': 'verbs',
  'TO': 'prepositions',
  'REALIZE': 'verbs',
  'ALL': 'determiners',
  'OF': 'prepositions',
  'MY': 'determiners',
  'DESIRES': 'nouns'
} as const;

// Extraneous words for each category
const CATEGORY_WORDS = {
  pronouns: ['HE', 'SHE', 'THEY', 'WE', 'YOU', 'HIM', 'HER', 'THEM', 'US'],
  verbs: ['NEED', 'FEEL', 'DO', 'MAKE', 'GET', 'TAKE', 'GIVE', 'FIND', 'THINK', 'SEE'],
  prepositions: ['IN', 'ON', 'AT', 'BY', 'FOR', 'WITH', 'FROM', 'ABOUT', 'OVER', 'UNDER'],
  determiners: ['THE', 'A', 'AN', 'THIS', 'THAT', 'SOME', 'MANY', 'FEW', 'EACH', 'EVERY'],
  nouns: ['DREAMS', 'HOPES', 'GOALS', 'WISHES', 'PLANS', 'NEEDS', 'WANTS', 'IDEAS', 'THOUGHTS'],
  // Red herring categories
  adjectives: ['BEAUTIFUL', 'LARGE', 'SMALL', 'GOOD', 'BAD', 'NEW', 'OLD', 'HAPPY', 'SAD', 'BRIGHT'],
  possessives: ['HIS', 'HERS', 'THEIRS', 'OURS', 'YOURS', 'ITS', 'MINE', 'WHOSE']
} as const;

type CategoryKey = keyof typeof CATEGORY_WORDS;

const LevelDropdown: React.FC<LevelProps> = ({
  onComplete,
  onNavigate,
  canGoBack,
  canGoForward,
  levelNumber,
  maxUnlockedLevel,
  transitionState = 'idle',
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const [folderContents, setFolderContents] = useState<Record<string, string[]>>({});

  const currentWord = TARGET_WORDS[currentWordIndex];

  // Get words that should be visible in each category (generate once per folder open)
  const getVisibleWordsForCategory = (category: CategoryKey): string[] => {
    // If already generated for this folder, return cached version
    if (folderContents[category]) {
      return folderContents[category];
    }

    const extraWords = CATEGORY_WORDS[category];
    const targetWordsInCategory = TARGET_WORDS
      .slice(0, currentWordIndex + 1) // Only show current and previous words
      .filter(word => WORD_CATEGORIES[word] === category);
    
    const allWords = [...extraWords, ...targetWordsInCategory];
    
    // Shuffle array using Fisher-Yates algorithm
    const shuffled = [...allWords];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Cache the shuffled result
    setFolderContents(prev => ({ ...prev, [category]: shuffled }));
    
    return shuffled;
  };

  // Toggle folder open/close
  const toggleFolder = (folderName: string) => {
    const newOpenFolders = new Set(openFolders);
    if (newOpenFolders.has(folderName)) {
      newOpenFolders.delete(folderName);
    } else {
      newOpenFolders.add(folderName);
    }
    setOpenFolders(newOpenFolders);
  };

  // Handle word click
  const handleWordClick = (clickedWord: string) => {
    if (clickedWord === currentWord) {
      // Close all folders and clear cached contents
      setOpenFolders(new Set());
      setFolderContents({});
      
      if (currentWordIndex < TARGET_WORDS.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1);
      } else {
        onComplete();
      }
    }
  };

  // Check if a word should be clickable
  const isWordClickable = (word: string): boolean => {
    return word === currentWord;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 p-8 pt-16">
        <div className="max-w-md mx-auto">
          {/* Main "Words" folder */}
          <div className="mb-4">
            <div 
              className="flex items-center justify-between cursor-pointer p-3 border border-black hover:bg-black hover:text-white transition-colors"
              onClick={() => toggleFolder('main')}
            >
              <div className="flex items-center">
                <span className="text-xl mr-2">
                  {openFolders.has('main') ? '−' : '+'}
                </span>
                <span className="text-lg font-semibold">WORDS</span>
              </div>
              
              {/* Progress checkmarks */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: currentWordIndex }, (_, i) => (
                  <span key={i} className="text-lg">✓</span>
                ))}
              </div>
            </div>
            
            {/* Nested categories */}
            {openFolders.has('main') && (
              <div className="ml-6 mt-2 space-y-2">
                {/* Pronouns */}
                <div>
                  <div 
                    className="flex items-center cursor-pointer p-2 border border-black hover:bg-black hover:text-white transition-colors"
                    onClick={() => toggleFolder('pronouns')}
                  >
                    <span className="text-lg mr-2">
                      {openFolders.has('pronouns') ? '−' : '+'}
                    </span>
                    <span className="text-md font-medium">PRONOUNS</span>
                  </div>
                  
                  {openFolders.has('pronouns') && (
                    <div className="ml-6 mt-1 space-y-1">
                      {getVisibleWordsForCategory('pronouns').map((word) => (
                        <div 
                          key={word}
                          className="p-2 border border-black cursor-pointer hover:bg-black hover:text-white transition-colors"
                          onClick={() => handleWordClick(word)}
                        >
                          {word}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Verbs */}
                <div>
                  <div 
                    className="flex items-center cursor-pointer p-2 border border-black hover:bg-black hover:text-white transition-colors"
                    onClick={() => toggleFolder('verbs')}
                  >
                    <span className="text-lg mr-2">
                      {openFolders.has('verbs') ? '−' : '+'}
                    </span>
                    <span className="text-md font-medium">VERBS</span>
                  </div>
                  
                  {openFolders.has('verbs') && (
                    <div className="ml-6 mt-1 space-y-1">
                      {getVisibleWordsForCategory('verbs').map((word) => (
                        <div 
                          key={word}
                          className="p-2 border border-black cursor-pointer hover:bg-black hover:text-white transition-colors"
                          onClick={() => handleWordClick(word)}
                        >
                          {word}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Prepositions */}
                <div>
                  <div 
                    className="flex items-center cursor-pointer p-2 border border-black hover:bg-black hover:text-white transition-colors"
                    onClick={() => toggleFolder('prepositions')}
                  >
                    <span className="text-lg mr-2">
                      {openFolders.has('prepositions') ? '−' : '+'}
                    </span>
                    <span className="text-md font-medium">PREPOSITIONS</span>
                  </div>
                  
                  {openFolders.has('prepositions') && (
                    <div className="ml-6 mt-1 space-y-1">
                      {getVisibleWordsForCategory('prepositions').map((word) => (
                        <div 
                          key={word}
                          className="p-2 border border-black cursor-pointer hover:bg-black hover:text-white transition-colors"
                          onClick={() => handleWordClick(word)}
                        >
                          {word}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Determiners */}
                <div>
                  <div 
                    className="flex items-center cursor-pointer p-2 border border-black hover:bg-black hover:text-white transition-colors"
                    onClick={() => toggleFolder('determiners')}
                  >
                    <span className="text-lg mr-2">
                      {openFolders.has('determiners') ? '−' : '+'}
                    </span>
                    <span className="text-md font-medium">DETERMINERS</span>
                  </div>
                  
                  {openFolders.has('determiners') && (
                    <div className="ml-6 mt-1 space-y-1">
                      {getVisibleWordsForCategory('determiners').map((word) => (
                        <div 
                          key={word}
                          className="p-2 border border-black cursor-pointer hover:bg-black hover:text-white transition-colors"
                          onClick={() => handleWordClick(word)}
                        >
                          {word}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Nouns */}
                <div>
                  <div 
                    className="flex items-center cursor-pointer p-2 border border-black hover:bg-black hover:text-white transition-colors"
                    onClick={() => toggleFolder('nouns')}
                  >
                    <span className="text-lg mr-2">
                      {openFolders.has('nouns') ? '−' : '+'}
                    </span>
                    <span className="text-md font-medium">NOUNS</span>
                  </div>
                  
                  {openFolders.has('nouns') && (
                    <div className="ml-6 mt-1 space-y-1">
                      {getVisibleWordsForCategory('nouns').map((word) => (
                        <div 
                          key={word}
                          className="p-2 border border-black cursor-pointer hover:bg-black hover:text-white transition-colors"
                          onClick={() => handleWordClick(word)}
                        >
                          {word}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Adjectives - Red herring category */}
                <div>
                  <div 
                    className="flex items-center cursor-pointer p-2 border border-black hover:bg-black hover:text-white transition-colors"
                    onClick={() => toggleFolder('adjectives')}
                  >
                    <span className="text-lg mr-2">
                      {openFolders.has('adjectives') ? '−' : '+'}
                    </span>
                    <span className="text-md font-medium">ADJECTIVES</span>
                  </div>
                  
                  {openFolders.has('adjectives') && (
                    <div className="ml-6 mt-1 space-y-1">
                      {getVisibleWordsForCategory('adjectives').map((word) => (
                        <div 
                          key={word}
                          className="p-2 border border-black cursor-pointer hover:bg-black hover:text-white transition-colors"
                          onClick={() => handleWordClick(word)}
                        >
                          {word}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Possessives - Red herring category (confusable with "MY") */}
                <div>
                  <div 
                    className="flex items-center cursor-pointer p-2 border border-black hover:bg-black hover:text-white transition-colors"
                    onClick={() => toggleFolder('possessives')}
                  >
                    <span className="text-lg mr-2">
                      {openFolders.has('possessives') ? '−' : '+'}
                    </span>
                    <span className="text-md font-medium">POSSESSIVES</span>
                  </div>
                  
                  {openFolders.has('possessives') && (
                    <div className="ml-6 mt-1 space-y-1">
                      {getVisibleWordsForCategory('possessives').map((word) => (
                        <div 
                          key={word}
                          className="p-2 border border-black cursor-pointer hover:bg-black hover:text-white transition-colors"
                          onClick={() => handleWordClick(word)}
                        >
                          {word}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
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

export default LevelDropdown;