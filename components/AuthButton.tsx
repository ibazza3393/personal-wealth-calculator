'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export function AuthButton() {
  const configured = isSupabaseConfigured();
  const router = useRouter();
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

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/signin');
    router.refresh();
  }

  if (!signedIn) {
    return (
      <Link href="/signin" className="hit text-[13px] text-[var(--blue)]">
        Sign in
      </Link>
    );
  }

  return (
    <button
      type="button"
      className="hit text-[13px] text-[var(--blue)]"
      onClick={() => void signOut()}
    >
      Sign out
    </button>
  );
}
