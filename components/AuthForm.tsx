'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

type Mode = 'signin' | 'signup';

const COPY = {
  signin: {
    heading: 'Welcome back',
    sub: 'Sign in to your private ledger.',
    submit: 'Sign in',
    alt: 'New here?',
    altLink: 'Create an account',
    altHref: '/signup',
  },
  signup: {
    heading: 'Create your account',
    sub: 'Your figures stay yours. Read-only bank access, never passwords.',
    submit: 'Create account',
    alt: 'Already have an account?',
    altLink: 'Sign in',
    altHref: '/signin',
  },
} as const;

/**
 * Sign in and sign up are the same form with different copy and a different
 * call, so they share one component rather than drifting apart.
 *
 * Supabase returns real messages for the failure cases that matter — wrong
 * password, unconfirmed email, weak password — so they are shown as given
 * rather than replaced with a generic "something went wrong", which would
 * leave someone with no idea which of the two fields to change.
 */
export function AuthForm({ mode }: { mode: Mode }) {
  const copy = COPY[mode];
  const router = useRouter();
  const configured = isSupabaseConfigured();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState<null | 'email' | 'google'>(null);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function withGoogle() {
    setError(null);
    setBusy('google');
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (err) {
        setError(err.message);
        setBusy(null);
      }
      // On success the browser leaves for Google, so `busy` stays set.
    } catch {
      setError('Could not reach the sign-in service.');
      setBusy(null);
    }
  }

  async function withEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy('email');
    try {
      const supabase = createClient();
      if (mode === 'signup') {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (err) {
          setError(err.message);
          return;
        }
        // With email confirmation on, Supabase returns a user but no session.
        // Saying so beats dropping the person on a page that looks signed out.
        if (!data.session) {
          setSent(true);
          return;
        }
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) {
          setError(err.message);
          return;
        }
      }
      router.replace('/dashboard');
      router.refresh();
    } catch {
      setError('Could not reach the sign-in service.');
    } finally {
      setBusy(null);
    }
  }

  if (!configured) {
    return (
      <div className="auth-card glass-md">
        <p className="auth-heading">Sign-in is not configured</p>
        <p className="auth-sub">
          This deployment has no Supabase credentials, so there is nothing to sign in to.
        </p>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="auth-card glass-md">
        <p className="auth-heading">Check your email</p>
        <p className="auth-sub">
          We sent a confirmation link to <strong>{email}</strong>. Open it and you will be signed in.
        </p>
        <Link href="/signin" className="auth-alt-link">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-card glass-md">
      <span className="auth-mark" aria-hidden>
        N
      </span>
      <h1 className="auth-heading">{copy.heading}</h1>
      <p className="auth-sub">{copy.sub}</p>

      <button type="button" className="auth-provider" onClick={withGoogle} disabled={busy !== null}>
        <GoogleMark />
        {busy === 'google' ? 'Opening Google…' : 'Continue with Google'}
      </button>

      <div className="auth-divider">
        <span>or</span>
      </div>

      <form className="auth-form" onSubmit={withEmail} noValidate>
        <label className="auth-field">
          <span>Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>

        <label className="auth-field">
          <span>Password</span>
          <span className="auth-password">
            <input
              type={show ? 'text' : 'password'}
              name="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              required
              minLength={mode === 'signup' ? 8 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'}
            />
            <button
              type="button"
              className="auth-reveal"
              onClick={() => setShow((s) => !s)}
              aria-pressed={show}
            >
              {show ? 'Hide' : 'Show'}
            </button>
          </span>
        </label>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="auth-submit" disabled={busy !== null}>
          {busy === 'email' ? 'Working…' : copy.submit}
        </button>
      </form>

      <p className="auth-alt">
        {copy.alt}{' '}
        <Link href={copy.altHref} className="auth-alt-link">
          {copy.altLink}
        </Link>
      </p>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden focusable="false">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9Z" />
      <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6V6.7H1.4a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.7l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z" />
    </svg>
  );
}
