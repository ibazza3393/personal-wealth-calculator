'use client';

import { TrendingUp, Wallet } from 'lucide-react';
import { formatCents } from '@/lib/money';
import type { CurrencyCode } from '@/lib/currency';

export function WealthCard({
  currentCents,
  projectedCents,
  years,
  currency,
}: {
  currentCents: number;
  projectedCents: number;
  years: number;
  currency: CurrencyCode;
}) {
  return (
    <div className="card-stage w-full max-w-[280px] shrink-0">
      <div className="wealth-card glass liquid-glass-chrome relative aspect-[1.586] w-full overflow-hidden rounded-[var(--radius-chrome,20px)] p-5">
        <div className="wealth-card-shine pointer-events-none absolute inset-0" />
        <div className="wealth-card-inner">
          <div className="flex items-center justify-between">
            <p
              className="font-semibold tracking-[0.18em] text-[var(--secondary)]"
              style={{ fontSize: 'var(--text-caption-2)', lineHeight: 'var(--leading-caption-2)' }}
            >
              WEALTH
            </p>
            <Wallet
              size={16}
              strokeWidth={1.75}
              absoluteStrokeWidth
              aria-hidden
              className="text-[var(--secondary)]"
            />
          </div>
          <div className="wealth-card-foot">
            <p className="wealth-card-amount tabular-nums">
              {formatCents(currentCents, currency, 0)}
            </p>
            <p className="wealth-card-projection">
              <TrendingUp size={12} strokeWidth={1.75} absoluteStrokeWidth aria-hidden />
              {years}y · {formatCents(projectedCents, currency, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
