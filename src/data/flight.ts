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
    flightNumber: 'CA1510',
    departureTime: '2021-10-11T11:00:00',
    departureAirport: 'HGH',
    arrivalAirport: 'PEK',
  },
  {
    flightNumber: 'MU5458',
    departureTime: '2021-10-15T18:30:00',
    departureAirport: 'PKX',
    arrivalAirport: 'HGH',
  },
  {
    flightNumber: 'MF9051',
    departureTime: '2023-05-04T18:50:00',
    departureAirport: 'HGH',
    arrivalAirport: 'SIN',
  },
  {
    flightNumber: 'CZ352',
    departureTime: '2023-05-16T08:00:00',
    departureAirport: 'SIN',
    arrivalAirport: 'CAN',
  },
  {
    flightNumber: 'CZ3501',
    departureTime: '2023-05-16T15:10:00',
    departureAirport: 'CAN',
    arrivalAirport: 'HGH',
  },
  {
    flightNumber: 'MF873',
    departureTime: '2023-07-28T08:45:00',
    departureAirport: 'HGH',
    arrivalAirport: 'SIN',
  },
  {
    flightNumber: 'MF874',
    departureTime: '2023-08-14T15:10:00',
    departureAirport: 'SIN',
    arrivalAirport: 'HGH',
  },
  {
    flightNumber: 'MF863',
    departureTime: '2024-03-24T09:15:00',
    departureAirport: 'HGH',
    arrivalAirport: 'SIN',
  },
  {
    flightNumber: 'SQ874',
    departureTime: '2024-04-03T07:25:00',
    departureAirport: 'SIN',
    arrivalAirport: 'HKG',
  },
  {
    flightNumber: 'HX128',
    departureTime: '2024-04-03T21:10:00',
    departureAirport: 'HKG',
    arrivalAirport: 'HGH',
  },
  {
    flightNumber: 'MF8703',
    departureTime: '2024-07-10T08:15:00',
    departureAirport: 'HGH',
    arrivalAirport: 'SIN',
  },
  {
    flightNumber: 'MF8704',
    departureTime: '2024-07-24T14:50:00',
    departureAirport: 'SIN',
    arrivalAirport: 'HGH',
  },
  {
    flightNumber: 'MF8703',
    departureTime: '2024-09-01T08:15:00',
    departureAirport: 'HGH',
    arrivalAirport: 'SIN',
  },
  {
    flightNumber: 'MF8704',
    departureTime: '2024-09-14T14:50:00',
    departureAirport: 'SIN',
    arrivalAirport: 'HGH',
  },
  {
    flightNumber: 'HU7278',
    departureTime: '2024-10-20T11:30:00',
    departureAirport: 'HGH',
    arrivalAirport: 'PEK',
  },
  {
    flightNumber: 'CA1732',
    departureTime: '2024-10-25T21:30:00',
    departureAirport: 'PEK',
    arrivalAirport: 'HGH',
  },
  {
    flightNumber: 'MF8703',
    departureTime: '2024-11-17T08:10:00',
    departureAirport: 'HGH',
    arrivalAirport: 'SIN',
  },
  {
    flightNumber: 'MF8704',
    departureTime: '2024-11-30T14:50:00',
    departureAirport: 'SIN',
    arrivalAirport: 'HGH',
  },
  {
    flightNumber: 'DL280',
    departureTime: '2025-02-05T19:05:00',
    departureAirport: 'PVG',
    arrivalAirport: 'SEA',
  },
  {
    flightNumber: 'DL281',
    departureTime: '2025-02-21T11:30:00',
    departureAirport: 'SEA',
    arrivalAirport: 'PVG',
  },
  {
    flightNumber: 'CX959',
    departureTime: '2025-03-02T11:25:00',
    departureAirport: 'HGH',
    arrivalAirport: 'HKG',
  },
  {
    flightNumber: 'CX635',
    departureTime: '2025-03-02T15:05:00',
    departureAirport: 'HKG',
    arrivalAirport: 'SIN',
  },
  {
    flightNumber: 'MF8704',
    departureTime: '2025-03-15T14:50:00',
    departureAirport: 'SIN',
    arrivalAirport: 'HGH',
  },
  {
    flightNumber: 'MF8594',
    departureTime: '2025-05-18T13:40:00',
    departureAirport: 'HGH',
    arrivalAirport: 'XMN',
  },
  {
    flightNumber: 'MF885',
    departureTime: '2025-05-18T18:00:00',
    departureAirport: 'XMN',
    arrivalAirport: 'SIN',
  },
  {
    flightNumber: 'MF8704',
    departureTime: '2025-05-31T14:50:00',
    departureAirport: 'SIN',
    arrivalAirport: 'HGH',
  },
  {
    flightNumber: 'CA8367',
    departureTime: '2025-07-01T17:05:00',
    departureAirport: 'HGH',
    arrivalAirport: 'PKX',
  },
  {
    flightNumber: 'CA1708',
    departureTime: '2025-07-05T09:30:00',
    departureAirport: 'PEK',
    arrivalAirport: 'HGH',
  },
  {
    flightNumber: 'CA1723',
    departureTime: '2025-07-20T18:00:00',
    departureAirport: 'HGH',
    arrivalAirport: 'PEK',
  },
  {
    flightNumber: 'CA1714',
    departureTime: '2025-07-26T12:30:00',
    departureAirport: 'PEK',
    arrivalAirport: 'HGH',
  },
  {
    flightNumber: 'MF8703',
    departureTime: '2025-07-27T08:15:00',
    departureAirport: 'HGH',
    arrivalAirport: 'SIN',
  },
  {
    flightNumber: 'TR652',
    departureTime: '2025-08-01T18:35:00',
    departureAirport: 'SIN',
    arrivalAirport: 'HKT',
  },
  {
    flightNumber: 'TR653',
    departureTime: '2025-08-03T20:35:00',
    departureAirport: 'HKT',
    arrivalAirport: 'SIN',
  },
  {
    flightNumber: 'MF8704',
    departureTime: '2025-08-09T14:50:00',
    departureAirport: 'SIN',
    arrivalAirport: 'HGH',
  },
  {
    flightNumber: 'CA1719',
    departureTime: '2025-08-24T16:00:00',
    departureAirport: 'HGH',
    arrivalAirport: 'PEK',
  },
  {
    flightNumber: 'CA1706',
    departureTime: '2025-08-30T08:30:00',
    departureAirport: 'PEK',
    arrivalAirport: 'HGH',
  },
  {
    flightNumber: 'CX959',
    departureTime: '2025-10-08T11:25:00',
    departureAirport: 'HGH',
    arrivalAirport: 'HKG',
  },
  {
    flightNumber: 'CX635',
    departureTime: '2025-10-08T15:15:00',
    departureAirport: 'HKG',
    arrivalAirport: 'SIN',
  },
  {
    flightNumber: 'CA1725',
    departureTime: '2025-12-01T19:00:00',
    departureAirport: 'HGH',
    arrivalAirport: 'PEK',
  },
  {
    flightNumber: 'HU7577',
    departureTime: '2025-12-05T11:10:00',
    departureAirport: 'PEK',
    arrivalAirport: 'HGH',
  },
  {
    flightNumber: 'CX959',
    departureTime: '2025-12-07T11:25:00',
    departureAirport: 'HGH',
    arrivalAirport: 'HKG',
  },
  {
    flightNumber: 'CX635',
    departureTime: '2025-12-07T15:10:00',
    departureAirport: 'HKG',
    arrivalAirport: 'SIN',
  },
  {
    flightNumber: 'MF8704',
    departureTime: '2025-12-20T15:00:00',
    departureAirport: 'SIN',
    arrivalAirport: 'HGH',
  },
  {
    flightNumber: 'CA1723',
    departureTime: '2026-02-08T18:30:00',
    departureAirport: 'HGH',
    arrivalAirport: 'PEK',
  },
];