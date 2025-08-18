import { Airport } from "@/data/airport";
import { Flight } from "@/data/flight";
import dynamic from 'next/dynamic';

const FlightMap = dynamic(() => import('@/components/FlightMap'), {
  ssr: false,
  loading: () => <p>Loading map...</p>
});

async function getFlights(): Promise<Flight[]> {
  const res = await fetch('http://localhost:3080/api/flights', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch flights');
  }
  return res.json();
}

async function getAirports(): Promise<Airport[]> {
  const res = await fetch('http://localhost:3080/api/airports', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch airports');
  }
  return res.json();
}

export default async function Home() {
  const flights = await getFlights();
  const airports = await getAirports();

  return (
    <main>
      <FlightMap flights={flights} airports={airports} />
    </main>
  );
}