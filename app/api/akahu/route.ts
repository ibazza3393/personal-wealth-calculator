import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

function tokens() {
  const appToken = process.env.AKAHU_APP_TOKEN?.trim() ?? '';
  const userToken = process.env.AKAHU_USER_TOKEN?.trim() ?? '';
  return { appToken, userToken, configured: Boolean(appToken && userToken) };
}

export async function GET() {
  const { configured } = tokens();
  // Status only. The sync itself lives at /api/akahu/sync, gated by the
  // Supabase session rather than by a secret the browser cannot send.
  return NextResponse.json({ configured, ready: configured });
}
