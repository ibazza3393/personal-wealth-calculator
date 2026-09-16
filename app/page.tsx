'use client';

import { useCallback } from 'react';
import { AllocationRing } from '@/components/AllocationRing';
import { ComparePaths } from '@/components/ComparePaths';
import { Hairline, HoldingsGroup, Row, EditableRow } from '@/components/HoldingsGroup';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  centsToDollars,
  formatCents,
  labelPercents,
  toCents,
  widthPercents,
} from '@/lib/money';
import { MAX_ITEMS, sanitizeWealthData } from '@/lib/sanitize';
import {
  DEFAULT_COMPARE,
  DEFAULT_WEALTH_DATA,
  HOLDING_GROUPS,
  STORAGE_KEY,
  type Holding,
  type HoldingKind,
  type WealthData,
} from '@/lib/types';
import { useLocalStorage } from '@/lib/useLocalStorage';

const CASH = '#64d2ff';
const PROPERTY = '#ffd60a';

export default function WealthDashboard() {
  const { value: data, setValue, clearValue, isHydrated, writeError } = useLocalStorage<WealthData>(
    STORAGE_KEY,
    DEFAULT_WEALTH_DATA,
    sanitizeWealthData,
  );

  const { liquidCash, propertyValue, holdings, liabilities, compare } = data;

  const liquidCents = toCents(liquidCash);
  const propertyCents = toCents(propertyValue);
  const byKind = (kind: HoldingKind) =>
    holdings.filter((h) => h.kind === kind).reduce((sum, h) => sum + toCents(h.value), 0);
  const stocksCents = byKind('stocks');
  const bitcoinCents = byKind('bitcoin');
  const cryptoCents = byKind('crypto');
  const bondsCents = byKind('bonds');
  const fundsCents = byKind('funds');
  const retirementCents = byKind('retirement');
  const businessCents = byKind('business');
  const liabilityCents = liabilities.reduce((sum, item) => sum + toCents(item.value), 0);
  const holdingCents = holdings.reduce((sum, h) => sum + toCents(h.value), 0);
  const assetCents = liquidCents + propertyCents + holdingCents;
  const netCents = assetCents - liabilityCents;

  const allocation = [
    { label: 'Cash', cents: liquidCents, color: CASH },
    { label: 'Stocks', cents: stocksCents, color: HOLDING_GROUPS[0].color },
    { label: 'Bitcoin', cents: bitcoinCents, color: HOLDING_GROUPS[1].color },
    { label: 'Crypto', cents: cryptoCents, color: HOLDING_GROUPS[2].color },
    { label: 'Bonds', cents: bondsCents, color: HOLDING_GROUPS[3].color },
    { label: 'Funds', cents: fundsCents, color: HOLDING_GROUPS[4].color },
    { label: 'Retirement', cents: retirementCents, color: HOLDING_GROUPS[5].color },
    { label: 'Business', cents: businessCents, color: HOLDING_GROUPS[6].color },
    { label: 'Property', cents: propertyCents, color: PROPERTY },
  ].filter((s) => s.cents > 0);

  const percents = labelPercents(allocation.map((s) => s.cents));
  const widths = widthPercents(allocation.map((s) => s.cents));
  const segments = allocation.map((s, i) => ({
    ...s,
    percent: percents[i] ?? 0,
    width: widths[i] ?? 0,
  }));

  const figure = (cents: number) => (isHydrated ? formatCents(cents) : '—');

  const patch = useCallback(
    (updater: (prev: WealthData) => WealthData) => setValue(updater),
    [setValue],
  );

  const addHolding = (kind: HoldingKind, name: string) =>
    patch((prev) => {
      if (prev.holdings.filter((h) => h.kind === kind).length >= MAX_ITEMS) return prev;
      const next: Holding = { id: crypto.randomUUID(), kind, name, value: 0 };
      return { ...prev, holdings: [...prev.holdings, next] };
    });

  const addLiability = () =>
    patch((prev) => {
      if (prev.liabilities.length >= MAX_ITEMS) return prev;
      return {
        ...prev,
        liabilities: [...prev.liabilities, { id: crypto.randomUUID(), name: 'Loan', value: 0 }],
      };
    });

  const loadDemo = () =>
    patch(() => ({
      liquidCash: 24500,
      propertyValue: 485000,
      holdings: [
        { id: crypto.randomUUID(), kind: 'stocks', name: 'Individual stocks', value: 42000 },
        { id: crypto.randomUUID(), kind: 'funds', name: 'VTSAX', value: 187500 },
        { id: crypto.randomUUID(), kind: 'bitcoin', name: 'Bitcoin', value: 18500 },
        { id: crypto.randomUUID(), kind: 'bonds', name: 'Treasuries', value: 22000 },
        { id: crypto.randomUUID(), kind: 'retirement', name: 'KiwiSaver', value: 64000 },
      ],
      liabilities: [
        { id: crypto.randomUUID(), name: 'Mortgage', value: 312000 },
        { id: crypto.randomUUID(), name: 'Student loans', value: 18500 },
        { id: crypto.randomUUID(), name: 'Cards', value: 3200 },
      ],
      compare: DEFAULT_COMPARE,
    }));

  const handleClear = () => {
    if (window.confirm('Clear every figure saved on this device?')) clearValue();
  };

  const downloadBackup = () => {
    const payload = { ...data, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wealth-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-[var(--separator)] bg-[color-mix(in_srgb,var(--bg)_80%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex h-12 max-w-[980px] items-center justify-between px-5">
          <span className="text-[17px] font-semibold tracking-tight">Wealth</span>
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-[var(--secondary)]">On this device</span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[980px] px-5 pb-20 pt-8">
        <div
          className="wealth-card relative mx-auto aspect-[1.586] w-full max-w-[340px] overflow-hidden rounded-[18px] p-6"
          style={{ background: 'var(--card-grad)', boxShadow: 'var(--card-shadow)' }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'var(--card-sheen)' }}
          />
          <div className="relative flex h-full flex-col justify-between">
            <p className="text-[12px] font-semibold tracking-[0.14em] text-[var(--label)]/55">WEALTH</p>
            <div>
              <p className="text-[15px] font-medium">Personal</p>
              <p className="text-[13px] text-[var(--secondary)]">Private · local only</p>
            </div>
          </div>
        </div>

        <section className="mt-8" aria-live="polite">
          <p className="text-[13px] text-[var(--secondary)]">Net Worth</p>
          <p className="mt-0.5 min-h-[52px] text-[44px] font-semibold leading-none tracking-[-0.03em] tabular-nums">
            {figure(netCents)}
          </p>
          <div className="mt-5 flex gap-10">
            <div>
              <p className="text-[13px] text-[var(--secondary)]">Assets</p>
              <p className="mt-0.5 min-h-[22px] text-[17px] font-semibold tabular-nums tracking-tight">
                {figure(assetCents)}
              </p>
            </div>
            <div>
              <p className="text-[13px] text-[var(--secondary)]">Liabilities</p>
              <p className="mt-0.5 min-h-[22px] text-[17px] font-semibold tabular-nums tracking-tight">
                {figure(liabilityCents)}
              </p>
            </div>
          </div>
        </section>

        {writeError && (
          <p className="mt-4 text-[13px] text-[var(--red)]" role="alert">
            {writeError}
          </p>
        )}

        <section className="mt-8 rounded-[20px] bg-[var(--elevated)] px-5 py-5">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-[17px] font-semibold tracking-tight">Allocation</h2>
            <span className="text-[13px] tabular-nums text-[var(--secondary)]">{figure(assetCents)}</span>
          </div>
          {segments.length === 0 ? (
            <p className="text-[15px] text-[var(--tertiary)]">Add assets to see the mix.</p>
          ) : (
            <AllocationRing
              hydrated={isHydrated}
              totalCents={assetCents}
              format={formatCents}
              segments={segments}
            />
          )}
        </section>

        <p className="mb-2 mt-8 px-4 text-[13px] font-semibold text-[var(--secondary)]">Core</p>
        <div className="overflow-hidden rounded-[20px] bg-[var(--elevated)]">
          <Row
            label="Liquid cash"
            caption="Checking, savings, cash"
            cents={liquidCents}
            onCents={(cents) => patch((p) => ({ ...p, liquidCash: centsToDollars(cents) }))}
            disabled={!isHydrated}
          />
          <Hairline />
          <Row
            label="Property"
            caption="Estimated market value"
            cents={propertyCents}
            onCents={(cents) => patch((p) => ({ ...p, propertyValue: centsToDollars(cents) }))}
            disabled={!isHydrated}
          />
        </div>

        {HOLDING_GROUPS.map((group) => (
          <HoldingsGroup
            key={group.kind}
            title={group.title}
            empty={group.empty}
            add={group.add}
            items={holdings.filter((h) => h.kind === group.kind)}
            disabled={!isHydrated}
            onAdd={() => addHolding(group.kind, group.title.replace(/s$/, ''))}
            onName={(id, name) =>
              patch((p) => ({
                ...p,
                holdings: p.holdings.map((row) => (row.id === id ? { ...row, name } : row)),
              }))
            }
            onCents={(id, cents) =>
              patch((p) => ({
                ...p,
                holdings: p.holdings.map((row) =>
                  row.id === id ? { ...row, value: centsToDollars(cents) } : row,
                ),
              }))
            }
            onRemove={(id) =>
              patch((p) => ({
                ...p,
                holdings: p.holdings.filter((row) => row.id !== id),
              }))
            }
          />
        ))}

        <p className="mb-2 mt-6 px-4 text-[13px] font-semibold text-[var(--secondary)]">Liabilities</p>
        <div className="overflow-hidden rounded-[20px] bg-[var(--elevated)]">
          {liabilities.length === 0 && (
            <p className="px-4 py-3.5 text-[15px] text-[var(--tertiary)]">No loans or cards yet</p>
          )}
          {liabilities.map((item, i) => (
            <div key={item.id}>
              {i > 0 && <Hairline />}
              <EditableRow
                name={item.name}
                cents={toCents(item.value)}
                disabled={!isHydrated}
                onName={(name) =>
                  patch((p) => ({
                    ...p,
                    liabilities: p.liabilities.map((row) =>
                      row.id === item.id ? { ...row, name } : row,
                    ),
                  }))
                }
                onCents={(cents) =>
                  patch((p) => ({
                    ...p,
                    liabilities: p.liabilities.map((row) =>
                      row.id === item.id ? { ...row, value: centsToDollars(cents) } : row,
                    ),
                  }))
                }
                onRemove={() =>
                  patch((p) => ({
                    ...p,
                    liabilities: p.liabilities.filter((row) => row.id !== item.id),
                  }))
                }
              />
            </div>
          ))}
          <Hairline />
          <button
            type="button"
            onClick={addLiability}
            className="flex h-11 w-full items-center px-4 text-left text-[17px] text-[var(--blue)]"
          >
            Add liability
          </button>
        </div>

        <section className="mt-6 overflow-hidden rounded-[20px] bg-[var(--elevated)]">
          <SummaryLine label="Liquid cash" value={figure(liquidCents)} />
          <Hairline />
          <SummaryLine label="Stocks" value={figure(stocksCents)} />
          <Hairline />
          <SummaryLine label="Bitcoin" value={figure(bitcoinCents)} />
          <Hairline />
          <SummaryLine label="Other crypto" value={figure(cryptoCents)} />
          <Hairline />
          <SummaryLine label="Bonds" value={figure(bondsCents)} />
          <Hairline />
          <SummaryLine label="Funds" value={figure(fundsCents)} />
          <Hairline />
          <SummaryLine label="Retirement" value={figure(retirementCents)} />
          <Hairline />
          <SummaryLine label="Business" value={figure(businessCents)} />
          <Hairline />
          <SummaryLine label="Property" value={figure(propertyCents)} />
          <Hairline />
          <SummaryLine label="Total assets" value={figure(assetCents)} strong />
          <Hairline />
          <SummaryLine label="Total liabilities" value={figure(liabilityCents)} />
          <Hairline />
          <SummaryLine label="Net worth" value={figure(netCents)} strong />
        </section>

        <ComparePaths
          value={compare}
          hydrated={isHydrated}
          onChange={(next) => patch((p) => ({ ...p, compare: next }))}
        />

        <div className="mt-10 flex flex-col items-center gap-3">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[17px]">
            <button type="button" onClick={loadDemo} className="text-[var(--blue)]">
              Load sample
            </button>
            <button type="button" onClick={downloadBackup} className="text-[var(--blue)]">
              Download backup
            </button>
            <button type="button" onClick={handleClear} className="text-[var(--red)]">
              Clear
            </button>
          </div>
          <p className="max-w-sm text-center text-[12px] leading-relaxed text-[var(--tertiary)]">
            Figures stay in this browser. Bitcoin and funds are USD values you enter — nothing is
            fetched or uploaded.
          </p>
        </div>
      </main>
    </div>
  );
}

function SummaryLine({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className={`text-[15px] ${strong ? 'font-semibold' : 'text-[var(--secondary)]'}`}>{label}</span>
      <span className={`tabular-nums tracking-tight ${strong ? 'text-[17px] font-semibold' : 'text-[15px]'}`}>
        {value}
      </span>
    </div>
  );
}
