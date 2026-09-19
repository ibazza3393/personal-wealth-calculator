import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AKAHU_AUTHORIZE, appCredentials, redirectUri } from '@/lib/akahu/api';
import { issueState } from '@/lib/akahu/token';

export const dynamic = 'force-dynamic';

/**
 * Starts the Akahu hosted connect flow.
 *
 * The user reaches this from /connect, the consumer information page, having
 * been told what is being asked for and for how long. This route only mints
 * the `state` and redirects; it never sees a bank credential.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    return NextResponse.json({ error: 'Sign in to connect a bank account.' }, { status: 401 });
  }

  const { appToken, configured } = appCredentials();
  if (!configured) {
    return NextResponse.json(
      { error: 'Akahu is not configured on this host. Set AKAHU_APP_TOKEN and AKAHU_APP_SECRET.' },
      { status: 501 },
    );
  }

  // 256 bits of CSPRNG. The value is meaningless on its own — its weight comes
  // from the row issueState writes, which binds it to this user for ten
  // minutes and one use.
  const state = randomBytes(32).toString('base64url');
  try {
    await issueState(user.id, state);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not start the connect flow.' },
      { status: 500 },
    );
  }

  const url = new URL(AKAHU_AUTHORIZE);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', appToken);
  url.searchParams.set('redirect_uri', redirectUri());
  url.searchParams.set('scope', 'ENDURING_CONSENT');
  url.searchParams.set('state', state);

  return NextResponse.redirect(url);
}
