'use client';

import { ForecastChart, type ForecastPoint } from '@/components/ForecastChart';
import { SectionHero, SheetStat } from '@/components/SectionHero';
import { useWealth } from '@/components/WealthProvider';
import { budgetTotals } from '@/lib/budget';
import { formatCents, toCents } from '@/lib/money';
import { projectNetCents } from '@/lib/project';

const HORIZONS = [10, 20, 30] as const;

export default function ForecastPage() {
  const { data, patch, isHydrated, holdingValue } = useWealth();
  const { currency, liquidCash, propertyValue, holdings, liabilities, budget, compare } = data;

  const assetCents =
    toCents(liquidCash) +
    toCents(propertyValue) +
    holdings.reduce((sum, h) => sum + holdingValue(h), 0);
  const debtCents = liabilities.reduce((sum, l) => sum + toCents(l.value), 0);
  const netCents = assetCents - debtCents;

  const cashflow = budgetTotals(budget);
  // Only a real, entered savings figure drives the curve. Falling back to a
  // default would be inventing the number this page exists to show.
  const monthlyCents = cashflow.leftover > 0 ? cashflow.leftover : 0;
  const years = compare.years;
  const ratePct = compare.spReturnPct;

  const figure = (cents: number) => (isHydrated ? formatCents(cents, currency, 0) : '—');

  const hasBase = netCents !== 0 || monthlyCents > 0;

  if (isHydrated && !hasBase) {
    return (
      <main className="pt-4">
        <SectionHero
          tone="ocean"
          lead="See"
          headline="where this ends up"
          sub="Your net worth today, carried forward at a return you choose, on the amount you actually save each month."
          ctaLabel="Add your figures"
          ctaHref="/holdings"
          note="Driven entirely by what you enter. Nothing here is a default or a guess."
        >
          <p className="sh-preview-label">What the forecast needs</p>
          <div className="sh-grid">
            <div className="sh-tile">
              <SheetStat label="Net worth today" value="From Holdings" />
            </div>
            <div className="sh-tile">
              <SheetStat label="Monthly saving" value="From Spend" />
            </div>
          </div>
        </SectionHero>
      </main>
    );
  }

  const points: ForecastPoint[] = Array.from({ length: years + 1 }, (_, year) => ({
    year,
    cents: projectNetCents({ netCents, years: year, annualPct: ratePct, monthlyCents }),
  }));

  const endCents = points[points.length - 1].cents;
  const contributedCents = monthlyCents * 12 * years;
  const growthCents = endCents - netCents - contributedCents;

  return (
    <main className="pt-4">
      <h1 className="text-[28px] font-semibold tracking-tight">Forecast</h1>
      <p className="mt-1 max-w-xl text-[15px] text-[var(--secondary)]">
        Illustrative only, and not advice. The curve is your net worth compounding at the return
        below, plus what you save each month.
      </p>

      <section className="panel liquid-glass-card mt-6 rounded-[26px] px-5 py-5">
        <div className="fc-hero">
          <div>
            <p className="hero-caption">After {years} years</p>
            <p className="hero-current tabular-nums">{figure(endCents)}</p>
          </div>
          <div className="year-row" role="group" aria-label="Forecast horizon">
            {HORIZONS.map((y) => (
              <button
                key={y}
                type="button"
                className={`year-chip${years === y ? ' is-on' : ''}`}
                onClick={() => patch((p) => ({ ...p, compare: { ...p.compare, years: y } }))}
              >
                {y}y
              </button>
            ))}
          </div>
        </div>

        <ForecastChart points={points} format={(c) => formatCents(c, currency, 0)} />
      </section>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile label="Starting net worth" value={figure(netCents)} />
        <Tile label="You add" value={figure(contributedCents)} />
        <Tile label="Growth" value={figure(growthCents)} />
        <Tile label="Saving / month" value={figure(monthlyCents)} />
      </div>

      <section className="panel liquid-glass-card mt-4 rounded-[26px] px-5 py-5">
        <label className="flex items-center justify-between gap-4">
          <span className="text-[15px]">
            Expected annual return
            <span className="block text-[13px] text-[var(--secondary)]">Before tax and inflation</span>
          </span>
          <span className="flex items-baseline gap-1">
            <input
              type="text"
              inputMode="decimal"
              aria-label="Expected annual return"
              className="w-16 bg-transparent text-right text-[17px] tabular-nums outline-none"
              value={String(ratePct)}
              onChange={(e) => {
                const n = Number(e.target.value.replace(/[^0-9.]/g, ''));
                patch((p) => ({
                  ...p,
                  compare: { ...p.compare, spReturnPct: Number.isFinite(n) ? Math.min(30, n) : 0 },
                }));
              }}
            />
            <span className="text-[15px] text-[var(--secondary)]">%</span>
          </span>
        </label>
        {monthlyCents === 0 && (
          <p className="mt-3 text-[13px] text-[var(--tertiary)]">
            No monthly saving yet, so the curve is compounding alone. Add your income and spending
            on the Spend page and it will pick that up.
          </p>
        )}
      </section>
    </main>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel liquid-glass-card rounded-[20px] px-4 py-3">
      <p className="text-[12px] text-[var(--secondary)]">{label}</p>
      <p className="mt-0.5 text-[17px] font-semibold tabular-nums">{value}</p>
    </div>
  );
}
