import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { appCredentials, buildAuthorizationUrl } from '@/lib/providers/akahu-oauth';

export const dynamic = 'force-dynamic';

export const STATE_COOKIE = 'akahu_oauth_state';

/** Where Akahu returns the user. Must match a Redirect URI on the Akahu app. */
export function callbackUrl(origin: string) {
  return `${origin}/api/akahu/callback`;
}

/**
 * Starts the bank connection. Sends the signed-in user to Akahu to choose a
 * bank and consent; nothing is stored until they come back.
 *
 * The random `state` is held in an httpOnly cookie and compared on return, so
 * a code someone else obtained cannot be redeemed against this session.
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ error: 'Sign in to connect a bank.' }, { status: 401 });
  }

  const creds = appCredentials();
  if (!creds) {
    return NextResponse.json(
      { error: 'Akahu is not configured on this host. Set AKAHU_APP_TOKEN and AKAHU_APP_SECRET.' },
      { status: 501 },
    );
  }

  const origin = new URL(request.url).origin;
  const state = randomBytes(32).toString('base64url');

  const response = NextResponse.redirect(
    buildAuthorizationUrl({
      appToken: creds.appToken,
      redirectUri: callbackUrl(origin),
      state,
    }),
  );
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 600,
  });
  return response;
}
