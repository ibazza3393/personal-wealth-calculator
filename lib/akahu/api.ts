import 'server-only';

export const AKAHU_BASE = 'https://api.akahu.io/v1';
export const AKAHU_AUTHORIZE = 'https://oauth.akahu.io';

/**
 * Akahu credentials that belong to the app rather than to a user.
 *
 * The App Token identifies Next Wealth; the App Secret authenticates it during
 * the OAuth token exchange. Neither has any business reaching a browser, so
 * neither is read anywhere but here, and nothing in this file is importable
 * from a client component — `server-only` makes that a build error rather than
 * a code review note.
 */
export function appCredentials() {
  const appToken = process.env.AKAHU_APP_TOKEN?.trim() ?? '';
  const appSecret = process.env.AKAHU_APP_SECRET?.trim() ?? '';
  return { appToken, appSecret, configured: Boolean(appToken && appSecret) };
}

/** Where Akahu sends the user back. Must match the app's registered redirect. */
export function redirectUri(): string {
  const base =
    process.env.AKAHU_REDIRECT_ORIGIN?.trim() ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3000');
  return `${base.replace(/\/$/, '')}/api/akahu/callback`;
}

/** Thrown when Akahu says the user's token is no longer good. */
export class AkahuRevokedError extends Error {
  constructor() {
    super('Akahu rejected the stored token. The user has revoked access.');
    this.name = 'AkahuRevokedError';
  }
}

/**
 * A call to Akahu on behalf of one user.
 *
 * A 401 here is not a transient failure — Akahu returns it when the grant is
 * gone, which is the documented way to notice a revocation that happened at
 * my.akahu.nz rather than in this app. Turning it into a typed error means
 * every caller has to decide what to do about it.
 */
export async function akahuFetch(
  path: string,
  userToken: string,
  init?: RequestInit,
): Promise<Response> {
  const { appToken } = appCredentials();
  const res = await fetch(`${AKAHU_BASE}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${userToken}`,
      'X-Akahu-Id': appToken,
      Accept: 'application/json',
    },
  });
  if (res.status === 401) throw new AkahuRevokedError();
  return res;
}

/** Exchanges the OAuth code for a user access token. Uses the App Secret. */
export async function exchangeCode(code: string): Promise<{ token: string; akahuUserId: string | null }> {
  const { appToken, appSecret } = appCredentials();
  const res = await fetch(`${AKAHU_BASE}/token`, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri(),
      client_id: appToken,
      client_secret: appSecret,
    }),
  });

  if (!res.ok) {
    throw new Error(`Akahu refused the authorisation code (${res.status}).`);
  }

  const json = (await res.json()) as {
    access_token?: string;
    item_id?: string;
    user?: { _id?: string };
  };
  if (!json.access_token) throw new Error('Akahu returned no access token.');
  return { token: json.access_token, akahuUserId: json.user?._id ?? json.item_id ?? null };
}

/** Revokes one connection. Akahu: DELETE /authorisations/{id}. */
export async function revokeAuthorisation(userToken: string, id: string): Promise<boolean> {
  const res = await akahuFetch(`/authorisations/${encodeURIComponent(id)}`, userToken, {
    method: 'DELETE',
  });
  return res.ok;
}

/** Revokes everything this app holds for the user. Akahu: DELETE /token. */
export async function revokeToken(userToken: string): Promise<boolean> {
  const res = await akahuFetch('/token', userToken, { method: 'DELETE' });
  return res.ok;
}
