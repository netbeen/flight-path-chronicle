"use client";

import dynamic from 'next/dynamic';
import { Flight } from '@/data/flight';
import { Airport } from '@/data/airport';

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
  return <FlightMap flights={flights} airports={airports} />;
}