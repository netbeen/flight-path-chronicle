'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-polylinedecorator';
import { Airport } from '@/data/airport';
import { Flight } from '@/data/flight';

// --- Helper functions for Bezier curve calculation ---

const getControlPoint = (p0: L.LatLng, p2: L.LatLng, curvature: number) => {
  const midpoint = L.latLng((p0.lat + p2.lat) / 2, (p0.lng + p2.lng) / 2);
  const dx = p2.lng - p0.lng;
  const dy = p2.lat - p0.lat;
  const perpendicular = L.latLng(-dy, dx);
  
  return L.latLng(
    midpoint.lat + curvature * perpendicular.lat,
    midpoint.lng + curvature * perpendicular.lng
  );
};

const getQuadraticBezierPoints = (p0: L.LatLng, p1: L.LatLng, p2: L.LatLng, numPoints = 50) => {
  const points: L.LatLngExpression[] = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lat = (1 - t) * (1 - t) * p0.lat + 2 * (1 - t) * t * p1.lat + t * t * p2.lat;
    const lng = (1 - t) * (1 - t) * p0.lng + 2 * (1 - t) * t * p1.lng + t * t * p2.lng;
    points.push([lat, lng]);
  }
  return points;
};


interface FlightMapProps {
  flights: Flight[];
  airports: Airport[];
}

const FlightMap: React.FC<FlightMapProps> = ({ flights, airports }) => {
  const center: [number, number] = [39.9042, 116.4074];
  const [isDarkMode, setIsDarkMode] = useState(false);
  // 1. 使用 useState 来存储地图实例，确保时机正确
  const [map, setMap] = useState<L.Map | null>(null);
  const pathsRef = useRef<Map<string, { path: L.Polyline; decorator: L.PolylineDecorator; hitArea: L.Polyline }>>(new Map());

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

  // 2. 将绘图逻辑移入一个单独的 useEffect，并依赖于 map 状态
  useEffect(() => {
    if (!map) return; // 只有当地图实例准备好后才执行

    const bounds = L.latLngBounds(L.latLng(-85, -180), L.latLng(85, 180));
    map.setMaxBounds(bounds);

    pathsRef.current.forEach(({ path, decorator, hitArea }) => {
      path.remove();
      decorator.remove();
      hitArea.remove();
    });
    pathsRef.current.clear();

    const flightGroups = new Map<string, Flight[]>();
    flights.forEach(flight => {
      const key = [flight.departureAirport, flight.arrivalAirport].sort().join('-');
      if (!flightGroups.has(key)) {
        flightGroups.set(key, []);
      }
      flightGroups.get(key)!.push(flight);
    });

    flightGroups.forEach(group => {
      const directions = new Map<string, Flight[]>();
      group.forEach(flight => {
        const directionKey = `${flight.departureAirport}->${flight.arrivalAirport}`;
        if (!directions.has(directionKey)) {
          directions.set(directionKey, []);
        }
        directions.get(directionKey)!.push(flight);
      });

      directions.forEach((directionFlights, directionKey) => {
        const baseCurvature = 0.15;
        const isReturnFlight = directionKey.split('->')[0] > directionKey.split('->')[1];

        directionFlights.forEach((flight, index) => {
          const departureAirport = getAirportByCode(flight.departureAirport);
          const arrivalAirport = getAirportByCode(flight.arrivalAirport);

          if (departureAirport && arrivalAirport) {
            const p0 = L.latLng(departureAirport.latitude, departureAirport.longitude);
            const p2 = L.latLng(arrivalAirport.latitude, arrivalAirport.longitude);
            
            let curvature = (index + 1) * baseCurvature;
            if (isReturnFlight) {
              curvature = -curvature;
            }

            const controlPoint = getControlPoint(p0, p2, curvature);
            const polylinePoints = getQuadraticBezierPoints(p0, controlPoint, p2);

            const path = L.polyline(polylinePoints, {
              color: '#3b82f6',
              weight: 2,
              opacity: 0.7,
              interactive: false,
            }).addTo(map);

            const hitArea = L.polyline(polylinePoints, {
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
                  // 1. 修改箭头符号的定义
                  symbol: L.Symbol.arrowHead({
                    pixelSize: 10,     // 稍微增大尺寸，使其更清晰
                    polygon: true,     // 将箭头绘制为闭合的多边形（三角形）
                    pathOptions: {
                      stroke: false,   // 移除边框，使其成为一个实心形状
                      fill: true,      // 允许填充
                      fillColor: '#3b82f6', // 使用与航线相同的颜色进行填充
                      fillOpacity: 1,  // 完全不透明
                    },
                  }),
                },
              ],
            }).addTo(map);
            
            const popupContent = `
              <div>
                <h3>Flight Details</h3>
                <p><strong>Flight No:</strong> ${flight.flightNumber}</p>
                <p><strong>From:</strong> ${departureAirport.name} (${departureAirport.code})</p>
                <p><strong>To:</strong> ${arrivalAirport.name} (${arrivalAirport.code})</p>
                <p><strong>Departure:</strong> ${new Date(flight.departureTime).toLocaleString()}</p>
              </div>
            `;

            hitArea.bindPopup(popupContent);

            hitArea.on('mouseover', () => {
              path.setStyle({ weight: 4, color: '#2563eb' });
            });
            hitArea.on('mouseout', () => {
              path.setStyle({ weight: 2, color: '#3b82f6' });
            });

            pathsRef.current.set(flight.flightNumber, { path, decorator, hitArea });
          }
        });
      });
    });
  }, [map, flights, airports]); // 3. 添加 map 到依赖数组

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer
        center={center}
        zoom={3}
        style={{ height: '100%', width: '100%', backgroundColor: isDarkMode ? '#2d3748' : '#ffffff' }}
        // 4. 将 setMap 作为 ref 回调函数传递
        ref={setMap}
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
      </MapContainer>
    </div>
  );
};

export default FlightMap;