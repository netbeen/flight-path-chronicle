import {
  processFlights,
  calculateAirportActivity,
  calculateFlightStatistics,
  getAvailableYears
} from '../flightProcessor';
import { Flight } from '../flight';
import { Airport } from '../airport';

// Mock Data
const mockAirports: Airport[] = [
  { code: 'PEK', name: 'Beijing Capital', latitude: 40.0799, longitude: 116.6031, city: 'Beijing', country: 'China' },
  { code: 'PVG', name: 'Shanghai Pudong', latitude: 31.1443, longitude: 121.8083, city: 'Shanghai', country: 'China' },
  { code: 'LAX', name: 'Los Angeles', latitude: 33.9416, longitude: -118.4085, city: 'Los Angeles', country: 'USA' }, 
  { code: 'NRT', name: 'Narita', latitude: 35.7720, longitude: 140.3929, city: 'Tokyo', country: 'Japan' },
  // Fake airports for date line test
  { code: 'EAST', name: 'East', latitude: 0, longitude: 170, city: 'East', country: 'E' },
  { code: 'WEST', name: 'West', latitude: 0, longitude: -170, city: 'West', country: 'W' },
];

const mockFlights: Flight[] = [
  { departureAirport: 'PEK', arrivalAirport: 'PVG', flightNumber: 'CA1234', departureTime: '2023-01-01T10:00:00Z', arrivalTime: '2023-01-01T12:00:00Z' },
  { departureAirport: 'PVG', arrivalAirport: 'PEK', flightNumber: 'CA1235', departureTime: '2023-01-02T10:00:00Z', arrivalTime: '2023-01-02T12:00:00Z' },
  { departureAirport: 'NRT', arrivalAirport: 'LAX', flightNumber: 'JL0062', departureTime: '2023-01-03T17:00:00Z', arrivalTime: '2023-01-03T11:00:00Z' },
];

describe('flightProcessor', () => {
  describe('calculateAirportActivity', () => {
    it('should calculate airport activity correctly', () => {
      const activity = calculateAirportActivity(mockFlights);
      expect(activity.get('PEK')).toBe(2);
      expect(activity.get('PVG')).toBe(2);
      expect(activity.get('NRT')).toBe(1);
      expect(activity.get('LAX')).toBe(1);
    });
  });

  describe('processFlights', () => {
    it('should process flights and assign direction and color', () => {
      const processed = processFlights(mockFlights, mockAirports);
      expect(processed).toHaveLength(3);

      const pekToPvg = processed.find(f => f.departureAirport === 'PEK' && f.arrivalAirport === 'PVG');
      expect(pekToPvg).toBeDefined();
      
      // PEK (40N) -> PVG (31N): Latitude decreases => Returning
      expect(pekToPvg?.direction).toBe('returning'); 
      expect(pekToPvg?.color).toBe('#60a5fa'); 
      
      const pvgToPek = processed.find(f => f.departureAirport === 'PVG' && f.arrivalAirport === 'PEK');
      expect(pvgToPek?.direction).toBe('outgoing');
      expect(pvgToPek?.color).toBe('#f87171');
    });

    it('should calculate distance', () => {
        const processed = processFlights(mockFlights, mockAirports);
        const flight = processed[0];
        expect(flight.distance).toBeGreaterThan(0);
        // Approx distance PEK to PVG is ~1000km
        expect(flight.distance).toBeGreaterThan(1000); 
        expect(flight.distance).toBeLessThan(1300);
    });

    it('should handle date line crossing correctly', () => {
        // EAST (170) -> WEST (-170 -> 190). Diff = 20. No crossing logic triggered in current implementation unless diff > 180.
        // Wait, current logic:
        // depLon = 170. arrLon = -170 + 360 = 190.
        // delta = 190 - 170 = 20. 
        // Abs(delta) < 180. So no modification. This is correct for short path across Pacific.
        
        // Let's try crossing the OTHER way (Atlantic/Europe) which this map treats as wrapping?
        // Current logic shifts everything to 0-360.
        // If we go from -10 (350) to 10.
        // dep = 350. arr = 10.
        // delta = 10 - 350 = -340.
        // Abs(-340) > 180.
        // adjusted: delta < 0 => arr + 360 = 370.
        // So line draws from 350 to 370. Correct.
        
        // Wait, West (-170/190) to East (170). Delta = 170 - 190 = -20. No wrap.
        
        // Use coordinates that wrap around 0/360 boundary in the new system.
        // The new system is 0-360.
        // A flight from London (0) to NYC (-74 -> 286).
        // 0 -> 286. Delta = 286. > 180.
        // Adjusted: 286 - 360 = -74.
        // So line draws from 0 to -74.
        
        const london: Airport = { code: 'LHR', name: 'London', latitude: 51, longitude: 0, city: 'London', country: 'UK' };
        const nyc: Airport = { code: 'JFK', name: 'NYC', latitude: 40, longitude: -74, city: 'NYC', country: 'USA' };
        
        const flights: Flight[] = [{ departureAirport: 'LHR', arrivalAirport: 'JFK', flightNumber: 'BA111', departureTime: '', arrivalTime: '' }];
        const airports = [london, nyc];
        
        const processed = processFlights(flights, airports);
        expect(processed[0].arrivalAirportModified).toBeDefined();
        expect(processed[0].arrivalAirportModified?.longitude).toBeCloseTo(-74);
    });
  });

  describe('calculateFlightStatistics', () => {
      it('should calculate stats correctly', () => {
          const stats = calculateFlightStatistics(mockFlights, mockAirports);
          expect(stats.totalFlights).toBe(3);
          expect(stats.totalDistance).toBeGreaterThan(0);
          expect(stats.topDestinations).toHaveLength(3); // PEK, PVG, LAX
          
          // Verify longest flight (NRT-LAX is definitely longer than PEK-PVG)
          expect(stats.longestFlight?.from).toBe('NRT');
          expect(['PEK', 'PVG']).toContain(stats.shortestFlight?.from);
      });
  });
  
  describe('getAvailableYears', () => {
      it('should return unique years', () => {
          const years = getAvailableYears(mockFlights);
          expect(years).toContain('2023');
          expect(years).toHaveLength(1);
      });
  });
});
