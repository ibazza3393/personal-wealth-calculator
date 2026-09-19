import { toCents } from './money';
import type {
  Account,
  Connection,
  Holding,
  LedgerDocument,
  ManualAsset,
  ManualLiability,
  MoneyCurrency,
  NetWorthSnapshot,
  Property,
} from './domain';
import { EMPTY_LEDGER } from './domain';
import { convert, FALLBACK_FX, type FxTable } from './fx';

const MAX_ITEMS = 50;
const MAX_NAME = 80;

function asString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v.slice(0, MAX_NAME) : fallback;
}

function asNum(v: unknown): number {
  return toCents(typeof v === 'number' ? v : Number(v)) / 100;
}

/**
 * A plain ISO date (YYYY-MM-DD), or null.
 *
 * Checked against a real Date rather than a regex alone, so 2026-02-31 is
 * rejected instead of stored and later rendered as 3 March.
 */
function asIsoDate(v: unknown): string | null {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const d = new Date(`${v}T00:00:00Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v ? null : v;
}

function oneOf<T extends string>(v: unknown, allowed: readonly T[], fallback: T): T {
  return typeof v === 'string' && (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
}

/**
 * USD used to fall through to the AUD branch, so US$100 was converted at the
 * NZD/AUD rate. Every currency now goes through its own rate.
 */
export function toNzd(amount: number, currency: MoneyCurrency, fx: FxTable = FALLBACK_FX): number {
  return convert(amount, currency, 'NZD', fx) ?? 0;
}

export function toAud(amount: number, currency: MoneyCurrency, fx: FxTable = FALLBACK_FX): number {
  return convert(amount, currency, 'AUD', fx) ?? 0;
}

export function buildSnapshot(doc: LedgerDocument, fx: FxTable = FALLBACK_FX): NetWorthSnapshot {
  const nzd = (amount: number, currency: MoneyCurrency) => toNzd(amount, currency, fx);

  let cash = 0;
  let investments = 0;
  let superBal = 0;
  let creditCards = 0;
  let mortgages = 0;
  let otherLiabilities = 0;

  for (const a of doc.accounts) {
    const v = nzd(a.current_balance, a.currency);
    if (a.type === 'cash') cash += v;
    else if (a.type === 'investment') investments += v;
    else if (a.type === 'super' || a.type === 'kiwi_saver') superBal += v;
    else if (a.type === 'credit_card') creditCards += v;
    else if (a.type === 'mortgage') mortgages += v;
    else if (a.type === 'loan' || a.type === 'other') otherLiabilities += v;
  }

  for (const h of doc.holdings) {
    const account = doc.accounts.find((a) => a.id === h.account_id);
    if (account?.type === 'investment' || account?.type === 'kiwi_saver' || account?.type === 'super') {
      continue;
    }
    investments += nzd(h.market_value, h.currency);
  }

  const property = doc.properties.reduce((s, p) => s + nzd(p.estimated_value, p.currency), 0);
  const otherAssets = doc.manualAssets.reduce((s, a) => s + nzd(a.value, a.currency), 0);
  otherLiabilities += doc.manualLiabilities.reduce((s, l) => s + nzd(l.value, l.currency), 0);

  const assets = cash + investments + superBal + property + otherAssets;
  const liabilities = creditCards + mortgages + otherLiabilities;
  const netNzd = assets - liabilities;

  return {
    as_of: fx.asOf,
    cash,
    investments,
    super: superBal,
    property,
    other_assets: otherAssets,
    credit_cards: creditCards,
    mortgages,
    other_liabilities: otherLiabilities,
    net_worth_nzd: netNzd,
    net_worth_aud: toAud(netNzd, 'NZD', fx),
    fx_rate_nzd_aud: fx.rates.AUD ?? 0,
  };
}

function uniqueIds<T extends { id: string }>(rows: T[]): T[] {
  const seen = new Set<string>();
  return rows.filter((row) => {
    if (!row.id || seen.has(row.id)) return false;
    seen.add(row.id);
    return true;
  });
}

export function sanitizeLedger(raw: unknown): LedgerDocument {
  if (!raw || typeof raw !== 'object') return EMPTY_LEDGER;
  const o = raw as Record<string, unknown>;

  const connections: Connection[] = uniqueIds(
    (Array.isArray(o.connections) ? o.connections : []).slice(0, MAX_ITEMS).map((row, i) => {
      const r = row && typeof row === 'object' ? (row as Record<string, unknown>) : {};
      return {
        id: asString(r.id, `conn-${i}`),
        provider: oneOf(r.provider, ['akahu', 'basiq', 'fiskil', 'manual', 'csv', 'broker'] as const, 'manual'),
        country: oneOf(r.country, ['NZ', 'AU'] as const, 'NZ'),
        institution_name: asString(r.institution_name, 'Institution'),
        status: oneOf(
          r.status,
          ['active', 'needs_reauth', 'consent_expiring', 'error', 'revoked'] as const,
          'active',
        ),
        scopes: 'read_only',
        last_synced_at: typeof r.last_synced_at === 'string' ? r.last_synced_at : null,
        consent_expires_at: typeof r.consent_expires_at === 'string' ? r.consent_expires_at : null,
      };
    }),
  );

  const accounts: Account[] = uniqueIds(
    (Array.isArray(o.accounts) ? o.accounts : []).slice(0, MAX_ITEMS).map((row, i) => {
      const r = row && typeof row === 'object' ? (row as Record<string, unknown>) : {};
      return {
        id: asString(r.id, `acc-${i}`),
        connection_id: asString(r.connection_id),
        country: oneOf(r.country, ['NZ', 'AU'] as const, 'NZ'),
        type: oneOf(
          r.type,
          ['cash', 'credit_card', 'loan', 'mortgage', 'investment', 'super', 'kiwi_saver', 'other'] as const,
          'other',
        ),
        name: asString(r.name, 'Account'),
        institution: asString(r.institution, 'Bank'),
        currency: oneOf(r.currency, ['NZD', 'AUD', 'USD'] as const, 'NZD'),
        current_balance: asNum(r.current_balance),
        available_balance: r.available_balance == null ? null : asNum(r.available_balance),
      };
    }),
  );

  const holdings: Holding[] = uniqueIds(
    (Array.isArray(o.holdings) ? o.holdings : []).slice(0, MAX_ITEMS).map((row, i) => {
      const r = row && typeof row === 'object' ? (row as Record<string, unknown>) : {};
      return {
        id: asString(r.id, `hld-${i}`),
        account_id: asString(r.account_id),
        ticker_or_name: asString(r.ticker_or_name, 'Holding'),
        asset_class: oneOf(r.asset_class, ['equity', 'bond', 'fund', 'cash', 'other'] as const, 'other'),
        units: r.units == null ? null : Number(r.units) || null,
        price: r.price == null ? null : asNum(r.price),
        market_value: asNum(r.market_value),
        cost_basis: r.cost_basis == null ? null : asNum(r.cost_basis),
        currency: oneOf(r.currency, ['NZD', 'AUD', 'USD'] as const, 'NZD'),
      };
    }),
  );

  const properties: Property[] = uniqueIds(
    (Array.isArray(o.properties) ? o.properties : []).slice(0, MAX_ITEMS).map((row, i) => {
      const r = row && typeof row === 'object' ? (row as Record<string, unknown>) : {};
      return {
        id: asString(r.id, `prop-${i}`),
        country: oneOf(r.country, ['NZ', 'AU'] as const, 'NZ'),
        address: asString(r.address, 'Property'),
        estimated_value: asNum(r.estimated_value),
        currency: oneOf(r.currency, ['NZD', 'AUD', 'USD'] as const, 'NZD'),
        valuation_source: oneOf(
          r.valuation_source,
          ['council', 'manual', 'homes', 'qv', 'corelogic', 'domain', 'other'] as const,
          'manual',
        ),
        // Stored as a plain ISO date. A blank or malformed value reads as "no
        // date" rather than today's, so an undated figure is never passed off
        // as a fresh one.
        valuation_date: asIsoDate(r.valuation_date),
        mortgage_account_id: typeof r.mortgage_account_id === 'string' ? r.mortgage_account_id : null,
      };
    }),
  );

  const manualAssets: ManualAsset[] = uniqueIds(
    (Array.isArray(o.manualAssets) ? o.manualAssets : []).slice(0, MAX_ITEMS).map((row, i) => {
      const r = row && typeof row === 'object' ? (row as Record<string, unknown>) : {};
      return {
        id: asString(r.id, `ma-${i}`),
        name: asString(r.name, 'Asset'),
        country: oneOf(r.country, ['NZ', 'AU'] as const, 'NZ'),
        value: asNum(r.value),
        currency: oneOf(r.currency, ['NZD', 'AUD', 'USD'] as const, 'NZD'),
      };
    }),
  );

  const manualLiabilities: ManualLiability[] = uniqueIds(
    (Array.isArray(o.manualLiabilities) ? o.manualLiabilities : []).slice(0, MAX_ITEMS).map((row, i) => {
      const r = row && typeof row === 'object' ? (row as Record<string, unknown>) : {};
      return {
        id: asString(r.id, `ml-${i}`),
        name: asString(r.name, 'Liability'),
        country: oneOf(r.country, ['NZ', 'AU'] as const, 'NZ'),
        value: asNum(r.value),
        currency: oneOf(r.currency, ['NZD', 'AUD', 'USD'] as const, 'NZD'),
      };
    }),
  );

  return { connections, accounts, holdings, properties, manualAssets, manualLiabilities };
}
