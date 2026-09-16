import { formatCents, toCents } from './money';
import type { CurrencyCode } from './currency';
import type { CompareInputs } from './types';

const MORTGAGE_YEARS = 30;

export type PathId = 'housing' | 'renting' | 'sp500';

export type PathColumn = {
  id: PathId;
  title: string;
  subtitle: string;
  endingCents: number;
};

export type CompareResult = {
  columns: PathColumn[];
  rows: { label: string; cells: string[] }[];
};

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

export function monthlyRateFromAnnual(annual: number): number {
  if (!Number.isFinite(annual) || annual <= -0.999) return 0;
  return Math.pow(1 + annual, 1 / 12) - 1;
}

export function mortgagePayment(principal: number, annualRate: number, termYears: number): number {
  if (!(principal > 0) || termYears <= 0) return 0;
  const n = termYears * 12;
  const rm = annualRate / 12;
  if (Math.abs(rm) < 1e-12) return principal / n;
  const pow = Math.pow(1 + rm, n);
  return (principal * (rm * pow)) / (pow - 1);
}

export function remainingBalance(
  principal: number,
  annualRate: number,
  termYears: number,
  monthsPaid: number,
): number {
  if (!(principal > 0)) return 0;
  const n = termYears * 12;
  if (monthsPaid >= n) return 0;
  if (monthsPaid <= 0) return principal;
  const rm = annualRate / 12;
  if (Math.abs(rm) < 1e-12) return Math.max(0, principal - (principal / n) * monthsPaid);
  const powN = Math.pow(1 + rm, n);
  const powK = Math.pow(1 + rm, monthsPaid);
  return (principal * (powN - powK)) / (powN - 1);
}

export function futureValueMonthly(
  lump: number,
  monthly: number,
  annualReturn: number,
  years: number,
): number {
  const months = Math.round(years * 12);
  if (months <= 0) return Math.max(0, lump);
  const rm = monthlyRateFromAnnual(annualReturn);
  if (Math.abs(rm) < 1e-12) return Math.max(0, lump + monthly * months);
  const growth = Math.pow(1 + rm, months);
  return lump * growth + monthly * ((growth - 1) / rm);
}

function money(n: number, currency: CurrencyCode) {
  return formatCents(toCents(Math.max(0, n)), currency, 0);
}

export function runCompare(input: CompareInputs, currency: CurrencyCode = 'USD'): CompareResult {
  const years = Math.round(clamp(input.years, 1, 40));
  const lump = Math.max(0, input.lumpSum);
  const monthlyBudget = Math.max(0, input.monthlyBudget);
  const homePrice = Math.max(0, input.homePrice);
  const mortgageRate = clamp(input.mortgageRatePct, 0, 20) / 100;
  const appreciation = clamp(input.appreciationPct, -10, 20) / 100;
  const housingCost = clamp(input.housingCostPct, 0, 10) / 100;
  const rent0 = Math.max(0, input.rentMonthly);
  const rentInflation = clamp(input.rentInflationPct, 0, 20) / 100;
  const sp = clamp(input.spReturnPct, -20, 30) / 100;
  const months = years * 12;

  const down = Math.min(lump, homePrice);
  const leftover = Math.max(0, lump - down);
  const loan = Math.max(0, homePrice - down);
  const payment = mortgagePayment(loan, mortgageRate, MORTGAGE_YEARS);
  const homeEnd = homePrice * Math.pow(1 + appreciation, years);
  const balance = remainingBalance(loan, mortgageRate, MORTGAGE_YEARS, months);
  const equity = Math.max(0, homeEnd - balance);
  let housingPaid = down;
  let homeCursor = homePrice;
  const gM = Math.pow(1 + appreciation, 1 / 12);
  for (let i = 0; i < months; i++) {
    housingPaid += payment + (housingCost * homeCursor) / 12;
    homeCursor *= gM;
  }
  const leftoverFv = futureValueMonthly(leftover, 0, sp, years);
  const housingNet = equity + leftoverFv;
  const housingMonthlyStart = payment + (housingCost * homePrice) / 12;

  let rent = rent0;
  let rentPortfolio = lump;
  let rentPaid = 0;
  const rm = monthlyRateFromAnnual(sp);
  for (let y = 0; y < years; y++) {
    for (let m = 0; m < 12; m++) {
      rentPaid += rent;
      const invest = Math.max(0, monthlyBudget - rent);
      rentPortfolio = (rentPortfolio + invest) * (1 + rm);
    }
    rent *= 1 + rentInflation;
  }

  const spNet = futureValueMonthly(lump, monthlyBudget, sp, years);
  const spDeployed = lump + monthlyBudget * months;

  const moneyFmt = (n: number) => money(n, currency);
  const dash = '—';

  return {
    columns: [
      {
        id: 'housing',
        title: 'Housing',
        subtitle: 'Buy and hold',
        endingCents: toCents(housingNet),
      },
      {
        id: 'renting',
        title: 'Renting',
        subtitle: 'Rent + invest the rest',
        endingCents: toCents(rentPortfolio),
      },
      {
        id: 'sp500',
        title: 'S&P 500',
        subtitle: 'Invest the same cash',
        endingCents: toCents(spNet),
      },
    ],
    rows: [
      { label: 'Starting capital', cells: [moneyFmt(lump), moneyFmt(lump), moneyFmt(lump)] },
      {
        label: 'Monthly outlay (year 1)',
        cells: [moneyFmt(housingMonthlyStart), moneyFmt(rent0), moneyFmt(monthlyBudget)],
      },
      { label: 'Home value', cells: [moneyFmt(homeEnd), dash, dash] },
      { label: 'Remaining mortgage', cells: [moneyFmt(balance), dash, dash] },
      { label: 'Home equity', cells: [moneyFmt(equity), moneyFmt(0), moneyFmt(0)] },
      {
        label: 'Investment portfolio',
        cells: [moneyFmt(leftoverFv), moneyFmt(rentPortfolio), moneyFmt(spNet)],
      },
      { label: 'Cash spent', cells: [moneyFmt(housingPaid), moneyFmt(rentPaid), moneyFmt(spDeployed)] },
      { label: 'Ending net', cells: [moneyFmt(housingNet), moneyFmt(rentPortfolio), moneyFmt(spNet)] },
    ],
  };
}
