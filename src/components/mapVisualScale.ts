export interface RouteVisualMetrics {
  weight: number;
  hoverWeight: number;
  selectedWeight: number;
  arrowSize: number;
  dashSize: number;
}

const clamp = (value: number, min: number, max: number): number => (
  Math.min(max, Math.max(min, value))
);

/**
 * Leaflet strokes use screen pixels. Scale them gently with the map zoom so
 * routes do not look disproportionately heavy when the geography is compressed.
 */
export const getRouteVisualMetrics = (zoom: number): RouteVisualMetrics => {
  const scale = clamp(2 ** ((zoom - 4) * 0.28), 0.62, 1.48);

  return {
    weight: 2 * scale,
    hoverWeight: 3.5 * scale,
    selectedWeight: 4.5 * scale,
    arrowSize: clamp(10 * scale, 6, 13),
    dashSize: clamp(10 * scale, 6, 15),
  };
};
