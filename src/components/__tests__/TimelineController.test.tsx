import { fireEvent, render, screen } from '@testing-library/react';
import TimelineController from '../TimelineController';
import { Airport } from '@/data';
import { Flight } from '@/data/flight';
import { processFlights } from '@/data/flightProcessor';

const airports: Airport[] = [
  { code: 'HGH', name: '杭州萧山', latitude: 30.23, longitude: 120.43 },
  { code: 'SIN', name: '新加坡樟宜', latitude: 1.36, longitude: 103.99 },
];

const flights: Flight[] = [
  {
    flightNumber: 'MF8703',
    departureTime: '2024-03-24T09:15:00',
    arrivalTime: '2024-03-24T14:15:00',
    departureAirport: 'HGH',
    arrivalAirport: 'SIN',
  },
  {
    flightNumber: 'MF8704',
    departureTime: '2024-03-30T14:50:00',
    arrivalTime: '2024-03-30T19:50:00',
    departureAirport: 'SIN',
    arrivalAirport: 'HGH',
  },
];

const processedFlights = processFlights(flights, airports);

describe('TimelineController', () => {
  it('navigates by real flight indexes', () => {
    const onIndexChange = jest.fn();
    render(
      <TimelineController
        flights={processedFlights}
        currentIndex={0}
        onIndexChange={onIndexChange}
        isPlaying={false}
        onPlayPause={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '下一段行程' }));
    expect(onIndexChange).toHaveBeenCalledWith(1);

    fireEvent.change(screen.getByRole('slider', { name: '行程进度' }), {
      target: { value: '1' },
    });
    expect(onIndexChange).toHaveBeenCalledWith(1);
  });

  it('returns to the complete route view', () => {
    const onIndexChange = jest.fn();
    render(
      <TimelineController
        flights={processedFlights}
        currentIndex={1}
        onIndexChange={onIndexChange}
        isPlaying={false}
        onPlayPause={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '查看全部' }));
    expect(onIndexChange).toHaveBeenCalledWith(null);
  });
});
