'use client';

import { usePathname } from 'next/navigation';
import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { sanitizeWealthData } from '@/lib/sanitize';
import {
  DEFAULT_WEALTH_DATA,
  STORAGE_KEY,
  type WealthData,
} from '@/lib/types';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { holdingCents, useQuotes } from '@/lib/useQuotes';

type WealthContextValue = {
  data: WealthData;
  patch: (updater: (prev: WealthData) => WealthData) => void;
  clearValue: () => void;
  isHydrated: boolean;
  writeError: string | null;
  bySymbol: Map<string, ReturnType<typeof useQuotes>['quotes'][number]>;
  quotes: ReturnType<typeof useQuotes>['quotes'];
  quotesAsOf: string | null;
  quotesError: string | null;
  quotesLoading: boolean;
  holdingValue: (h: WealthData['holdings'][number]) => number;
};

const WealthContext = createContext<WealthContextValue | null>(null);

/** Routes that render a price and therefore need the quotes feed. */
const PRICED_ROUTES = ['/dashboard', '/holdings', '/markets', '/forecast'];

export function WealthProvider({ children }: { children: ReactNode }) {
  const { value: data, setValue, clearValue, isHydrated, writeError } = useLocalStorage<WealthData>(
    STORAGE_KEY,
    DEFAULT_WEALTH_DATA,
    sanitizeWealthData,
  );

  const symbols = useMemo(() => {
    const fromHoldings = data.holdings.map((h) => h.symbol).filter(Boolean) as string[];
    return [...new Set(['BTC', 'ETH', 'SPY', 'QQQ', 'AAPL', ...fromHoldings])];
  }, [data.holdings]);

  // Only four pages show a price: the Overview ticker, Holdings, Markets, and
  // Forecast through holdingValue. The rest — Spend, Credit, Equity, Compare,
  // Connections, Connect — were each triggering a quotes request for a figure
  // they never render. Kept as one list here rather than an opt-in call in
  // every page, so a page cannot silently lose its prices by forgetting it.
  const pathname = usePathname();
  const wantsQuotes = PRICED_ROUTES.includes(pathname);

  const { quotes, bySymbol, asOf, error, loading } = useQuotes(
    data.currency,
    symbols,
    wantsQuotes,
  );

  const patch = useCallback(
    (updater: (prev: WealthData) => WealthData) => setValue(updater),
    [setValue],
  );

  const holdingValue = useCallback(
    (h: WealthData['holdings'][number]) => holdingCents(h, bySymbol, data.currency),
    [bySymbol, data.currency],
  );

  const ctx = useMemo(
    () => ({
      data,
      patch,
      clearValue,
      isHydrated,
      writeError,
      bySymbol,
      quotes,
      quotesAsOf: asOf,
      quotesError: error,
      quotesLoading: loading,
      holdingValue,
    }),
    [data, patch, clearValue, isHydrated, writeError, bySymbol, quotes, asOf, error, loading, holdingValue],
  );

  return <WealthContext.Provider value={ctx}>{children}</WealthContext.Provider>;
}

export function useWealth() {
  const ctx = useContext(WealthContext);
  if (!ctx) throw new Error('useWealth must be used within WealthProvider');
  return ctx;
}
