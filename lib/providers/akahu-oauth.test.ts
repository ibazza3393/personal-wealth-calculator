import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { buildAuthorizationUrl, ENDURING_CONSENT, userHeaders } from './akahu-oauth';

test('the authorize URL carries what Akahu requires', () => {
  const url = new URL(
    buildAuthorizationUrl({
      appToken: 'app_token_abc',
      redirectUri: 'https://nextwealth.app/api/akahu/callback',
      state: 'nonce123',
    }),
  );
  assert.equal(url.origin, 'https://oauth.akahu.nz');
  assert.equal(url.searchParams.get('response_type'), 'code');
  assert.equal(url.searchParams.get('client_id'), 'app_token_abc');
  assert.equal(url.searchParams.get('redirect_uri'), 'https://nextwealth.app/api/akahu/callback');
  assert.equal(url.searchParams.get('state'), 'nonce123');
  // Ongoing access, not a one-off read: the whole point is a ledger that stays
  // current without asking the user to reconnect every time.
  assert.equal(url.searchParams.get('scope'), ENDURING_CONSENT);
});

test('the redirect URI is encoded rather than breaking the query', () => {
  const url = buildAuthorizationUrl({
    appToken: 'a',
    redirectUri: 'https://example.com/cb?x=1&y=2',
    state: 's',
  });
  assert.ok(url.includes('redirect_uri=https%3A%2F%2Fexample.com%2Fcb%3Fx%3D1%26y%3D2'));
  assert.equal(new URL(url).searchParams.get('redirect_uri'), 'https://example.com/cb?x=1&y=2');
});

test('user calls send the access token as bearer and the app token as the id', () => {
  const h = userHeaders('app_token_abc', 'user_token_xyz');
  assert.equal(h.Authorization, 'Bearer user_token_xyz');
  assert.equal(h['X-Akahu-Id'], 'app_token_abc');
});
