import React from 'react';

interface LevelNavigationProps {
  levelNumber: number;
  onNavigate: (direction: 'prev' | 'next') => void;
  canGoBack: boolean;
  canGoForward: boolean;
}

const LevelNavigation: React.FC<LevelNavigationProps> = ({
  levelNumber,
  onNavigate,
  canGoBack,
  canGoForward,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-transparent p-4 flex justify-between items-center">
      {canGoBack && (
        <button
          onClick={() => onNavigate('prev')}
          className="w-12 h-12 flex items-center justify-center text-2xl font-bold text-black hover:bg-gray-100 rounded-full transition-colors"
        >
          ←
        </button>
      )}
      {!canGoBack && (
        <div className="w-12 h-12"></div>
      )}
      
      <div className="text-xl font-bold text-black select-none">
        {levelNumber}
      </div>
      
      {canGoForward && (
        <button
          onClick={() => onNavigate('next')}
          className="w-12 h-12 flex items-center justify-center text-2xl font-bold text-black hover:bg-gray-100 rounded-full transition-colors"
        >
          →
        </button>
      )}
      {!canGoForward && (
        <div className="w-12 h-12"></div>
      )}
    </div>
  );
};

export default LevelNavigation;