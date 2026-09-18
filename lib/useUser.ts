'use client';

import { useEffect, useState } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export type SessionUser = {
  /** Best available human name: full name, else the part before the @. */
  name: string | null;
  firstName: string | null;
  email: string | null;
  /** Two letters for the avatar, derived from whatever name we have. */
  initials: string;
  signedIn: boolean;
  /** False until the first auth read resolves, so nothing flashes. */
  ready: boolean;
};

const EMPTY: SessionUser = {
  name: null,
  firstName: null,
  email: null,
  initials: '',
  signedIn: false,
  ready: false,
};

export function initialsFor(name: string | null, email: string | null): string {
  const source = name ?? email?.split('@')[0] ?? '';
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * The signed-in user, for greeting and avatar only. Google returns the name
 * on the session itself, so this needs no extra round trip — and when Supabase
 * is not configured it stays empty rather than inventing a person.
 */
export function useUser(): SessionUser {
  const configured = isSupabaseConfigured();
  // When Supabase is absent there is no one to look up, so the hook starts in
  // its final state rather than settling into it from an effect.
  const [user, setUser] = useState<SessionUser>(() =>
    configured ? EMPTY : { ...EMPTY, ready: true },
  );

  useEffect(() => {
    if (!configured) return;
    const supabase = createClient();
    let cancelled = false;

    const apply = (session: { user?: { email?: string; user_metadata?: Record<string, unknown> } } | null) => {
      if (cancelled) return;
      const meta = session?.user?.user_metadata ?? {};
      const raw =
        (typeof meta.full_name === 'string' && meta.full_name) ||
        (typeof meta.name === 'string' && meta.name) ||
        null;
      const email = session?.user?.email ?? null;
      const name = raw?.trim() || (email ? email.split('@')[0] : null);
      setUser({
        name,
        firstName: name ? name.split(/\s+/)[0] : null,
        email,
        initials: initialsFor(name, email),
        signedIn: Boolean(session),
        ready: true,
      });
    };

    void supabase.auth.getSession().then(({ data }) => apply(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => apply(session));

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, [configured]);

  return user;
}
