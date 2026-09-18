import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { encryptToken } from '@/lib/crypto';
import { appCredentials, exchangeCode, userHeaders, AKAHU_API } from '@/lib/providers/akahu-oauth';
import { STATE_COOKIE, callbackUrl } from '../connect/route';

export const dynamic = 'force-dynamic';

function back(origin: string, params: Record<string, string>) {
  const url = new URL('/connections', origin);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = NextResponse.redirect(url);
  res.cookies.delete(STATE_COOKIE);
  return res;
}

/**
 * Completes the bank connection.
 *
 * The token that comes back reads someone's bank accounts, so it is encrypted
 * and written through the service-role client into a table the browser cannot
 * read. It is never returned in a response.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return back(origin, { akahu: 'signin' });

  // Akahu reports a refusal by sending the user back with an error rather than
  // a code; saying "you declined" beats a blank screen.
  const denied = url.searchParams.get('error');
  if (denied) return back(origin, { akahu: 'denied' });

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const expected = request.headers
    .get('cookie')
    ?.split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${STATE_COOKIE}=`))
    ?.slice(STATE_COOKIE.length + 1);

  if (!code || !state || !expected || state !== expected) {
    return back(origin, { akahu: 'state' });
  }

  const creds = appCredentials();
  const admin = createAdminClient();
  if (!creds || !admin) return back(origin, { akahu: 'unconfigured' });

  try {
    const token = await exchangeCode({
      code,
      redirectUri: callbackUrl(origin),
      appToken: creds.appToken,
      appSecret: creds.appSecret,
    });

    // Who Akahu thinks this is, kept for support and for spotting a token that
    // has been reconnected to a different Akahu identity.
    let akahuUserId: string | null = null;
    try {
      const me = await fetch(`${AKAHU_API}/me`, {
        cache: 'no-store',
        headers: userHeaders(creds.appToken, token.access_token),
      });
      if (me.ok) {
        const body = (await me.json()) as { item?: { _id?: string } };
        akahuUserId = body.item?._id ?? null;
      }
    } catch {
      /* Identity is a nicety; a failure here must not lose the connection. */
    }

    const { error } = await admin.from('akahu_tokens').upsert({
      user_id: auth.user.id,
      access_token: encryptToken(token.access_token),
      scope: token.scope,
      akahu_user_id: akahuUserId,
      updated_at: new Date().toISOString(),
    });
    if (error) return back(origin, { akahu: 'store' });

    return back(origin, { akahu: 'connected' });
  } catch {
    return back(origin, { akahu: 'exchange' });
  }
}
