import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 动态导入 leaflet-arc
import('leaflet-arc');

import './FlightMap.css';

// 临时示例数据
const exampleFlights = [
  {
    id: '1',
    start: [39.9042, 116.4074] as [number, number], // 北京
    end: [31.2304, 121.4737] as [number, number],   // 上海
  },
  {
    id: '2',
    start: [31.2304, 121.4737] as [number, number], // 上海
    end: [22.3193, 114.1694] as [number, number],   // 香港
  },
  {
    id: '3',
    start: [35.6895, 139.6917] as [number, number], // 东京
    end: [37.7749, -122.4194] as [number, number],  // 旧金山
  }
];

const FlightMap: React.FC = () => {
  // 默认中心点设置为北京
  const center: [number, number] = [39.9042, 116.4074];
  const [isDarkMode, setIsDarkMode] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const pathsRef = useRef<L.Polyline[]>([]);

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

  const handleMapLoad = (map: L.Map) => {
    mapRef.current = map;
    
    // 设置地图边界，限制滚动范围
    const bounds = L.latLngBounds(
      L.latLng(-85, -180), // 西南角
      L.latLng(85, 180)    // 东北角
    );
    map.setMaxBounds(bounds);
    
    // 等待 leaflet-arc 加载完成后绘制航线
    setTimeout(() => {
      if (L.Polyline && (L.Polyline as any).Arc) {
        // 清除之前的航线
        pathsRef.current.forEach(path => path.remove());
        pathsRef.current = [];
        
        // 绘制新的航线
        exampleFlights.forEach(flight => {
          // @ts-ignore
          const path = (L.Polyline as any).Arc(flight.start, flight.end, {
            color: '#3b82f6',
            weight: 2,
            opacity: 0.7,
            // 移除 dashArray 属性以使用实线
            interactive: false
          }).addTo(map);
          
          pathsRef.current.push(path);
        });
      }
    }, 100);
  };

  return (
    <div className="flight-map-container">
      <MapContainer 
        center={center} 
        zoom={3} 
        className="flight-map"
        style={{ backgroundColor: isDarkMode ? '#2d3748' : '#ffffff' }}
        whenReady={({ target }) => handleMapLoad(target as L.Map)}
        // 限制地图滚动范围
        maxBounds={L.latLngBounds(
          L.latLng(-85, -180), // 西南角
          L.latLng(85, 180)    // 东北角
        )}
        maxBoundsViscosity={1.0} // 强制限制边界
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