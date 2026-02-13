import React, { useState, useEffect, useRef } from 'react';

interface TimelineControllerProps {
  startDate: string; // ISO string of earliest flight
  endDate: string;   // ISO string of latest flight
  currentDate: string | null; // Currently displayed date
  onDateChange: (date: string | null) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
}

const TimelineController: React.FC<TimelineControllerProps> = ({
  startDate,
  endDate,
  currentDate,
  onDateChange,
  isPlaying,
  onPlayPause,
}) => {
  const [progress, setProgress] = useState(100); // 0-100 percentage
  const startTimestamp = new Date(startDate).getTime();
  const endTimestamp = new Date(endDate).getTime();
  const totalDuration = endTimestamp - startTimestamp;

  // Sync internal progress with external currentDate
  useEffect(() => {
    if (currentDate) {
      const current = new Date(currentDate).getTime();
      const newProgress = Math.min(100, Math.max(0, ((current - startTimestamp) / totalDuration) * 100));
      setProgress(newProgress);
    } else {
        // If null (show all), set to 100%
        setProgress(100);
    }
  }, [currentDate, startTimestamp, totalDuration]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    
    // Calculate new date based on progress
    const newTime = startTimestamp + (totalDuration * (newProgress / 100));
    const newDate = new Date(newTime).toISOString();
    onDateChange(newDate);
  };

  const formatDisplayDate = (dateStr: string | null) => {
    if (!dateStr) return '全部展示';
    return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4 z-[1000]">
      <div className="bg-gray-900/80 backdrop-blur-md border border-white/10 rounded-full shadow-2xl p-4 flex items-center gap-4 text-white">
        
        {/* Play/Pause Button */}
        <button 
          onClick={onPlayPause}
          className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* Date Display */}
        <div className="flex-shrink-0 w-32 font-mono text-sm text-center font-bold text-blue-200">
          {formatDisplayDate(currentDate)}
        </div>

        {/* Slider */}
        <div className="flex-1 relative flex items-center">
            <input 
                type="range" 
                min="0" 
                max="100" 
                step="0.1"
                value={progress} 
                onChange={handleSliderChange}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
            />
        </div>
        
        {/* Toggle Mode Button (Show All vs Timeline) */}
        <button
            onClick={() => onDateChange(null)}
            className={`text-xs px-3 py-1 rounded-md transition-colors ${!currentDate ? 'bg-blue-500/20 text-blue-300' : 'text-gray-400 hover:text-white'}`}
        >
            查看全部
        </button>

      </div>
    </div>
  );
};

export default TimelineController;
