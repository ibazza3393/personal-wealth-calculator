'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { LEDGER_KEY, type LedgerDocument, type Property } from '@/lib/domain';
import { FALLBACK_FX, type FxTable } from '@/lib/fx';
import { buildSnapshot, sanitizeLedger } from '@/lib/ledger';
import { MOCK_LEDGER } from '@/lib/mock';
import { useLocalStorage } from '@/lib/useLocalStorage';

type LedgerContextValue = {
  ledger: LedgerDocument;
  patch: (updater: (prev: LedgerDocument) => LedgerDocument) => void;
  resetMock: () => void;
  isHydrated: boolean;
  writeError: string | null;
  snapshot: ReturnType<typeof buildSnapshot>;
  addProperty: (input: Omit<Property, 'id'>) => void;
  /** Rates behind the snapshot. `live: false` means the dated fallback is in use. */
  fx: FxTable;
};

const LedgerContext = createContext<LedgerContextValue | null>(null);

export function LedgerProvider({ children }: { children: ReactNode }) {
  const { value: ledger, setValue, isHydrated, writeError } = useLocalStorage<LedgerDocument>(
    LEDGER_KEY,
    MOCK_LEDGER,
    sanitizeLedger,
  );

  const patch = useCallback(
    (updater: (prev: LedgerDocument) => LedgerDocument) => setValue(updater),
    [setValue],
  );

  const resetMock = useCallback(() => setValue(() => MOCK_LEDGER), [setValue]);

  const addProperty = useCallback(
    (input: Omit<Property, 'id'>) => {
      patch((prev) => {
        if (prev.properties.length >= 50) return prev;
        return {
          ...prev,
          properties: [...prev.properties, { ...input, id: crypto.randomUUID() }],
        };
      });
    },
    [patch],
  );

  // Net worth mixes NZD, AUD and USD, so it needs real rates rather than the
  // single hardcoded constant this used to carry.
  const [fx, setFx] = useState<FxTable>(FALLBACK_FX);
  useEffect(() => {
    let cancelled = false;
    fetch('/api/fx')
      .then((res) => (res.ok ? (res.json() as Promise<FxTable>) : null))
      .then((table) => {
        if (!cancelled && table?.rates?.NZD) setFx(table);
      })
      .catch(() => {
        /* Keep the dated fallback; the UI reports that it is not live. */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const snapshot = useMemo(() => buildSnapshot(ledger, fx), [ledger, fx]);

  const ctx = useMemo(
    () => ({ ledger, patch, resetMock, isHydrated, writeError, snapshot, addProperty, fx }),
    [ledger, patch, resetMock, isHydrated, writeError, snapshot, addProperty, fx],
  );

  return <LedgerContext.Provider value={ctx}>{children}</LedgerContext.Provider>;
}

export function useLedger() {
  const ctx = useContext(LedgerContext);
  if (!ctx) throw new Error('useLedger must be used within LedgerProvider');
  return ctx;
}
