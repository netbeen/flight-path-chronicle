"use client";

import dynamic from 'next/dynamic';
import React, { useMemo, useState } from 'react';
import { Flight } from '@/data/flight';
import { Airport } from '@/data/airport';
import Sidebar from '@/components/Sidebar';
import FloatingStatsPanel from '@/components/FloatingStatsPanel';
import { getAvailableYears, getAvailableAirlines, ProcessedFlight } from '@/data/flightProcessor';

// 使用 next/dynamic 动态导入 FlightMap 组件，并禁用 SSR
const FlightMap = dynamic(() => import('@/components/FlightMap'), { 
  ssr: false,
  // 添加一个加载状态，提升用户体验
  loading: () => <p style={{ textAlign: 'center', paddingTop: '20px' }}>Loading Map...</p>,
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
  const [selectedItem, setSelectedItem] = useState<Airport | Flight | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [focusedLocation, setFocusedLocation] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);

  // 获取所有可选年份和航司
  const years = useMemo(() => getAvailableYears(flights), [flights]);
  const airlines = useMemo(() => getAvailableAirlines(flights), [flights]);

  // 根据条件筛选航班
  const filteredFlights = useMemo(() => {
    return flights.filter(flight => {
      const year = new Date(flight.departureTime).getFullYear().toString();
      const airlineCode = flight.flightNumber.substring(0, 2);
      
      const yearMatch = selectedYear === 'all' || year === selectedYear;
      const airlineMatch = selectedAirline === 'all' || airlineCode === selectedAirline;
      
      return yearMatch && airlineMatch;
    });
  }, [flights, selectedYear, selectedAirline]);

  // 获取选中项目的相关航班（仅针对机场）
  const relatedFlights = useMemo(() => {
    if (!selectedItem || !('code' in selectedItem)) return []; // selectedItem is not Airport
    const code = (selectedItem as Airport).code;
    // 这里选择使用 filteredFlights，让用户看到在当前筛选条件下的相关航班
    return filteredFlights.filter(f => f.departureAirport === code || f.arrivalAirport === code)
      .sort((a, b) => new Date(b.departureTime).getTime() - new Date(a.departureTime).getTime());
  }, [selectedItem, filteredFlights]);

  const handleAirportClick = (airport: Airport) => {
    setSelectedItem(airport);
    setIsSidebarOpen(true);
    // 聚焦到该机场
    setFocusedLocation({ lat: airport.latitude, lng: airport.longitude, zoom: 6 });
  };

  const handleFlightClick = (flight: ProcessedFlight) => {
    setSelectedItem(flight);
    setIsSidebarOpen(true);
  };

  const handleDestinationHover = (code: string | null) => {
    if (code) {
      const airport = airports.find(a => a.code === code);
      if (airport) {
        setFocusedLocation({ lat: airport.latitude, lng: airport.longitude, zoom: 6 });
      }
    }
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
        {/* Floating Stats Panel */}
        <FloatingStatsPanel 
            flights={filteredFlights}
            airports={airports}
            years={years}
            airlines={airlines}
            selectedYear={selectedYear}
            selectedAirline={selectedAirline}
            onYearChange={setSelectedYear}
            onAirlineChange={setSelectedAirline}
            onDestinationHover={handleDestinationHover}
        />

        {/* Sidebar */}
        <Sidebar 
            isOpen={isSidebarOpen}
            onClose={closeSidebar}
            selectedItem={selectedItem}
            relatedFlights={relatedFlights}
        />

        {/* Map */}
        <FlightMap 
            flights={filteredFlights} 
            airports={airports} 
            onAirportClick={handleAirportClick}
            onFlightClick={handleFlightClick}
            focusedLocation={focusedLocation}
        />
    </div>
  );
}
