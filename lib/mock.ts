import type { LedgerDocument } from './domain';

/**
 * Sample data, loaded only when someone asks for it from Connections.
 *
 * This used to be the initial value of every ledger, which meant a real person
 * who signed up was shown a Grey Lynn property, an ANZ mortgage and a
 * Commonwealth Bank account as their net worth. A financial app whose first
 * screen is invented figures is not a rounding error — you cannot tell which
 * numbers are yours.
 */
export const MOCK_LEDGER: LedgerDocument = {
  connections: [
    {
      id: 'conn-akahu-anz',
      provider: 'akahu',
      country: 'NZ',
      institution_name: 'ANZ',
      status: 'active',
      scopes: 'read_only',
      last_synced_at: '2026-09-16T02:00:00.000Z',
      consent_expires_at: null,
    },
    {
      id: 'conn-aucdr-cba',
      provider: 'basiq',
      country: 'AU',
      institution_name: 'Commonwealth Bank',
      status: 'consent_expiring',
      scopes: 'read_only',
      last_synced_at: '2026-09-10T04:00:00.000Z',
      consent_expires_at: '2026-09-30T00:00:00.000Z',
    },
    {
      id: 'conn-manual',
      provider: 'manual',
      country: 'NZ',
      institution_name: 'Manual ledger',
      status: 'active',
      scopes: 'read_only',
      last_synced_at: '2026-09-16T02:00:00.000Z',
      consent_expires_at: null,
    },
    {
      id: 'conn-csv-ks',
      provider: 'csv',
      country: 'NZ',
      institution_name: 'KiwiSaver (CSV)',
      status: 'active',
      scopes: 'read_only',
      last_synced_at: '2026-09-01T00:00:00.000Z',
      consent_expires_at: null,
    },
  ],
  accounts: [
    {
      id: 'acc-anz-everyday',
      connection_id: 'conn-akahu-anz',
      country: 'NZ',
      type: 'cash',
      name: 'ANZ Everyday',
      institution: 'ANZ',
      currency: 'NZD',
      current_balance: 18420,
      available_balance: 18420,
    },
    {
      id: 'acc-anz-mortgage',
      connection_id: 'conn-akahu-anz',
      country: 'NZ',
      type: 'mortgage',
      name: 'Home loan',
      institution: 'ANZ',
      currency: 'NZD',
      current_balance: 412000,
      available_balance: null,
    },
    {
      id: 'acc-cba-card',
      connection_id: 'conn-aucdr-cba',
      country: 'AU',
      type: 'credit_card',
      name: 'CBA Awards',
      institution: 'Commonwealth Bank',
      currency: 'AUD',
      current_balance: 2140,
      available_balance: 12860,
    },
    {
      id: 'acc-sharesies',
      connection_id: 'conn-manual',
      country: 'NZ',
      type: 'investment',
      name: 'Sharesies',
      institution: 'Sharesies',
      currency: 'NZD',
      current_balance: 24680,
      available_balance: 24680,
    },
    {
      id: 'acc-kiwisaver',
      connection_id: 'conn-csv-ks',
      country: 'NZ',
      type: 'kiwi_saver',
      name: 'Simplicity Growth (CSV)',
      institution: 'Simplicity',
      currency: 'NZD',
      current_balance: 86200,
      available_balance: 86200,
    },
  ],
  holdings: [
    {
      id: 'hld-vti',
      account_id: 'acc-sharesies',
      ticker_or_name: 'VTI',
      asset_class: 'fund',
      units: 42,
      price: 290,
      market_value: 12180,
      cost_basis: 9800,
      currency: 'NZD',
    },
    {
      id: 'hld-nzx',
      account_id: 'acc-sharesies',
      ticker_or_name: 'FPH.NZ',
      asset_class: 'equity',
      units: 80,
      price: 156.25,
      market_value: 12500,
      cost_basis: 11000,
      currency: 'NZD',
    },
  ],
  properties: [
    {
      id: 'prop-grey-lynn',
      country: 'NZ',
      address: 'Grey Lynn, Auckland',
      estimated_value: 1180000,
      currency: 'NZD',
      valuation_source: 'council',
      valuation_date: '2024-06-01',
      mortgage_account_id: 'acc-anz-mortgage',
    },
  ],
  manualAssets: [
    {
      id: 'ma-car',
      name: 'Car',
      country: 'NZ',
      value: 18000,
      currency: 'NZD',
    },
  ],
  manualLiabilities: [],
};

/**
 * Ids unique to the sample fixture above.
 *
 * A ledger that still carries these was never the owner's data — it is the old
 * default, which every visitor received whether they wanted it or not. It is
 * cleared once on load. Ids rather than a deep compare, so a ledger the person
 * actually edited is left alone.
 */
export const MOCK_MARKER_IDS = ['conn-akahu-anz', 'conn-aucdr-cba', 'prop-grey-lynn'] as const;

/** True when a stored ledger is still the untouched sample fixture. */
export function isUntouchedMock(doc: LedgerDocument): boolean {
  const ids = new Set<string>([
    ...doc.connections.map((c) => c.id),
    ...doc.properties.map((p) => p.id),
  ]);
  return MOCK_MARKER_IDS.every((id) => ids.has(id));
}
