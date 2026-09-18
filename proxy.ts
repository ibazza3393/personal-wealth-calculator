import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { supabasePublishableKey, supabaseUrl } from '@/lib/supabase/env';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = supabaseUrl();
  const key = supabasePublishableKey();
  if (!url || !key) {
    // Local development without Supabase runs open, which is convenient. In
    // production it would mean a missing env var silently publishes every
    // page — so there, no auth config means no access.
    const open = ['/', '/signin', '/signup'];
    if (process.env.NODE_ENV === 'production' && !open.includes(request.nextUrl.pathname)) {
      return NextResponse.json({ error: 'Auth is not configured on this host.' }, { status: 503 });
    }
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Everything except the landing page and the auth callback is private. The
  // app previously relied on Vercel's SSO to hide it, which does not apply to
  // custom domains — so attaching one would have published every page and API
  // route, including the Akahu sync. The session is the gate now.
  const path = request.nextUrl.pathname;
  const isPublic =
    path === '/' || path === '/signin' || path === '/signup' || path.startsWith('/auth/');

  if (!user && !isPublic) {
    if (path.startsWith('/api/')) {
      return NextResponse.json({ error: 'Sign in to use this endpoint.' }, { status: 401 });
    }
    const to = request.nextUrl.clone();
    to.pathname = '/signin';
    to.search = '';
    return NextResponse.redirect(to);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
