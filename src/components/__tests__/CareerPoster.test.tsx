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
        longestFlight={{
          from: 'PVG',
          to: 'SEA',
          fromName: '上海浦东',
          toName: '西雅图塔科马',
          distance: 9_187,
        }}
        mostFrequentRoute={{
          from: 'SIN',
          to: 'HGH',
          fromName: '新加坡樟宜',
          toName: '杭州萧山',
          count: 8,
        }}
        isExporting={false}
        onDownload={jest.fn()}
        onClose={jest.fn()}
      />,
    );

    expect(screen.getByText('飞行轨迹总览')).toBeTruthy();
    expect(screen.getByText('累计飞行次数')).toBeTruthy();
    expect(screen.getByText('记录区间')).toBeTruthy();
    expect(screen.getByText(/沿地球赤道飞行/).textContent).toContain('沿地球赤道飞行 2.8 圈');
    expect(screen.getByText('最长距离航线')).toBeTruthy();
    expect(screen.getByText(/上海浦东 → 西雅图塔科马/).textContent).toContain('9,187 km');
    expect(screen.getByText('最高频率航线')).toBeTruthy();
    expect(screen.getByText(/新加坡樟宜 → 杭州萧山/).textContent).toContain('8 段');
  });
});
