import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import { KEY_VERSION, open, seal } from '@/lib/akahu/crypto';

/**
 * The only module that reads or writes `akahu_tokens`.
 *
 * Everything here takes a `userId` that the caller got from
 * `supabase.auth.getUser()`. Because the table has no RLS policy, that
 * argument is the access control — there is no second check behind it.
 */

export type StoredToken = {
  token: string;
  akahuUserId: string | null;
  connectedAt: string;
  revokedAt: string | null;
};

type TokenRow = {
  ciphertext: string;
  iv: string;
  auth_tag: string;
  key_version: number;
  akahu_user_id: string | null;
  connected_at: string;
  revoked_at: string | null;
};

export async function saveToken(
  userId: string,
  token: string,
  akahuUserId: string | null,
): Promise<void> {
  const sealed = seal(token);
  const admin = createAdminClient();
  const { error } = await admin.from('akahu_tokens').upsert(
    {
      user_id: userId,
      ciphertext: sealed.ciphertext,
      iv: sealed.iv,
      auth_tag: sealed.authTag,
      key_version: sealed.keyVersion,
      akahu_user_id: akahuUserId,
      connected_at: new Date().toISOString(),
      revoked_at: null,
    },
    { onConflict: 'user_id' },
  );
  if (error) throw new Error(`Could not store the Akahu token: ${error.message}`);
}

/** Returns null when the user has never connected, or has revoked access. */
export async function loadToken(userId: string): Promise<StoredToken | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('akahu_tokens')
    .select('ciphertext, iv, auth_tag, key_version, akahu_user_id, connected_at, revoked_at')
    .eq('user_id', userId)
    .maybeSingle<TokenRow>();

  if (error) throw new Error(`Could not read the Akahu token: ${error.message}`);
  if (!data || data.revoked_at) return null;

  if (data.key_version !== KEY_VERSION) {
    // A row sealed with a key this build does not hold. Better to report a
    // dead connection and send the user back through the flow than to hand
    // Akahu a bearer token that decrypted to noise.
    throw new Error(
      `The stored Akahu token was sealed with key version ${data.key_version}, but this server holds version ${KEY_VERSION}.`,
    );
  }

  return {
    token: open({
      ciphertext: data.ciphertext,
      iv: data.iv,
      authTag: data.auth_tag,
      keyVersion: data.key_version,
    }),
    akahuUserId: data.akahu_user_id,
    connectedAt: data.connected_at,
    revokedAt: data.revoked_at,
  };
}

/**
 * Marks the grant dead without dropping the row, so `/connections` can say
 * "your bank feed stopped" rather than silently showing nothing. Called when
 * the user revokes, when the TOKEN DELETE webhook arrives, and when Akahu
 * answers 401.
 */
export async function markRevoked(userId: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from('akahu_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('user_id', userId);
  if (error) throw new Error(`Could not mark the Akahu token revoked: ${error.message}`);
}

/** Used on account deletion, where nothing about the user should survive. */
export async function deleteToken(userId: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from('akahu_tokens').delete().eq('user_id', userId);
  if (error) throw new Error(`Could not delete the Akahu token: ${error.message}`);
}

export async function touchLastUsed(userId: string): Promise<void> {
  const admin = createAdminClient();
  await admin
    .from('akahu_tokens')
    .update({ last_used_at: new Date().toISOString() })
    .eq('user_id', userId);
}

// --- OAuth state ----------------------------------------------------------

/**
 * Issues a single-use `state` value bound to the signed-in user.
 *
 * Akahu Tier 2 asks for `state` to be used correctly against CSRF. Holding it
 * server-side, rather than only in a cookie, means the callback can prove the
 * value was issued by this server to this user — an attacker who can set a
 * cookie in the victim's browser still cannot mint a row here.
 */
export async function issueState(userId: string, state: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from('akahu_oauth_state').insert({ state, user_id: userId });
  if (error) throw new Error(`Could not start the Akahu connect flow: ${error.message}`);
}

/** How long an unfinished connect flow stays valid. */
const STATE_TTL_MS = 10 * 60 * 1000;

/**
 * Consumes a `state`. Returns true only if it was issued to this user, has not
 * been used, and has not expired. The update is conditional on `used_at` being
 * null so two concurrent callbacks cannot both win.
 */
export async function consumeState(userId: string, state: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('akahu_oauth_state')
    .update({ used_at: new Date().toISOString() })
    .eq('state', state)
    .eq('user_id', userId)
    .is('used_at', null)
    .select('created_at')
    .maybeSingle<{ created_at: string }>();

  if (error || !data) return false;
  return Date.now() - new Date(data.created_at).getTime() < STATE_TTL_MS;
}
