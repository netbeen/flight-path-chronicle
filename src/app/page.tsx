import dynamic from 'next/dynamic';
import { FLIGHTS, AIRPORTS } from '@/data';

// 使用 next/dynamic 动态导入 FlightMap 组件，并禁用 SSR
const FlightMap = dynamic(() => import('@/components/FlightMap'), { 
  ssr: false,
  // 添加一个加载状态，提升用户体验
  loading: () => <p style={{ textAlign: 'center', paddingTop: '20px' }}>Loading Map...</p>,
});

export default function Home() {
  return (
    <main>
      <FlightMap flights={FLIGHTS} airports={AIRPORTS} />
    </main>
  );
}