"use client";

import dynamic from 'next/dynamic';
import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { Flight } from '@/data/flight';
import { Airport } from '@/data/airport';
import Sidebar from '@/components/Sidebar';
import FloatingStatsPanel from '@/components/FloatingStatsPanel';
import TimelineController from '@/components/TimelineController';
import {
  getAvailableYears,
  getAvailableAirlines,
  processFlights,
  ProcessedFlight,
} from '@/data/flightProcessor';
import { getFlightId, MapCommand } from '@/components/flightUiTypes';

// 使用 next/dynamic 动态导入 FlightMap 组件，并禁用 SSR
const FlightMap = dynamic(() => import('@/components/FlightMap'), { 
  ssr: false,
  // 添加一个加载状态，提升用户体验
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-lg font-light tracking-widest">LOADING MAP DATA...</p>
    </div>
  ),
});

interface FlightMapClientProps {
  flights: Flight[];
  airports: Airport[];
}

/**
 * FlightMapClient component
 * 
 * @param {FlightMapClientProps} props - The props for the component.
 * @param {Flight[]} props.flights - The list of flights.
 * @param {Airport[]} props.airports - The list of airports.
 * @returns {JSX.Element} The rendered FlightMap component.
 */
export default function FlightMapClient({ flights, airports }: FlightMapClientProps) {
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedAirline, setSelectedAirline] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<Airport | ProcessedFlight | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [mapCommand, setMapCommand] = useState<MapCommand | null>(null);
  const mapCommandId = useRef(0);
  
  const [currentFlightIndex, setCurrentFlightIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 获取所有可选年份和航司
  const years = useMemo(() => getAvailableYears(flights), [flights]);
  const airlines = useMemo(() => getAvailableAirlines(flights), [flights]);

  const filteredFlights = useMemo(() => {
    const result = flights.filter(flight => {
      const year = new Date(flight.departureTime).getFullYear().toString();
      const airlineCode = flight.flightNumber.substring(0, 2);
      
      const yearMatch = selectedYear === 'all' || year === selectedYear;
      const airlineMatch = selectedAirline === 'all' || airlineCode === selectedAirline;
      
      return yearMatch && airlineMatch;
    });

    return processFlights(result, airports).sort(
      (a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime(),
    );
  }, [flights, airports, selectedYear, selectedAirline]);

  const visibleFlights = useMemo(
    () => currentFlightIndex === null
      ? filteredFlights
      : filteredFlights.slice(0, currentFlightIndex + 1),
    [filteredFlights, currentFlightIndex],
  );

  const activeTimelineFlight = currentFlightIndex === null
    ? null
    : filteredFlights[currentFlightIndex] || null;

  const selectedFlightId = selectedItem
    ? 'flightNumber' in selectedItem
      ? getFlightId(selectedItem)
      : null
    : activeTimelineFlight
      ? getFlightId(activeTimelineFlight)
      : null;

  useEffect(() => {
    if (isPlaying && filteredFlights.length > 0) {
      timerRef.current = setInterval(() => {
        setCurrentFlightIndex((previousIndex) => {
          const nextIndex = previousIndex === null ? 0 : previousIndex + 1;
          if (nextIndex >= filteredFlights.length) {
            setIsPlaying(false);
            return filteredFlights.length - 1;
          }
          return nextIndex;
        });
      }, 800);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, filteredFlights.length]);

  const handlePlayPause = () => {
    if (filteredFlights.length === 0) return;
    if (!isPlaying && (currentFlightIndex === null || currentFlightIndex >= filteredFlights.length - 1)) {
      setCurrentFlightIndex(0);
    }
    if (!isPlaying) {
      setSelectedItem(null);
      setIsSidebarOpen(false);
    }
    setIsPlaying((playing) => !playing);
  };

  const handleTimelineIndexChange = useCallback((index: number | null) => {
    setIsPlaying(false);
    setCurrentFlightIndex(index);
    setSelectedItem(null);
    setIsSidebarOpen(false);
  }, []);

  const relatedFlights = useMemo(() => {
    if (!selectedItem || !('code' in selectedItem)) return [];
    const code = selectedItem.code;
    return filteredFlights.filter(f => f.departureAirport === code || f.arrivalAirport === code)
      .sort((a, b) => new Date(b.departureTime).getTime() - new Date(a.departureTime).getTime());
  }, [selectedItem, filteredFlights]);

  const handleAirportClick = useCallback((airport: Airport) => {
    setSelectedItem(airport);
    setIsSidebarOpen(true);
    setMapCommand({
      id: ++mapCommandId.current,
      type: 'airport',
      lat: airport.latitude,
      lng: airport.longitude,
      zoom: 6,
    });
  }, []);

  const handleFlightClick = useCallback((flight: ProcessedFlight) => {
    setSelectedItem(flight);
    setIsSidebarOpen(true);
    const index = filteredFlights.findIndex((candidate) => getFlightId(candidate) === getFlightId(flight));
    if (index >= 0) {
      setCurrentFlightIndex(index);
    }
    const departure = airports.find((airport) => airport.code === flight.departureAirport);
    const arrival = airports.find((airport) => airport.code === flight.arrivalAirport);
    if (departure && arrival) {
      const departureLng = departure.longitude < 0 ? departure.longitude + 360 : departure.longitude;
      const arrivalLng = flight.arrivalAirportModified?.longitude
        ?? (arrival.longitude < 0 ? arrival.longitude + 360 : arrival.longitude);
      setMapCommand({
        id: ++mapCommandId.current,
        type: 'flight',
        bounds: [
          [departure.latitude, departureLng],
          [arrival.latitude, arrivalLng],
        ],
      });
    }
  }, [airports, filteredFlights]);

  const handleDestinationClick = useCallback((code: string) => {
    const airport = airports.find((candidate) => candidate.code === code);
    if (airport) handleAirportClick(airport);
  }, [airports, handleAirportClick]);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
    setSelectedItem(null);
  }, []);

  const handleMapBackgroundClick = useCallback(() => {
    setSelectedItem(null);
    setIsSidebarOpen(false);
  }, []);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentFlightIndex(null);
    setSelectedItem(null);
    setIsSidebarOpen(false);
  }, [selectedYear, selectedAirline]);

  return (
    <div className="relative h-screen w-full overflow-hidden">
        <FloatingStatsPanel 
            flights={filteredFlights}
            airports={airports}
            years={years}
            airlines={airlines}
            selectedYear={selectedYear}
            selectedAirline={selectedAirline}
            onYearChange={setSelectedYear}
            onAirlineChange={setSelectedAirline}
            onDestinationClick={handleDestinationClick}
            onFlightClick={handleFlightClick}
            selectedFlightId={selectedFlightId}
        />

        {filteredFlights.length > 0 && (
            <TimelineController 
                flights={filteredFlights}
                currentIndex={currentFlightIndex}
                onIndexChange={handleTimelineIndexChange}
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
            />
        )}

        <Sidebar 
            isOpen={isSidebarOpen}
            onClose={closeSidebar}
            selectedItem={selectedItem}
            relatedFlights={relatedFlights}
            airports={airports}
            onFlightClick={handleFlightClick}
        />

        <FlightMap 
            flights={visibleFlights}
            airports={airports} 
            onAirportClick={handleAirportClick}
            onFlightClick={handleFlightClick}
            onMapBackgroundClick={handleMapBackgroundClick}
            mapCommand={mapCommand}
            selectedFlightId={selectedFlightId}
        />
    </div>
  );
}
