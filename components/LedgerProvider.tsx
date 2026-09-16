'use client';

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { LEDGER_KEY, type LedgerDocument, type Property } from '@/lib/domain';
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

  const snapshot = useMemo(() => buildSnapshot(ledger), [ledger]);

  const ctx = useMemo(
    () => ({ ledger, patch, resetMock, isHydrated, writeError, snapshot, addProperty }),
    [ledger, patch, resetMock, isHydrated, writeError, snapshot, addProperty],
  );

  return <LedgerContext.Provider value={ctx}>{children}</LedgerContext.Provider>;
}

export function useLedger() {
  const ctx = useContext(LedgerContext);
  if (!ctx) throw new Error('useLedger must be used within LedgerProvider');
  return ctx;
}
