/**
 * Foreign exchange.
 *
 * Previously the ledger carried a single hardcoded NZD→AUD constant and used it
 * for every conversion, so a USD balance was converted at the Australian rate.
 * Rates are now a table keyed by currency, fetched live, with a clearly dated
 * fallback for when the feed is unreachable.
 */

export type FxTable = {
  /** Every rate is "how many of this currency per 1 NZD". NZD is always 1. */
  rates: Record<string, number>;
  asOf: string;
  /** False when the dated fallback below is in use rather than a live feed. */
  live: boolean;
};

/**
 * Dated fallback. Only used when the rate feed cannot be reached; the UI says
 * so rather than passing stale numbers off as current.
 */
export const FALLBACK_FX: FxTable = {
  rates: { NZD: 1, AUD: 0.91, USD: 0.6, EUR: 0.55, GBP: 0.47, CAD: 0.82, JPY: 92 },
  asOf: '2026-09-16',
  live: false,
};

/** Currencies the ledger can hold, plus everything the app can display in. */
export const FX_SYMBOLS = ['AUD', 'USD', 'EUR', 'GBP', 'CAD', 'JPY'] as const;

/**
 * Convert between any two currencies in the table. Returns null when either
 * side is missing a rate — callers must decide what to show rather than
 * silently emitting a number converted at the wrong rate.
 */
export function convert(
  amount: number,
  from: string,
  to: string,
  fx: FxTable = FALLBACK_FX,
): number | null {
  if (!Number.isFinite(amount)) return null;
  if (from === to) return amount;
  const fromRate = fx.rates[from];
  const toRate = fx.rates[to];
  if (!fromRate || !toRate || fromRate <= 0 || toRate <= 0) return null;
  // Via the NZD base: strip the source rate, apply the target's.
  return (amount / fromRate) * toRate;
}

/** Convert, falling back to the unconverted amount. Only for display paths that
 *  already surface `fx.live === false` to the reader. */
export function convertOr(amount: number, from: string, to: string, fx: FxTable): number {
  const out = convert(amount, from, to, fx);
  return out === null ? amount : out;
}

type FrankfurterResponse = { date?: string; base?: string; rates?: Record<string, number> };

/**
 * Live rates, NZD base. Used by the /api/fx route and the quotes route.
 * Never throws — an unreachable feed yields the dated fallback, flagged.
 */
export async function fetchRates(revalidateSeconds = 3600): Promise<FxTable> {
  try {
    const res = await fetch(
      `https://api.frankfurter.dev/v1/latest?base=NZD&symbols=${FX_SYMBOLS.join(',')}`,
      { next: { revalidate: revalidateSeconds } },
    );
    if (!res.ok) return FALLBACK_FX;
    const json = (await res.json()) as FrankfurterResponse;
    const rates = json.rates;
    if (!rates || typeof rates !== 'object') return FALLBACK_FX;

    const clean: Record<string, number> = { NZD: 1 };
    for (const sym of FX_SYMBOLS) {
      const v = rates[sym];
      if (typeof v === 'number' && v > 0) clean[sym] = v;
    }
    // A table missing everything is no better than the fallback.
    if (Object.keys(clean).length <= 1) return FALLBACK_FX;

    return { rates: clean, asOf: json.date ?? new Date().toISOString().slice(0, 10), live: true };
  } catch {
    return FALLBACK_FX;
  }
}
