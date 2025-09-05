import React, { useState, useRef, useEffect } from "react";
import { getTotalLevels } from "../utils/levelRegistry";

interface DevToolProps {
  maxUnlockedLevel: number;
  onSetMaxUnlockedLevel: (level: number) => void;
  onGoToCongrats: () => void;
}

const DevTool: React.FC<DevToolProps> = ({
  maxUnlockedLevel,
  onSetMaxUnlockedLevel,
  onGoToCongrats,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // TO ENABLE DEV TOOLS: Change this to true
  const DEV_MODE_ENABLED = false;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLevelSelect = (level: number) => {
    onSetMaxUnlockedLevel(level);
    setIsOpen(false);
  };

  // Don't render anything if dev mode is disabled
  if (!DEV_MODE_ENABLED) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 bg-red-500 text-white px-3 py-2 text-sm font-bold hover:bg-red-600 transition-colors z-50 rounded"
      >
        DEV
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={overlayRef}
            className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4"
          >
            <h3 className="text-lg font-bold mb-4 text-center text-black">
              Jump to Any Level
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: getTotalLevels() }, (_, i) => i + 1).map(
                (level) => (
                  <button
                    key={level}
                    onClick={() => handleLevelSelect(level)}
                    className="w-12 h-12 border-2 bg-black text-white border-black hover:bg-gray-800 font-bold text-lg transition-colors"
                  >
                    {level}
                  </button>
                )
              )}
            </div>
            <div className="mt-4">
              <button
                onClick={() => {
                  onGoToCongrats();
                  setIsOpen(false);
                }}
                className="w-full bg-green-600 text-white px-4 py-2 text-sm font-bold hover:bg-green-700 transition-colors rounded"
              >
                🎉 Go to Congratulations
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Click any level to jump directly to it
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default DevTool;
