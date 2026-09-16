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

export function holdingCents(holding: Holding, bySymbol: Map<string, Quote>): number {
  const symbol = holding.symbol?.toUpperCase();
  const units = holding.units ?? 0;
  if (symbol && units > 0) {
    const q = bySymbol.get(symbol);
    if (q) return toCents(units * q.price);
  }
  return toCents(holding.value);
}
