import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  History,
  ImageDown,
  MapPin,
  Plane,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import { Airport } from '@/data';
import {
  calculateFlightStatistics,
  AIRLINE_NAMES,
  ProcessedFlight,
} from '@/data/flightProcessor';
import { getFlightId } from '@/components/flightUiTypes';

interface FloatingStatsPanelProps {
  flights: ProcessedFlight[];
  airports: Airport[];
  years: string[];
  airlines: string[];
  selectedYear: string | 'all';
  selectedAirline: string | 'all';
  cityQuery: string;
  onYearChange: (year: string | 'all') => void;
  onAirlineChange: (airline: string | 'all') => void;
  onCityQueryChange: (query: string) => void;
  onDestinationClick: (code: string) => void;
  onFlightClick: (flight: ProcessedFlight) => void;
  onOpenCareerMode: () => void;
  selectedFlightId: string | null;
}

const FloatingStatsPanel: React.FC<FloatingStatsPanelProps> = ({
  flights,
  airports,
  years,
  airlines,
  selectedYear,
  selectedAirline,
  cityQuery,
  onYearChange,
  onAirlineChange,
  onCityQueryChange,
  onDestinationClick,
  onFlightClick,
  onOpenCareerMode,
  selectedFlightId,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  
  const stats = useMemo(() => calculateFlightStatistics(flights, airports), [flights, airports]);
  const airportIndex = useMemo(
    () => new Map(airports.map((airport) => [airport.code, airport])),
    [airports],
  );
  const groupedFlights = useMemo(() => {
    const groups = new Map<string, ProcessedFlight[]>();
    [...flights]
      .sort((a, b) => new Date(b.departureTime).getTime() - new Date(a.departureTime).getTime())
      .forEach((flight) => {
        const year = new Date(flight.departureTime).getFullYear().toString();
        groups.set(year, [...(groups.get(year) || []), flight]);
      });
    return Array.from(groups.entries());
  }, [flights]);

  const clearFilters = () => {
    onYearChange('all');
    onAirlineChange('all');
    onCityQueryChange('');
  };

  return (
    <aside className={`flight-panel absolute z-[1100] transition-[width,max-height] duration-300 ${isCollapsed ? 'is-collapsed' : ''}`}>
      <div className="flex h-full flex-col overflow-hidden rounded-lg border border-white/10 bg-gray-950/88 text-white shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/10 bg-black/20 p-4">
          <div className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-blue-400" aria-hidden="true" />
            <h1 className={`text-lg font-bold ${isCollapsed ? 'hidden' : 'block'}`}>飞行纪事</h1>
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-gray-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            aria-label={isCollapsed ? '展开面板' : '收起面板'}
            title={isCollapsed ? '展开面板' : '收起面板'}
          >
            {isCollapsed ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
          </button>
        </div>

        {!isCollapsed && (
          <>
            <div className="grid grid-cols-2 border-b border-white/10 p-2" role="tablist" aria-label="飞行信息">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'overview'}
                onClick={() => setActiveTab('overview')}
                className={`flex h-9 items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'overview' ? 'bg-blue-500/20 text-blue-200' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <BarChart3 className="h-4 w-4" aria-hidden="true" />
                概览
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'history'}
                onClick={() => setActiveTab('history')}
                className={`flex h-9 items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'history' ? 'bg-blue-500/20 text-blue-200' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <History className="h-4 w-4" aria-hidden="true" />
                行程
                <span className="font-mono text-xs text-gray-400">{flights.length}</span>
              </button>
            </div>

            <div className="space-y-3 border-b border-white/10 p-4">
              <div className="relative">
                <label className="mb-1 block text-xs font-semibold text-gray-400" htmlFor="city-filter">城市或机场</label>
                <Search className="pointer-events-none absolute bottom-2.5 left-3 h-4 w-4 text-gray-500" aria-hidden="true" />
                <input
                  id="city-filter"
                  type="search"
                  value={cityQuery}
                  onChange={(event) => {
                    onCityQueryChange(event.target.value);
                    if (event.target.value) setActiveTab('history');
                  }}
                  placeholder="搜索北京、首都或 PEK"
                  className="w-full rounded-md border border-white/10 bg-gray-800 py-2 pl-9 pr-9 text-sm placeholder:text-gray-500 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {cityQuery && (
                  <button
                    type="button"
                    onClick={() => onCityQueryChange('')}
                    className="absolute bottom-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                    aria-label="清除城市搜索"
                    title="清除城市搜索"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-400" htmlFor="year-filter">年份</label>
                <select 
                  id="year-filter"
                  value={selectedYear}
                  onChange={(e) => onYearChange(e.target.value)}
                  className="w-full rounded-md border border-white/10 bg-gray-800 px-3 py-2 text-sm transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">全部年份</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}年</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-400" htmlFor="airline-filter">航空公司</label>
                <select 
                  id="airline-filter"
                  value={selectedAirline}
                  onChange={(e) => onAirlineChange(e.target.value)}
                  className="w-full rounded-md border border-white/10 bg-gray-800 px-3 py-2 text-sm transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">全部航司</option>
                  {airlines.map(code => (
                    <option key={code} value={code}>{AIRLINE_NAMES[code] || code}</option>
                  ))}
                </select>
              </div>
              </div>
            </div>

            <div className="panel-scroll custom-scrollbar min-h-0 flex-1 overflow-y-auto">
              {activeTab === 'overview' ? (
                <div className="space-y-5 p-4" role="tabpanel">
                  <button
                    type="button"
                    onClick={onOpenCareerMode}
                    className="flex w-full items-center justify-between rounded-md border border-blue-400/20 bg-blue-500/10 px-3 py-3 text-left transition-colors hover:border-blue-300/40 hover:bg-blue-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  >
                    <span>
                      <span className="block text-sm font-semibold text-blue-100">生成飞行轨迹总览</span>
                      <span className="mt-0.5 block text-xs text-gray-400">基于全部航班生成可导出的全景视图</span>
                    </span>
                    <ImageDown className="h-5 w-5 flex-shrink-0 text-blue-300" aria-hidden="true" />
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-md border border-white/5 bg-white/5 p-3">
                      <p className="mb-1 text-xs text-gray-400">总里程</p>
                      <p className="text-xl font-bold text-blue-300">{stats.totalDistance.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">公里</p>
                    </div>
                    <div className="rounded-md border border-white/5 bg-white/5 p-3">
                      <p className="mb-1 text-xs text-gray-400">飞行次数</p>
                      <p className="text-xl font-bold text-emerald-300">{stats.totalFlights}</p>
                      <p className="text-xs text-gray-500">次</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {stats.topAirline && (
                      <div className="flex items-center justify-between border-b border-white/5 pb-2 text-sm">
                        <span className="text-gray-400">最爱航司</span>
                        <span className="font-semibold text-fuchsia-300">
                          {stats.topAirline.name} <span className="text-xs text-gray-500">({stats.topAirline.count}次)</span>
                        </span>
                      </div>
                    )}
                    {stats.longestFlight && (
                      <div className="border-b border-white/5 pb-2 text-sm">
                        <span className="mb-1 block text-gray-400">最长航线</span>
                        <div className="flex flex-wrap justify-between gap-1">
                          <span className="font-semibold">{stats.longestFlight.fromName} → {stats.longestFlight.toName}</span>
                          <span className="whitespace-nowrap text-blue-300">{stats.longestFlight.distance.toLocaleString()} km</span>
                        </div>
                      </div>
                    )}
                    {stats.shortestFlight && (
                      <div className="border-b border-white/5 pb-2 text-sm">
                        <span className="mb-1 block text-gray-400">最短航线</span>
                        <div className="flex flex-wrap justify-between gap-1">
                          <span className="font-semibold">{stats.shortestFlight.fromName} → {stats.shortestFlight.toName}</span>
                          <span className="whitespace-nowrap text-emerald-300">{stats.shortestFlight.distance.toLocaleString()} km</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <section aria-labelledby="top-destinations">
                    <h2 id="top-destinations" className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-300">
                      <MapPin className="h-4 w-4 text-amber-400" aria-hidden="true" />
                      热门目的地
                    </h2>
                    <ol className="space-y-1">
                      {stats.topDestinations.map((dest, index) => (
                        <li key={dest.code}>
                          <button
                            type="button"
                            className="group flex min-h-10 w-full items-center justify-between rounded-md px-2 text-left text-sm transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                            onClick={() => onDestinationClick(dest.code)}
                          >
                            <span className="flex min-w-0 items-center">
                              <span className={`mr-3 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-xs font-mono ${
                                index < 3 ? 'border border-amber-500/30 bg-amber-500/20 text-amber-300' : 'bg-gray-700 text-gray-400'
                              }`}>
                                {index + 1}
                              </span>
                              <span className="truncate transition-colors group-hover:text-blue-300">{dest.name}</span>
                            </span>
                            <span className="ml-2 font-mono text-gray-400">{dest.count}</span>
                          </button>
                        </li>
                      ))}
                    </ol>
                  </section>
                </div>
              ) : (
                <div className="p-3" role="tabpanel">
                  {groupedFlights.length > 0 ? (
                    groupedFlights.map(([year, yearFlights]) => (
                      <section key={year} className="mb-4 last:mb-0" aria-labelledby={`year-${year}`}>
                        <div className="sticky top-0 z-10 flex items-center justify-between bg-gray-950/95 px-1 py-2 backdrop-blur">
                          <h2 id={`year-${year}`} className="text-sm font-bold text-gray-200">{year}</h2>
                          <span className="text-xs text-gray-500">{yearFlights.length} 段</span>
                        </div>
                        <div className="space-y-1">
                          {yearFlights.map((flight) => {
                            const id = getFlightId(flight);
                            const departure = airportIndex.get(flight.departureAirport);
                            const arrival = airportIndex.get(flight.arrivalAirport);
                            const departureTime = new Date(flight.departureTime);
                            const arrivalTime = new Date(flight.arrivalTime);
                            return (
                              <button
                                type="button"
                                key={id}
                                data-flight-id={id}
                                aria-pressed={selectedFlightId === id}
                                onClick={() => onFlightClick(flight)}
                                className={`w-full rounded-md border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                                  selectedFlightId === id
                                    ? 'border-blue-400/50 bg-blue-500/15'
                                    : 'border-transparent hover:border-white/10 hover:bg-white/5'
                                }`}
                              >
                                <div className="mb-2 flex items-center justify-between gap-3">
                                  <span className="text-xs text-gray-400">
                                    {departureTime.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' })}
                                  </span>
                                  <span className="font-mono text-xs font-semibold text-blue-300">{flight.flightNumber}</span>
                                </div>
                                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                                  <div className="min-w-0">
                                    <strong className="block text-lg">{flight.departureAirport}</strong>
                                    <span className="block truncate text-xs text-gray-500">{departure?.name || flight.departureAirport}</span>
                                    <span className="mt-1 block font-mono text-xs text-gray-400">
                                      {departureTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <Plane className="h-4 w-4 text-gray-500" aria-hidden="true" />
                                  <div className="min-w-0 text-right">
                                    <strong className="block text-lg">{flight.arrivalAirport}</strong>
                                    <span className="block truncate text-xs text-gray-500">{arrival?.name || flight.arrivalAirport}</span>
                                    <span className="mt-1 block font-mono text-xs text-gray-400">
                                      {arrivalTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                </div>
                                {flight.distance !== undefined && (
                                  <div className="mt-2 border-t border-white/5 pt-2 text-right font-mono text-xs text-gray-500">
                                    {flight.distance.toLocaleString()} km
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </section>
                    ))
                  ) : (
                    <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center">
                      <History className="mb-3 h-7 w-7 text-gray-600" aria-hidden="true" />
                      <p className="text-sm font-medium text-gray-300">没有符合条件的行程</p>
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="mt-4 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-blue-300 hover:bg-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                      >
                        <RotateCcw className="h-4 w-4" aria-hidden="true" />
                        清除筛选
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

export default FloatingStatsPanel;
