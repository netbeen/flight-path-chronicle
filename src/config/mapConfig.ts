import { LatLngExpression, LatLngBoundsExpression } from 'leaflet';

export interface MapConfig {
  defaultCenter: LatLngExpression;
  defaultZoom: number;
  minZoom: number;
  maxBounds: LatLngBoundsExpression;
  maxBoundsViscosity: number;
  tileProviders: {
    dark: string;
    light: string;
  };
  attribution: string;
}

export const MAP_CONFIG: MapConfig = {
  // Center map on China as requested
  defaultCenter: [35, 105],
  defaultZoom: 4,
  minZoom: 2,
  // Pacific centered view bounds
  maxBounds: [[-90, -20], [90, 380]],
  maxBoundsViscosity: 1.0,
  tileProviders: {
    dark: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    light: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  },
  attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
};
