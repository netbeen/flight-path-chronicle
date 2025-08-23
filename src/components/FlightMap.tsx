'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-polylinedecorator';
import { Airport, getAirportByCode } from '@/data';
import { Flight } from '@/data';
import { processFlights } from '@/data';

// --- Helper functions for Bezier curve calculation ---

const getControlPoint = (p0: L.LatLng, p2: L.LatLng, curvature: number, map: L.Map) => {
  // 将经纬度坐标投影到地图的像素坐标系
  const p0_proj = map.project(p0);
  const p2_proj = map.project(p2);

  // 在像素坐标系中计算中点
  const midpoint_proj = p0_proj.add(p2_proj).divideBy(2);
  
  // 计算p0到p2的向量
  const dx = p2_proj.x - p0_proj.x;
  const dy = p2_proj.y - p0_proj.y;

  // 计算标准化的垂直向量
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) {
    // 如果起点和终点相同，直接返回中点
    return map.unproject(midpoint_proj);
  }
  const nx = -dy / len;
  const ny = dx / len;

  // 曲率现在是航线长度的一个比例，这使得曲线的弯曲程度与航线距离成正比
  const curve_pixel_distance = len * curvature;

  const control_point_proj = L.point(
    midpoint_proj.x + curve_pixel_distance * nx,
    midpoint_proj.y + curve_pixel_distance * ny
  );

  // 将计算出的控制点像素坐标反投影回经纬度坐标
  return map.unproject(control_point_proj);
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
  // 将地图中心点调整为太平洋，以实现“亚洲在左，美洲在右”的布局
  const center: [number, number] = [30, -150];
  const [isDarkMode, setIsDarkMode] = useState(false);
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

  // 使用 useEffect 强制设置地图的初始视图，确保太平洋为中心
  useEffect(() => {
    if (map) {
      // 将视图中心设置为 [-150, 30]，并设置缩放级别
      map.setView([30, -150], 2);
    }
  }, [map]); // 此效果仅在 map 实例准备好后运行一次

  // 2. 将绘图逻辑移入一个单独的 useEffect，并依赖于 map 状态
  useEffect(() => {
    if (!map) return; // 只有当地图实例准备好后才执行

    // 强制将视图设置在新的 [0, 360] 坐标系的中心
    map.setView([30, 180], 2);

    const bounds = L.latLngBounds(L.latLng(-85, -Infinity), L.latLng(85, Infinity));
    map.setMaxBounds(bounds);

    pathsRef.current.forEach(({ path, decorator, hitArea }) => {
      path.remove();
      decorator.remove();
      hitArea.remove();
    });
    pathsRef.current.clear();

    // 使用新的数据处理器来获取带有可视化属性的航班数据
    const processedFlights = processFlights(flights, airports);

    processedFlights.forEach(flight => {
      const departureAirport = getAirportByCode(flight.departureAirport);
      const arrivalAirport = getAirportByCode(flight.arrivalAirport);

      if (departureAirport && arrivalAirport) {
        // 使用转换后的坐标进行绘图
        const departureLongitude = departureAirport.longitude < 0 ? departureAirport.longitude + 360 : departureAirport.longitude;
        const arrivalLongitude = arrivalAirport.longitude < 0 ? arrivalAirport.longitude + 360 : arrivalAirport.longitude;

        const p0 = L.latLng(departureAirport.latitude, departureLongitude);
        // 优先使用修正后的到达点坐标
        const p2 = flight.arrivalAirportModified
          ? L.latLng(flight.arrivalAirportModified.latitude, flight.arrivalAirportModified.longitude)
          : L.latLng(arrivalAirport.latitude, arrivalLongitude);
        
        // 直接使用处理后的曲率，并传入 map 实例以进行投影计算
        const controlPoint = getControlPoint(p0, p2, flight.curvature, map);
        const polylinePoints = getQuadraticBezierPoints(p0, controlPoint, p2);

        const path = L.polyline(polylinePoints, {
          color: flight.color, // 使用处理后的颜色
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
                pixelSize: 10,
                polygon: true,
                pathOptions: {
                  stroke: false,
                  fill: true,
                  fillColor: flight.color, // 使用处理后的颜色
                  fillOpacity: 1,
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
          path.setStyle({ weight: 4, color: flight.color, opacity: 1 });
        });
        hitArea.on('mouseout', () => {
          path.setStyle({ weight: 2, color: flight.color, opacity: 0.7 });
        });

        pathsRef.current.set(flight.flightNumber, { path, decorator, hitArea });
      }
    });
  }, [map, flights, airports]); // 3. 添加 map 到依赖数组

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer
        center={center}
        zoom={2}
        style={{ height: '100%', width: '100%', backgroundColor: isDarkMode ? '#2d3748' : '#ffffff' }}
        ref={setMap}
        maxBoundsViscosity={1.0}
        // 使用 worldCopyJump 来创建一个连续的、可滚动的世界地图
        // 这是实现太平洋中心视图的标准方式
        worldCopyJump={true}
      >
        <TileLayer
          url={
            isDarkMode
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
          }
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          // 移除 noWrap={true}，因为它导致了地图只显示一半的问题
        />
      </MapContainer>
    </div>
  );
};

export default FlightMap;