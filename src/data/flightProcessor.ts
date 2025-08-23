import { Flight } from './flight';
import { Airport, getAirportByCode } from './airport';

// 定义处理后航班的数据结构，增加了方向、颜色和曲率属性
export interface ProcessedFlight extends Flight {
  direction: 'outgoing' | 'returning';
  color: string;
  curvature: number;
  // 为跨日界线航线增加一个可选的、经度调整后的目标机场坐标
  arrivalAirportModified?: {
    latitude: number;
    longitude: number;
  };
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
    const departureAirportRaw = getAirportByCode(group[0].departureAirport);
    const arrivalAirportRaw = getAirportByCode(group[0].arrivalAirport);

    if (departureAirportRaw && arrivalAirportRaw) {
      // 将所有经度转换到 [0, 360] 的范围
      const departureAirport = { ...departureAirportRaw, longitude: departureAirportRaw.longitude < 0 ? departureAirportRaw.longitude + 360 : departureAirportRaw.longitude };
      const arrivalAirport = { ...arrivalAirportRaw, longitude: arrivalAirportRaw.longitude < 0 ? arrivalAirportRaw.longitude + 360 : arrivalAirportRaw.longitude };

      const direction = getDirection(departureAirport, arrivalAirport);
      const color = direction === 'outgoing' ? '#f87171' : '#60a5fa'; // 去程红色，返程蓝色

      // 为组内的每个航班分配递增的曲率，并处理跨日界线的情况
      group.forEach((flight, index) => {
        const curvature = (index + 1) * baseCurvature;

        let arrivalAirportModified;
        // 在新的 [0, 360] 坐标系下，日界线变成了 180 度经线
        const deltaLongitude = arrivalAirport.longitude - departureAirport.longitude;

        // 如果经度差大于180度，说明航线“绕了远路”，需要修正
        if (Math.abs(deltaLongitude) > 180) {
          const adjustedLongitude =
            deltaLongitude > 0
              ? arrivalAirport.longitude - 360
              : arrivalAirport.longitude + 360;
          arrivalAirportModified = {
            latitude: arrivalAirport.latitude,
            longitude: adjustedLongitude,
          };
        }

        processedFlights.push({
          ...flight,
          direction,
          color,
          curvature,
          arrivalAirportModified,
        });
      });
    }
  });

  return processedFlights;
};