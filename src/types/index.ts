export interface FlightData {
  id: string;
  flightNumber: string;
  departure: {
    airport: string;
    latitude: number;
    longitude: number;
    time: string;
  };
  arrival: {
    airport: string;
    latitude: number;
    longitude: number;
    time: string;
  };
}