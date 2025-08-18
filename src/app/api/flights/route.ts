import { NextResponse } from 'next/server';
import { FLIGHTS } from '@/data/flight';
import { AIRPORTS } from '@/data/airport';

export async function GET() {
  // 1. 创建一个机场代码的 Set，用于快速查找
  const airportCodes = new Set(AIRPORTS.map(airport => airport.code));

  // 2. 过滤航班数据
  const validFlights = FLIGHTS.filter(flight => {
    const departureAirportExists = airportCodes.has(flight.departureAirport);
    const arrivalAirportExists = airportCodes.has(flight.arrivalAirport);

    // 3. 如果机场不存在，则在服务器控制台打印警告
    if (!departureAirportExists) {
      console.warn(`[Data Validation Warning] Flight ${flight.flightNumber}: Departure airport code '${flight.departureAirport}' not found in airports data. This flight will be excluded.`);
    }
    if (!arrivalAirportExists) {
      console.warn(`[Data Validation Warning] Flight ${flight.flightNumber}: Arrival airport code '${flight.arrivalAirport}' not found in airports data. This flight will be excluded.`);
    }

    // 只有当出发和到达机场都存在时，才返回该航班数据
    return departureAirportExists && arrivalAirportExists;
  });

  // 4. 返回过滤后的、干净的航班数据
  return NextResponse.json(validFlights);
}