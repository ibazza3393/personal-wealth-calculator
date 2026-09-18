import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { appCredentials } from '@/lib/akahu/api';
import { isTokenKeyConfigured } from '@/lib/akahu/crypto';
import { isAdminConfigured } from '@/lib/supabase/admin';
import { loadToken } from '@/lib/akahu/token';

export const dynamic = 'force-dynamic';

/**
 * Connection status for the UI.
 *
 * Booleans only. The App Token, the App Secret and the user's access token are
 * all readable from this process, and none of them has any reason to be in
 * this response — the browser needs to know whether a bank is connected, not
 * what proves it.
 */
export async function GET() {
  const configured = appCredentials().configured && isTokenKeyConfigured() && isAdminConfigured();

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    return NextResponse.json({ configured, connected: false });
  }

  let connected = false;
  let error: string | null = null;
  if (configured) {
    try {
      connected = Boolean(await loadToken(user.id));
    } catch {
      error = 'The stored connection could not be read. Reconnect your bank.';
    }
  }

  return NextResponse.json({ configured, connected, error });
}
