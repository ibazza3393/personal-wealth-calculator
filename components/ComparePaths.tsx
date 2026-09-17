'use client';

import { RateInput, YearsInput } from '@/components/CurrencyInput';
import { Hairline, Row } from '@/components/HoldingsGroup';
import { runCompare } from '@/lib/compare';
import { formatCents, toCents } from '@/lib/money';
import type { CurrencyCode } from '@/lib/currency';
import type { CompareInputs } from '@/lib/types';

export function ComparePaths({
  value,
  onChange,
  hydrated,
  currency,
}: {
  value: CompareInputs;
  onChange: (next: CompareInputs) => void;
  hydrated: boolean;
  currency: CurrencyCode;
}) {
  const { columns, rows } = runCompare(value, currency);
  const best = Math.max(...columns.map((p) => p.endingCents));
  const patch = (partial: Partial<CompareInputs>) => onChange({ ...value, ...partial });

  return (
    <section className="mt-6">
      <div className="px-1">
        <h2 className="text-[28px] font-semibold tracking-tight">Compare paths</h2>
        <p className="mt-1 max-w-xl text-[15px] leading-relaxed text-[var(--secondary)]">
          Same starting capital and monthly budget. Illustrative — not advice.
        </p>
      </div>

      <p className="mb-2 mt-6 px-4 text-[13px] font-semibold text-[var(--secondary)]">Shared inputs</p>
      <div className="overflow-hidden rounded-[20px] bg-[var(--elevated)]">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-[17px] leading-tight">Years</p>
            <p className="text-[13px] text-[var(--secondary)]">How long you stay the course</p>
          </div>
          <YearsInput
            value={value.years}
            onChange={(n) => patch({ years: Math.max(1, n) })}
            ariaLabel="Years"
            disabled={!hydrated}
          />
        </div>
        <Hairline />
        <Row
          label="Starting capital"
          caption="Down payment or investable lump sum"
          cents={toCents(value.lumpSum)}
          onCents={(c) => patch({ lumpSum: c / 100 })}
          disabled={!hydrated}
        />
        <Hairline />
        <Row
          label="Monthly budget"
          caption="What you can put toward housing or investing"
          cents={toCents(value.monthlyBudget)}
          onCents={(c) => patch({ monthlyBudget: c / 100 })}
          disabled={!hydrated}
        />
        <Hairline />
        <Row
          label="Home price"
          caption="Purchase price in the housing path"
          cents={toCents(value.homePrice)}
          onCents={(c) => patch({ homePrice: c / 100 })}
          disabled={!hydrated}
        />
        <Hairline />
        <RateRow
          label="Mortgage rate"
          caption="30-year fixed, annual"
          value={value.mortgageRatePct}
          onChange={(n) => patch({ mortgageRatePct: n })}
          disabled={!hydrated}
        />
        <Hairline />
        <RateRow
          label="Home appreciation"
          caption="Annual"
          value={value.appreciationPct}
          onChange={(n) => patch({ appreciationPct: n })}
          disabled={!hydrated}
        />
        <Hairline />
        <RateRow
          label="Housing costs"
          caption="Tax, insurance, maintenance — % of home value / year"
          value={value.housingCostPct}
          onChange={(n) => patch({ housingCostPct: n })}
          disabled={!hydrated}
        />
        <Hairline />
        <Row
          label="Monthly rent"
          caption="Starting rent in the renting path"
          cents={toCents(value.rentMonthly)}
          onCents={(c) => patch({ rentMonthly: c / 100 })}
          disabled={!hydrated}
        />
        <Hairline />
        <RateRow
          label="Rent inflation"
          caption="Annual"
          value={value.rentInflationPct}
          onChange={(n) => patch({ rentInflationPct: n })}
          disabled={!hydrated}
        />
        <Hairline />
        <RateRow
          label="S&P 500 return"
          caption="Expected annual, before tax"
          value={value.spReturnPct}
          onChange={(n) => patch({ spReturnPct: n })}
          disabled={!hydrated}
        />
      </div>

      <p className="compare-hint" aria-hidden>
        Swipe the table to compare renting and the index →
      </p>

      <div className="compare-scroll panel mt-2 rounded-[24px]">
        <div className="compare-grid">
        <div className="compare-row compare-head">
          <div className="compare-label text-[13px] font-medium text-[var(--secondary)]">
            After {value.years} years
          </div>
          {columns.map((p) => (
            <div key={p.id} className="compare-cell">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--secondary)]">
                {p.title}
              </p>
              <p className="mt-1 text-[22px] font-semibold leading-tight tracking-tight tabular-nums sm:text-[24px]">
                {hydrated ? formatCents(p.endingCents, currency, 0) : '—'}
              </p>
              <p className="mt-1 min-h-[18px] text-[13px] text-[var(--secondary)]">{p.subtitle}</p>
              <p className="mt-1 min-h-[18px] text-[13px] font-medium text-[var(--blue)]">
                {hydrated && p.endingCents === best && best > 0 ? 'Highest ending' : '\u00a0'}
              </p>
            </div>
          ))}
        </div>
        {rows.map((row) => (
          <div key={row.label} className="compare-row">
            <div className="compare-label text-[14px] text-[var(--secondary)]">{row.label}</div>
            {row.cells.map((cell, i) => (
              <div key={columns[i]?.id ?? i} className="compare-cell text-[15px] tabular-nums tracking-tight">
                {hydrated ? cell : '—'}
              </div>
            ))}
          </div>
        ))}
        </div>
      </div>
    </section>
  );
}

function RateRow({
  label,
  caption,
  value,
  onChange,
  disabled,
}: {
  label: string;
  caption: string;
  value: number;
  onChange: (n: number) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-[17px] leading-tight">{label}</p>
        <p className="text-[13px] text-[var(--secondary)]">{caption}</p>
      </div>
      <RateInput value={value} onChange={onChange} ariaLabel={label} disabled={disabled} />
    </div>
  );
}
