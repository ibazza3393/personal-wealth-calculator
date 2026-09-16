'use client';

import Link from 'next/link';
import { AllocationRing } from '@/components/AllocationRing';
import { CurrencyInput } from '@/components/CurrencyInput';
import { WealthCard } from '@/components/WealthCard';
import { useWealth } from '@/components/WealthProvider';
import { budgetTotals } from '@/lib/budget';
import { centsToDollars, formatCents, labelPercents, toCents, widthPercents } from '@/lib/money';
import { calcIncomeTax } from '@/lib/tax';
import { EXPENSE_GROUPS, HOLDING_GROUPS, type HoldingKind } from '@/lib/types';

const CASH = '#64d2ff';
const PROPERTY = '#ffd60a';

export default function OverviewPage() {
  const { data, patch, isHydrated, writeError, quotes, quotesAsOf, quotesError, holdingValue } =
    useWealth();
  const {
    liquidCash,
    propertyValue,
    holdings,
    liabilities,
    currency,
    budget,
    taxRegion,
    taxIncome,
    taxDeductions,
  } = data;

  if (!isHydrated) {
    return (
      <main className="mx-auto max-w-[1100px] px-4 pt-8 sm:px-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="skeleton h-48" />
          <div className="skeleton h-48" />
          <div className="skeleton h-28" />
          <div className="skeleton h-28" />
          <div className="skeleton h-40 sm:col-span-2" />
        </div>
      </main>
    );
  }

  const liquidCents = toCents(liquidCash);
  const propertyCents = toCents(propertyValue);
  const byKind = (kind: HoldingKind) =>
    holdings.filter((h) => h.kind === kind).reduce((sum, h) => sum + holdingValue(h), 0);
  const liabilityCents = liabilities.reduce((sum, item) => sum + toCents(item.value), 0);
  const holdingCentsTotal = holdings.reduce((sum, h) => sum + holdingValue(h), 0);
  const assetCents = liquidCents + propertyCents + holdingCentsTotal;
  const netCents = assetCents - liabilityCents;
  const cashflow = budgetTotals(budget);
  const tax = calcIncomeTax({ region: taxRegion, income: taxIncome, deductions: taxDeductions });

  const allocation = [
    { label: 'Cash', cents: liquidCents, color: CASH },
    ...HOLDING_GROUPS.map((g) => ({ label: g.title, cents: byKind(g.kind), color: g.color })),
    { label: 'Property', cents: propertyCents, color: PROPERTY },
  ].filter((s) => s.cents > 0);

  const percents = labelPercents(allocation.map((s) => s.cents));
  const widths = widthPercents(allocation.map((s) => s.cents));
  const segments = allocation.map((s, i) => ({ ...s, percent: percents[i] ?? 0, width: widths[i] ?? 0 }));
  const figure = (cents: number) => formatCents(cents, currency, 0);
  const ticker = quotes.slice(0, 6);
  const topSpend = [...budget.items].sort((a, b) => b.amount - a.amount).slice(0, 3);

  return (
    <main className="mx-auto max-w-[1100px] px-4 pt-6 sm:px-5">
      <section className="rise flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[13px] text-[var(--secondary)]">Net worth</p>
          <p className="mt-1 text-[40px] font-semibold leading-none tracking-[-0.04em] tabular-nums sm:text-[56px]">
            {figure(netCents)}
          </p>
          {writeError && (
            <p className="mt-3 text-[13px] text-[var(--red)]" role="alert">
              {writeError}
            </p>
          )}
        </div>
        <WealthCard />
      </section>

      <div className="rise rise-1 mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Assets" value={figure(assetCents)} />
        <Kpi label="Liabilities" value={figure(liabilityCents)} />
        <Kpi label="Monthly income" value={figure(cashflow.income)} />
        <Kpi label="Savings rate" value={`${Math.round(cashflow.rate * 100)}%`} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="panel rise rise-2 rounded-[20px] px-5 py-5">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-[17px] font-semibold">Markets</h2>
            <span className="text-[12px] text-[var(--tertiary)]">
              {quotesError ? 'Offline' : quotesAsOf ? 'Live' : 'Loading'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {ticker.map((q) => (
              <div key={q.symbol}>
                <p className="text-[12px] font-medium text-[var(--secondary)]">{q.symbol}</p>
                <p className="text-[15px] font-semibold tabular-nums">
                  {formatCents(toCents(q.price), currency, 0)}
                </p>
                <p
                  className={`text-[12px] tabular-nums ${
                    (q.changePct ?? 0) >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'
                  }`}
                >
                  {q.changePct == null ? '—' : `${q.changePct >= 0 ? '+' : ''}${q.changePct.toFixed(1)}%`}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="panel rise rise-2 rounded-[20px] px-5 py-5">
          <h2 className="text-[17px] font-semibold">Tax · {taxRegion}</h2>
          <p className="mt-1 text-[12px] text-[var(--tertiary)]">
            Resident rates, illustrative. Switch AU/NZ in the bar.
          </p>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[var(--secondary)]">Income</span>
              <CurrencyInput
                cents={toCents(taxIncome)}
                ariaLabel="Taxable income"
                onCentsChange={(c) => patch((p) => ({ ...p, taxIncome: centsToDollars(c) }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[var(--secondary)]">Deductions</span>
              <CurrencyInput
                cents={toCents(taxDeductions)}
                ariaLabel="Deductions"
                onCentsChange={(c) => patch((p) => ({ ...p, taxDeductions: centsToDollars(c) }))}
              />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-[14px]">
            <p className="text-[var(--secondary)]">
              Tax <span className="font-medium tabular-nums text-[var(--label)]">{figure(toCents(tax.incomeTax))}</span>
            </p>
            {taxRegion === 'AU' && (
              <p className="text-[var(--secondary)]">
                Medicare <span className="font-medium tabular-nums text-[var(--label)]">{figure(toCents(tax.medicare))}</span>
              </p>
            )}
            <p className="text-[var(--secondary)]">
              Net <span className="font-medium tabular-nums text-[var(--label)]">{figure(toCents(tax.net))}</span>
            </p>
            <p className="text-[var(--secondary)]">
              Effective <span className="font-medium tabular-nums text-[var(--label)]">{Math.round(tax.effective * 1000) / 10}%</span>
            </p>
          </div>
        </section>

        <section className="panel rise rise-3 rounded-[20px] px-5 py-5">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-[17px] font-semibold">Allocation</h2>
            <span className="text-[13px] tabular-nums text-[var(--secondary)]">{figure(assetCents)}</span>
          </div>
          {segments.length === 0 ? (
            <p className="text-[15px] text-[var(--tertiary)]">Add holdings to see the mix.</p>
          ) : (
            <AllocationRing
              hydrated
              totalCents={assetCents}
              format={(c) => formatCents(c, currency, 0)}
              segments={segments}
            />
          )}
        </section>

        <section className="panel rise rise-3 rounded-[20px] px-5 py-5">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-[17px] font-semibold">This month</h2>
            <Link href="/spend" className="text-[13px] text-[var(--blue)]">
              Spend
            </Link>
          </div>
          <div className="flex justify-between text-[15px]">
            <span className="text-[var(--secondary)]">Spent</span>
            <span className="font-medium tabular-nums">{figure(cashflow.spent)}</span>
          </div>
          <div className="mt-2 flex justify-between text-[15px]">
            <span className="text-[var(--secondary)]">Left</span>
            <span className="font-medium tabular-nums">{figure(cashflow.leftover)}</span>
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
              <li className="text-[14px] text-[var(--tertiary)]">No expenses yet.</li>
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
    </main>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel rounded-[16px] px-4 py-3">
      <p className="text-[12px] text-[var(--secondary)]">{label}</p>
      <p className="mt-1 text-[17px] font-semibold tracking-tight tabular-nums">{value}</p>
    </div>
  );
}
