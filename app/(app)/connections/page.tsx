'use client';

import Link from 'next/link';
import { useMemo, useState, type FormEvent } from 'react';
import { AkahuControls } from '@/components/AkahuControls';
import { useLedger } from '@/components/LedgerProvider';
import { formatCents, parseDollars, toCents } from '@/lib/money';
import { mergeAkahuLedger } from '@/lib/providers/akahu-map';
import type { Connection, ConnectionStatus, Country, ValuationSource } from '@/lib/domain';

const STATUS_COPY: Record<ConnectionStatus, string> = {
  active: 'Active',
  consent_expiring: 'Consent expiring',
  needs_reauth: 'Reconnect',
  error: 'Error',
  revoked: 'Revoked',
};

/**
 * Statuses that mean the feed has stopped and the user has to act. Akahu Tier
 * 2 asks for an alert on these rather than a quietly stale number, so they get
 * a banner and a link back into the OAuth flow.
 */
const NEEDS_ACTION: ConnectionStatus[] = ['needs_reauth', 'error', 'revoked'];

const VALUATION_COPY: Record<ValuationSource, string> = {
  council: 'Council CV',
  manual: 'Own estimate',
  homes: 'Homes.co.nz',
  qv: 'QV',
  corelogic: 'CoreLogic',
  domain: 'Domain',
  other: 'Other',
};

/**
 * Councils revalue at least every three years, so a figure older than that has
 * been superseded by a newer public record. Flagged rather than hidden: it is
 * still the owner's number, it just is not the current one.
 */
function isStale(valuedOn: string | null): boolean {
  if (!valuedOn) return false;
  const set = new Date(`${valuedOn}T00:00:00Z`).getTime();
  if (Number.isNaN(set)) return false;
  return Date.now() - set > 3 * 365.25 * 86_400_000;
}

