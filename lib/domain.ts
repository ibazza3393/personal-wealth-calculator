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

export type ValuationSource = 'manual' | 'homes' | 'qv' | 'corelogic' | 'domain' | 'other';

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

/** 1 NZD = this many AUD. Dated mock until a real FX feed. */
export const FX_NZD_AUD = 0.91;
export const FX_AS_OF = '2026-09-16';

export const EMPTY_LEDGER: LedgerDocument = {
  connections: [],
  accounts: [],
  holdings: [],
  properties: [],
  manualAssets: [],
  manualLiabilities: [],
};
