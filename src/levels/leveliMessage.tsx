import React, { useState } from 'react';
import { TARGET_WORDS } from '../types/game';
import { LevelProps } from '../types/game';
import LevelNavigation from '../components/LevelNavigation';

interface Message {
  id: string;
  text: string;
  sender: 'other' | 'user';
  clickableWord?: string;
  options?: string[];
}

const LeveliMessage: React.FC<LevelProps> = ({
  onComplete,
  onNavigate,
  canGoBack,
  canGoForward,
  levelNumber,
  maxUnlockedLevel,
  transitionState = 'idle',
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial',
      text: 'I am free for collaborative haiku writing!',
      sender: 'other',
      clickableWord: 'I'
    }
  ]);
  const [showingOptions, setShowingOptions] = useState<string[]>([]);
  const [conversationPath, setConversationPath] = useState<string[]>([]);

  // Conversation flow based on choices made
  const getConversationFlow = () => {
    const flows = {
      // After "I am free for collaborative haiku writing!" -> WANT options
      WANT: [
        'Whenever you want :)',
        'I want an effortless collab :)'
      ],
      
      // Gray responses based on WANT choice -> TO word
      TO: {
        'Whenever you want :)': 'Flowers laid to rest',
        'I want an effortless collab :)': 'Flowers laid to rest'
      },
      
      // Blue options for REALIZE -> gray ALL response
      REALIZE: [
        'Realize death\'s true nature',
        'Realize time\'s quick passage'
      ],
      
      ALL: {
        'Realize death\'s true nature': 'All is in decay',
        'Realize time\'s quick passage': 'All is in decay'
      },
      
      // Blue options for OF -> gray MY response
      OF: [
        'Whispers of terror',
        'A thick slice of pie'
      ],
      
      MY: {
        'Whispers of terror': 'Chills ripple through my body',
        'A thick slice of pie': 'Chills ripple through my body'
      },
      
      // Final DESIRES options
      DESIRES: [
        'Lost in desires',
        'It desires more'
      ]
    };
    
    return flows;
  };

  const currentWord = TARGET_WORDS[currentWordIndex];

  // Handle clicking a word in a message
  const handleWordClick = (clickedWord: string, messageId: string) => {
    if (clickedWord !== currentWord) return;

    setCurrentWordIndex(currentWordIndex + 1);

    if (currentWordIndex + 1 < TARGET_WORDS.length) {
      const nextWord = TARGET_WORDS[currentWordIndex + 1];
      const flows = getConversationFlow();
      
      // Show user options for next word
      if (flows[nextWord as keyof typeof flows] && Array.isArray(flows[nextWord as keyof typeof flows])) {
        const options = flows[nextWord as keyof typeof flows] as string[];
        setTimeout(() => {
          setShowingOptions(options);
        }, 500);
      }
    } else {
      // Final word clicked - complete level
      onComplete();
    }
  };

  // Handle selecting an option
  const handleOptionSelect = (selectedText: string) => {
    const userMessage: Message = {
      id: `user-${currentWordIndex}`,
      text: selectedText,
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setShowingOptions([]);
    
    // Track the conversation path
    const newPath = [...conversationPath, selectedText];
    setConversationPath(newPath);

    setCurrentWordIndex(currentWordIndex + 1);

    if (currentWordIndex + 1 < TARGET_WORDS.length) {
      const nextWord = TARGET_WORDS[currentWordIndex + 1];
      const flows = getConversationFlow();
      
      // Get the gray response based on previous choice
      if (flows[nextWord as keyof typeof flows] && !Array.isArray(flows[nextWord as keyof typeof flows])) {
        const responses = flows[nextWord as keyof typeof flows] as Record<string, string>;
        const grayResponse = responses[selectedText];
        
        if (grayResponse) {
          const grayMessage: Message = {
            id: `other-${currentWordIndex + 1}`,
            text: grayResponse,
            sender: 'other',
            clickableWord: nextWord
          };
          
          setTimeout(() => {
            setMessages(prev => [...prev, grayMessage]);
          }, 500);
        }
      }
    } else {
      // Final word clicked - complete level
      onComplete();
    }
  };

  // Render a message bubble
  const renderMessage = (message: Message, isOption = false) => {
    const isUser = message.sender === 'user';
    const words = message.text.split(' ');
    
    return (
      <div
        key={message.id}
        className={`flex mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`max-w-xs px-4 py-2 rounded-2xl select-none ${
            isUser
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-black'
          }`}
        >
          <span className="text-sm select-none">
            {words.map((word, index) => {
              // Remove punctuation for comparison
              const cleanWord = word.replace(/[.,!?;:]$/, '').toUpperCase();
              const isClickable = cleanWord === currentWord && message.clickableWord === cleanWord;
              const isOptionWord = isOption && cleanWord === currentWord;
              
              return (
                <span
                  key={index}
                  className={`select-none ${isClickable || isOptionWord ? 'cursor-pointer' : ''}`}
                  onClick={(isClickable || isOptionWord) ? (e) => {
                    e.stopPropagation();
                    if (isOption) {
                      handleOptionSelect(message.text);
                    } else {
                      handleWordClick(cleanWord, message.id);
                    }
                  } : undefined}
                >
                  {word}
                  {index < words.length - 1 ? ' ' : ''}
                </span>
              );
            })}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col">
        {/* Messages area */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {/* Existing messages */}
            {messages.map((message) => renderMessage(message))}
            
            {/* Option messages (user can select from) */}
            {showingOptions.map((optionText, index) => {
              const optionMessage: Message = {
                id: `option-${index}`,
                text: optionText,
                sender: 'user',
                clickableWord: currentWord
              };
              return (
                <div key={`option-${index}`} className="opacity-60">
                  {renderMessage(optionMessage, true)}
                </div>
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

export default LeveliMessage;