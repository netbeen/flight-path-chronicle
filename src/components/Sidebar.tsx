import React from 'react';
import { Clock3, MapPinned, Plane, Ruler, X } from 'lucide-react';
import { Airport } from '@/data';
import { ProcessedFlight } from '@/data/flightProcessor';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: Airport | ProcessedFlight | null;
  relatedFlights?: ProcessedFlight[];
  airports: Airport[];
  onFlightClick: (flight: ProcessedFlight) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  selectedItem,
  relatedFlights,
  airports,
  onFlightClick,
}) => {
  if (!selectedItem) return null;

  const isFlight = (item: Airport | ProcessedFlight): item is ProcessedFlight => {
    return (item as ProcessedFlight).flightNumber !== undefined;
  };
  const getAirportName = (code: string) => airports.find((airport) => airport.code === code)?.name || code;

  const renderContent = () => {
    if (isFlight(selectedItem)) {
      const flight = selectedItem;
      const departureDate = new Date(flight.departureTime);
      const arrivalDate = new Date(flight.arrivalTime);
      return (
        <div className="space-y-5">
          <div className="border-b border-gray-700 pb-4">
            <p className="mb-2 text-sm text-gray-400">航班详情</p>
            <h2 className="text-2xl font-bold text-white">{flight.flightNumber}</h2>
          </div>
          
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-white">
            <div className="min-w-0">
              <p className="mb-1 text-xs text-gray-400">出发地</p>
              <p className="text-xl font-semibold">{flight.departureAirport}</p>
              <p className="truncate text-xs text-gray-500">{getAirportName(flight.departureAirport)}</p>
            </div>
            <Plane className="h-5 w-5 text-blue-400" aria-hidden="true" />
            <div className="min-w-0 text-right">
              <p className="mb-1 text-xs text-gray-400">目的地</p>
              <p className="text-xl font-semibold">{flight.arrivalAirport}</p>
              <p className="truncate text-xs text-gray-500">{getAirportName(flight.arrivalAirport)}</p>
            </div>
          </div>

          <div className="space-y-3 border-t border-gray-800 pt-4 text-sm">
            <div className="flex items-start gap-3">
              <Clock3 className="mt-0.5 h-4 w-4 text-gray-500" aria-hidden="true" />
              <div>
                <p className="text-xs text-gray-500">起飞时间</p>
                <p className="text-gray-200">{departureDate.toLocaleString('zh-CN')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPinned className="mt-0.5 h-4 w-4 text-gray-500" aria-hidden="true" />
              <div>
                <p className="text-xs text-gray-500">抵达时间</p>
                <p className="text-gray-200">{arrivalDate.toLocaleString('zh-CN')}</p>
              </div>
            </div>
            {flight.distance && (
              <div className="flex items-start gap-3">
                <Ruler className="mt-0.5 h-4 w-4 text-gray-500" aria-hidden="true" />
                <div>
                  <p className="text-xs text-gray-500">航程距离</p>
                  <p className="font-mono text-lg text-blue-300">{flight.distance.toLocaleString()} km</p>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    } else {
      // It's an Airport
      return (
        <div className="space-y-6">
          <div className="border-b border-gray-700 pb-4">
            <h2 className="text-2xl font-bold text-white mb-2">{selectedItem.name}</h2>
            <p className="text-gray-400 text-sm">{selectedItem.code}</p>
            <p className="text-gray-500 text-xs mt-1">
              {selectedItem.latitude.toFixed(4)}, {selectedItem.longitude.toFixed(4)}
            </p>
          </div>

          <div className="text-white">
            <h3 className="text-lg font-semibold mb-4">相关航班 ({relatedFlights?.length || 0})</h3>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {relatedFlights && relatedFlights.length > 0 ? (
                relatedFlights.map((flight) => (
                  <button
                    type="button"
                    key={`${flight.flightNumber}-${flight.departureTime}`}
                    onClick={() => onFlightClick(flight)}
                    className="w-full rounded-md bg-white/5 p-3 text-left transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-blue-400">{flight.flightNumber}</span>
                      <span className="text-xs text-gray-500">{new Date(flight.departureTime).toLocaleDateString('zh-CN')}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <span>{flight.departureAirport}</span>
                      <span className="mx-2 text-gray-600">→</span>
                      <span>{flight.arrivalAirport}</span>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-gray-500 italic">暂无记录</p>
              )}
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[1200] transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      <div 
        className={`fixed top-0 right-0 z-[1300] h-full w-full max-w-80 transform border-l border-white/10 bg-gray-950/95 shadow-2xl backdrop-blur-md transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="false"
        aria-label="行程详情"
      >
        <div className="p-6 h-full flex flex-col">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            aria-label="关闭详情"
            title="关闭详情"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          
          <div className="mt-8 flex-1 overflow-hidden">
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
