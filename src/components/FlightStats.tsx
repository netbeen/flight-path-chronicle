'use client';

import React from 'react';
import { Flight, Airport } from '@/data';
import { calculateFlightStatistics, FlightStatistics } from '@/data/flightProcessor';

interface FlightStatsProps {
  flights: Flight[];
  airports: Airport[];
}

const FlightStats: React.FC<FlightStatsProps> = ({ flights, airports }) => {
  const stats: FlightStatistics = calculateFlightStatistics(flights, airports);

  return (
    <div className="flight-stats-panel">
      <h3>飞行统计</h3>
      <div className="stats-item">
        <span>总飞行次数:</span>
        <span>{stats.totalFlights} 次</span>
      </div>
      <div className="stats-item">
        <span>总飞行里程:</span>
        <span>{stats.totalDistance.toLocaleString()} km</span>
      </div>
      <div className="stats-destinations">
        <h4>热门目的地 (Top 5)</h4>
        <ul>
          {stats.topDestinations.map(dest => (
            <li key={dest.code}>
              <span>{dest.name}</span>
              <span>{dest.count} 次</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FlightStats;