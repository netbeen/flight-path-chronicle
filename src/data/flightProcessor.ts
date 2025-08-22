import { Flight } from './flight';
import { Airport, getAirportByCode } from './airport';

// 定义处理后航班的数据结构，增加了方向、颜色和曲率属性
export interface ProcessedFlight extends Flight {
  direction: 'outgoing' | 'returning';
  color: string;
  curvature: number;
}

// 定义一个函数，根据出发和到达机场的纬度和经度来判断航线方向
const getDirection = (departureAirport: Airport, arrivalAirport: Airport): 'outgoing' | 'returning' => {
  // 规则：纬度上升为去程，纬度下降为返程
  if (arrivalAirport.latitude > departureAirport.latitude) {
    return 'outgoing';
  }
  if (arrivalAirport.latitude < departureAirport.latitude) {
    return 'returning';
  }
  // 如果纬度相同，则比较经度：经度上升为去程
  if (arrivalAirport.longitude > departureAirport.longitude) {
    return 'outgoing';
  }
  return 'returning';
};

/**
 * 处理原始航班数据，为其增加方向、颜色和曲率等可视化属性
 * @param flights 原始航班数据列表
 * @param airports 机场数据列表
 * @returns 返回处理后的航班数据列表
 */
export const processFlights = (flights: Flight[], airports: Airport[]): ProcessedFlight[] => {
  const flightGroups = new Map<string, Flight[]>();

  // 1. 将航班按航线（例如 "PEK-PVG"）进行分组
  flights.forEach(flight => {
    const key = `${flight.departureAirport}-${flight.arrivalAirport}`;
    if (!flightGroups.has(key)) {
      flightGroups.set(key, []);
    }
    flightGroups.get(key)!.push(flight);
  });

  const processedFlights: ProcessedFlight[] = [];
  const baseCurvature = 0.15; // 基础曲率

  // 2. 遍历每个航线组，计算其属性
  flightGroups.forEach((group, key) => {
    const departureAirport = getAirportByCode(group[0].departureAirport);
    const arrivalAirport = getAirportByCode(group[0].arrivalAirport);

    if (departureAirport && arrivalAirport) {
      const direction = getDirection(departureAirport, arrivalAirport);
      const color = direction === 'outgoing' ? '#f87171' : '#60a5fa'; // 去程红色，返程蓝色

      // 3. 为组内的每个航班分配递增的曲率
      group.forEach((flight, index) => {
        // 旧逻辑：返程使用负曲率，导致了线路重叠
        // const curvatureSign = direction === 'outgoing' ? 1 : -1;
        // const curvature = curvatureSign * (index + 1) * baseCurvature;

        // 新逻辑：始终使用正曲率。
        // getControlPoint 函数在计算返程航线时，由于起点和终点互换，
        // 其计算出的垂直向量方向会自然反转，这使得正曲率能将返程航线绘制在去程航线的另一侧，
        // 从而形成视觉上分离的、对称的弧线效果。
        const curvature = (index + 1) * baseCurvature;

        processedFlights.push({
          ...flight,
          direction,
          color,
          curvature,
        });
      });
    }
  });

  return processedFlights;
};