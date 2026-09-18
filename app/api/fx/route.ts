import { NextResponse } from 'next/server';
import { fetchRates } from '@/lib/fx';

export const revalidate = 3600;

/** Live FX table, NZD base. Falls back to a dated table, flagged via `live`. */
export async function GET() {
  const fx = await fetchRates();
  return NextResponse.json(fx);
}
