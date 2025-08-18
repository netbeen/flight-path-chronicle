export interface Flight {
  /** 航班号 */
  flightNumber: string;
  /** 起飞时间 */
  departureTime: string;
  /** 起飞机场（用三位英文缩写描述） */
  departureAirport: string;
  /** 降落机场（用三位英文缩写描述） */
  arrivalAirport: string;
}

/** 预定义的航班数据 */
export const FLIGHTS: Flight[] = [
  {
    flightNumber: 'CA1831',
    departureTime: '2023-05-01T08:00:00',
    departureAirport: 'PEK',
    arrivalAirport: 'PVG',
  },
  {
    flightNumber: 'MU5101',
    departureTime: '2023-05-03T14:30:00',
    departureAirport: 'SHA',
    arrivalAirport: 'CAN',
  },
  {
    flightNumber: 'CZ3907',
    departureTime: '2023-05-05T09:45:00',
    departureAirport: 'CAN',
    arrivalAirport: 'CTU',
  },
  {
    flightNumber: 'HU7606',
    departureTime: '2023-05-07T16:20:00',
    departureAirport: 'CTU',
    arrivalAirport: 'XIY',
  },
  {
    flightNumber: 'FM9101',
    departureTime: '2023-05-10T11:10:00',
    departureAirport: 'XIY',
    arrivalAirport: 'PEK',
  },
];