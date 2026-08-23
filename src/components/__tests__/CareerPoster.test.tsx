import { render, screen } from '@testing-library/react';
import CareerPoster, { getEarthLaps } from '../CareerPoster';

describe('CareerPoster', () => {
  it('converts distance to earth-equator laps', () => {
    expect(getEarthLaps(111_874)).toBe('2.8');
    expect(getEarthLaps(40_075)).toBe('1.0');
  });

  it('renders the distance comparison in the poster content', () => {
    render(
      <CareerPoster
        totalFlights={44}
        totalDistance={111_874}
        cityCount={9}
        startYear={2021}
        endYear={2026}
        isExporting={false}
        onDownload={jest.fn()}
        onClose={jest.fn()}
      />,
    );

    expect(screen.getByText(/沿地球赤道飞行/).textContent).toContain('沿地球赤道飞行 2.8 圈');
  });
});
