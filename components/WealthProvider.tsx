'use client';

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

  const { quotes, bySymbol, asOf, error, loading } = useQuotes(data.currency, symbols);

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
