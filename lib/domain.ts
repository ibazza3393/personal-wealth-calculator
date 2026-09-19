export type Country = 'NZ' | 'AU';

export type Provider = 'akahu' | 'basiq' | 'fiskil' | 'manual' | 'csv' | 'broker';

export type ConnectionStatus =
  | 'active'
  | 'needs_reauth'
  | 'consent_expiring'
  | 'error'
  | 'revoked';

export type AccountType =
  | 'cash'
  | 'credit_card'
  | 'loan'
  | 'mortgage'
  | 'investment'
  | 'super'
  | 'kiwi_saver'
  | 'other';

export type AssetClass = 'equity' | 'bond' | 'fund' | 'cash' | 'other';

/**
 * Where a property figure came from.
 *
 * `council` is the rating valuation (CV) on the District Valuation Roll — the
 * public record a council sets at least every three years under the Rating
 * Valuations Act 1998. It is the only figure here with a public source, which
 * is why it is named separately from a number the owner estimated.
 */
export type ValuationSource =
  | 'council'
  | 'manual'
  | 'homes'
  | 'qv'
  | 'corelogic'
  | 'domain'
  | 'other';

export type MoneyCurrency = 'NZD' | 'AUD' | 'USD';

export interface Connection {
  id: string;
  provider: Provider;
  country: Country;
  institution_name: string;
  status: ConnectionStatus;
  scopes: 'read_only';
  last_synced_at: string | null;
  consent_expires_at: string | null;
}

export interface Account {
  id: string;
  connection_id: string;
  country: Country;
  type: AccountType;
  name: string;
  institution: string;
  currency: MoneyCurrency;
  current_balance: number;
  available_balance: number | null;
}

export interface Holding {
  id: string;
  account_id: string;
  ticker_or_name: string;
  asset_class: AssetClass;
  units: number | null;
  price: number | null;
  market_value: number;
  cost_basis: number | null;
  currency: MoneyCurrency;
}

export interface Property {
  id: string;
  country: Country;
  address: string;
  estimated_value: number;
  currency: MoneyCurrency;
  valuation_source: ValuationSource;
  /**
   * When the figure was set, ISO date. A council revalues on a three-yearly
   * cycle, so a CV without its date cannot be judged stale — and a four-year-old
   * CV presented as today's net worth is a wrong number, not a rounded one.
   */
  valuation_date: string | null;
  mortgage_account_id: string | null;
}

export interface ManualAsset {
  id: string;
  name: string;
  country: Country;
  value: number;
  currency: MoneyCurrency;
}

export interface ManualLiability {
  id: string;
  name: string;
  country: Country;
  value: number;
  currency: MoneyCurrency;
}

export interface NetWorthSnapshot {
  as_of: string;
  cash: number;
  investments: number;
  super: number;
  property: number;
  other_assets: number;
  credit_cards: number;
  mortgages: number;
  other_liabilities: number;
  net_worth_nzd: number;
  net_worth_aud: number;
  fx_rate_nzd_aud: number;
}

export interface LedgerDocument {
  connections: Connection[];
  accounts: Account[];
  holdings: Holding[];
  properties: Property[];
  manualAssets: ManualAsset[];
  manualLiabilities: ManualLiability[];
}

export const LEDGER_KEY = 'wealth-ledger-v1';


export const EMPTY_LEDGER: LedgerDocument = {
  connections: [],
  accounts: [],
  holdings: [],
  properties: [],
  manualAssets: [],
  manualLiabilities: [],
};
