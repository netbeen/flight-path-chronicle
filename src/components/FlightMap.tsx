'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-polylinedecorator';
import { Airport, Flight } from '@/data';
import { processFlights, calculateAirportActivity, ProcessedFlight } from '@/data/flightProcessor';

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
  onAirportClick: (airport: Airport) => void;
  onFlightClick: (flight: ProcessedFlight) => void;
  focusedLocation: { lat: number; lng: number; zoom?: number } | null;
}

const FlightMap: React.FC<FlightMapProps> = ({ flights, airports, onAirportClick, onFlightClick, focusedLocation }) => {
  // 将地图中心点调整为太平洋，以实现“亚洲在左，美洲在右”的布局
  const center: [number, number] = [30, -150];
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [map, setMap] = useState<L.Map | null>(null);
  const pathsRef = useRef<Map<string, { path: L.Polyline; decorator: L.PolylineDecorator; hitArea: L.Polyline }>>(new Map());
  const airportMarkersRef = useRef<L.Marker[]>([]);

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

  // 监听焦点位置变化
  useEffect(() => {
    if (map && focusedLocation) {
      map.flyTo([focusedLocation.lat, focusedLocation.lng], focusedLocation.zoom || 5, {
        duration: 1.5
      });
    }
  }, [map, focusedLocation]);

  // 2. 将绘图逻辑移入一个单独的 useEffect，并依赖于 map 状态
  /**
   * 预计算机场活跃度
   * 仅在 flights 变化时重新计算，降低绘制副作用中的重复开销
   */
  const airportActivity = useMemo(() => calculateAirportActivity(flights), [flights]);

  /**
   * 预处理航班曲线与跨日界线修正
   * 仅在 flights 或 airports 变化时重新计算
   */
  const processedFlights = useMemo(() => processFlights(flights, airports), [flights, airports]);

  useEffect(() => {
    if (!map) return; // 只有当地图实例准备好后才执行

    // 创建一个自定义的 Pane 用于渲染机场高亮点，并设置高 zIndex
    map.createPane('airportHighlights');
    const highlightPane = map.getPane('airportHighlights');
    if (highlightPane) {
      highlightPane.style.zIndex = '650';
    }

    // 清理旧的航线和高亮点
    pathsRef.current.forEach(({ path, decorator, hitArea }) => {
      path.remove();
      decorator.remove();
      hitArea.remove();
    });
    pathsRef.current.clear();
    airportMarkersRef.current.forEach(marker => marker.remove());
    airportMarkersRef.current = [];

    // --- 绘制机场高亮点 ---
    airportActivity.forEach((count, code) => {
      const airport = getAirportByCode(code);
      if (airport) {
        const size = 10 + count * 2; // 根据起降次数动态计算大小
        const icon = L.divIcon({
          html: `<div class="airport-highlight cursor-pointer"></div>`,
          className: '',
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        // 为了适配可无限滚动的世界地图，我们在三个“世界”中都绘制标记
        // （当前世界、左边的世界和右边的世界）
        // 这确保了高亮点与跨越日界线的航线终点能够正确匹配
        [-360, 0, 360].forEach(lngOffset => {
          const marker = L.marker([airport.latitude, airport.longitude + lngOffset], {
            icon: icon,
            pane: 'airportHighlights', // 在自定义 Pane 中渲染
            interactive: true,
          }).addTo(map);

          marker.on('click', () => {
             onAirportClick(airport);
          });

          airportMarkersRef.current.push(marker);
        });
      }
    });

    // --- 绘制航线 ---

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
        
        // 替换 bindPopup 为 onClick
        hitArea.on('click', (e) => {
            L.DomEvent.stopPropagation(e); // 防止地图点击事件
            onFlightClick(flight);
        });

        hitArea.on('mouseover', () => {
          path.setStyle({ weight: 4, color: flight.color, opacity: 1 });
        });
        hitArea.on('mouseout', () => {
          path.setStyle({ weight: 2, color: flight.color, opacity: 0.7 });
        });

        pathsRef.current.set(`${flight.flightNumber}-${flight.departureTime}`, { path, decorator, hitArea });
      }
    });
  }, [map, processedFlights, airportActivity, airports, onAirportClick, onFlightClick]); // 3. 添加 map 到依赖数组

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer
        center={center}
        zoom={2}
        zoomControl={false} // Disable default zoom control
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
        <ZoomControl position="bottomright" />
      </MapContainer>
    </div>
  );
};

export default FlightMap;
