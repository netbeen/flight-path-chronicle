import { NextResponse } from 'next/server';
import { AIRPORTS } from '@/data/airport';

export async function GET() {
  return NextResponse.json(AIRPORTS);
}