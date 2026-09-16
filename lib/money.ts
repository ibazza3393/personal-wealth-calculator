import type { CurrencyCode } from './currency';
import { CURRENCIES } from './currency';

const MAX_CENTS = 100_000_000_000_000;

export function toCents(dollars: unknown): number {
  const n = typeof dollars === 'number' ? dollars : Number(dollars);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(MAX_CENTS, Math.round(n * 100));
}

export function centsToDollars(cents: number): number {
  if (!Number.isFinite(cents) || cents <= 0) return 0;
  return Math.min(MAX_CENTS, Math.round(cents)) / 100;
}

export function parseDollars(input: string): number {
  const cleaned = input.replace(/[^0-9.]/g, '');
  const firstDot = cleaned.indexOf('.');
  const normalized =
    firstDot === -1
      ? cleaned
      : cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
  if (normalized === '' || normalized === '.') return 0;
  const [whole, frac = ''] = normalized.split('.');
  const clipped = frac.length > 0 ? `${whole.slice(0, 12)}.${frac.slice(0, 2)}` : whole.slice(0, 12);
  return centsToDollars(toCents(Number(clipped)));
}

export function parseUnits(input: string): number {
  const cleaned = input.replace(/[^0-9.]/g, '');
  const firstDot = cleaned.indexOf('.');
  const normalized =
    firstDot === -1
      ? cleaned.slice(0, 12)
      : `${cleaned.slice(0, firstDot).slice(0, 8)}.${cleaned.slice(firstDot + 1).replace(/\./g, '').slice(0, 8)}`;
  if (normalized === '' || normalized === '.') return 0;
  const n = Number(normalized);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function formatCents(cents: number, currency: CurrencyCode = 'USD'): string {
  const dollars = (Number.isFinite(cents) ? cents : 0) / 100;
  const abs = Math.abs(dollars);
  const meta = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];
  const fractionDigits = currency === 'JPY' ? 0 : Number.isInteger(abs) ? 0 : 2;
  return new Intl.NumberFormat(meta.locale, {
    style: 'currency',
    currency: meta.code,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: currency === 'JPY' ? 0 : 2,
  }).format(dollars);
}

export function inputValueFromCents(cents: number): string {
  if (!cents) return '';
  const dollars = cents / 100;
  return Number.isInteger(dollars) ? String(dollars) : dollars.toFixed(2);
}

export function labelPercents(values: number[]): number[] {
  const n = values.length;
  if (n === 0) return [];
  const total = values.reduce((sum, v) => sum + (Number.isFinite(v) && v > 0 ? v : 0), 0);
  if (total <= 0) return Array(n).fill(0);

  const exact = values.map((v) => ((Number.isFinite(v) && v > 0 ? v : 0) / total) * 100);
  const floors = exact.map(Math.floor);
  const remain = 100 - floors.reduce((a, b) => a + b, 0);
  const order = exact
    .map((e, i) => ({ i, frac: e - floors[i] }))
    .sort((a, b) => b.frac - a.frac);
  const out = [...floors];
  for (let k = 0; k < remain; k++) {
    out[order[k].i] += 1;
  }
  return out;
}

export function widthPercents(values: number[]): number[] {
  const total = values.reduce((sum, v) => sum + (Number.isFinite(v) && v > 0 ? v : 0), 0);
  if (total <= 0) return values.map(() => 0);
  return values.map((v) => ((Number.isFinite(v) && v > 0 ? v : 0) / total) * 100);
}
