import React, { useState, useEffect } from 'react';
import { TARGET_WORDS } from '../types/game';
import { LevelProps } from '../types/game';
import LevelNavigation from '../components/LevelNavigation';

interface GridCell {
  letter: string;
  row: number;
  col: number;
}

interface WordPlacement {
  word: string;
  startRow: number;
  startCol: number;
  direction: 'horizontal' | 'vertical' | 'diagonal-down-right' | 'diagonal-down-left';
  reversed: boolean;
  cells: GridCell[];
}

interface CrossoutLine {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

const LevelWordSearch: React.FC<LevelProps> = ({
  onComplete,
  onNavigate,
  canGoBack,
  canGoForward,
  levelNumber,
  maxUnlockedLevel,
  transitionState = 'idle',
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [grid, setGrid] = useState<string[][]>([]);
  const [wordPlacements, setWordPlacements] = useState<WordPlacement[]>([]);
  const [crossoutLines, setCrossoutLines] = useState<CrossoutLine[]>([]);

  const GRID_ROWS = 12;
  const GRID_COLS = 8;
  
  // Letters that exist in "I WANT TO REALIZE ALL OF MY DESIRES"
  const availableLetters = ['I', 'W', 'A', 'N', 'T', 'O', 'R', 'E', 'L', 'Z', 'F', 'M', 'Y', 'D', 'S'];

  const getRandomLetter = () => {
    return availableLetters[Math.floor(Math.random() * availableLetters.length)];
  };

  const generateEmptyGrid = (): string[][] => {
    return Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(''));
  };

  const canPlaceWord = (grid: string[][], word: string, startRow: number, startCol: number, direction: string, reversed: boolean): boolean => {
    const letters = reversed ? word.split('').reverse() : word.split('');
    
    for (let i = 0; i < letters.length; i++) {
      let row = startRow;
      let col = startCol;
      
      switch (direction) {
        case 'horizontal':
          col += i;
          break;
        case 'vertical':
          row += i;
          break;
        case 'diagonal-down-right':
          row += i;
          col += i;
          break;
        case 'diagonal-down-left':
          row += i;
          col -= i;
          break;
      }
      
      if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) {
        return false;
      }
      
      if (grid[row][col] !== '' && grid[row][col] !== letters[i]) {
        return false;
      }
    }
    
    return true;
  };

  const placeWord = (grid: string[][], word: string, startRow: number, startCol: number, direction: string, reversed: boolean): GridCell[] => {
    const letters = reversed ? word.split('').reverse() : word.split('');
    const cells: GridCell[] = [];
    
    for (let i = 0; i < letters.length; i++) {
      let row = startRow;
      let col = startCol;
      
      switch (direction) {
        case 'horizontal':
          col += i;
          break;
        case 'vertical':
          row += i;
          break;
        case 'diagonal-down-right':
          row += i;
          col += i;
          break;
        case 'diagonal-down-left':
          row += i;
          col -= i;
          break;
      }
      
      grid[row][col] = letters[i];
      cells.push({ letter: letters[i], row, col });
    }
    
    return cells;
  };

  const checkForAccidentalWords = (grid: string[][], placements: WordPlacement[]) => {
    // Check if any target words appear accidentally in the grid beyond the placed ones
    const directions = [
      { dr: 0, dc: 1 },   // horizontal right
      { dr: 0, dc: -1 },  // horizontal left
      { dr: 1, dc: 0 },   // vertical down
      { dr: -1, dc: 0 },  // vertical up
      { dr: 1, dc: 1 },   // diagonal down-right
      { dr: 1, dc: -1 }   // diagonal down-left
    ];

    for (const targetWord of TARGET_WORDS) {
      if (targetWord === 'I') continue; // Skip single letter I
      
      let foundCount = 0;
      
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          for (const dir of directions) {
            let word = '';
            let currentRow = row;
            let currentCol = col;
            
            // Build word in this direction
            for (let i = 0; i < targetWord.length; i++) {
              if (currentRow >= 0 && currentRow < GRID_ROWS && 
                  currentCol >= 0 && currentCol < GRID_COLS) {
                word += grid[currentRow][currentCol];
                currentRow += dir.dr;
                currentCol += dir.dc;
              } else {
                break;
              }
            }
            
            if (word === targetWord) {
              foundCount++;
            }
          }
        }
      }
      
