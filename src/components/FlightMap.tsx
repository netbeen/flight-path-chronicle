'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Airport } from '@/data/airport';
import { Flight } from '@/data/flight';

interface FlightMapProps {
  flights: Flight[];
  airports: Airport[];
}

const FlightMap: React.FC<FlightMapProps> = ({ flights, airports }) => {
  const center: [number, number] = [39.9042, 116.4074];
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isArcLoaded, setIsArcLoaded] = useState(false); // 1. 新增状态来追踪 leaflet-arc 是否加载
  const mapRef = useRef<L.Map | null>(null);
  const pathsRef = useRef<L.Polyline[]>([]);

  const getAirportByCode = (code: string): Airport | undefined => {
    return airports.find(airport => airport.code === code);
  };

  // 2. 使用 useEffect 专门加载 leaflet-arc
  useEffect(() => {
    import('leaflet-arc')
      .then(() => {
        setIsArcLoaded(true);
      })
      .catch(err => console.error("Failed to load leaflet-arc", err));
  }, []);

  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    darkModeMediaQuery.addEventListener('change', handleChange);
    return () => darkModeMediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 3. 在绘制航线的 useEffect 中，增加对 isArcLoaded 的依赖
  useEffect(() => {
    const map = mapRef.current;
    // 确保地图和 leaflet-arc 都已准备就绪
    if (!map || !isArcLoaded) return;

    const bounds = L.latLngBounds(L.latLng(-85, -180), L.latLng(85, 180));
    map.setMaxBounds(bounds);

    // 移除旧的 setTimeout，直接绘制
    pathsRef.current.forEach(path => path.remove());
    pathsRef.current = [];

    flights.forEach(flight => {
      const departureAirport = getAirportByCode(flight.departureAirport);
      const arrivalAirport = getAirportByCode(flight.arrivalAirport);

      if (departureAirport && arrivalAirport) {
        const path = (L.Polyline as any).Arc(
          [departureAirport.latitude, departureAirport.longitude],
          [arrivalAirport.latitude, arrivalAirport.longitude],
          {
            color: '#3b82f6',
            weight: 2,
            opacity: 0.7,
            interactive: false,
          }
        ).addTo(map);
        pathsRef.current.push(path);
      }
    });
  }, [flights, airports, isArcLoaded]); // 4. 将 isArcLoaded 添加到依赖数组

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer
        center={center}
        zoom={3}
        style={{ height: '100%', width: '100%', backgroundColor: isDarkMode ? '#2d3748' : '#ffffff' }}
        ref={mapRef}
        maxBounds={L.latLngBounds(L.latLng(-85, -180), L.latLng(85, 180))}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          url={
            isDarkMode
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
          }
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
      </MapContainer>
    </div>
  );
};

export default FlightMap;