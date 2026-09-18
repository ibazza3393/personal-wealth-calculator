import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AkahuRevokedError, revokeToken } from '@/lib/akahu/api';
import { loadToken, markRevoked } from '@/lib/akahu/token';

export const dynamic = 'force-dynamic';

/**
 * Revokes every Akahu authorisation this app holds for the signed-in user,
 * and removes the data that access produced.
 *
 * Akahu Tier 2 requires a way for the consumer to withdraw access from inside
 * the product. This is the "all of it" lever; /api/akahu/connections/[id] is
 * the per-connection one.
 *
 * Order matters. Akahu is told first, because that is the part that stops new
 * data arriving and is the part we cannot retry from a deleted row. The local
 * data goes second. If Akahu is unreachable the row is still marked revoked
 * and the data still deleted — the user asked to be disconnected, and leaving
 * their transactions sitting here because a third party timed out is the wrong
 * failure. The response says plainly whether Akahu confirmed.
 */
export async function DELETE() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    return NextResponse.json({ error: 'Sign in to manage your connections.' }, { status: 401 });
  }

  let confirmedByAkahu = false;
  try {
    const stored = await loadToken(user.id);
    if (stored) {
      confirmedByAkahu = await revokeToken(stored.token);
    } else {
      // Nothing to revoke upstream; the grant is already gone.
      confirmedByAkahu = true;
    }
  } catch (error) {
    // A 401 means Akahu had already dropped the grant, which is the outcome
    // being asked for.
    if (error instanceof AkahuRevokedError) confirmedByAkahu = true;
  }

  await markRevoked(user.id).catch(() => {
    /* The purge below is the part that matters; report it via the flag. */
  });

  const { error: purgeErr } = await supabase.rpc('purge_user_bank_data', { target: user.id });
  if (purgeErr) {
    return NextResponse.json(
      { error: `Access was revoked, but the stored data could not be deleted: ${purgeErr.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ revoked: true, confirmedByAkahu });
}
