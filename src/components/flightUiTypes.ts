import { LatLngBoundsExpression } from 'leaflet';

export type MapCommand =
  | {
      id: number;
      type: 'airport';
      lat: number;
      lng: number;
      zoom: number;
    }
  | {
      id: number;
      type: 'flight';
      bounds: LatLngBoundsExpression;
    }
  | {
      id: number;
      type: 'career';
      bounds: LatLngBoundsExpression;
    }
  | {
      id: number;
      type: 'reset';
    };

export const getFlightId = (flight: {
  flightNumber: string;
  departureTime: string;
}): string => `${flight.flightNumber}-${flight.departureTime}`;
