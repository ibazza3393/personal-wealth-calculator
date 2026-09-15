'use client';

import { useCallback, useState, useSyncExternalStore } from 'react';

type Listener = () => void;

const listeners = new Map<string, Set<Listener>>();
const snapshots = new Map<string, { raw: string | null; value: unknown }>();

function emit(key: string) {
  listeners.get(key)?.forEach((listener) => listener());
}

function subscribeKey(key: string, onChange: Listener) {
  let set = listeners.get(key);
  if (!set) {
    set = new Set();
    listeners.set(key, set);
  }
  set.add(onChange);

  const onStorage = (event: StorageEvent) => {
    if (event.key === key || event.key === null) {
      snapshots.delete(key);
      onChange();
    }
  };
  window.addEventListener('storage', onStorage);

  return () => {
    set.delete(onChange);
    window.removeEventListener('storage', onStorage);
  };
}

function readKey<T>(key: string, initialValue: T, sanitize?: (raw: unknown) => T): T {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    const cachedThrow = snapshots.get(key);
    if (cachedThrow && cachedThrow.raw === '__unreadable__') {
      return cachedThrow.value as T;
    }
    snapshots.set(key, { raw: '__unreadable__', value: initialValue });
    return initialValue;
  }

  const cached = snapshots.get(key);
  if (cached && cached.raw === raw) return cached.value as T;

  let value: T = initialValue;
  if (raw !== null) {
    try {
      const parsed: unknown = JSON.parse(raw);
      value = sanitize ? sanitize(parsed) : (parsed as T);
    } catch {
      value = initialValue;
    }
  }

  snapshots.set(key, { raw, value });
  return value;
}

function emptySubscribe() {
  return () => {};
}

/**
 * SSR-safe localStorage hook.
 *
 * Contract:
 * - Server render and the first client hydration pass use `initialValue`
 *   (`getServerSnapshot`), so markup matches and React does not throw.
 * - After hydration, `useSyncExternalStore` reads the real snapshot from
 *   localStorage. Callers must keep figure containers mounted and only swap
 *   the text so this extra pass does not cause layout shift.
 * - Snapshot identity is cached by the raw JSON string so React does not
 *   loop. Writes update localStorage, invalidate, and notify subscribers.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  sanitize?: (raw: unknown) => T,
) {
  const value = useSyncExternalStore(
    (onChange) => subscribeKey(key, onChange),
    () => readKey(key, initialValue, sanitize),
    () => initialValue,
  );

  const isHydrated = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const [writeError, setWriteError] = useState<string | null>(null);

  const setValue = useCallback(
    (update: T | ((val: T) => T)) => {
      const prev = readKey(key, initialValue, sanitize);
      const next = update instanceof Function ? update(prev) : update;
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
        snapshots.delete(key);
        setWriteError(null);
        emit(key);
      } catch (error) {
        const quota =
          error instanceof DOMException &&
          (error.name === 'QuotaExceededError' || error.code === 22);
        setWriteError(
          quota
            ? 'This browser is out of storage space. Your last change may not have been saved.'
            : 'Could not save to this browser.',
        );
        console.error(`Error saving ${key} to localStorage:`, error);
      }
    },
    [key, initialValue, sanitize],
  );

  const clearValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error clearing ${key} from localStorage:`, error);
    }
    snapshots.delete(key);
    setWriteError(null);
    emit(key);
  }, [key]);

  return {
    value,
    setValue,
    clearValue,
    isHydrated,
    writeError,
  } as const;
}
