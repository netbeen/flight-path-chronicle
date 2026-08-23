'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-polylinedecorator';
import { Airport, Flight } from '@/data';
import {
  processFlights,
  calculateAirportActivity,
  ProcessedFlight,
} from '@/data/flightProcessor';
import { MAP_CONFIG } from '@/config/mapConfig';
import { getFlightId, MapCommand } from '@/components/flightUiTypes';
import { getRouteVisualMetrics } from '@/components/mapVisualScale';

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
  onMapBackgroundClick: () => void;
  mapCommand: MapCommand | null;
  selectedFlightId: string | null;
  careerMode: boolean;
}

const FlightMap: React.FC<FlightMapProps> = ({
  flights,
  airports,
  onAirportClick,
  onFlightClick,
  onMapBackgroundClick,
  mapCommand,
  selectedFlightId,
  careerMode,
}) => {
  // 将地图中心点调整为中国，以满足用户需求
  const center: L.LatLngExpression = MAP_CONFIG.defaultCenter;
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [map, setMap] = useState<L.Map | null>(null);
  const pathsRef = useRef<Map<string, {
    path: L.Polyline;
    decorator: L.PolylineDecorator;
    hitArea: L.Polyline;
    color: string;
    arrowOffset: string;
  }>>(new Map());
  const airportMarkersRef = useRef<L.Marker[]>([]);
  const isAnimatingRef = useRef(false);
  const selectedFlightIdRef = useRef(selectedFlightId);
  const hoveredFlightIdRef = useRef<string | null>(null);

  useEffect(() => {
    selectedFlightIdRef.current = selectedFlightId;
  }, [selectedFlightId]);

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

  // 使用 useEffect 强制设置地图的初始视图，确保以中国为中心
  useEffect(() => {
    if (map) {
      // 将视图中心设置为默认中心，并设置缩放级别
      map.setView(MAP_CONFIG.defaultCenter, MAP_CONFIG.defaultZoom);
    }
  }, [map]); // 此效果仅在 map 实例准备好后运行一次

  useEffect(() => {
    if (!map || !mapCommand || isAnimatingRef.current) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    isAnimatingRef.current = true;

    if (mapCommand.type === 'airport') {
      map.flyTo([mapCommand.lat, mapCommand.lng], mapCommand.zoom, {
        animate: !reduceMotion,
        duration: reduceMotion ? 0 : 0.8,
      });
    } else if (mapCommand.type === 'flight' || mapCommand.type === 'career') {
      map.fitBounds(mapCommand.bounds, {
        animate: !reduceMotion,
        duration: reduceMotion ? 0 : 0.8,
        paddingTopLeft: mapCommand.type === 'career' ? [60, 180] : [80, 80],
        paddingBottomRight: mapCommand.type === 'career' ? [60, 110] : [80, 80],
        maxZoom: mapCommand.type === 'career' ? 4 : 6,
      });
    } else {
      map.flyTo(MAP_CONFIG.defaultCenter, MAP_CONFIG.defaultZoom, {
        animate: !reduceMotion,
        duration: reduceMotion ? 0 : 0.8,
      });
    }

    const releaseAnimationLock = () => {
      isAnimatingRef.current = false;
    };
    map.once('moveend', releaseAnimationLock);
    const fallback = window.setTimeout(releaseAnimationLock, reduceMotion ? 50 : 1200);
    return () => {
      window.clearTimeout(fallback);
      map.off('moveend', releaseAnimationLock);
      isAnimatingRef.current = false;
    };
  }, [map, mapCommand]);

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
    if (!map.getPane('airportHighlights')) {
      map.createPane('airportHighlights');
    }
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
        const size = Math.min(34, 12 + Math.sqrt(count) * 3);
        const icon = L.divIcon({
          html: `
            <div class="airport-highlight cursor-pointer"></div>
            ${careerMode ? `<div class="career-airport-label" aria-label="${airport.code}，抵达 ${count} 次">${airport.code}<span>${count}</span></div>` : ''}
          `,
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
        
        // Adaptive sampling based on distance
        // Short flights (<1000km) don't need many points, while long transcontinental flights do.
        const distance = p0.distanceTo(p2); // in meters
        let numPoints = 20;
        if (distance > 5000000) { // > 5000km
          numPoints = 60;
        } else if (distance > 1000000) { // > 1000km
          numPoints = 40;
        }

        // 直接使用处理后的曲率，并传入 map 实例以进行投影计算
        const controlPoint = getControlPoint(p0, p2, flight.curvature, map);
        const polylinePoints = getQuadraticBezierPoints(p0, controlPoint, p2, numPoints);
        const visualMetrics = getRouteVisualMetrics(map.getZoom());
        const arrowOffset = `${flight.routeCount === 1
          ? 50
          : 38 + (flight.routeIndex / (flight.routeCount - 1)) * 24}%`;

        const path = L.polyline(polylinePoints, {
          color: flight.color, // 使用处理后的颜色
          weight: visualMetrics.weight,
          opacity: careerMode ? 0.78 : 0.62,
          interactive: false,
          dashArray: `${visualMetrics.dashSize}, ${visualMetrics.dashSize}`,
          className: `${careerMode ? 'flight-path-poster' : 'flight-path-animated'} route-${flight.departureAirport}-${flight.arrivalAirport}`,
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
              offset: arrowOffset,
              repeat: 0,
              // 1. 修改箭头符号的定义
              symbol: L.Symbol.arrowHead({
                pixelSize: visualMetrics.arrowSize,
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

        const flightId = getFlightId(flight);

        hitArea.on('mouseover', () => {
          hoveredFlightIdRef.current = flightId;
          const metrics = getRouteVisualMetrics(map.getZoom());
          path.setStyle({ weight: metrics.hoverWeight, color: flight.color, opacity: 1 });
        });
        hitArea.on('mouseout', () => {
          hoveredFlightIdRef.current = null;
          const currentSelection = selectedFlightIdRef.current;
          const isSelected = currentSelection === flightId;
          const metrics = getRouteVisualMetrics(map.getZoom());
          path.setStyle({
            weight: isSelected ? metrics.selectedWeight : metrics.weight,
            color: flight.color,
            opacity: isSelected ? 1 : currentSelection ? 0.22 : 0.62,
          });
        });

        pathsRef.current.set(flightId, {
          path,
          decorator,
          hitArea,
          color: flight.color,
          arrowOffset,
        });
      }
    });
  }, [map, processedFlights, airportActivity, airports, onAirportClick, onFlightClick, careerMode]);

  useEffect(() => {
    pathsRef.current.forEach(({ path, color }, id) => {
      const isSelected = selectedFlightId === id;
      const hasSelection = selectedFlightId !== null;
      const isHovered = hoveredFlightIdRef.current === id;
      const metrics = getRouteVisualMetrics(map?.getZoom() ?? MAP_CONFIG.defaultZoom);
      path.setStyle({
        color,
        weight: isHovered
          ? metrics.hoverWeight
          : isSelected
            ? metrics.selectedWeight
            : metrics.weight,
        opacity: isHovered || isSelected ? 1 : hasSelection ? 0.22 : 0.62,
      });
      if (isSelected) path.bringToFront();
    });
  }, [map, selectedFlightId, processedFlights]);

  useEffect(() => {
    if (!map) return;

    const updateRouteScale = () => {
      const metrics = getRouteVisualMetrics(map.getZoom());
      const selection = selectedFlightIdRef.current;
      const hovered = hoveredFlightIdRef.current;

      pathsRef.current.forEach(({ path, decorator, color, arrowOffset }, id) => {
        const isSelected = selection === id;
        const isHovered = hovered === id;
        path.setStyle({
          color,
          weight: isHovered
            ? metrics.hoverWeight
            : isSelected
              ? metrics.selectedWeight
              : metrics.weight,
          opacity: isHovered || isSelected ? 1 : selection ? 0.22 : careerMode ? 0.78 : 0.62,
          dashArray: `${metrics.dashSize}, ${metrics.dashSize}`,
        });
        decorator.setPatterns([
          {
            offset: arrowOffset,
            repeat: 0,
            symbol: L.Symbol.arrowHead({
              pixelSize: metrics.arrowSize,
              polygon: true,
              pathOptions: {
                stroke: false,
                fill: true,
                fillColor: color,
                fillOpacity: 1,
              },
            }),
          },
        ]);
      });
    };

    updateRouteScale();
    map.on('zoomend', updateRouteScale);
    return () => {
      map.off('zoomend', updateRouteScale);
    };
  }, [map, processedFlights, careerMode]);

  useEffect(() => {
    if (!map) return;
    map.on('click', onMapBackgroundClick);
    return () => {
      map.off('click', onMapBackgroundClick);
    };
  }, [map, onMapBackgroundClick]);

  return (
    <div className={careerMode ? 'career-map' : ''} style={{ height: '100vh', width: '100%' }}>
      <MapContainer
        center={center}
        zoom={MAP_CONFIG.defaultZoom}
        minZoom={MAP_CONFIG.minZoom}
        zoomControl={false} // Disable default zoom control
        style={{ height: '100%', width: '100%', backgroundColor: isDarkMode ? '#202124' : '#ffffff' }}
        ref={setMap}
        maxBoundsViscosity={MAP_CONFIG.maxBoundsViscosity}
        maxBounds={MAP_CONFIG.maxBounds}
        // 由于设置了 maxBounds，worldCopyJump 将不再生效，这可以防止用户拖动到地图边缘以外的空白区域
        // worldCopyJump={true} 
      >
        <TileLayer
          crossOrigin="anonymous"
          url={
            isDarkMode || careerMode
              ? MAP_CONFIG.tileProviders.dark
              : MAP_CONFIG.tileProviders.light
          }
          attribution={MAP_CONFIG.attribution}
          // 移除 noWrap={true}，因为它导致了地图只显示一半的问题
        />
        <ZoomControl position="bottomright" />
      </MapContainer>
    </div>
  );
};

export default FlightMap;
