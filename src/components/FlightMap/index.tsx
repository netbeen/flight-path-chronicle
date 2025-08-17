import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 动态导入 leaflet-arc
import('leaflet-arc');

import './FlightMap.css';

// 直接在组件中定义模拟数据，避免导入问题
const mockFlights = [
  {
    id: '1',
    flightNumber: 'CA1831',
    departure: {
      airport: '北京首都国际机场',
      latitude: 40.0724,
      longitude: 116.5971,
      time: '2023-05-01T08:00:00',
    },
    arrival: {
      airport: '上海浦东国际机场',
      latitude: 31.1559,
      longitude: 121.8053,
      time: '2023-05-01T10:15:00',
    },
  },
  {
    id: '2',
    flightNumber: 'MU5101',
    departure: {
      airport: '上海虹桥国际机场',
      latitude: 31.1959,
      longitude: 121.3417,
      time: '2023-05-03T14:30:00',
    },
    arrival: {
      airport: '广州白云国际机场',
      latitude: 23.3896,
      longitude: 113.3057,
      time: '2023-05-03T17:00:00',
    },
  },
  {
    id: '3',
    flightNumber: 'CZ3907',
    departure: {
      airport: '广州白云国际机场',
      latitude: 23.3896,
      longitude: 113.3057,
      time: '2023-05-05T09:45:00',
    },
    arrival: {
      airport: '成都双流国际机场',
      latitude: 30.5785,
      longitude: 103.9471,
      time: '2023-05-05T12:10:00',
    },
  },
  {
    id: '4',
    flightNumber: 'HU7606',
    departure: {
      airport: '成都双流国际机场',
      latitude: 30.5785,
      longitude: 103.9471,
      time: '2023-05-07T16:20:00',
    },
    arrival: {
      airport: '西安咸阳国际机场',
      latitude: 34.4388,
      longitude: 108.7583,
      time: '2023-05-07T18:35:00',
    },
  },
  {
    id: '5',
    flightNumber: 'FM9101',
    departure: {
      airport: '西安咸阳国际机场',
      latitude: 34.4388,
      longitude: 108.7583,
      time: '2023-05-10T11:10:00',
    },
    arrival: {
      airport: '北京首都国际机场',
      latitude: 40.0724,
      longitude: 116.5971,
      time: '2023-05-10T13:25:00',
    },
  },
];

const FlightMap: React.FC = () => {
  // 默认中心点设置为北京
  const center: [number, number] = [39.9042, 116.4074];
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [flights, setFlights] = useState(mockFlights);
  const [loading, setLoading] = useState(false);
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
  };

  // 绘制航线
  useEffect(() => {
    if (!mapRef.current || loading) return;
    
    const map = mapRef.current;
    
    // 等待 leaflet-arc 加载完成后绘制航线
    setTimeout(() => {
      if (L.Polyline && (L.Polyline as any).Arc) {
        // 清除之前的航线
        pathsRef.current.forEach(path => path.remove());
        pathsRef.current = [];
        
        // 绘制新的航线
        flights.forEach(flight => {
          // @ts-ignore
          const path = (L.Polyline as any).Arc(
            [flight.departure.latitude, flight.departure.longitude],
            [flight.arrival.latitude, flight.arrival.longitude],
            {
              color: '#3b82f6',
              weight: 2,
              opacity: 0.7,
              // 移除 dashArray 属性以使用实线
              interactive: false
            }
          ).addTo(map);
          
          pathsRef.current.push(path);
        });
      }
    }, 100);
  }, [flights, loading]);

  if (loading) {
    return <div className="flight-map-container">Loading flights...</div>;
  }

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