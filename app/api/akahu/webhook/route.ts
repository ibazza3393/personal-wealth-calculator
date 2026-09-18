import { createVerify } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * Akahu webhooks, of which the one that matters is TOKEN DELETE.
 *
 * A user can revoke Next Wealth's access at my.akahu.nz without ever opening
 * this app. Akahu Tier 2 requires that to be handled gracefully — either by
 * this webhook or by treating a 401 as a dead token. Both are implemented:
 * this is the fast path, and lib/akahu/api.ts throws AkahuRevokedError on 401
 * as the backstop for a webhook that never arrives.
 *
 * This route is public — Akahu has no Supabase session — so the signature IS
 * the authentication. An unsigned or badly signed request is rejected before
 * anything is read out of the body.
 */

/** Akahu signs with RSA-SHA256 over the raw body; the public key is published. */
const AKAHU_KEY_URL = 'https://api.akahu.io/v1/keys';

type AkahuKey = { id: string; key: string };

async function publicKeys(): Promise<AkahuKey[]> {
  const res = await fetch(AKAHU_KEY_URL, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Could not fetch Akahu signing keys (${res.status}).`);
  const json = (await res.json()) as { items?: AkahuKey[] };
  return json.items ?? [];
}

async function verify(rawBody: string, signature: string, keyId: string | null): Promise<boolean> {
  let keys: AkahuKey[];
  try {
    keys = await publicKeys();
  } catch {
    return false;
  }
  const candidates = keyId ? keys.filter((k) => k.id === keyId) : keys;
  return candidates.some((k) => {
    try {
      return createVerify('RSA-SHA256').update(rawBody).end().verify(k.key, signature, 'base64');
    } catch {
      return false;
    }
  });
}

/**
 * The webhook names the Akahu user, not our user, so the row is found by the
 * akahu_user_id recorded at connect time. That lookup is only safe because the
 * signature has already been verified: the id is attacker-chosen otherwise.
 */
type WebhookBody = {
  webhook_type?: string;
  webhook_code?: string;
  item?: { _id?: string };
  user?: { _id?: string };
};

export async function POST(request: NextRequest) {
  const raw = await request.text();
  const signature = request.headers.get('x-akahu-signature');
  const keyId = request.headers.get('x-akahu-signature-key-id');

  if (!signature || !(await verify(raw, signature, keyId))) {
    return NextResponse.json({ error: 'Bad signature.' }, { status: 401 });
  }

  let body: WebhookBody;
  try {
    body = JSON.parse(raw) as WebhookBody;
  } catch {
    return NextResponse.json({ error: 'Bad body.' }, { status: 400 });
  }

  const type = `${body.webhook_type ?? ''} ${body.webhook_code ?? ''}`.trim().toUpperCase();
  const isTokenDelete = type.includes('TOKEN') && type.includes('DELETE');
  if (!isTokenDelete) {
    // Acknowledge anything else so Akahu does not retry it forever.
    return NextResponse.json({ received: true });
  }

  const akahuUserId = body.user?._id ?? body.item?._id;
  if (!akahuUserId) return NextResponse.json({ received: true });

  const admin = createAdminClient();
  const { data: row } = await admin
    .from('akahu_tokens')
    .select('user_id')
    .eq('akahu_user_id', akahuUserId)
    .maybeSingle<{ user_id: string }>();

  if (!row) return NextResponse.json({ received: true });

  // The grant is gone upstream. Mark it dead so /connections tells the user
  // their feed stopped, and drop the bank data the grant produced — the
  // Privacy Act basis for holding it went away with the consent.
  await admin
    .from('akahu_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('user_id', row.user_id);

  await admin.rpc('purge_user_bank_data', { target: row.user_id });

  return NextResponse.json({ received: true, revoked: true });
}

/**
 * Akahu pings the endpoint when it is registered. Kept separate from POST so a
 * GET can never trigger a state change, and answering it proves only that the
 * URL is live — nothing here is trusted or stored.
 */
export async function GET() {
  return NextResponse.json({ ok: true });
}
