import { Download, Orbit, Plane, Repeat2, Route, X } from 'lucide-react';
import { FlightStatistics } from '@/data/flightProcessor';

const EARTH_EQUATORIAL_CIRCUMFERENCE_KM = 40_075;

export const getEarthLaps = (distanceKm: number): string => (
  (distanceKm / EARTH_EQUATORIAL_CIRCUMFERENCE_KM).toFixed(1)
);

interface CareerPosterProps {
  totalFlights: number;
  totalDistance: number;
  cityCount: number;
  startYear: number;
  endYear: number;
  longestFlight: NonNullable<FlightStatistics['longestFlight']>;
  mostFrequentRoute: NonNullable<FlightStatistics['mostFrequentRoute']>;
  isExporting: boolean;
  onDownload: () => void;
  onClose: () => void;
}

const CareerPoster: React.FC<CareerPosterProps> = ({
  totalFlights,
  totalDistance,
  cityCount,
  startYear,
  endYear,
  longestFlight,
  mostFrequentRoute,
  isExporting,
  onDownload,
  onClose,
}) => {
  const earthLaps = getEarthLaps(totalDistance);

  return (
    <>
    <div className="career-poster-copy pointer-events-none absolute inset-0 z-[900] text-white">
      <div className="absolute left-7 top-7 md:left-12 md:top-10">
        <div className="mb-5 flex items-center gap-2 text-sm font-medium text-blue-300">
          <Plane className="h-4 w-4" aria-hidden="true" />
          FLIGHT PATH CHRONICLE
        </div>
        <p className="text-sm text-gray-300">飞行轨迹总览</p>
        <p className="mt-1 text-[clamp(4.5rem,11vw,9rem)] font-semibold leading-none text-white">
          {totalFlights}
        </p>
        <p className="mt-2 text-sm tracking-wide text-gray-300">累计飞行次数</p>
      </div>

      <div className="absolute bottom-6 left-7 right-7 md:bottom-8 md:left-12 md:right-12">
        <div className="mb-4 h-px bg-white/25" />
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="grid grid-cols-3 gap-5 md:w-[42rem]">
            <div>
              <p className="text-xl font-semibold md:text-3xl">{totalDistance.toLocaleString()}</p>
              <p className="mt-1 text-xs text-gray-400">飞行公里</p>
            </div>
            <div>
              <p className="text-xl font-semibold md:text-3xl">{cityCount}</p>
              <p className="mt-1 text-xs text-gray-400">到访城市</p>
            </div>
            <div>
              <p className="text-xl font-semibold md:text-3xl">{startYear}–{endYear}</p>
              <p className="mt-1 text-xs text-gray-400">记录区间</p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:max-w-md md:justify-end md:text-right">
            <Orbit className="h-8 w-8 flex-shrink-0 text-blue-300 md:h-10 md:w-10" aria-hidden="true" />
            <div>
              <p className="text-xs text-gray-400">累计里程折合</p>
              <p className="mt-1 text-lg font-semibold text-white md:text-2xl">
                沿地球赤道飞行 <span className="text-blue-300">{earthLaps} 圈</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 md:grid-cols-2 md:gap-8">
          <div className="flex min-w-0 items-center gap-3">
            <Route className="h-5 w-5 flex-shrink-0 text-blue-300" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-xs text-gray-400">最长距离航线</p>
              <p className="mt-1 truncate text-sm font-semibold text-white md:text-base">
                {longestFlight.fromName} → {longestFlight.toName}
                <span className="ml-2 font-normal text-blue-300">
                  {longestFlight.distance.toLocaleString()} km
                </span>
              </p>
              <p className="mt-0.5 truncate text-xs text-gray-500">
                {longestFlight.from} → {longestFlight.to}
              </p>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-3 md:justify-end md:text-right">
            <Repeat2 className="h-5 w-5 flex-shrink-0 text-amber-300" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-xs text-gray-400">最高频率航线</p>
              <p className="mt-1 truncate text-sm font-semibold text-white md:text-base">
                {mostFrequentRoute.fromName} → {mostFrequentRoute.toName}
                <span className="ml-2 font-normal text-amber-300">
                  {mostFrequentRoute.count} 段
                </span>
              </p>
              <p className="mt-0.5 truncate text-xs text-gray-500">
                {mostFrequentRoute.from} → {mostFrequentRoute.to}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      className="career-poster-actions absolute right-4 top-4 z-[1400] flex gap-2"
      data-export-ignore="true"
    >
      <button
        type="button"
        onClick={onDownload}
        disabled={isExporting}
        className="flex h-10 items-center gap-2 rounded-md border border-white/15 bg-gray-950/85 px-3 text-sm text-white shadow-lg backdrop-blur transition-colors hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-wait disabled:opacity-60"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        {isExporting ? '正在导出' : '导出飞行轨迹图'}
      </button>
      <button
        type="button"
        onClick={onClose}
        className="flex h-10 w-10 items-center justify-center rounded-md border border-white/15 bg-gray-950/85 text-white shadow-lg backdrop-blur transition-colors hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        aria-label="退出全景模式"
        title="退出全景模式"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
    </>
  );
};

export default CareerPoster;
