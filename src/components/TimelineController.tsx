import React from 'react';
import { ChevronLeft, ChevronRight, ListRestart, Pause, Play } from 'lucide-react';
import { ProcessedFlight } from '@/data/flightProcessor';

interface TimelineControllerProps {
  flights: ProcessedFlight[];
  currentIndex: number | null;
  onIndexChange: (index: number | null) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
}

const TimelineController: React.FC<TimelineControllerProps> = ({
  flights,
  currentIndex,
  onIndexChange,
  isPlaying,
  onPlayPause,
}) => {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onIndexChange(Number(e.target.value));
  };

  const activeFlight = currentIndex === null ? null : flights[currentIndex];
  const canGoPrevious = currentIndex !== null && currentIndex > 0;
  const canGoNext = flights.length > 0 && (currentIndex === null || currentIndex < flights.length - 1);

  return (
    <div className="timeline-shell absolute bottom-5 left-1/2 z-[1000] w-full max-w-3xl -translate-x-1/2 px-4">
      <div className="rounded-lg border border-white/10 bg-gray-950/88 p-3 text-white shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onIndexChange(Math.max(0, (currentIndex ?? 0) - 1))}
            disabled={!canGoPrevious}
            className="timeline-icon-button"
            aria-label="上一段行程"
            title="上一段行程"
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onPlayPause}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-white transition-colors hover:bg-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={isPlaying ? '暂停回放' : '播放行程'}
            title={isPlaying ? '暂停回放' : '播放行程'}
            disabled={flights.length === 0}
          >
            {isPlaying ? <Pause className="h-5 w-5" aria-hidden="true" /> : <Play className="h-5 w-5" aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={() => onIndexChange(Math.min(flights.length - 1, (currentIndex ?? -1) + 1))}
            disabled={!canGoNext}
            className="timeline-icon-button"
            aria-label="下一段行程"
            title="下一段行程"
          >
            <ChevronRight aria-hidden="true" />
          </button>

          <div className="min-w-0 flex-1 px-2">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-blue-100">
                  {activeFlight
                    ? `${activeFlight.departureAirport} → ${activeFlight.arrivalAirport}`
                    : '全部行程'}
                </p>
                <p className="truncate text-xs text-gray-400">
                  {activeFlight
                    ? `${currentIndex! + 1} / ${flights.length} · ${new Date(activeFlight.departureTime).toLocaleDateString('zh-CN')} · ${activeFlight.flightNumber}`
                    : `共 ${flights.length} 段航班`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onIndexChange(null)}
                disabled={currentIndex === null}
                className="hidden h-9 flex-shrink-0 items-center gap-2 rounded-md px-3 text-sm text-blue-300 transition-colors hover:bg-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:text-gray-600 sm:flex"
              >
                <ListRestart className="h-4 w-4" aria-hidden="true" />
                查看全部
              </button>
            </div>
            <input
              type="range"
              min="0"
              max={Math.max(0, flights.length - 1)}
              step="1"
              value={currentIndex ?? Math.max(0, flights.length - 1)}
              onChange={handleSliderChange}
              disabled={flights.length <= 1}
              aria-label="行程进度"
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-700 accent-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
            />
          </div>
          <button
            type="button"
            onClick={() => onIndexChange(null)}
            disabled={currentIndex === null}
            className="timeline-icon-button sm:hidden"
            aria-label="查看全部行程"
            title="查看全部行程"
          >
            <ListRestart aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimelineController;
