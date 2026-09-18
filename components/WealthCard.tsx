'use client';

import { TrendingUp, Wallet } from 'lucide-react';
import { formatCents } from '@/lib/money';
import type { CurrencyCode } from '@/lib/currency';

/**
 * The net-worth card. It keeps the credit-card silhouette, but the middle is
 * no longer hollow: at phone width a strict 1.586 card left a third of its
 * height empty with the figure stranded on the floor, so the amount now sits
 * on the optical centre with what it is made of underneath.
 */
export function WealthCard({
  currentCents,
  projectedCents,
  assetCents,
  liabilityCents,
  years,
  currency,
}: {
  currentCents: number;
  projectedCents: number;
  assetCents: number;
  liabilityCents: number;
  years: number;
  currency: CurrencyCode;
}) {
  const money = (cents: number) => formatCents(cents, currency, 0);

  return (
    <div className="card-stage">
      <div className="wealth-card glass liquid-glass-chrome">
        <div className="wealth-card-shine pointer-events-none absolute inset-0" />
        <div className="wealth-card-inner">
          <div className="wealth-card-top">
            <p className="wealth-card-brand">WEALTH</p>
            <Wallet size={16} strokeWidth={1.75} absoluteStrokeWidth aria-hidden />
          </div>

          <div className="wealth-card-foot">
            <p className="wealth-card-amount tabular-nums">{money(currentCents)}</p>
            <p className="wealth-card-projection">
              <TrendingUp size={12} strokeWidth={1.75} absoluteStrokeWidth aria-hidden />
              {years}y · {money(projectedCents)}
            </p>
          </div>

          <dl className="wealth-card-split">
            <div>
              <dt>Assets</dt>
              <dd className="tabular-nums">{money(assetCents)}</dd>
            </div>
            <div>
              <dt>Owing</dt>
              <dd className="tabular-nums">{money(liabilityCents)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
