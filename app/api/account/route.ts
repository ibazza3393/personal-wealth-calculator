import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AkahuRevokedError, revokeToken } from '@/lib/akahu/api';
import { deleteToken, loadToken } from '@/lib/akahu/token';

export const dynamic = 'force-dynamic';

/**
 * Deletes the signed-in user's account.
 *
 * Akahu Tier 2 requires that deleting a Next Wealth account automatically
 * revokes all Akahu access. So the order here is: tell Akahu first, then drop
 * the token, then delete the user — whose cascade takes the bank data with it.
 *
 * Deleting the user last matters. If the delete ran first, a failure partway
 * through would leave a revoked grant with no row explaining why, and nobody
 * to show the message to.
 */
export async function DELETE() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
  }

  let confirmedByAkahu = true;
  try {
    const stored = await loadToken(user.id);
    if (stored) confirmedByAkahu = await revokeToken(stored.token);
  } catch (error) {
    // Already gone upstream is the desired end state.
    if (!(error instanceof AkahuRevokedError)) confirmedByAkahu = false;
  }

  try {
    await deleteToken(user.id);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not clear the Akahu token.' },
      { status: 500 },
    );
  }

  // auth.users cascades to every table in the schema, so this is the whole
  // deletion. It needs the secret key: a user cannot delete themselves with
  // the publishable key.
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return NextResponse.json(
      { error: `Akahu access was revoked, but the account could not be deleted: ${error.message}` },
      { status: 500 },
    );
  }

  await supabase.auth.signOut().catch(() => {
    /* The user is gone; the cookie is stale either way. */
  });

  return NextResponse.json({ deleted: true, confirmedByAkahu });
}
