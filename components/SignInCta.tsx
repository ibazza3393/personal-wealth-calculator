'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

type Props = {
  /** Visual weight. Primary is the filled pill, secondary the glass one. */
  variant?: 'primary' | 'secondary';
  /** Label before we know whether a session exists. */
  label?: string;
  className?: string;
};

/**
 * Sends people to the dashboard after Google sign-in. Someone who already has a
 * session gets a plain link instead of a second round trip through the provider.
 */
export function SignInCta({ variant = 'primary', label = 'Sign in with Google', className }: Props) {
  const configured = isSupabaseConfigured();
  const [signedIn, setSignedIn] = useState(false);
  const [busy, setBusy] = useState(false);

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

  const cls = `cta cta-${variant}${className ? ` ${className}` : ''}`;

  // No Supabase on this host, or already signed in: straight through to the app.
  if (!configured || signedIn) {
    return (
      <Link href="/dashboard" className={cls}>
        {signedIn ? 'Open dashboard' : label}
      </Link>
    );
  }

  async function signIn() {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
    if (error) setBusy(false);
  }

  return (
    <button type="button" className={cls} disabled={busy} onClick={() => void signIn()}>
      {busy ? 'Opening Google…' : label}
    </button>
  );
}
