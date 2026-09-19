'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { EMPTY_LEDGER, LEDGER_KEY, type LedgerDocument, type Property } from '@/lib/domain';

/** Marks the one-time clearing of the old seeded-sample default. */
const SEED_CLEARED_KEY = 'wealth-seed-cleared-v1';
import { FALLBACK_FX, type FxTable } from '@/lib/fx';
import { buildSnapshot, sanitizeLedger } from '@/lib/ledger';
import { MOCK_LEDGER, isUntouchedMock } from '@/lib/mock';
import { useLocalStorage } from '@/lib/useLocalStorage';

type LedgerContextValue = {
  ledger: LedgerDocument;
  patch: (updater: (prev: LedgerDocument) => LedgerDocument) => void;
  resetMock: () => void;
  clearLedger: () => void;
  isHydrated: boolean;
  writeError: string | null;
  snapshot: ReturnType<typeof buildSnapshot>;
  addProperty: (input: Omit<Property, 'id'>) => void;
  /** Rates behind the snapshot. `live: false` means the dated fallback is in use. */
  fx: FxTable;
};

const LedgerContext = createContext<LedgerContextValue | null>(null);

export function LedgerProvider({ children }: { children: ReactNode }) {
  // An empty ledger, not the sample. Somebody who signs up sees their own
  // figures or none — never a Grey Lynn property they do not own.
  const { value: stored, setValue, isHydrated, writeError } = useLocalStorage<LedgerDocument>(
    LEDGER_KEY,
    EMPTY_LEDGER,
    sanitizeLedger,
  );

  // Browsers that already saved the old default still hold it, so it is cleared
  // once and a flag records that it happened.
  //
  // The flag is the whole point. Without it this is not a migration but a
  // standing rule that the sample fixture may never exist — which silently
  // broke "Reset mock data": the sample was wiped in the same tick it loaded.
  // Run once, then never interfere with what the owner chooses to store.
  const { value: seedCleared, setValue: setSeedCleared } = useLocalStorage<boolean>(
    SEED_CLEARED_KEY,
    false,
  );
  // Gated on isHydrated. Before hydration useLocalStorage deliberately reports
  // the initial value so SSR markup matches, so an ungated check here sees an
  // empty ledger, finds no fixture to clear, and spends the one-time flag
  // without doing anything — leaving the sample in place forever.
  const clearingSeed = isHydrated && !seedCleared && isUntouchedMock(stored);
  const ledger = clearingSeed ? EMPTY_LEDGER : stored;

  useEffect(() => {
    if (!isHydrated || seedCleared) return;
    if (isUntouchedMock(stored)) setValue(() => EMPTY_LEDGER);
    setSeedCleared(() => true);
  }, [isHydrated, seedCleared, stored, setValue, setSeedCleared]);

  const patch = useCallback(
    (updater: (prev: LedgerDocument) => LedgerDocument) => setValue(updater),
    [setValue],
  );

  /** Loads the sample figures on request, from Connections. */
  const resetMock = useCallback(() => setValue(() => MOCK_LEDGER), [setValue]);

  /** Clears everything back to an empty ledger. */
  const clearLedger = useCallback(() => setValue(() => EMPTY_LEDGER), [setValue]);

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
    () => ({ ledger, patch, resetMock, clearLedger, isHydrated, writeError, snapshot, addProperty, fx }),
    [ledger, patch, resetMock, clearLedger, isHydrated, writeError, snapshot, addProperty, fx],
  );

  return <LedgerContext.Provider value={ctx}>{children}</LedgerContext.Provider>;
}

export function useLedger() {
  const ctx = useContext(LedgerContext);
  if (!ctx) throw new Error('useLedger must be used within LedgerProvider');
  return ctx;
}
