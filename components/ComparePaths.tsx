'use client';

import { RateInput, YearsInput } from '@/components/CurrencyInput';
import { Hairline, Row } from '@/components/HoldingsGroup';
import { runCompare } from '@/lib/compare';
import { formatCents, toCents } from '@/lib/money';
import type { CompareInputs } from '@/lib/types';

export function ComparePaths({
  value,
  onChange,
  hydrated,
}: {
  value: CompareInputs;
  onChange: (next: CompareInputs) => void;
  hydrated: boolean;
}) {
  const { columns, rows } = runCompare(value);
  const best = Math.max(...columns.map((p) => p.endingCents));

  const patch = (partial: Partial<CompareInputs>) => onChange({ ...value, ...partial });

  return (
    <section className="mt-12">
      <div className="px-1">
        <h2 className="text-[28px] font-semibold tracking-tight">Compare paths</h2>
        <p className="mt-1 max-w-xl text-[15px] leading-relaxed text-[var(--secondary)]">
          Same starting capital and monthly budget. Housing buys a home. Renting invests what is left
          after rent. S&amp;P 500 invests the cash instead. Illustrative — not advice.
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

      <div className="mt-6 overflow-x-auto rounded-[20px] bg-[var(--elevated)]">
        <table className="w-full min-w-[720px] border-collapse text-[15px]">
          <thead>
            <tr className="border-b border-[var(--separator)]">
              <th className="w-[22%] px-4 py-5 text-left text-[13px] font-semibold text-[var(--secondary)]">
                After {value.years} years
              </th>
              {columns.map((p) => (
                <th key={p.id} className="px-4 py-5 text-left align-bottom">
                  <div className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--secondary)]">
                    {p.title}
                  </div>
                  <div className="mt-1 min-h-[34px] text-[28px] font-semibold tracking-tight tabular-nums">
                    {hydrated ? formatCents(p.endingCents) : '—'}
                  </div>
                  <div className="mt-1 text-[13px] text-[var(--secondary)]">{p.subtitle}</div>
                  {hydrated && p.endingCents === best && best > 0 && (
                    <div className="mt-2 text-[13px] font-medium text-[var(--blue)]">Highest ending</div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-[var(--separator)] last:border-b-0">
                <th className="px-4 py-3 text-left font-normal text-[var(--secondary)]">{row.label}</th>
                {row.cells.map((cell, i) => (
                  <td key={columns[i]?.id ?? i} className="px-4 py-3 tabular-nums tracking-tight">
                    {hydrated ? cell : '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
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
