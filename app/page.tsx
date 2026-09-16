'use client';

import Link from 'next/link';
import { AllocationRing } from '@/components/AllocationRing';
import { WealthCard } from '@/components/WealthCard';
import { useWealth } from '@/components/WealthProvider';
import { budgetTotals } from '@/lib/budget';
import { formatCents, labelPercents, toCents, widthPercents } from '@/lib/money';
import { EXPENSE_GROUPS, HOLDING_GROUPS, type HoldingKind } from '@/lib/types';

const CASH = '#64d2ff';
const PROPERTY = '#ffd60a';

export default function OverviewPage() {
  const { data, isHydrated, writeError, quotes, quotesAsOf, quotesError, holdingValue } = useWealth();
  const { liquidCash, propertyValue, holdings, liabilities, currency, budget } = data;

  const liquidCents = toCents(liquidCash);
  const propertyCents = toCents(propertyValue);
  const byKind = (kind: HoldingKind) =>
    holdings.filter((h) => h.kind === kind).reduce((sum, h) => sum + holdingValue(h), 0);
  const liabilityCents = liabilities.reduce((sum, item) => sum + toCents(item.value), 0);
  const holdingCentsTotal = holdings.reduce((sum, h) => sum + holdingValue(h), 0);
  const assetCents = liquidCents + propertyCents + holdingCentsTotal;
  const netCents = assetCents - liabilityCents;
  const cashflow = budgetTotals(budget);

  const allocation = [
    { label: 'Cash', cents: liquidCents, color: CASH },
    ...HOLDING_GROUPS.map((g) => ({ label: g.title, cents: byKind(g.kind), color: g.color })),
    { label: 'Property', cents: propertyCents, color: PROPERTY },
  ].filter((s) => s.cents > 0);

  const percents = labelPercents(allocation.map((s) => s.cents));
  const widths = widthPercents(allocation.map((s) => s.cents));
  const segments = allocation.map((s, i) => ({ ...s, percent: percents[i] ?? 0, width: widths[i] ?? 0 }));
  const figure = (cents: number) => (isHydrated ? formatCents(cents, currency) : '—');
  const ticker = quotes.slice(0, 6);
  const topSpend = [...budget.items].sort((a, b) => b.amount - a.amount).slice(0, 4);

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
          </section>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Kpi label="Assets" value={figure(assetCents)} />
            <Kpi label="Liabilities" value={figure(liabilityCents)} />
            <Kpi label="Monthly income" value={figure(cashflow.income)} />
            <Kpi
              label="Savings rate"
              value={isHydrated ? `${Math.round(cashflow.rate * 100)}%` : '—'}
              hint={cashflow.leftover < 0 ? 'Spending above income' : 'Left after spend'}
            />
          </div>
          {writeError && (
            <p className="mt-4 text-[13px] text-[var(--red)]" role="alert">
              {writeError}
            </p>
          )}
        </div>

        <div>
          <section className="panel rise rise-2 mt-6 overflow-hidden rounded-[20px] px-5 py-4 sm:mt-0">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 className="text-[15px] font-semibold">Markets</h2>
              <span className="text-[12px] text-[var(--tertiary)]">
                {quotesError ? 'Quotes offline' : quotesAsOf ? 'Live' : 'Loading'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-3">
              {ticker.map((q) => (
                <div key={q.symbol}>
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

          <section className="panel rise rise-3 mt-4 rounded-[20px] px-5 py-5">
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

          <section className="panel mt-4 rounded-[20px] px-5 py-5">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-[17px] font-semibold tracking-tight">This month</h2>
              <Link href="/spend" className="text-[13px] text-[var(--blue)]">
                Spend
              </Link>
            </div>
            <div className="flex justify-between text-[15px]">
              <span className="text-[var(--secondary)]">Spent</span>
              <span className="tabular-nums font-medium">{figure(cashflow.spent)}</span>
            </div>
            <div className="mt-2 flex justify-between text-[15px]">
              <span className="text-[var(--secondary)]">Left</span>
              <span className="tabular-nums font-medium">{figure(cashflow.leftover)}</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-[var(--blue)]"
                style={{
                  width: `${cashflow.income > 0 ? Math.min(100, Math.round((cashflow.spent / cashflow.income) * 100)) : 0}%`,
                }}
              />
            </div>
            <ul className="mt-4 space-y-2">
              {topSpend.length === 0 && (
                <li className="text-[14px] text-[var(--tertiary)]">No expenses yet — add them in Spend.</li>
              )}
              {topSpend.map((item) => {
                const g = EXPENSE_GROUPS.find((x) => x.kind === item.kind);
                return (
                  <li key={item.id} className="flex justify-between text-[14px]">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: g?.color }} />
                      {item.name}
                    </span>
                    <span className="tabular-nums">{figure(toCents(item.amount))}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="panel rounded-[16px] px-4 py-3">
      <p className="text-[12px] text-[var(--secondary)]">{label}</p>
      <p className="mt-1 text-[17px] font-semibold tabular-nums tracking-tight">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-[var(--tertiary)]">{hint}</p>}
    </div>
  );
}
