import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { exchangeCode } from '@/lib/akahu/api';
import { consumeState, saveToken } from '@/lib/akahu/token';

export const dynamic = 'force-dynamic';

/**
 * Where Akahu returns the user after they grant consent.
 *
 * This lives under /api/akahu/ rather than /auth/ on purpose: proxy.ts treats
 * /auth/* as public for the Supabase callback, and this route must not be.
 * The user is already signed in when they come back, and the token that
 * arrives here belongs to whoever that session says they are.
 */
function back(request: NextRequest, params: Record<string, string>) {
  const to = request.nextUrl.clone();
  to.pathname = '/connections';
  to.search = '';
  for (const [k, v] of Object.entries(params)) to.searchParams.set(k, v);
  return NextResponse.redirect(to);
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    return NextResponse.json({ error: 'Sign in to finish connecting.' }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;

  // The user pressed cancel in Akahu's flow, or Akahu refused. Not an error
  // to shout about — say so and leave them where they started.
  const denied = params.get('error');
  if (denied) return back(request, { akahu: 'cancelled' });

  const code = params.get('code');
  const state = params.get('state');
  if (!code || !state) return back(request, { akahu: 'invalid' });

  // CSRF gate. A state this server did not issue to this user — or issued
  // more than ten minutes ago, or already spent — never reaches the exchange.
  const ok = await consumeState(user.id, state).catch(() => false);
  if (!ok) return back(request, { akahu: 'state' });

  try {
    const { token, akahuUserId } = await exchangeCode(code);
    await saveToken(user.id, token, akahuUserId);
  } catch {
    // Deliberately vague to the browser: the failure could name the App
    // Secret's state or Akahu's response body, and neither belongs in a URL
    // the user can screenshot. The detail is in the server log.
    return back(request, { akahu: 'failed' });
  }

  return back(request, { akahu: 'connected' });
}
