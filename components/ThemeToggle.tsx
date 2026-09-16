'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { THEME_KEY } from '@/lib/types';

type Theme = 'light' | 'dark';

function systemDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function readTheme(): Theme {
  try {
    const saved = window.localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    /* ignore */
  }
  return systemDark() ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const onMq = () => {
    try {
      if (!window.localStorage.getItem(THEME_KEY)) onChange();
    } catch {
      onChange();
    }
  };
  mq.addEventListener('change', onMq);
  return () => {
    listeners.delete(onChange);
    mq.removeEventListener('change', onMq);
  };
}

function emit() {
  listeners.forEach((l) => l());
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => 'light' as Theme);

  const setTheme = useCallback((next: Theme) => {
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      /* ignore */
    }
    applyTheme(next);
    emit();
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return { theme, toggle, setTheme };
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="text-[13px] text-[var(--blue)]"
    >
      {dark ? 'Light' : 'Dark'}
    </button>
  );
}
