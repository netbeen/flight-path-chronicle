import { NextResponse } from 'next/server';
import { FLIGHTS } from '@/data/flight';

export async function GET() {
  return NextResponse.json(FLIGHTS);
}