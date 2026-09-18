'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

type Props = {
  /** Visual weight. Primary is the filled pill, secondary the glass one. */
  variant?: 'primary' | 'secondary';
  /** Label before we know whether a session exists. */
  label?: string;
  /** Where a signed-out visitor goes. Signed-in always goes to the dashboard. */
  href?: string;
  className?: string;
};

/**
 * Sends people into the app. Google is no longer the only way in, so this now
 * links to the auth page that offers both it and email rather than launching
 * one provider directly. Someone who already has a session skips straight to
 * the dashboard instead of being asked to sign in again.
 */
export function SignInCta({
  variant = 'primary',
  label = 'Get started',
  href = '/signup',
  className,
}: Props) {
  const configured = isSupabaseConfigured();
  const [signedIn, setSignedIn] = useState(false);

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

  return (
    <Link href={signedIn ? '/dashboard' : href} className={cls}>
      {signedIn ? 'Open dashboard' : label}
    </Link>
  );
}
