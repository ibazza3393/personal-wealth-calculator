import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { decryptToken } from '@/lib/crypto';
import { appCredentials, userHeaders, AKAHU_API } from '@/lib/providers/akahu-oauth';
import { mapAkahuAccounts, type AkahuAccountsResponse } from '@/lib/providers/akahu-map';
import { mapAkahuTransactions, type AkahuTransactionsResponse } from '@/lib/providers/akahu-tx';

export const dynamic = 'force-dynamic';

/** One year is enough to fill a budget view without pulling a whole history. */
const LOOKBACK_DAYS = 365;
/** Akahu pages transactions; cap the walk so one sync cannot run unbounded. */
const MAX_PAGES = 20;

/**
 * Pulls accounts and transactions from Akahu and stores them against the
 * signed-in user.
 *
 * Each user's own OAuth token is used, read through the service-role client
 * from a table the browser cannot see. There is no longer a single token in
 * the environment: that only ever worked for one person, and this route now
 * serves whoever is signed in.
 */
export async function POST() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    return NextResponse.json({ error: 'Sign in to sync your bank accounts.' }, { status: 401 });
  }

  const creds = appCredentials();
  const admin = createAdminClient();
  if (!creds || !admin) {
    return NextResponse.json(
      { error: 'Akahu is not configured on this host.' },
      { status: 501 },
    );
  }

  const { data: tokenRow } = await admin
    .from('akahu_tokens')
    .select('access_token')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!tokenRow?.access_token) {
    return NextResponse.json(
      { error: 'No bank connected yet. Connect one from Connections.', needsConnection: true },
      { status: 409 },
    );
  }

  let accessToken: string;
  try {
    accessToken = decryptToken(tokenRow.access_token);
  } catch {
    // An unreadable token is a dead token: say so rather than sending rubbish
    // to Akahu and reporting a confusing 401 from them.
    return NextResponse.json(
      { error: 'Stored bank token could not be read. Reconnect your bank.', needsConnection: true },
      { status: 409 },
    );
  }

  const headers = userHeaders(creds.appToken, accessToken);

  // --- Accounts -----------------------------------------------------------
  const accountsRes = await fetch(`${AKAHU_API}/accounts`, { cache: 'no-store', headers });
  if (accountsRes.status === 401) {
    // The consent was revoked at the bank or in Akahu. Ask for a reconnect
    // rather than reporting a generic upstream failure.
    return NextResponse.json(
      { error: 'Your bank connection has expired. Reconnect to keep syncing.', needsConnection: true },
      { status: 409 },
    );
  }
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
      user_id: user.id,
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
      user_id: user.id,
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
    const url = new URL(`${AKAHU_API}/transactions`);
    url.searchParams.set('start', since);
    if (cursor) url.searchParams.set('cursor', cursor);

    const txRes = await fetch(url, { cache: 'no-store', headers });
    if (!txRes.ok) {
      return NextResponse.json(
        { error: `Akahu returned ${txRes.status} for transactions.`, storedAccounts: mapped.accounts.length },
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
        .upsert(page.transactions.map((t) => ({ ...t, user_id: user.id })), {
          onConflict: 'id',
          ignoreDuplicates: false,
        });
      if (txErr) return NextResponse.json({ error: txErr.message }, { status: 500 });
      stored += page.transactions.length;
    }

    cursor = page.nextCursor;
    pages += 1;
  } while (cursor && pages < MAX_PAGES);

  return NextResponse.json({
    accounts: mapped.accounts.length,
    connections: mapped.connections.length,
    transactions: stored,
    skipped,
    truncated: Boolean(cursor),
    syncedAt: now,
  });
}
