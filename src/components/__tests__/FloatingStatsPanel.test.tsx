import { fireEvent, render, screen } from '@testing-library/react';
import FloatingStatsPanel from '../FloatingStatsPanel';
import { Airport } from '@/data';
import { processFlights } from '@/data/flightProcessor';
import { Flight } from '@/data/flight';

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
    departureTime: '2025-03-15T14:50:00',
    arrivalTime: '2025-03-15T19:50:00',
    departureAirport: 'SIN',
    arrivalAirport: 'HGH',
  },
];

const processedFlights = processFlights(flights, airports);

const renderPanel = (
  onDestinationClick = jest.fn(),
  onFlightClick = jest.fn(),
) => render(
  <FloatingStatsPanel
    flights={processedFlights}
    airports={airports}
    years={['2025', '2024']}
    airlines={['MF']}
    selectedYear="all"
    selectedAirline="all"
    onYearChange={jest.fn()}
    onAirlineChange={jest.fn()}
    onDestinationClick={onDestinationClick}
    onFlightClick={onFlightClick}
    selectedFlightId={null}
  />,
);

describe('FloatingStatsPanel', () => {
  it('only selects a popular destination when it is clicked', () => {
    const onDestinationClick = jest.fn();
    renderPanel(onDestinationClick);

    const destination = screen.getByRole('button', { name: /新加坡樟宜/ });
    fireEvent.mouseEnter(destination);
    expect(onDestinationClick).not.toHaveBeenCalled();

    fireEvent.click(destination);
    expect(onDestinationClick).toHaveBeenCalledWith('SIN');
  });

  it('shows trips grouped by descending year and selects a trip', () => {
    const onFlightClick = jest.fn();
    renderPanel(jest.fn(), onFlightClick);

    fireEvent.click(screen.getByRole('tab', { name: /行程/ }));

    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings.map((heading) => heading.textContent)).toEqual(['2025', '2024']);

    fireEvent.click(screen.getByRole('button', { name: /MF8704/ }));
    expect(onFlightClick).toHaveBeenCalledWith(
      expect.objectContaining({ flightNumber: 'MF8704' }),
    );
  });
});
