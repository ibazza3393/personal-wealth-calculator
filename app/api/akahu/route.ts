import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { appCredentials } from '@/lib/providers/akahu-oauth';

export const dynamic = 'force-dynamic';

/**
 * Whether this user has a bank connected, and whether the host can offer one
 * at all. Reports a boolean only — the token itself never leaves the server.
 */
export async function GET() {
  const configured = Boolean(appCredentials());

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ configured, connected: false });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ configured: false, connected: false });

  const { data } = await admin
    .from('akahu_tokens')
    .select('user_id')
    .eq('user_id', auth.user.id)
    .maybeSingle();

  return NextResponse.json({ configured, connected: Boolean(data) });
}