export default function ConnectionsPage() {
  const { ledger, isHydrated, resetMock, addProperty, patch } = useLedger();
  const [address, setAddress] = useState('');
  const [value, setValue] = useState('650000');
  const [country, setCountry] = useState<Country>('NZ');
  // Council rating valuation is the default because it is the one figure here
  // with a public source behind it.
  const [source, setSource] = useState<ValuationSource>('council');
  const [valuedOn, setValuedOn] = useState('');
  const [mortgageId, setMortgageId] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const mortgages = useMemo(
    () => ledger.accounts.filter((a) => a.type === 'mortgage'),
    [ledger.accounts],
  );

  const stale = useMemo(
    () => ledger.connections.filter((c) => NEEDS_ACTION.includes(c.status)),
    [ledger.connections],
  );

  if (!isHydrated) {
    return (
      <main className="pt-4">
        <div className="skeleton h-40" />
      </main>
    );
  }

  async function syncAkahu() {
    setSyncing(true);
    setNotice('Syncing Akahu…');
    try {
      const res = await fetch('/api/akahu/sync', { method: 'POST' });
      const json = (await res.json()) as {
        error?: string;
        needsConnect?: boolean;
        connections?: Parameters<typeof mergeAkahuLedger>[1]['connections'];
        accounts?: Parameters<typeof mergeAkahuLedger>[1]['accounts'];
        count?: number;
      };
      if (!res.ok) {
        // A revoked or absent grant is not a failure to retry — it needs the
        // user to walk the connect flow again, so say that rather than
        // offering a Sync button that cannot work.
        setNotice(
          json.needsConnect
            ? (json.error ?? 'Connect a bank first.')
            : (json.error ?? 'Akahu sync failed.'),
        );
        return;
      }
      if (!json.connections || !json.accounts) {
        setNotice('Akahu returned no accounts.');
        return;
      }
      patch((prev) => mergeAkahuLedger(prev, { connections: json.connections!, accounts: json.accounts! }));
      setNotice(`Synced ${json.count ?? json.accounts.length} NZ accounts. Tokens never left the server.`);
    } catch {
      setNotice('Could not reach the sync endpoint.');
    } finally {
      setSyncing(false);
    }
  }

  /** Revokes one bank at Akahu and drops what that connection produced. */
  async function revokeConnection(id: string, name: string) {
    setNotice(`Disconnecting ${name}…`);
    try {
      const res = await fetch(`/api/akahu/connections/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const json = (await res.json()) as { error?: string; confirmedByAkahu?: boolean };
      if (!res.ok) {
        setNotice(json.error ?? `Could not disconnect ${name}.`);
        return;
      }
      patch((prev) => ({
        ...prev,
        connections: prev.connections.filter((c) => c.id !== id),
        accounts: prev.accounts.filter((a) => a.connection_id !== id),
      }));
      setNotice(
        json.confirmedByAkahu
          ? `${name} disconnected and its data deleted.`
          : `${name}'s data was deleted, but Akahu did not confirm. Check my.akahu.nz.`,
      );
    } catch {
      setNotice('Could not reach the server.');
    }
  }

  function fakeConnectAu() {
    setNotice('AU CDR (Basiq/Fiskil) is stubbed. Consent screens come after NZ Akahu is live for you.');
  }

  function onProperty(e: FormEvent) {
    e.preventDefault();
    const estimated = parseDollars(value);
    if (!address.trim() || estimated <= 0) return;
    addProperty({
      country,
      address: address.trim(),
      estimated_value: estimated,
      currency: country === 'AU' ? 'AUD' : 'NZD',
      valuation_source: source,
      valuation_date: valuedOn || null,
      mortgage_account_id: mortgageId || null,
    });
    setAddress('');
    setValuedOn('');
    setNotice(
      source === 'council' && !valuedOn
        ? 'Property saved. Add the valuation date so the figure can be shown as current or stale.'
        : 'Property saved on this device.',
    );
  }

  return (
    <main className="pt-4 pb-16">
      <p className="mb-4 text-[13px] text-[var(--secondary)]">
        Read-only bank access through Akahu. Your access token is encrypted on our server and never
        reaches this browser.
      </p>

      {stale.length > 0 && (
        <p className="panel mb-4 rounded-[12px] px-4 py-3 text-[13px]" role="alert">
          {stale.length === 1
            ? `${stale[0].institution_name} has stopped syncing.`
            : `${stale.length} connections have stopped syncing.`}{' '}
          <Link href="/connect" className="underline">
            Reconnect
          </Link>{' '}
          to start it again.
        </p>
      )}

      {notice && (
        <p className="panel mb-4 rounded-[12px] px-4 py-3 text-[13px]" role="status">
          {notice}
        </p>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        <button type="button" className="origin-btn" disabled={syncing} onClick={() => void syncAkahu()}>
          {syncing ? 'Syncing…' : 'Sync now'}
        </button>
        <button type="button" className="origin-btn" onClick={fakeConnectAu}>
          Connect AU bank (CDR)
        </button>
        <button type="button" className="origin-btn-ghost" onClick={resetMock}>
          Reset mock data
        </button>
      </div>

      <AkahuControls />

      <section className="panel mt-4 overflow-hidden rounded-[20px]">
        <div className="border-b border-[var(--separator)] px-5 py-3">
          <h2 className="text-[17px] font-semibold">Institutions</h2>
        </div>
        <ul>
          {ledger.connections.map((c) => (
            <ConnectionRow
              key={c.id}
              connection={c}
              onStatus={(status) =>
                patch((prev) => ({
                  ...prev,
                  connections: prev.connections.map((row) => (row.id === c.id ? { ...row, status } : row)),
                }))
              }
              onRevoke={() => void revokeConnection(c.id, c.institution_name)}
            />
          ))}
        </ul>
      </section>

      <section className="panel mt-4 overflow-hidden rounded-[20px]">
        <div className="border-b border-[var(--separator)] px-5 py-3">
          <h2 className="text-[17px] font-semibold">Accounts</h2>
        </div>
        <ul>
          {ledger.accounts.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-3 border-b border-[var(--separator)] px-5 py-3 last:border-0"
            >
              <div>
                <p className="text-[15px] font-medium">{a.name}</p>
                <p className="text-[12px] text-[var(--secondary)]">
                  {a.institution} · {a.country} · {a.type.replace('_', ' ')}
                </p>
              </div>
              <p className="text-[15px] font-semibold tabular-nums">
                {formatCents(toCents(a.current_balance), a.currency, 0)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel mt-4 rounded-[20px] px-5 py-5">
        <h2 className="text-[17px] font-semibold">Manual property</h2>
        <p className="mt-1 text-[13px] text-[var(--secondary)]">
          No live house feed. Mortgage links to a loan account when you have one.
        </p>
        <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={onProperty}>
          <label className="text-[13px] text-[var(--secondary)]">
            Address
            <input
              className="origin-input mt-1"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Suburb, city"
              required
            />
          </label>
          <label className="text-[13px] text-[var(--secondary)]">
            Estimated value
            <input
              className="origin-input mt-1"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              inputMode="decimal"
            />
          </label>
          <label className="text-[13px] text-[var(--secondary)]">
            Country
            <select className="origin-input mt-1" value={country} onChange={(e) => setCountry(e.target.value as Country)}>
              <option value="NZ">New Zealand</option>
              <option value="AU">Australia</option>
            </select>
          </label>
          <label className="text-[13px] text-[var(--secondary)]">
            Source
            <select
              className="origin-input mt-1"
              value={source}
              onChange={(e) => setSource(e.target.value as ValuationSource)}
            >
              <option value="council">Council rating valuation (CV)</option>
              <option value="manual">My own estimate</option>
              <option value="homes">Homes.co.nz</option>
              <option value="qv">QV</option>
              <option value="corelogic">CoreLogic</option>
              <option value="domain">Domain</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="text-[13px] text-[var(--secondary)]">
            Valued on
            <input
              type="date"
              className="origin-input mt-1"
              value={valuedOn}
              onChange={(e) => setValuedOn(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
            />
          </label>
          {source === 'council' && (
            <p className="text-[12px] text-[var(--secondary)] sm:col-span-2">
              Your council sets a rating valuation at least every three years, and it is a public
              record. Look yours up on your council&rsquo;s property search or at{' '}
              <a
                href="https://www.qv.co.nz/property-search/"
                className="underline"
                rel="noreferrer noopener"
                target="_blank"
              >
                qv.co.nz
              </a>
              , then enter the capital value and the date it was set. A CV is a rating figure, not a
              market appraisal — it is usually behind what a house would sell for.
            </p>
          )}
          <label className="text-[13px] text-[var(--secondary)] sm:col-span-2">
            Linked mortgage
            <select className="origin-input mt-1" value={mortgageId} onChange={(e) => setMortgageId(e.target.value)}>
              <option value="">None</option>
              {mortgages.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.institution})
                </option>
              ))}
            </select>
          </label>
          <div className="sm:col-span-2">
            <button type="submit" className="origin-btn">
              Save property
            </button>
          </div>
        </form>
        <ul className="mt-4 divide-y divide-[var(--separator)]">
          {ledger.properties.map((p) => (
            <li key={p.id} className="flex justify-between gap-3 py-3">
              <div>
                <p className="text-[15px] font-medium">{p.address}</p>
                <p className="text-[12px] text-[var(--secondary)]">
                  {p.country} · {VALUATION_COPY[p.valuation_source]}
                  {p.valuation_date ? ` · ${p.valuation_date}` : ''}
                  {isStale(p.valuation_date) ? ' · due a revaluation' : ''}
                  {p.mortgage_account_id ? ' · mortgage linked' : ''}
                </p>
              </div>
              <p className="text-[15px] font-semibold tabular-nums">
                {formatCents(toCents(p.estimated_value), p.currency, 0)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel mt-4 rounded-[20px] px-5 py-5">
        <h2 className="text-[17px] font-semibold">KiwiSaver</h2>
        <p className="mt-1 text-[13px] text-[var(--secondary)]">
          Official NZ open banking does not expose KiwiSaver. This app will not scrape provider logins.
          Use CSV / a statement, or Akahu if they add your provider as a classic connection.
        </p>
        {ledger.accounts
          .filter((a) => a.type === 'kiwi_saver')
          .map((a) => (
            <p key={a.id} className="mt-3 text-[15px] font-medium">
              {a.name}: {formatCents(toCents(a.current_balance), a.currency, 0)}
            </p>
          ))}
      </section>
    </main>
  );
}

function ConnectionRow({
  connection,
  onStatus,
  onRevoke,
}: {
  connection: Connection;
  onStatus: (status: ConnectionStatus) => void;
  onRevoke: () => void;
}) {
  const c = connection;
  const [confirming, setConfirming] = useState(false);
  const needsAction = NEEDS_ACTION.includes(c.status);

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--separator)] px-5 py-3 last:border-0">
      <div>
        <p className="text-[15px] font-medium">{c.institution_name}</p>
        <p className="text-[12px] text-[var(--secondary)]">
          {c.country} · {c.provider} · {c.scopes.replace('_', '-')}
          {c.consent_expires_at ? ` · expires ${c.consent_expires_at.slice(0, 10)}` : ''}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`status-pill status-${c.status}`}>{STATUS_COPY[c.status]}</span>

        {needsAction && (
          <Link href="/connect" className="origin-btn">
            Reconnect
          </Link>
        )}

        {c.status === 'consent_expiring' && (
          <button type="button" className="origin-btn" onClick={() => onStatus('active')}>
            Mark renewed
          </button>
        )}

        {/* Disconnecting is not undoable without the whole OAuth flow, so it
            takes a second press rather than firing on the first. */}
        {confirming ? (
          <>
            <button
              type="button"
              className="origin-btn"
              onClick={() => {
                setConfirming(false);
                onRevoke();
              }}
            >
              Confirm
            </button>
            <button type="button" className="origin-btn-ghost" onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </>
        ) : (
          c.provider === 'akahu' && (
            <button type="button" className="origin-btn-ghost" onClick={() => setConfirming(true)}>
              Disconnect
            </button>
          )
        )}
      </div>
    </li>
  );
}
