'use client';

import Link from 'next/link';
import { useLedger } from '@/components/LedgerProvider';
import { formatCents, toCents } from '@/lib/money';

export function ConsentBanner() {
  const { ledger, isHydrated } = useLedger();
  if (!isHydrated) return null;

  const alerts = ledger.connections.filter(
    (c) => c.status === 'consent_expiring' || c.status === 'needs_reauth' || c.status === 'error',
  );
  if (alerts.length === 0) return null;

  return (
    <div className="panel mb-4 rounded-[16px] border-[color-mix(in_srgb,var(--red)_35%,var(--separator))] px-4 py-3">
      {alerts.map((c) => (
        <p key={c.id} className="text-[13px] text-[var(--label)]">
          <span className="font-semibold">{c.institution_name}</span>
          {c.status === 'consent_expiring' && c.consent_expires_at
            ? ` — AU consent expires ${c.consent_expires_at.slice(0, 10)}. `
            : c.status === 'needs_reauth'
              ? ' — reconnect required. '
              : ' — sync error. '}
          <Link href="/connections" className="text-[var(--blue)] underline-offset-2 hover:underline">
            Review connections
          </Link>
        </p>
      ))}
    </div>
  );
}

export function LedgerStrip() {
  const { snapshot, isHydrated, ledger } = useLedger();
  if (!isHydrated) return null;

  const nzd = (n: number) => formatCents(toCents(n), 'NZD', 0);
  const aud = (n: number) => formatCents(toCents(n), 'AUD', 0);

  return (
    <section className="panel rise mb-4 rounded-[26px] px-5 py-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--blue)]">
            ANZ ledger
          </p>
          <p className="mt-1 text-[28px] font-semibold tracking-[-0.03em] tabular-nums">
            {nzd(snapshot.net_worth_nzd)}
          </p>
          <p className="text-[13px] text-[var(--secondary)] tabular-nums">
            {aud(snapshot.net_worth_aud)} · FX {snapshot.fx_rate_nzd_aud} NZD/AUD
          </p>
        </div>
        <p className="text-[12px] text-[var(--tertiary)]">
          {ledger.connections.length} connections · mock until Akahu sandbox
        </p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Mini label="Cash" value={nzd(snapshot.cash)} />
        <Mini label="Investments" value={nzd(snapshot.investments)} />
        <Mini label="KiwiSaver / super" value={nzd(snapshot.super)} />
        <Mini label="Property" value={nzd(snapshot.property)} />
        <Mini label="Other assets" value={nzd(snapshot.other_assets)} />
        <Mini label="Cards" value={nzd(snapshot.credit_cards)} />
        <Mini label="Mortgages" value={nzd(snapshot.mortgages)} />
        <Mini label="Other debts" value={nzd(snapshot.other_liabilities)} />
      </div>
    </section>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[12px] text-[var(--secondary)]">{label}</p>
      <p className="text-[15px] font-semibold tabular-nums">{value}</p>
    </div>
  );
}
