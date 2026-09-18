import type { ExpenseKind } from '../types';

/**
 * Akahu transaction shape. Only the fields this app reads are declared, and
 * all of them are optional: a provider payload is untrusted input, and a
 * missing field must never become a wrong number.
 */
export type AkahuTransactionJson = {
  _id?: string;
  _account?: string;
  date?: string;
  description?: string;
  amount?: number;
  type?: string;
  merchant?: { name?: string };
  category?: { groups?: { personal_finance?: { name?: string } }; name?: string };
};

export type AkahuTransactionsResponse = {
  success?: boolean;
  items?: AkahuTransactionJson[];
  cursor?: { next?: string | null };
};

export type MappedTransaction = {
  id: string;
  account_id: string;
  posted_at: string;
  /** Signed minor units. Negative is money leaving the account. */
  amount_cents: number;
  currency: string;
  description: string;
  merchant: string | null;
  source_group: string | null;
  source_name: string | null;
  kind: ExpenseKind | null;
};

/**
 * Money arrives as a float. Rounding at the boundary, once, is what keeps a
 * balance from drifting by a cent per thousand transactions.
 */
export function toCents(amount: unknown): number | null {
  const v = typeof amount === 'number' ? amount : Number(amount);
  if (!Number.isFinite(v)) return null;
  return Math.round(v * 100);
}

/**
 * Akahu's personal-finance groups mapped onto this app's expense buckets.
 * Anything unrecognised stays null rather than landing in "other": an
 * uncategorised transaction is honest, a miscategorised one quietly distorts
 * every budget total that counts it.
 */
const GROUP_TO_KIND: Record<string, ExpenseKind> = {
  'household': 'housing',
  'housing': 'housing',
  'utilities': 'utilities',
  'appliances': 'housing',
  'food': 'food',
  'groceries': 'food',
  'dining': 'food',
  'eating out': 'food',
  'lifestyle': 'other',
  'transport': 'transport',
  'vehicle': 'transport',
  'fuel': 'transport',
  'insurance': 'insurance',
  'professional services': 'other',
  'health': 'health',
  'healthcare': 'health',
  'medical': 'health',
  'wellness': 'health',
  'subscriptions': 'subs',
  'entertainment': 'subs',
  'education': 'other',
};

export function mapCategory(group: string | undefined, name: string | undefined): ExpenseKind | null {
  for (const candidate of [group, name]) {
    if (!candidate) continue;
    const hit = GROUP_TO_KIND[candidate.trim().toLowerCase()];
    if (hit) return hit;
  }
  return null;
}

export function mapAkahuTransactions(
  payload: AkahuTransactionsResponse,
  currency = 'NZD',
): { transactions: MappedTransaction[]; nextCursor: string | null; skipped: number } {
  const items = Array.isArray(payload.items) ? payload.items : [];
  const transactions: MappedTransaction[] = [];
  let skipped = 0;

  for (const item of items) {
    const cents = toCents(item.amount);
    const posted = item.date ? new Date(item.date) : null;
    // A row without an id, an account, a usable amount or a real date cannot
    // be reconciled later, so it is counted and dropped rather than guessed at.
    if (!item._id || !item._account || cents === null || !posted || Number.isNaN(posted.getTime())) {
      skipped += 1;
      continue;
    }
    const group = item.category?.groups?.personal_finance?.name;
    const name = item.category?.name;
    transactions.push({
      id: item._id,
      account_id: item._account,
      posted_at: posted.toISOString(),
      amount_cents: cents,
      currency,
      description: (item.description ?? '').trim() || 'Transaction',
      merchant: item.merchant?.name?.trim() || null,
      source_group: group ?? null,
      source_name: name ?? null,
      kind: mapCategory(group, name),
    });
  }

  return { transactions, nextCursor: payload.cursor?.next ?? null, skipped };
}