      if (foundCount > 1) {
        return false; // Found word appears more than once
      }
    }
    
    return true; // All words appear exactly once
  };

  const generateWordSearch = () => {
    let attempts = 0;
    const maxGridAttempts = 100;
    
    while (attempts < maxGridAttempts) {
      const newGrid = generateEmptyGrid();
      const placements: WordPlacement[] = [];
      const directions = ['horizontal', 'vertical', 'diagonal-down-right', 'diagonal-down-left'];
      let allWordsPlaced = true;
      
      // Place each word (except 'I' which we'll handle specially)
      for (const word of TARGET_WORDS.filter(w => w !== 'I')) {
        let placed = false;
        let wordAttempts = 0;
        const maxWordAttempts = 1000;
        
        while (!placed && wordAttempts < maxWordAttempts) {
          const direction = directions[Math.floor(Math.random() * directions.length)];
          const reversed = Math.random() < 0.5;
          
          // Calculate valid starting positions based on word length and direction
          let maxStartRow = GRID_ROWS - 1;
          let maxStartCol = GRID_COLS - 1;
          let minStartRow = 0;
          let minStartCol = 0;
          
          const wordLength = word.length;
          
          switch (direction) {
            case 'horizontal':
              maxStartCol = GRID_COLS - wordLength;
              break;
            case 'vertical':
              maxStartRow = GRID_ROWS - wordLength;
              break;
            case 'diagonal-down-right':
              maxStartRow = GRID_ROWS - wordLength;
              maxStartCol = GRID_COLS - wordLength;
              break;
            case 'diagonal-down-left':
              maxStartRow = GRID_ROWS - wordLength;
              minStartCol = wordLength - 1;
              break;
          }
          
          if (maxStartRow >= minStartRow && maxStartCol >= minStartCol) {
            const startRow = Math.floor(Math.random() * (maxStartRow - minStartRow + 1)) + minStartRow;
            const startCol = Math.floor(Math.random() * (maxStartCol - minStartCol + 1)) + minStartCol;
            
            if (canPlaceWord(newGrid, word, startRow, startCol, direction, reversed)) {
              const cells = placeWord(newGrid, word, startRow, startCol, direction, reversed);
              placements.push({
                word,
                startRow,
                startCol,
                direction: direction as any,
                reversed,
                cells
              });
              placed = true;
            }
          }
          wordAttempts++;
        }
        
        if (!placed) {
          allWordsPlaced = false;
          break;
        }
      }
      
      // If all words were successfully placed, fill empty cells and check for accidents
      if (allWordsPlaced && placements.length === TARGET_WORDS.filter(w => w !== 'I').length) {
        // Fill empty cells with random letters (but avoid creating accidental words)
        for (let row = 0; row < GRID_ROWS; row++) {
          for (let col = 0; col < GRID_COLS; col++) {
            if (newGrid[row][col] === '') {
              newGrid[row][col] = getRandomLetter();
            }
          }
        }
        
        // Check if this grid accidentally contains duplicate words
        if (checkForAccidentalWords(newGrid, placements)) {
          setGrid(newGrid);
          setWordPlacements(placements);
          return;
        }
      }
      
      attempts++;
    }
    
    // Fallback: create a simple grid with words placed systematically
    console.warn('Failed to generate clean grid, using systematic placement');
    const fallbackGrid = generateEmptyGrid();
    const fallbackPlacements: WordPlacement[] = [];
    
    // Place words systematically to avoid overlaps
    let currentRow = 0;
    for (const word of TARGET_WORDS.filter(w => w !== 'I')) {
      if (currentRow + 1 < GRID_ROWS && word.length <= GRID_COLS) {
        // Place horizontally
        const cells: GridCell[] = [];
        for (let i = 0; i < word.length; i++) {
          fallbackGrid[currentRow][i] = word[i];
          cells.push({ letter: word[i], row: currentRow, col: i });
        }
        fallbackPlacements.push({
          word,
          startRow: currentRow,
          startCol: 0,
          direction: 'horizontal',
          reversed: false,
          cells
        });
        currentRow += 2; // Skip a row to avoid conflicts
      }
    }
    
    // Fill remaining cells
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        if (fallbackGrid[row][col] === '') {
          fallbackGrid[row][col] = getRandomLetter();
        }
      }
    }
    
    setGrid(fallbackGrid);
    setWordPlacements(fallbackPlacements);
  };

  const findWordInDirection = (startRow: number, startCol: number, targetWord: string) => {
    const directions = [
      { dr: 0, dc: 1, name: 'horizontal-right' },   // horizontal right
      { dr: 0, dc: -1, name: 'horizontal-left' },   // horizontal left
      { dr: 1, dc: 0, name: 'vertical-down' },      // vertical down
      { dr: -1, dc: 0, name: 'vertical-up' },       // vertical up
      { dr: 1, dc: 1, name: 'diagonal-down-right' }, // diagonal down-right
      { dr: 1, dc: -1, name: 'diagonal-down-left' }  // diagonal down-left
    ];

    for (const dir of directions) {
      // Check forward direction
      let word = '';
      let cells: GridCell[] = [];
      let currentRow = startRow;
      let currentCol = startCol;
      
      for (let i = 0; i < targetWord.length; i++) {
        if (currentRow >= 0 && currentRow < GRID_ROWS && 
            currentCol >= 0 && currentCol < GRID_COLS) {
          word += grid[currentRow][currentCol];
          cells.push({ letter: grid[currentRow][currentCol], row: currentRow, col: currentCol });
          currentRow += dir.dr;
          currentCol += dir.dc;
        } else {
          break;
        }
      }
      
      if (word === targetWord) {
        return {
          found: true,
          startRow,
          startCol,
          endRow: cells[cells.length - 1].row,
          endCol: cells[cells.length - 1].col,
          cells
        };
      }
      
      // Check reverse direction
      word = '';
      cells = [];
      currentRow = startRow;
      currentCol = startCol;
      
      for (let i = 0; i < targetWord.length; i++) {
        if (currentRow >= 0 && currentRow < GRID_ROWS && 
            currentCol >= 0 && currentCol < GRID_COLS) {
          word += grid[currentRow][currentCol];
          cells.push({ letter: grid[currentRow][currentCol], row: currentRow, col: currentCol });
          currentRow -= dir.dr;
          currentCol -= dir.dc;
        } else {
          break;
        }
      }
      
      if (word === targetWord) {
        return {
          found: true,
          startRow,
          startCol,
          endRow: cells[cells.length - 1].row,
          endCol: cells[cells.length - 1].col,
          cells
        };
      }
    }
    
    return { found: false };
  };

  const handleCellClick = (row: number, col: number) => {
    if (currentWordIndex >= TARGET_WORDS.length) return;
    
    const currentWord = TARGET_WORDS[currentWordIndex];
    const clickedLetter = grid[row][col];
    
    // Special case for "I" - accept any "I" on the grid
    if (currentWord === 'I' && clickedLetter === 'I') {
      const newLine: CrossoutLine = {
        startRow: row,
        startCol: col,
        endRow: row,
        endCol: col
      };
      
      setCrossoutLines(prev => [...prev, newLine]);
      setFoundWords(prev => [...prev, currentWord]);
      
      if (currentWordIndex + 1 < TARGET_WORDS.length) {
        setCurrentWordIndex(currentWordIndex + 1);
      } else {
        onComplete();
      }
      return;
    }
    
    // Special algorithm for TO, OF, MY - check if clicked letter is part of word
    if (['TO', 'OF', 'MY'].includes(currentWord) && currentWord.includes(clickedLetter)) {
      const result = findWordInDirection(row, col, currentWord);
      
      if (result.found) {
        const newLine: CrossoutLine = {
          startRow: result.startRow!,
          startCol: result.startCol!,
          endRow: result.endRow!,
          endCol: result.endCol!
        };
        
        setCrossoutLines(prev => [...prev, newLine]);
        setFoundWords(prev => [...prev, currentWord]);
        
        if (currentWordIndex + 1 < TARGET_WORDS.length) {
          setCurrentWordIndex(currentWordIndex + 1);
        } else {
          onComplete();
        }
        return;
      }
    }
    
    // For all other words, check if clicked cell is part of the placed word
    const placement = wordPlacements.find(p => p.word === currentWord);
    
    if (!placement) return;
    
    const isPartOfWord = placement.cells.some(cell => cell.row === row && cell.col === col);
    
    if (isPartOfWord) {
      const startCell = placement.cells[0];
      const endCell = placement.cells[placement.cells.length - 1];
      
      const newLine: CrossoutLine = {
        startRow: startCell.row,
        startCol: startCell.col,
        endRow: endCell.row,
        endCol: endCell.col
      };
      
      setCrossoutLines(prev => [...prev, newLine]);
      setFoundWords(prev => [...prev, currentWord]);
      
      if (currentWordIndex + 1 < TARGET_WORDS.length) {
        setCurrentWordIndex(currentWordIndex + 1);
      } else {
        onComplete();
      }
    }
  };

  useEffect(() => {
    generateWordSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCellPosition = (row: number, col: number) => {
    const cellSize = 40; // w-10 h-10 = 40px
    const gap = 4; // gap-1 = 4px
    return {
      x: col * (cellSize + gap) + cellSize / 2,
      y: row * (cellSize + gap) + cellSize / 2
    };
  };

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      <div className="flex-1 p-4 flex items-center justify-center overflow-auto">
        <div className="max-w-fit relative">
          {/* Word search grid */}
          <div className="grid grid-cols-8 gap-1 relative">
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  className="w-10 h-10 flex items-center justify-center text-2xl font-bold text-black cursor-pointer select-none"
                >
                  {cell}
                </button>
              ))
            )}
          </div>
          
          {/* Crossout lines */}
          <svg 
            className="absolute top-0 left-0 pointer-events-none"
            style={{ 
              width: '100%', 
              height: '100%'
            }}
          >
            {crossoutLines.map((line, index) => {
              const start = getCellPosition(line.startRow, line.startCol);
              const end = getCellPosition(line.endRow, line.endCol);
              
              // For single letter words (like "I"), make it a horizontal line
              const isHorizontalSingleLetter = line.startRow === line.endRow && line.startCol === line.endCol;
              
              return (
                <line
                  key={index}
                  x1={isHorizontalSingleLetter ? start.x - 15 : start.x}
                  y1={start.y}
                  x2={isHorizontalSingleLetter ? end.x + 15 : end.x}
                  y2={end.y}
                  stroke="red"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
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

export default LevelWordSearch;