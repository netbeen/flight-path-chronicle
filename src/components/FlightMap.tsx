'use client';

import React, { useEffect, useState, useRef } from 'react';
// 1. 移除 Popup 和 useMapEvents，我们不再需要它们
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-polylinedecorator';
import { Airport } from '@/data/airport';
import { Flight } from '@/data/flight';

import('leaflet-arc');

interface FlightMapProps {
  flights: Flight[];
  airports: Airport[];
}

// 2. 移除 MapEvents 组件
const FlightMap: React.FC<FlightMapProps> = ({ flights, airports }) => {
  const center: [number, number] = [39.9042, 116.4074];
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isArcLoaded, setIsArcLoaded] = useState(false);
  // 3. 移除 selectedFlight state，不再由 React state 控制弹窗
  const mapRef = useRef<L.Map | null>(null);
  const pathsRef = useRef<Map<string, { path: L.Polyline; decorator: L.PolylineDecorator; hitArea: L.Polyline }>>(new Map());

  const getAirportByCode = (code: string): Airport | undefined => {
    return airports.find(airport => airport.code === code);
  };

  useEffect(() => {
    import('leaflet-arc')
      .then(() => setIsArcLoaded(true))
      .catch(err => console.error("Failed to load leaflet-arc", err));
  }, []);

  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    darkModeMediaQuery.addEventListener('change', handleChange);
    return () => darkModeMediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isArcLoaded) return;

    const bounds = L.latLngBounds(L.latLng(-85, -180), L.latLng(85, 180));
    map.setMaxBounds(bounds);

    pathsRef.current.forEach(({ path, decorator, hitArea }) => {
      path.remove();
      decorator.remove();
      hitArea.remove();
    });
    pathsRef.current.clear();

    flights.forEach(flight => {
      const departureAirport = getAirportByCode(flight.departureAirport);
      const arrivalAirport = getAirportByCode(flight.arrivalAirport);

      if (departureAirport && arrivalAirport) {
        const latlngs = [
          [departureAirport.latitude, departureAirport.longitude],
          [arrivalAirport.latitude, arrivalAirport.longitude],
        ];

        const path = (L.Polyline as any).Arc(latlngs[0], latlngs[1], {
          color: '#3b82f6',
          weight: 2,
          opacity: 0.7,
          interactive: false,
        }).addTo(map);

        const hitArea = (L.Polyline as any).Arc(latlngs[0], latlngs[1], {
          color: 'transparent',
          weight: 20,
          opacity: 0,
          interactive: true,
        }).addTo(map);

        const decorator = L.polylineDecorator(path, {
          patterns: [
            {
              offset: '50%',
              repeat: 0,
              symbol: L.Symbol.arrowHead({
                pixelSize: 8,
                polygon: false,
                pathOptions: { stroke: true, color: '#3b82f6', weight: 2 },
              }),
            },
          ],
        }).addTo(map);

        // 4. 构建弹窗的 HTML 内容
        const popupContent = `
          <div>
            <h3>Flight Details</h3>
            <p><strong>Flight No:</strong> ${flight.flightNumber}</p>
            <p><strong>From:</strong> ${departureAirport.name} (${departureAirport.code})</p>
            <p><strong>To:</strong> ${arrivalAirport.name} (${arrivalAirport.code})</p>
            <p><strong>Departure:</strong> ${new Date(flight.departureTime).toLocaleString()}</p>
          </div>
        `;

        // 5. 将弹窗内容直接绑定到图层上
        hitArea.bindPopup(popupContent);

        hitArea.on('mouseover', () => {
          path.setStyle({ weight: 4, color: '#2563eb' });
        });
        hitArea.on('mouseout', () => {
          path.setStyle({ weight: 2, color: '#3b82f6' });
        });
        
        // 6. 移除手动的 click 事件处理器，Leaflet 会自动处理
        
        pathsRef.current.set(flight.flightNumber, { path, decorator, hitArea });
      }
    });
  }, [flights, airports, isArcLoaded]);

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
              : 'https://s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
          }
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {/* 7. 移除所有与 Popup 相关的 JSX */}
      </MapContainer>
    </div>
  );
};

export default FlightMap;