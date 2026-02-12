import React from 'react';
import { Airport, Flight } from '@/data';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: Airport | Flight | null;
  relatedFlights?: Flight[]; // 当选中机场时，传入相关航班
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, selectedItem, relatedFlights }) => {
  if (!selectedItem) return null;

  const isFlight = (item: Airport | Flight): item is Flight => {
    return (item as Flight).flightNumber !== undefined;
  };

  const renderContent = () => {
    if (isFlight(selectedItem)) {
      const departureDate = new Date(selectedItem.departureTime);
      return (
        <div className="space-y-6">
          <div className="border-b border-gray-700 pb-4">
            <h2 className="text-2xl font-bold text-white mb-2">{selectedItem.flightNumber}</h2>
            <p className="text-gray-400 text-sm">航班详情</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-white">
            <div>
              <p className="text-gray-400 text-xs uppercase mb-1">出发地</p>
              <p className="text-xl font-semibold">{selectedItem.departureAirport}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase mb-1">目的地</p>
              <p className="text-xl font-semibold">{selectedItem.arrivalAirport}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-400 text-xs uppercase mb-1">起飞时间</p>
              <p className="text-lg">{departureDate.toLocaleString()}</p>
            </div>
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
                relatedFlights.map((flight, idx) => (
                  <div key={idx} className="bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-blue-400">{flight.flightNumber}</span>
                      <span className="text-xs text-gray-500">{new Date(flight.departureTime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <span>{flight.departureAirport}</span>
                      <span className="mx-2 text-gray-600">→</span>
                      <span>{flight.arrivalAirport}</span>
                    </div>
                  </div>
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
        className={`fixed top-0 right-0 h-full w-80 bg-gray-900/95 backdrop-blur-md shadow-2xl z-[1300] transform transition-transform duration-300 ease-in-out border-l border-white/10 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6 h-full flex flex-col">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
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
