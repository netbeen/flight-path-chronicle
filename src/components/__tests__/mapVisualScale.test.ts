import { getRouteVisualMetrics } from '../mapVisualScale';

describe('getRouteVisualMetrics', () => {
  it('uses zoom 4 as the visual baseline', () => {
    expect(getRouteVisualMetrics(4)).toEqual({
      weight: 2,
      hoverWeight: 3.5,
      selectedWeight: 4.5,
      arrowSize: 10,
      dashSize: 10,
    });
  });

  it('makes routes lighter when zooming out and stronger when zooming in', () => {
    const zoomedOut = getRouteVisualMetrics(2);
    const baseline = getRouteVisualMetrics(4);
    const zoomedIn = getRouteVisualMetrics(6);

    expect(zoomedOut.weight).toBeLessThan(baseline.weight);
    expect(zoomedOut.arrowSize).toBeLessThan(baseline.arrowSize);
    expect(zoomedIn.weight).toBeGreaterThan(baseline.weight);
    expect(zoomedIn.arrowSize).toBeGreaterThan(baseline.arrowSize);
  });

  it('keeps route visuals within legible limits', () => {
    expect(getRouteVisualMetrics(-10).weight).toBeCloseTo(1.24);
    expect(getRouteVisualMetrics(-10).arrowSize).toBe(6.2);
    expect(getRouteVisualMetrics(20).weight).toBeCloseTo(2.96);
    expect(getRouteVisualMetrics(20).arrowSize).toBe(13);
  });
});
