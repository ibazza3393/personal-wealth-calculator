'use client';

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
      <div className="wealth-card glass relative aspect-[1.586] w-full overflow-hidden rounded-[20px] p-5">
        <div className="wealth-card-shine pointer-events-none absolute inset-0" />
        <div className="relative flex h-full flex-col justify-between">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-[var(--secondary)]">WEALTH</p>
          <div>
            <p className="text-[22px] font-semibold tabular-nums tracking-[-0.03em]">
              {formatCents(currentCents, currency, 0)}
            </p>
            <p className="mt-1 text-[12px] text-[var(--secondary)]">
              {years}y · {formatCents(projectedCents, currency, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
