'use client';

import { useEffect, useState } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export function AuthButton() {
  const configured = isSupabaseConfigured();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    if (!configured) return;
    const supabase = createClient();
    let cancelled = false;

    void supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setSignedIn(Boolean(data.session));
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, [configured]);

  if (!configured) return null;

  async function signIn() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
  }

  return (
    <button
      type="button"
      className="hit text-[13px] text-[var(--blue)]"
      onClick={() => void (signedIn ? signOut() : signIn())}
    >
      {signedIn ? 'Sign out' : 'Sign in'}
    </button>
  );
}
