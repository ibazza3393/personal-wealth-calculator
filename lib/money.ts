/** Integer-cent helpers so $0.10 + $0.20 never becomes 0.30000000000000004. */

const MAX_CENTS = 100_000_000_000_000; // $1e12

export function toCents(dollars: unknown): number {
  const n = typeof dollars === 'number' ? dollars : Number(dollars);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(MAX_CENTS, Math.round(n * 100));
}

export function centsToDollars(cents: number): number {
  if (!Number.isFinite(cents) || cents <= 0) return 0;
  return Math.min(MAX_CENTS, Math.round(cents)) / 100;
}

/** Parse a user-typed amount into a 2-decimal dollar figure. */
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

export function formatCents(cents: number): string {
  const dollars = (Number.isFinite(cents) ? cents : 0) / 100;
  const abs = Math.abs(dollars);
  const fractionDigits = Number.isInteger(abs) ? 0 : 2;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: 2,
  }).format(dollars);
}

/** Display string for a controlled input. Empty when zero so the field is easy to edit. */
export function inputValueFromCents(cents: number): string {
  if (!cents) return '';
  const dollars = cents / 100;
  return Number.isInteger(dollars) ? String(dollars) : dollars.toFixed(2);
}

/**
 * Largest-remainder percents so labels always sum to 100 (or 0).
 * Zero-total returns an all-zero array of the same length.
 */
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

/** Unrounded 0–100 shares for bar/ring widths (can be fractional). */
export function widthPercents(values: number[]): number[] {
  const total = values.reduce((sum, v) => sum + (Number.isFinite(v) && v > 0 ? v : 0), 0);
  if (total <= 0) return values.map(() => 0);
  return values.map((v) => ((Number.isFinite(v) && v > 0 ? v : 0) / total) * 100);
}
