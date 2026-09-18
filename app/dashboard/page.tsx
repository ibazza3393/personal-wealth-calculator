'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AllocationRing } from '@/components/AllocationRing';
import { CurrencyInput } from '@/components/CurrencyInput';
import { ConsentBanner, LedgerStrip } from '@/components/LedgerStrip';
import { WealthCard } from '@/components/WealthCard';
import { useWealth } from '@/components/WealthProvider';
import { budgetTotals } from '@/lib/budget';
import { centsToDollars, formatCents, labelPercents, toCents, widthPercents } from '@/lib/money';
import { projectNetCents } from '@/lib/project';
import { calcIncomeTax } from '@/lib/tax';
import { EXPENSE_GROUPS, HOLDING_GROUPS, ONBOARDING_KEY, type HoldingKind } from '@/lib/types';


export default function OverviewPage() {
  const router = useRouter();
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

  // A first-time visitor with an empty ledger goes through onboarding rather
  // than meeting a dashboard of zeros. The answer lives in local storage, so it
  // can only be known after hydration — but it is computed during render, not
  // after it, so the dashboard never paints a frame before the redirect.
  const empty =
    !data.liquidCash &&
    !data.propertyValue &&
    data.holdings.length === 0 &&
    data.liabilities.length === 0 &&
    !data.budget.monthlyIncome;

  let onboarded = true;
  try {
    onboarded =
      typeof window === 'undefined' || window.localStorage.getItem(ONBOARDING_KEY) === 'done';
  } catch {
    /* Storage blocked — never trap the user in onboarding. */
  }
  const needsOnboarding = isHydrated && empty && !onboarded;

  useEffect(() => {
    if (needsOnboarding) router.replace('/welcome');
  }, [needsOnboarding, router]);

  // Holding the skeleton through the redirect is what removes the flash of a
  // fully-rendered dashboard of zeros before onboarding takes over.
  if (!isHydrated || needsOnboarding) {
    return (
      <main className="pt-4">
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
  const monthlySave = cashflow.leftover > 0 ? cashflow.leftover : toCents(data.compare.monthlyBudget);
  const projectedCents = projectNetCents({
    netCents,
    years: data.compare.years,
    annualPct: data.compare.spReturnPct,
    monthlyCents: monthlySave,
  });
  const tax = calcIncomeTax({ region: taxRegion, income: taxIncome, deductions: taxDeductions });

  // Four fixed groups, in a fixed order. Seven classes in one ring produced
  // slivers a few pixels wide; the per-class detail is kept as sub-rows under
  // whichever group owns it, where the label carries the identity.
  const investRows = HOLDING_GROUPS.filter((g) => g.kind !== 'business').map((g) => ({
    label: g.title,
    cents: byKind(g.kind),
  }));
  const investCents = investRows.reduce((sum, r) => sum + r.cents, 0);
  const businessCents = byKind('business');

  const grouped = [
    { key: 'cash', label: 'Cash', cents: liquidCents, rows: [] as { label: string; cents: number }[] },
    {
      key: 'invest',
      label: 'Investments',
      cents: investCents,
      rows: investRows.filter((r) => r.cents > 0),
    },
    { key: 'property', label: 'Property', cents: propertyCents, rows: [] },
    {
      key: 'other',
      label: 'Other assets',
      cents: businessCents,
      rows: businessCents > 0 ? [{ label: 'Business', cents: businessCents }] : [],
    },
  ].filter((g) => g.cents > 0);

  const percents = labelPercents(grouped.map((g) => g.cents));
  const widths = widthPercents(grouped.map((g) => g.cents));
  const allocGroups = grouped.map((g, i) => ({
    ...g,
    percent: percents[i] ?? 0,
    width: widths[i] ?? 0,
  }));
  const figure = (cents: number) => formatCents(cents, currency, 0);
  const ticker = quotes.slice(0, 6);
  const topSpend = [...budget.items].sort((a, b) => b.amount - a.amount).slice(0, 3);

  return (
    <main className="pt-4">
      <section className="hero-stack">
        <div className="hero-figures">
          <div>
            <p className="hero-caption">Current net worth</p>
            <p className="hero-current tabular-nums">{figure(netCents)}</p>
          </div>
          <div>
            <p className="hero-caption">Projected · {data.compare.years} years</p>
            <p className="hero-projected tabular-nums">{figure(projectedCents)}</p>
            <div className="year-row" role="group" aria-label="Projection horizon">
              {[5, 10, 20, 30].map((y) => (
                <button
                  key={y}
                  type="button"
                  className={`year-chip${data.compare.years === y ? ' is-on' : ''}`}
                  onClick={() => patch((p) => ({ ...p, compare: { ...p.compare, years: y } }))}
                >
                  {y}y
                </button>
              ))}
            </div>
          </div>
        </div>
        <WealthCard
          currentCents={netCents}
          projectedCents={projectedCents}
          assetCents={assetCents}
          liabilityCents={liabilityCents}
          years={data.compare.years}
          currency={currency}
        />
      </section>
      {writeError && (
        <p className="mt-4 text-[13px] text-[var(--red)]" role="alert">
          {writeError}
        </p>
      )}

      <div className="mt-6">
        <ConsentBanner />
        <LedgerStrip />
      </div>

      <div className="rise rise-1 mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Assets" value={figure(assetCents)} />
        <Kpi label="Liabilities" value={figure(liabilityCents)} />
        <Kpi label="Monthly income" value={figure(cashflow.income)} />
        <Kpi label="Savings rate" value={`${Math.round(cashflow.rate * 100)}%`} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="panel liquid-glass-card rise rise-2 rounded-[26px] px-5 py-5">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-[17px] font-semibold">Markets</h2>
            <span className="text-[12px] text-[var(--tertiary)]">
              {quotesError ? 'Offline' : quotesAsOf ? 'Live' : 'Loading'}
            </span>
          </div>
          {ticker.length === 0 ? (
            <p className="text-[15px] text-[var(--tertiary)]">
              {quotesError
                ? 'Prices are unavailable right now. Holdings priced from a ticker are left out of the totals above.'
                : 'Fetching prices…'}
            </p>
          ) : (
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
          )}
        </section>

        <section className="panel liquid-glass-card rise rise-2 rounded-[26px] px-5 py-5">
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

        <section className="panel liquid-glass-card rise rise-3 rounded-[26px] px-5 py-5">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-[17px] font-semibold">Allocation</h2>
            <span className="text-[13px] tabular-nums text-[var(--secondary)]">{figure(assetCents)}</span>
          </div>
          {allocGroups.length === 0 ? (
            <p className="text-[15px] text-[var(--tertiary)]">Add holdings to see the mix.</p>
          ) : (
            <AllocationRing
              hydrated
              totalCents={assetCents}
              format={(c) => formatCents(c, currency, 0)}
              groups={allocGroups}
            />
          )}
        </section>

        <section className="panel liquid-glass-card rise rise-3 rounded-[26px] px-5 py-5">
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
    <div className="panel liquid-glass-card rounded-[26px] px-4 py-3">
      <p className="text-[12px] text-[var(--secondary)]">{label}</p>
      <p className="mt-1 text-[17px] font-semibold tracking-tight tabular-nums">{value}</p>
    </div>
  );
}
