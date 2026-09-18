/**
 * Akahu OAuth2, for connecting each user's own banks.
 *
 * Shapes here follow the official `akahu` SDK (v2.5.1), read from its
 * published source rather than from memory: the authorize host is
 * `oauth.akahu.nz`, the API is `api.akahu.io/v1`, the code exchange POSTs to
 * `/token` with the app credentials in the body, and `ENDURING_CONSENT` is the
 * scope for ongoing access rather than a one-off read.
 *
 * Nothing in this file may run in the browser: the app secret and the user's
 * access token both stay on the server.
 */
export const AKAHU_OAUTH_HOST = 'https://oauth.akahu.nz';
export const AKAHU_API = 'https://api.akahu.io/v1';
export const ENDURING_CONSENT = 'ENDURING_CONSENT';

export type AkahuTokenResponse = {
  access_token: string;
  token_type: 'bearer';
  scope: string;
};

export function appCredentials(): { appToken: string; appSecret: string } | null {
  const appToken = process.env.AKAHU_APP_TOKEN?.trim();
  const appSecret = process.env.AKAHU_APP_SECRET?.trim();
  if (!appToken || !appSecret) return null;
  return { appToken, appSecret };
}

/**
 * Where to send someone to choose a bank and consent.
 *
 * `state` is carried through by Akahu and compared on return, which is what
 * stops a third party from feeding us an authorization code of their own.
 */
export function buildAuthorizationUrl({
  appToken,
  redirectUri,
  state,
  scope = ENDURING_CONSENT,
}: {
  appToken: string;
  redirectUri: string;
  state: string;
  scope?: string;
}): string {
  const url = new URL(AKAHU_OAUTH_HOST);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', appToken);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('scope', scope);
  url.searchParams.set('state', state);
  return url.toString();
}

/** Exchanges the one-time code for the enduring user access token. */
export async function exchangeCode({
  code,
  redirectUri,
  appToken,
  appSecret,
}: {
  code: string;
  redirectUri: string;
  appToken: string;
  appSecret: string;
}): Promise<AkahuTokenResponse> {
  const res = await fetch(`${AKAHU_API}/token`, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: appToken,
      client_secret: appSecret,
    }),
  });

  if (!res.ok) {
    // The body often names the cause (bad redirect_uri, expired code). Pass it
    // on rather than flattening every failure into one unhelpful sentence.
    const detail = await res.text().catch(() => '');
    throw new Error(`Akahu token exchange failed (${res.status}). ${detail.slice(0, 300)}`);
  }

  const json = (await res.json()) as Partial<AkahuTokenResponse>;
  if (!json.access_token) throw new Error('Akahu returned no access token.');
  return {
    access_token: json.access_token,
    token_type: 'bearer',
    scope: json.scope ?? ENDURING_CONSENT,
  };
}

/** Headers for any call made on behalf of a connected user. */
export function userHeaders(appToken: string, accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    'X-Akahu-Id': appToken,
    Accept: 'application/json',
  };
}

/** Hands the token back to Akahu so the consent genuinely ends. */
export async function revokeToken(appToken: string, accessToken: string): Promise<void> {
  await fetch(`${AKAHU_API}/token`, {
    method: 'DELETE',
    cache: 'no-store',
    headers: userHeaders(appToken, accessToken),
  }).catch(() => {
    /* Best effort: the row is deleted regardless, so we never keep a token we
       have told the user is gone. */
  });
}
