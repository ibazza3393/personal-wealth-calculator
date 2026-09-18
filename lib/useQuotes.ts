'use client';

import { useEffect, useMemo, useState } from 'react';
import { toCents } from '@/lib/money';
import type { Holding } from '@/lib/types';
import type { CurrencyCode } from '@/lib/currency';

export type Quote = {
  symbol: string;
  price: number;
  changePct: number | null;
  source: string;
  /** The currency `price` is in. May differ from the requested display
   *  currency when the server could not convert. */
  currency?: string;
};

export function useQuotes(vs: CurrencyCode, symbols: string[]) {
  const key = symbols
    .map((s) => s.toUpperCase())
    .filter(Boolean)
    .sort()
    .join(',');
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [asOf, setAsOf] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const list = key || 'BTC,ETH,SPY,QQQ,AAPL';
    let cancelled = false;
    fetch(`/api/quotes?vs=${encodeURIComponent(vs)}&symbols=${encodeURIComponent(list)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Quotes unavailable');
        return res.json() as Promise<{ quotes: Quote[]; asOf: string }>;
      })
      .then((data) => {
        if (cancelled) return;
        setQuotes(data.quotes ?? []);
        setAsOf(data.asOf ?? null);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Quotes unavailable');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [vs, key]);

  const bySymbol = useMemo(() => {
    const map = new Map<string, Quote>();
    for (const q of quotes) map.set(q.symbol.toUpperCase(), q);
    return map;
  }, [quotes]);

  return { quotes, bySymbol, asOf, error, loading };
}

/**
 * A quote is only usable for valuation when it is in the currency we are
 * displaying. Multiplying units by a price in another currency is how a
 * NZX ticker used to land in the totals at a US dollar figure.
 */
export function quoteMatches(q: Quote | undefined, displayCurrency: string): q is Quote {
  return Boolean(q && (q.currency === undefined || q.currency === displayCurrency));
}

export function holdingCents(
  holding: Holding,
  bySymbol: Map<string, Quote>,
  displayCurrency: string,
): number {
  const symbol = holding.symbol?.toUpperCase();
  const units = holding.units ?? 0;
  if (symbol && units > 0) {
    const q = bySymbol.get(symbol);
    if (quoteMatches(q, displayCurrency)) return toCents(units * q.price);
  }
  return toCents(holding.value);
}
