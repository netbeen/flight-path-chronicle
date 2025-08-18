'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Airport } from '@/data/airport';
import { Flight } from '@/data/flight';

// 动态导入 leaflet-arc
import('leaflet-arc');

interface FlightMapProps {
  flights: Flight[];
  airports: Airport[];
}

const FlightMap: React.FC<FlightMapProps> = ({ flights, airports }) => {
  const center: [number, number] = [39.9042, 116.4074];
  const [isDarkMode, setIsDarkMode] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const pathsRef = useRef<L.Polyline[]>([]);

  const getAirportByCode = (code: string): Airport | undefined => {
    return airports.find(airport => airport.code === code);
  };

  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    darkModeMediaQuery.addEventListener('change', handleChange);
    return () => darkModeMediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const bounds = L.latLngBounds(L.latLng(-85, -180), L.latLng(85, 180));
    map.setMaxBounds(bounds);

    setTimeout(() => {
      if (L.Polyline && (L.Polyline as any).Arc) {
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
      }
    }, 100);
  }, [flights, airports]);

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