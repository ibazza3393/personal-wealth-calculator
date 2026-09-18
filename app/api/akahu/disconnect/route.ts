import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { decryptToken } from '@/lib/crypto';
import { appCredentials, revokeToken } from '@/lib/providers/akahu-oauth';

export const dynamic = 'force-dynamic';

/**
 * Ends the connection: revokes the token at Akahu, then deletes everything it
 * produced.
 *
 * Revoking first matters. Deleting our row while Akahu still holds a live
 * consent would leave the bank feeding an app that no longer knows it exists,
 * and the user believing they had disconnected. If the revoke call fails we
 * still delete, because keeping a token we have told someone is gone is worse.
 */
export async function POST() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ error: 'Sign in to manage connections.' }, { status: 401 });
  }

  const admin = createAdminClient();
  const creds = appCredentials();
  if (!admin) {
    return NextResponse.json({ error: 'Server is not configured for Akahu.' }, { status: 501 });
  }

  const { data: row } = await admin
    .from('akahu_tokens')
    .select('access_token')
    .eq('user_id', auth.user.id)
    .maybeSingle();

  if (row?.access_token && creds) {
    try {
      await revokeToken(creds.appToken, decryptToken(row.access_token));
    } catch {
      /* Fall through to deletion: see the note above. */
    }
  }

  await admin.from('akahu_tokens').delete().eq('user_id', auth.user.id);

  // The synced data goes too. Keeping someone's transactions after they have
  // disconnected is not something a privacy-first app gets to do, and the NZ
  // Privacy Act expects data to go once its purpose has ended.
  await supabase.from('transactions').delete().eq('user_id', auth.user.id);
  await supabase.from('bank_accounts').delete().eq('user_id', auth.user.id);
  await supabase.from('bank_connections').delete().eq('user_id', auth.user.id);

  return NextResponse.json({ disconnected: true });
}
