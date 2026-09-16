import type { CurrencyCode } from './currency';

export type HoldingKind =
  | 'stocks'
  | 'bitcoin'
  | 'crypto'
  | 'bonds'
  | 'funds'
  | 'retirement'
  | 'business';

export interface Holding {
  id: string;
  kind: HoldingKind;
  name: string;
  value: number;
  symbol?: string;
  units?: number;
}

export interface LiabilityItem {
  id: string;
  name: string;
  value: number;
}

export interface CompareInputs {
  years: number;
  lumpSum: number;
  monthlyBudget: number;
  homePrice: number;
  mortgageRatePct: number;
  appreciationPct: number;
  housingCostPct: number;
  rentMonthly: number;
  rentInflationPct: number;
  spReturnPct: number;
}

export interface WealthData {
  currency: CurrencyCode;
  liquidCash: number;
  propertyValue: number;
  holdings: Holding[];
  liabilities: LiabilityItem[];
  compare: CompareInputs;
}

export const DEFAULT_COMPARE: CompareInputs = {
  years: 10,
  lumpSum: 100000,
  monthlyBudget: 3000,
  homePrice: 650000,
  mortgageRatePct: 6.5,
  appreciationPct: 3,
  housingCostPct: 1.5,
  rentMonthly: 2500,
  rentInflationPct: 3,
  spReturnPct: 10,
};

export const DEFAULT_WEALTH_DATA: WealthData = {
  currency: 'USD',
  liquidCash: 0,
  propertyValue: 0,
  holdings: [],
  liabilities: [],
  compare: DEFAULT_COMPARE,
};

export const STORAGE_KEY = 'personal-wealth-data';
export const THEME_KEY = 'wealth-theme';

export const HOLDING_GROUPS: {
  kind: HoldingKind;
  title: string;
  caption: string;
  add: string;
  empty: string;
  color: string;
  priced?: boolean;
}[] = [
  {
    kind: 'stocks',
    title: 'Stocks',
    caption: 'Ticker + shares marks to market',
    add: 'Add stock',
    empty: 'No stocks yet',
    color: '#5e5ce6',
    priced: true,
  },
  {
    kind: 'bitcoin',
    title: 'Bitcoin',
    caption: 'BTC amount × live price',
    add: 'Add bitcoin',
    empty: 'No bitcoin yet',
    color: '#f7931a',
    priced: true,
  },
  {
    kind: 'crypto',
    title: 'Other crypto',
    caption: 'ETH, SOL — units × live price',
    add: 'Add crypto',
    empty: 'No other crypto yet',
    color: '#bf5af2',
    priced: true,
  },
  {
    kind: 'bonds',
    title: 'Bonds',
    caption: 'Treasuries, corporates — enter value',
    add: 'Add bond',
    empty: 'No bonds yet',
    color: '#8e8e93',
  },
  {
    kind: 'funds',
    title: 'Mutual funds & ETFs',
    caption: 'SPY, QQQ, VTI — ticker + units',
    add: 'Add fund',
    empty: 'No funds yet',
    color: '#64d2ff',
    priced: true,
  },
  {
    kind: 'retirement',
    title: 'Retirement',
    caption: 'KiwiSaver, 401(k), IRA — enter value',
    add: 'Add account',
    empty: 'No retirement accounts yet',
    color: '#30d158',
  },
  {
    kind: 'business',
    title: 'Business',
    caption: 'Private equity you estimate',
    add: 'Add business',
    empty: 'No business equity yet',
    color: '#ff9f0a',
  },
];
