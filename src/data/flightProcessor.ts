import { Flight } from './flight';
import { Airport } from './airport';

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

/**
 * 计算机场的起降次数
 * @param flights 原始航班数据列表
 * @returns 返回一个Map，key为机场代码，value为总起降次数
 */
export const calculateAirportActivity = (flights: Flight[]): Map<string, number> => {
  const activityMap = new Map<string, number>();
  flights.forEach(flight => {
    activityMap.set(flight.departureAirport, (activityMap.get(flight.departureAirport) || 0) + 1);
    activityMap.set(flight.arrivalAirport, (activityMap.get(flight.arrivalAirport) || 0) + 1);
  });
  return activityMap;
};

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
 * 构建机场索引表
 * @param airports 机场数据列表
 * @returns 以三字码为键的机场索引，便于 O(1) 查找
 */
const buildAirportIndex = (airports: Airport[]): Map<string, Airport> => {
  const index = new Map<string, Airport>();
  for (const airport of airports) {
    index.set(airport.code, airport);
  }
  return index;
};

/**
 * 处理原始航班数据，为其增加方向、颜色和曲率等可视化属性
 * @param flights 原始航班数据列表
 * @param airports 机场数据列表
 * @returns 返回处理后的航班数据列表
 */
export const processFlights = (flights: Flight[], airports: Airport[]): ProcessedFlight[] => {
  const flightGroups = new Map<string, Flight[]>();
  const airportIndex = buildAirportIndex(airports);

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
    const departureAirportRaw = airportIndex.get(group[0].departureAirport);
    const arrivalAirportRaw = airportIndex.get(group[0].arrivalAirport);

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


/**
 * 使用 Haversine 公式计算两个经纬度坐标点之间的距离（单位：公里）
 * @param lat1 第一个点的纬度
 * @param lon1 第一个点的经度
 * @param lat2 第二个点的纬度
 * @param lon2 第二个点的经度
 * @returns 返回两点间的距离（公里）
 */
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // 地球平均半径（公里）
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export interface FlightStatistics {
  totalFlights: number;
  totalDistance: number;
  topDestinations: {
    code: string;
    name: string;
    count: number;
  }[];
}

/**
 * 计算航班的各项统计数据
 * @param flights 原始航班数据列表
 * @param airports 机场数据列表
 * @returns 返回一个包含统计数据的对象
 */
export const calculateFlightStatistics = (flights: Flight[], airports: Airport[]): FlightStatistics => {
  const totalFlights = flights.length;
  let totalDistance = 0;
  const destinationCounts = new Map<string, number>();
  const airportIndex = buildAirportIndex(airports);

  flights.forEach(flight => {
    const departureAirport = airportIndex.get(flight.departureAirport);
    const arrivalAirport = airportIndex.get(flight.arrivalAirport);

    if (departureAirport && arrivalAirport) {
      totalDistance += getDistance(
        departureAirport.latitude,
        departureAirport.longitude,
        arrivalAirport.latitude,
        arrivalAirport.longitude
      );
    }

    destinationCounts.set(flight.arrivalAirport, (destinationCounts.get(flight.arrivalAirport) || 0) + 1);
  });

  const topDestinations = Array.from(destinationCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5) // 只显示排名前5的目的地
    .map(([code, count]) => {
      const airport = airportIndex.get(code);
      return {
        code,
        name: airport?.name || code,
        count,
      };
    });

  return {
    totalFlights,
    totalDistance: Math.round(totalDistance), // 四舍五入到整数
    topDestinations,
  };
};
