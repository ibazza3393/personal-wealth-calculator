'use client';

import { AllocationRing } from '@/components/AllocationRing';
import { WealthCard } from '@/components/WealthCard';
import { useWealth } from '@/components/WealthProvider';
import { formatCents, labelPercents, toCents, widthPercents } from '@/lib/money';
import { HOLDING_GROUPS, type HoldingKind } from '@/lib/types';

const CASH = '#64d2ff';
const PROPERTY = '#ffd60a';

export default function OverviewPage() {
  const { data, isHydrated, writeError, quotes, quotesAsOf, quotesError, holdingValue } = useWealth();
  const { liquidCash, propertyValue, holdings, liabilities, currency } = data;

  const liquidCents = toCents(liquidCash);
  const propertyCents = toCents(propertyValue);
  const byKind = (kind: HoldingKind) =>
    holdings.filter((h) => h.kind === kind).reduce((sum, h) => sum + holdingValue(h), 0);
  const liabilityCents = liabilities.reduce((sum, item) => sum + toCents(item.value), 0);
  const holdingCentsTotal = holdings.reduce((sum, h) => sum + holdingValue(h), 0);
  const assetCents = liquidCents + propertyCents + holdingCentsTotal;
  const netCents = assetCents - liabilityCents;

  const allocation = [
    { label: 'Cash', cents: liquidCents, color: CASH },
    ...HOLDING_GROUPS.map((g) => ({ label: g.title, cents: byKind(g.kind), color: g.color })),
    { label: 'Property', cents: propertyCents, color: PROPERTY },
  ].filter((s) => s.cents > 0);

  const percents = labelPercents(allocation.map((s) => s.cents));
  const widths = widthPercents(allocation.map((s) => s.cents));
  const segments = allocation.map((s, i) => ({ ...s, percent: percents[i] ?? 0, width: widths[i] ?? 0 }));
  const figure = (cents: number) => (isHydrated ? formatCents(cents, currency) : '—');
  const ticker = quotes.slice(0, 5);

  return (
    <main className="mx-auto max-w-[1100px] px-4 pt-6 sm:px-5">
      <div className="duo-split">
        <div className="rise">
          <WealthCard />
          <section className="mt-6 sm:mt-8" aria-live="polite">
            <p className="text-[13px] text-[var(--secondary)]">Net Worth</p>
            <p className="mt-0.5 min-h-[48px] text-[36px] font-semibold leading-none tracking-[-0.03em] tabular-nums sm:min-h-[52px] sm:text-[44px]">
              {figure(netCents)}
            </p>
            <div className="mt-5 flex gap-8 sm:gap-10">
              <div>
                <p className="text-[13px] text-[var(--secondary)]">Assets</p>
                <p className="mt-0.5 text-[17px] font-semibold tabular-nums">{figure(assetCents)}</p>
              </div>
              <div>
                <p className="text-[13px] text-[var(--secondary)]">Liabilities</p>
                <p className="mt-0.5 text-[17px] font-semibold tabular-nums">{figure(liabilityCents)}</p>
              </div>
            </div>
          </section>
          {writeError && (
            <p className="mt-4 text-[13px] text-[var(--red)]" role="alert">
              {writeError}
            </p>
          )}
        </div>

        <div>
          <section className="rise rise-2 mt-6 overflow-x-auto overscroll-x-contain rounded-[20px] bg-[var(--elevated)] px-5 py-4 sm:mt-0">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 className="text-[15px] font-semibold">Markets</h2>
              <span className="text-[12px] text-[var(--tertiary)]">
                {quotesError ? 'Quotes offline' : quotesAsOf ? 'Live' : 'Loading'}
              </span>
            </div>
            <div className="flex snap-x gap-6 overflow-x-auto pb-1">
              {ticker.map((q) => (
                <div key={q.symbol} className="min-w-[92px] snap-start">
                  <p className="text-[12px] font-medium text-[var(--secondary)]">{q.symbol}</p>
                  <p className="tabular-nums text-[15px] font-semibold">
                    {formatCents(toCents(q.price), currency)}
                  </p>
                  <p
                    className={`text-[12px] tabular-nums ${
                      (q.changePct ?? 0) >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'
                    }`}
                  >
                    {q.changePct == null ? '—' : `${q.changePct >= 0 ? '+' : ''}${q.changePct.toFixed(2)}%`}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rise rise-3 mt-6 rounded-[20px] bg-[var(--elevated)] px-5 py-5">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-[17px] font-semibold tracking-tight">Allocation</h2>
              <span className="text-[13px] tabular-nums text-[var(--secondary)]">{figure(assetCents)}</span>
            </div>
            {segments.length === 0 ? (
              <p className="text-[15px] text-[var(--tertiary)]">Add holdings to see the mix.</p>
            ) : (
              <AllocationRing
                hydrated={isHydrated}
                totalCents={assetCents}
                format={(c) => formatCents(c, currency)}
                segments={segments}
              />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
