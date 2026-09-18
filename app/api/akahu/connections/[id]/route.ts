import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AkahuRevokedError, revokeAuthorisation } from '@/lib/akahu/api';
import { loadToken, markRevoked } from '@/lib/akahu/token';

export const dynamic = 'force-dynamic';

/**
 * Revokes one Akahu connection — one bank, rather than the whole grant.
 *
 * The `id` comes from the URL, so it is attacker-controlled. It is never
 * passed to Akahu before the database confirms the connection belongs to the
 * caller: the select below runs under the user's own session, so RLS answers
 * "no rows" for somebody else's connection and this returns 404 rather than
 * revoking a stranger's bank feed.
 */
export async function DELETE(request: NextRequest, ctx: RouteContext<'/api/akahu/connections/[id]'>) {
  const { id } = await ctx.params;

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    return NextResponse.json({ error: 'Sign in to manage your connections.' }, { status: 401 });
  }

  const { data: owned } = await supabase
    .from('bank_connections')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle<{ id: string }>();

  if (!owned) {
    return NextResponse.json({ error: 'No such connection.' }, { status: 404 });
  }

  let confirmedByAkahu = false;
  try {
    const stored = await loadToken(user.id);
    if (!stored) {
      return NextResponse.json({ error: 'This account is not connected to Akahu.' }, { status: 409 });
    }
    confirmedByAkahu = await revokeAuthorisation(stored.token, id);
  } catch (error) {
    if (error instanceof AkahuRevokedError) {
      // The whole grant is gone, not just this connection.
      await markRevoked(user.id).catch(() => {});
      confirmedByAkahu = true;
    } else {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Could not reach Akahu.' },
        { status: 502 },
      );
    }
  }

  // The accounts and transactions under this connection go with it: cascade
  // from bank_connections handles both.
  const { error: delErr } = await supabase
    .from('bank_connections')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (delErr) {
    return NextResponse.json(
      { error: `Access was revoked, but the stored data could not be deleted: ${delErr.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ revoked: true, confirmedByAkahu });
}
