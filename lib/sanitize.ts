import type {
  CompareInputs,
  Holding,
  HoldingKind,
  LiabilityItem,
  WealthData,
} from './types';
import { DEFAULT_COMPARE, DEFAULT_WEALTH_DATA } from './types';
import { centsToDollars, toCents } from './money';
import { isCurrency } from './currency';

const MAX_NAME = 80;
export const MAX_ITEMS = 50;
const HOLDING_KIND_COUNT = 7;

const KINDS = new Set<HoldingKind>([
  'stocks',
  'bitcoin',
  'crypto',
  'bonds',
  'funds',
  'retirement',
  'business',
]);

function sanitizeName(name: unknown): string {
  if (typeof name !== 'string') return '';
  return name.replace(/\s+/g, ' ').trim().slice(0, MAX_NAME);
}

function sanitizeAmount(value: unknown): number {
  return centsToDollars(toCents(value));
}

function clampNum(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function uniqueIds<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.map((item, i) => {
    let id = item.id;
    if (!id || seen.has(id)) id = `${item.id || 'item'}-${i}`;
    seen.add(id);
    return id === item.id ? item : { ...item, id };
  });
}

function sanitizeSymbol(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const s = value.toUpperCase().replace(/[^A-Z0-9.-]/g, '').slice(0, 8);
  return s || undefined;
}

function sanitizeUnits(value: unknown): number | undefined {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.min(1e12, n);
}

function sanitizeHolding(raw: unknown, fallbackId: string): Holding | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const name = sanitizeName(row.name);
  const value = sanitizeAmount(row.value);
  const kind: HoldingKind = KINDS.has(row.kind as HoldingKind) ? (row.kind as HoldingKind) : 'stocks';
  const id =
    typeof row.id === 'string' && row.id.length > 0 && row.id.length <= 64 ? row.id : fallbackId;
  const symbol = sanitizeSymbol(row.symbol);
  const units = sanitizeUnits(row.units);
  if (!name && value === 0 && !units) return null;
  return { id, kind, name: name || symbol || 'Untitled', value, symbol, units };
}

function sanitizeLiability(raw: unknown, fallbackId: string): LiabilityItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const name = sanitizeName(row.name);
  const value = sanitizeAmount(row.value);
  const id =
    typeof row.id === 'string' && row.id.length > 0 && row.id.length <= 64 ? row.id : fallbackId;
  if (!name && value === 0) return null;
  return { id, name: name || 'Untitled', value };
}

function sanitizeCompare(raw: unknown): CompareInputs {
  const d = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    years: Math.round(clampNum(d.years, DEFAULT_COMPARE.years, 1, 40)),
    lumpSum: sanitizeAmount(d.lumpSum ?? DEFAULT_COMPARE.lumpSum),
    monthlyBudget: sanitizeAmount(d.monthlyBudget ?? DEFAULT_COMPARE.monthlyBudget),
    homePrice: sanitizeAmount(d.homePrice ?? DEFAULT_COMPARE.homePrice),
    mortgageRatePct: clampNum(d.mortgageRatePct, DEFAULT_COMPARE.mortgageRatePct, 0, 20),
    appreciationPct: clampNum(d.appreciationPct, DEFAULT_COMPARE.appreciationPct, -10, 20),
    housingCostPct: clampNum(d.housingCostPct, DEFAULT_COMPARE.housingCostPct, 0, 10),
    rentMonthly: sanitizeAmount(d.rentMonthly ?? DEFAULT_COMPARE.rentMonthly),
    rentInflationPct: clampNum(d.rentInflationPct, DEFAULT_COMPARE.rentInflationPct, 0, 20),
    spReturnPct: clampNum(d.spReturnPct, DEFAULT_COMPARE.spReturnPct, -20, 30),
  };
}

export function sanitizeWealthData(raw: unknown): WealthData {
  if (!raw || typeof raw !== 'object') return DEFAULT_WEALTH_DATA;
  const d = raw as Record<string, unknown>;

  const fromHoldings = Array.isArray(d.holdings) ? d.holdings : null;
  const fromLegacy = Array.isArray(d.marketAssets) ? d.marketAssets : [];
  const source = fromHoldings ?? fromLegacy.map((row) => ({ ...(row as object), kind: 'stocks' }));

  const holdings = uniqueIds(
    source
      .map((row, i) => sanitizeHolding(row, `holding-${i}`))
      .filter((x): x is Holding => x !== null)
      .slice(0, MAX_ITEMS * HOLDING_KIND_COUNT),
  );

  const liabilities = uniqueIds(
    Array.isArray(d.liabilities)
      ? d.liabilities
          .map((row, i) => sanitizeLiability(row, `liability-${i}`))
          .filter((x): x is LiabilityItem => x !== null)
          .slice(0, MAX_ITEMS)
      : [],
  );

  return {
    currency: isCurrency(d.currency) ? d.currency : 'USD',
    liquidCash: sanitizeAmount(d.liquidCash),
    propertyValue: sanitizeAmount(d.propertyValue),
    holdings,
    liabilities,
    compare: sanitizeCompare(d.compare),
  };
}
