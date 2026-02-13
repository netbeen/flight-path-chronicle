import React, { useMemo, useState } from 'react';
import { Flight, Airport } from '@/data';
import { calculateFlightStatistics, AIRLINE_NAMES } from '@/data/flightProcessor';

interface FloatingStatsPanelProps {
  flights: Flight[];
  airports: Airport[];
  years: string[];
  airlines: string[];
  selectedYear: string | 'all';
  selectedAirline: string | 'all';
  onYearChange: (year: string | 'all') => void;
  onAirlineChange: (airline: string | 'all') => void;
  onDestinationHover: (code: string | null) => void;
}

const FloatingStatsPanel: React.FC<FloatingStatsPanelProps> = ({
  flights,
  airports,
  years,
  airlines,
  selectedYear,
  selectedAirline,
  onYearChange,
  onAirlineChange,
  onDestinationHover,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Calculate stats based on current filtered flights
  const stats = useMemo(() => calculateFlightStatistics(flights, airports), [flights, airports]);

  return (
    <div className={`absolute top-4 left-4 z-[1100] transition-all duration-300 ${isCollapsed ? 'w-auto' : 'w-80'}`}>
      <div className="bg-gray-900/80 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
            <h3 className={`font-bold text-lg ${isCollapsed ? 'hidden' : 'block'}`}>飞行统计</h3>
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>

        {/* Content */}
        {!isCollapsed && (
          <div className="p-5 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
            {/* Filters */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase font-semibold">年份</label>
                <select 
                  value={selectedYear}
                  onChange={(e) => onYearChange(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-white/10 transition-colors"
                >
                  <option value="all">全部年份</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}年</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase font-semibold">航空公司</label>
                <select 
                  value={selectedAirline}
                  onChange={(e) => onAirlineChange(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-white/10 transition-colors"
                >
                  <option value="all">全部航司</option>
                  {airlines.map(code => (
                    <option key={code} value={code}>{AIRLINE_NAMES[code] || code}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                <p className="text-gray-400 text-xs mb-1">总里程</p>
                <p className="text-xl font-bold text-blue-300">{stats.totalDistance.toLocaleString()}</p>
                <p className="text-xs text-gray-500">公里</p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                <p className="text-gray-400 text-xs mb-1">飞行次数</p>
                <p className="text-xl font-bold text-green-300">{stats.totalFlights}</p>
                <p className="text-xs text-gray-500">次</p>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 gap-3">
              {stats.topAirline && (
                <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                  <span className="text-gray-400">最爱航司</span>
                  <span className="font-semibold text-purple-300">
                    {stats.topAirline.name} <span className="text-xs text-gray-500">({stats.topAirline.count}次)</span>
                  </span>
                </div>
              )}
              {stats.longestFlight && (
                 <div className="flex flex-col text-sm border-b border-white/5 pb-2">
                    <span className="text-gray-400 mb-1">最长航线</span>
                    <div className="flex justify-between">
                        <span className="font-semibold">{stats.longestFlight.from} → {stats.longestFlight.to}</span>
                        <span className="text-blue-300">{stats.longestFlight.distance.toLocaleString()} km</span>
                    </div>
                 </div>
              )}
              {stats.shortestFlight && (
                 <div className="flex flex-col text-sm border-b border-white/5 pb-2">
                    <span className="text-gray-400 mb-1">最短航线</span>
                    <div className="flex justify-between">
                        <span className="font-semibold">{stats.shortestFlight.from} → {stats.shortestFlight.to}</span>
                        <span className="text-green-300">{stats.shortestFlight.distance.toLocaleString()} km</span>
                    </div>
                 </div>
              )}
            </div>

            {/* Top Destinations */}
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mr-2"></span>
                热门目的地
              </h4>
              <ul className="space-y-2">
                {stats.topDestinations.map((dest, index) => (
                  <li 
                    key={dest.code}
                    className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-white/10 cursor-pointer transition-colors group"
                    onMouseEnter={() => onDestinationHover(dest.code)}
                    onMouseLeave={() => onDestinationHover(null)}
                  >
                    <div className="flex items-center">
                      <span className={`w-5 h-5 rounded flex items-center justify-center text-xs mr-3 font-mono ${index < 3 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-gray-700 text-gray-400'}`}>
                        {index + 1}
                      </span>
                      <span className="group-hover:text-blue-300 transition-colors">{dest.name}</span>
                    </div>
                    <span className="font-mono text-gray-400">{dest.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingStatsPanel;
