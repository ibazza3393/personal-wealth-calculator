'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

/**
 * The consumer controls Akahu Tier 2 requires, in one place: what is
 * connected, how to disconnect it, and how to delete the account.
 *
 * Two things are deliberate here.
 *
 * It is always rendered, whatever the user's plan or account state — the
 * requirement is that a consumer can see and withdraw their access
 * unconditionally, so this is not behind a feature flag or a paid tier.
 *
 * And the destructive actions ask first. Revoking is not undoable without
 * walking the whole OAuth flow again, and deleting the account is not undoable
 * at all, so each one takes a second press rather than firing on the first.
 */

type Status = {
  configured: boolean;
  connected: boolean;
  error?: string | null;
};

type Notice = { tone: 'ok' | 'warn'; text: string } | null;

const CALLBACK_NOTICES: Record<string, Notice> = {
  connected: { tone: 'ok', text: 'Bank connected. Sync to pull your accounts in.' },
  cancelled: { tone: 'warn', text: 'Connection cancelled. Nothing was shared.' },
  state: {
    tone: 'warn',
    text: 'That connection link had expired or did not match. Start again from Connect.',
  },
  invalid: { tone: 'warn', text: 'Akahu sent back an incomplete response. Try again.' },
  failed: { tone: 'warn', text: 'Akahu could not complete the connection. Try again.' },
};

export function AkahuControls() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<Status | null>(null);
  const [actionNotice, setNotice] = useState<Notice>(null);
  const [busy, setBusy] = useState<null | 'revoke' | 'delete'>(null);
  const [confirming, setConfirming] = useState<null | 'revoke' | 'delete'>(null);

  // The OAuth callback redirects back here with ?akahu=<outcome>. Derived from
  // the URL rather than copied into state in an effect, so there is one source
  // of truth and no cascading render. Anything the user then does produces an
  // actionNotice, which takes precedence.
  const callbackNotice = CALLBACK_NOTICES[params.get('akahu') ?? ''] ?? null;
  const notice = actionNotice ?? callbackNotice;

  const [reloadStatus, setReloadStatus] = useState(0);
  const refresh = useCallback(() => setReloadStatus((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/akahu', { cache: 'no-store' })
      .then((res) => res.json() as Promise<Status>)
      .then((next) => {
        if (!cancelled) setStatus(next);
      })
      .catch(() => {
        if (!cancelled) setStatus({ configured: false, connected: false });
      });
    return () => {
      cancelled = true;
    };
  }, [reloadStatus]);

  async function revokeAll() {
    setBusy('revoke');
    setConfirming(null);
    try {
      const res = await fetch('/api/akahu/token', { method: 'DELETE' });
      const json = (await res.json()) as { error?: string; confirmedByAkahu?: boolean };
      if (!res.ok) {
        setNotice({ tone: 'warn', text: json.error ?? 'Could not revoke access.' });
        return;
      }
      setNotice({
        tone: 'ok',
        text: json.confirmedByAkahu
          ? 'Access revoked and your bank data deleted.'
          : 'Your bank data was deleted, but Akahu did not confirm the revocation. Check my.akahu.nz.',
      });
      refresh();
      router.refresh();
    } catch {
      setNotice({ tone: 'warn', text: 'Could not reach the server.' });
    } finally {
      setBusy(null);
    }
  }

  async function deleteAccount() {
    setBusy('delete');
    setConfirming(null);
    try {
      const res = await fetch('/api/account', { method: 'DELETE' });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setNotice({ tone: 'warn', text: json.error ?? 'Could not delete your account.' });
        return;
      }
      router.replace('/');
      router.refresh();
    } catch {
      setNotice({ tone: 'warn', text: 'Could not reach the server.' });
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="panel mt-4 rounded-[20px] px-5 py-5">
      <h2 className="text-[17px] font-semibold">Bank access</h2>

      {notice && (
        <p
          className="mt-3 rounded-[12px] px-4 py-3 text-[13px]"
          role="status"
          data-tone={notice.tone}
          style={{ background: 'var(--fill)' }}
        >
          {notice.text}
        </p>
      )}

      {status === null ? (
        <div className="skeleton mt-3 h-10" />
      ) : !status.configured ? (
        <p className="mt-2 text-[13px] text-[var(--secondary)]">
          Akahu is not configured on this deployment.
        </p>
      ) : status.connected ? (
        <>
          <p className="mt-2 text-[15px]">
            Your bank is connected through Akahu, with read-only access that syncs until you stop
            it.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {confirming === 'revoke' ? (
              <>
                <button
                  type="button"
                  className="origin-btn"
                  disabled={busy !== null}
                  onClick={() => void revokeAll()}
                >
                  {busy === 'revoke' ? 'Revoking…' : 'Yes, disconnect and delete'}
                </button>
                <button type="button" className="origin-btn-ghost" onClick={() => setConfirming(null)}>
                  Keep it
                </button>
              </>
            ) : (
              <button
                type="button"
                className="origin-btn-ghost"
                disabled={busy !== null}
                onClick={() => setConfirming('revoke')}
              >
                Disconnect all banks
              </button>
            )}
          </div>
          {confirming === 'revoke' && (
            <p className="mt-2 text-[13px] text-[var(--secondary)]">
              This revokes Next Wealth&rsquo;s access at Akahu and deletes the balances and
              transactions we hold. Your manual figures stay.
            </p>
          )}
        </>
      ) : (
        <>
          <p className="mt-2 text-[15px]">
            {status.error ??
              'No bank connected. Everything you see is what you entered yourself.'}
          </p>
          <Link href="/connect" className="origin-btn mt-4 inline-block">
            Connect a bank
          </Link>
        </>
      )}

      <hr className="my-5 border-[var(--separator)]" />

      <h3 className="text-[15px] font-semibold">Delete your account</h3>
      <p className="mt-1 text-[13px] text-[var(--secondary)]">
        Removes your account and everything stored against it, and revokes your Akahu access at the
        same time. This cannot be undone.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {confirming === 'delete' ? (
          <>
            <button
              type="button"
              className="origin-btn"
              disabled={busy !== null}
              onClick={() => void deleteAccount()}
            >
              {busy === 'delete' ? 'Deleting…' : 'Yes, delete everything'}
            </button>
            <button type="button" className="origin-btn-ghost" onClick={() => setConfirming(null)}>
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            className="origin-btn-ghost"
            disabled={busy !== null}
            onClick={() => setConfirming('delete')}
          >
            Delete account
          </button>
        )}
      </div>
    </section>
  );
}
