import { FLIGHTS, AIRPORTS } from '@/data';
import FlightStats from '@/components/FlightStats';
import FlightMapClient from '@/components/FlightMapClient';

export default function Home() {
  return (
    <main>
      <FlightMapClient flights={FLIGHTS} airports={AIRPORTS} />
      <FlightStats flights={FLIGHTS} airports={AIRPORTS} />
    </main>
  );
}