import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AkahuRevokedError, akahuFetch, appCredentials } from '@/lib/akahu/api';
import { loadToken, markRevoked, touchLastUsed } from '@/lib/akahu/token';
import { mapAkahuAccounts, type AkahuAccountsResponse } from '@/lib/providers/akahu-map';
import { mapAkahuTransactions, type AkahuTransactionsResponse } from '@/lib/providers/akahu-tx';

export const dynamic = 'force-dynamic';

/** One year is enough to fill a budget view without pulling a whole history. */
const LOOKBACK_DAYS = 365;
/** Akahu pages transactions; cap the walk so one sync cannot run unbounded. */
const MAX_PAGES = 20;

/**
 * Pulls accounts and transactions from Akahu for the signed-in user.
 *
 * The token is now the user's own, granted through the hosted OAuth flow and
 * held encrypted in `akahu_tokens`. It used to be a single AKAHU_USER_TOKEN
 * read from the server environment — which worked for one person and quietly
 * stamped that person's bank data onto whoever happened to be signed in.
 *
 * A 401 from Akahu means the grant is gone, usually because the user revoked
 * it at my.akahu.nz. That is recorded rather than retried: the token is marked
 * revoked and /connections tells them the feed stopped and offers to
 * reconnect.
 */
export async function POST() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    return NextResponse.json({ error: 'Sign in to sync your bank accounts.' }, { status: 401 });
  }

  if (!appCredentials().configured) {
    return NextResponse.json(
      {
        error:
          'Akahu is not configured on this host. Set AKAHU_APP_TOKEN and AKAHU_APP_SECRET in the server environment.',
      },
      { status: 501 },
    );
  }

  let token: string;
  try {
    const stored = await loadToken(user.id);
    if (!stored) {
      return NextResponse.json(
        { error: 'No bank connected. Connect one from /connect.', needsConnect: true },
        { status: 409 },
      );
    }
    token = stored.token;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not read the stored connection.' },
      { status: 500 },
    );
  }

  try {
    return await sync(supabase, user.id, token);
  } catch (error) {
    if (error instanceof AkahuRevokedError) {
      await markRevoked(user.id).catch(() => {});
      return NextResponse.json(
        {
          error: 'Your bank connection was revoked. Reconnect to keep syncing.',
          revoked: true,
          needsConnect: true,
        },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed.' },
      { status: 500 },
    );
  }
}

type ServerClient = Awaited<ReturnType<typeof createClient>>;

async function sync(supabase: ServerClient, userId: string, token: string) {
  // --- Accounts -----------------------------------------------------------
  const accountsRes = await akahuFetch('/accounts', token);
  if (!accountsRes.ok) {
    return NextResponse.json(
      { error: `Akahu returned ${accountsRes.status} for accounts.` },
      { status: 502 },
    );
  }
  const mapped = mapAkahuAccounts((await accountsRes.json()) as AkahuAccountsResponse);

  const now = new Date().toISOString();
  const { error: connErr } = await supabase.from('bank_connections').upsert(
    mapped.connections.map((c) => ({
      id: c.id,
      user_id: userId,
      provider: c.provider,
      country: c.country,
      institution_name: c.institution_name,
      status: c.status,
      last_synced_at: now,
      consent_expires_at: c.consent_expires_at,
    })),
  );
  if (connErr) return NextResponse.json({ error: connErr.message }, { status: 500 });

  const { error: accErr } = await supabase.from('bank_accounts').upsert(
    mapped.accounts.map((a) => ({
      id: a.id,
      user_id: userId,
      connection_id: a.connection_id,
      country: a.country,
      type: a.type,
      name: a.name,
      institution: a.institution,
      currency: a.currency,
      current_cents: Math.round(a.current_balance * 100),
      available_cents: a.available_balance === null ? null : Math.round(a.available_balance * 100),
      updated_at: now,
    })),
  );
  if (accErr) return NextResponse.json({ error: accErr.message }, { status: 500 });

  // --- Transactions -------------------------------------------------------
  const since = new Date(Date.now() - LOOKBACK_DAYS * 86_400_000).toISOString();
  let cursor: string | null = null;
  let stored = 0;
  let skipped = 0;
  let pages = 0;

  do {
    const query = new URLSearchParams({ start: since });
    if (cursor) query.set('cursor', cursor);

    const txRes = await akahuFetch(`/transactions?${query}`, token);
    if (!txRes.ok) {
      return NextResponse.json(
        {
          error: `Akahu returned ${txRes.status} for transactions.`,
          storedAccounts: mapped.accounts.length,
        },
        { status: 502 },
      );
    }

    const page = mapAkahuTransactions((await txRes.json()) as AkahuTransactionsResponse);
    skipped += page.skipped;

    if (page.transactions.length) {
      // A re-sync re-sends Akahu's category for every row. A category the
      // user corrected is preserved by the keep_locked_category trigger, so
      // the write here stays a plain upsert.
      const { error: txErr } = await supabase
        .from('transactions')
        .upsert(page.transactions.map((t) => ({ ...t, user_id: userId })), {
          onConflict: 'id',
          ignoreDuplicates: false,
        });
      if (txErr) return NextResponse.json({ error: txErr.message }, { status: 500 });
      stored += page.transactions.length;
    }

    cursor = page.nextCursor;
    pages += 1;
  } while (cursor && pages < MAX_PAGES);

  await touchLastUsed(userId);

  return NextResponse.json({
    accounts: mapped.accounts.length,
    connections: mapped.connections.length,
    transactions: stored,
    skipped,
    truncated: Boolean(cursor),
    syncedAt: now,
  });
}
