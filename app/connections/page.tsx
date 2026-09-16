'use client';

import { useMemo, useState, type FormEvent } from 'react';
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

export default function ConnectionsPage() {
  const { ledger, isHydrated, resetMock, addProperty, patch } = useLedger();
  const [address, setAddress] = useState('');
  const [value, setValue] = useState('650000');
  const [country, setCountry] = useState<Country>('NZ');
  const [source, setSource] = useState<ValuationSource>('manual');
  const [mortgageId, setMortgageId] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const mortgages = useMemo(
    () => ledger.accounts.filter((a) => a.type === 'mortgage'),
    [ledger.accounts],
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
      const res = await fetch('/api/akahu', { method: 'POST' });
      const json = (await res.json()) as {
        error?: string;
        connections?: Parameters<typeof mergeAkahuLedger>[1]['connections'];
        accounts?: Parameters<typeof mergeAkahuLedger>[1]['accounts'];
        count?: number;
      };
      if (!res.ok) {
        setNotice(json.error ?? 'Akahu sync failed.');
        return;
      }
      if (!json.connections || !json.accounts) {
        setNotice('Akahu returned no accounts.');
        return;
      }
      patch((prev) => mergeAkahuLedger(prev, { connections: json.connections!, accounts: json.accounts! }));
      setNotice(`Synced ${json.count ?? json.accounts.length} NZ accounts. Tokens never left the server.`);
    } catch {
      setNotice('Could not reach /api/akahu.');
    } finally {
      setSyncing(false);
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
      mortgage_account_id: mortgageId || null,
    });
    setAddress('');
    setNotice('Property saved on this device.');
  }

  return (
    <main className="pt-4 pb-16">
      <p className="mb-4 text-[13px] text-[var(--secondary)]">
        Single user, read-only. NZ Personal App is free on Akahu. Tokens stay in `.env.local`, never in the browser.
      </p>

      {notice && (
        <p className="panel mb-4 rounded-[12px] px-4 py-3 text-[13px]" role="status">
          {notice}
        </p>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        <button type="button" className="origin-btn" disabled={syncing} onClick={() => void syncAkahu()}>
          Connect NZ bank (Akahu)
        </button>
        <button type="button" className="origin-btn" onClick={fakeConnectAu}>
          Connect AU bank (CDR)
        </button>
        <button type="button" className="origin-btn-ghost" onClick={resetMock}>
          Reset mock data
        </button>
      </div>

      <section className="panel overflow-hidden rounded-[20px]">
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
              <option value="manual">Manual</option>
              <option value="homes">Homes.co.nz</option>
              <option value="qv">QV</option>
              <option value="corelogic">CoreLogic</option>
              <option value="domain">Domain</option>
              <option value="other">Other</option>
            </select>
          </label>
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
                  {p.country} · {p.valuation_source}
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
}: {
  connection: Connection;
  onStatus: (status: ConnectionStatus) => void;
}) {
  const c = connection;
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--separator)] px-5 py-3 last:border-0">
      <div>
        <p className="text-[15px] font-medium">{c.institution_name}</p>
        <p className="text-[12px] text-[var(--secondary)]">
          {c.country} · {c.provider} · {c.scopes.replace('_', '-')}
          {c.consent_expires_at ? ` · expires ${c.consent_expires_at.slice(0, 10)}` : ''}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`status-pill status-${c.status}`}>{STATUS_COPY[c.status]}</span>
        {c.status === 'consent_expiring' && (
          <button type="button" className="origin-btn" onClick={() => onStatus('active')}>
            Mark renewed
          </button>
        )}
        {c.status === 'active' && c.country === 'AU' && (
          <button type="button" className="origin-btn-ghost" onClick={() => onStatus('consent_expiring')}>
            Simulate expiry
          </button>
        )}
      </div>
    </li>
  );
}
