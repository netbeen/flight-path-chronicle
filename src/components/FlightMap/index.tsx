import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import './FlightMap.css';

const FlightMap: React.FC = () => {
  // 默认中心点设置为北京
  const center: [number, number] = [39.9042, 116.4074];
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // 检查系统是否启用深色模式
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);
    
    // 监听系统深色模式变化
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };
    
    darkModeMediaQuery.addEventListener('change', handleChange);
    
    return () => {
      darkModeMediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return (
    <div className="flight-map-container">
      <MapContainer 
        center={center} 
        zoom={3} 
        className="flight-map"
        style={{ backgroundColor: isDarkMode ? '#2d3748' : '#ffffff' }}
      >
        {isDarkMode ? (
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
        ) : (
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
        )}
      </MapContainer>
    </div>
  );
};

export default FlightMap;