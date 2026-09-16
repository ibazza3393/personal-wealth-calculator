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
}[] = [
  {
    kind: 'stocks',
    title: 'Stocks',
    caption: 'Individual shares and brokerages',
    add: 'Add stock',
    empty: 'No stocks yet',
    color: '#5e5ce6',
  },
  {
    kind: 'bitcoin',
    title: 'Bitcoin',
    caption: 'BTC on-chain or at an exchange — enter the USD value',
    add: 'Add bitcoin',
    empty: 'No bitcoin yet',
    color: '#f7931a',
  },
  {
    kind: 'crypto',
    title: 'Other crypto',
    caption: 'ETH and everything else, in USD',
    add: 'Add crypto',
    empty: 'No other crypto yet',
    color: '#bf5af2',
  },
  {
    kind: 'bonds',
    title: 'Bonds',
    caption: 'Treasuries, corporates, bond funds',
    add: 'Add bond',
    empty: 'No bonds yet',
    color: '#8e8e93',
  },
  {
    kind: 'funds',
    title: 'Mutual funds & ETFs',
    caption: 'Index funds, target-date, active funds',
    add: 'Add fund',
    empty: 'No funds yet',
    color: '#64d2ff',
  },
  {
    kind: 'retirement',
    title: 'Retirement',
    caption: 'KiwiSaver, 401(k), IRA, super',
    add: 'Add account',
    empty: 'No retirement accounts yet',
    color: '#30d158',
  },
  {
    kind: 'business',
    title: 'Business',
    caption: 'Private companies and side equity',
    add: 'Add business',
    empty: 'No business equity yet',
    color: '#ff9f0a',
  },
];
