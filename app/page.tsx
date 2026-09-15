'use client';

import { useCallback } from 'react';
import { AllocationRing } from '@/components/AllocationRing';
import { CurrencyInput } from '@/components/CurrencyInput';
import {
  centsToDollars,
  formatCents,
  labelPercents,
  toCents,
  widthPercents,
} from '@/lib/money';
import { MAX_ITEMS, sanitizeWealthData } from '@/lib/sanitize';
import { DEFAULT_WEALTH_DATA, STORAGE_KEY, type WealthData } from '@/lib/types';
import { useLocalStorage } from '@/lib/useLocalStorage';

const CASH = '#64d2ff';
const MARKET = '#5e5ce6';
const PROPERTY = '#ffd60a';

export default function WealthDashboard() {
  const { value: data, setValue, clearValue, isHydrated, writeError } = useLocalStorage<WealthData>(
    STORAGE_KEY,
    DEFAULT_WEALTH_DATA,
    sanitizeWealthData,
  );

  const { liquidCash, propertyValue, marketAssets, liabilities } = data;

  const liquidCents = toCents(liquidCash);
  const propertyCents = toCents(propertyValue);
  const marketCents = marketAssets.reduce((sum, item) => sum + toCents(item.value), 0);
  const liabilityCents = liabilities.reduce((sum, item) => sum + toCents(item.value), 0);
  const assetCents = liquidCents + propertyCents + marketCents;
  const netCents = assetCents - liabilityCents;

  const assetValues = [liquidCents, marketCents, propertyCents];
  const [cashPct, marketPct, propertyPct] = labelPercents(assetValues);
  const [cashW, marketW, propertyW] = widthPercents(assetValues);

  const figure = (cents: number) => (isHydrated ? formatCents(cents) : '—');

  const patch = useCallback(
    (updater: (prev: WealthData) => WealthData) => setValue(updater),
    [setValue],
  );

  const addMarket = () =>
    patch((prev) => {
      if (prev.marketAssets.length >= MAX_ITEMS) return prev;
      return {
        ...prev,
        marketAssets: [
          ...prev.marketAssets,
          { id: crypto.randomUUID(), name: 'Portfolio', value: 0 },
        ],
      };
    });

  const addLiability = () =>
    patch((prev) => {
      if (prev.liabilities.length >= MAX_ITEMS) return prev;
      return {
        ...prev,
        liabilities: [
          ...prev.liabilities,
          { id: crypto.randomUUID(), name: 'Loan', value: 0 },
        ],
      };
    });

  const loadDemo = () =>
    patch(() => ({
      liquidCash: 24500,
      propertyValue: 485000,
      marketAssets: [
        { id: crypto.randomUUID(), name: 'VTSAX', value: 187500 },
        { id: crypto.randomUUID(), name: 'Brokerage', value: 42500 },
        { id: crypto.randomUUID(), name: 'Crypto', value: 18500 },
      ],
      liabilities: [
        { id: crypto.randomUUID(), name: 'Mortgage', value: 312000 },
        { id: crypto.randomUUID(), name: 'Student loans', value: 18500 },
        { id: crypto.randomUUID(), name: 'Cards', value: 3200 },
      ],
    }));

  const handleClear = () => {
    if (window.confirm('Clear every figure saved on this device?')) clearValue();
  };

  const downloadBackup = () => {
    const payload = {
      ...data,
      exportedAt: new Date().toISOString(),
    };
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
      <header className="sticky top-0 z-10 border-b border-[rgba(60,60,67,0.08)] bg-[#f5f5f7]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-12 max-w-[720px] items-center justify-between px-5">
          <span className="text-[17px] font-semibold tracking-tight">Wealth</span>
          <span className="text-[13px] text-[#6e6e73]">On this device</span>
        </div>
      </header>

      <main className="mx-auto max-w-[720px] px-5 pb-20 pt-8">
        <div
          className="relative mx-auto aspect-[1.586] w-full max-w-[340px] overflow-hidden rounded-[18px] p-6"
          style={{
            background: 'linear-gradient(155deg, #fbfbfd 0%, #e8e8ed 48%, #d2d2d7 100%)',
            boxShadow: '0 18px 40px rgba(0,0,0,0.10), 0 1px 0 rgba(255,255,255,0.8) inset',
          }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.75)_0%,rgba(255,255,255,0)_46%)]" />
          <div className="relative flex h-full flex-col justify-between">
            <p className="text-[12px] font-semibold tracking-[0.14em] text-[#1d1d1f]/55">WEALTH</p>
            <div>
              <p className="text-[15px] font-medium text-[#1d1d1f]">Personal</p>
              <p className="text-[13px] text-[#6e6e73]">Private · local only</p>
            </div>
          </div>
        </div>

        <section className="mt-8" aria-live="polite">
          <p className="text-[13px] text-[#6e6e73]">Net Worth</p>
          <p className="mt-0.5 min-h-[52px] text-[44px] font-semibold leading-none tracking-[-0.03em] tabular-nums text-[#1d1d1f]">
            {figure(netCents)}
          </p>
          <div className="mt-5 flex gap-10">
            <div>
              <p className="text-[13px] text-[#6e6e73]">Assets</p>
              <p className="mt-0.5 min-h-[22px] text-[17px] font-semibold tabular-nums tracking-tight">
                {figure(assetCents)}
              </p>
            </div>
            <div>
              <p className="text-[13px] text-[#6e6e73]">Liabilities</p>
              <p className="mt-0.5 min-h-[22px] text-[17px] font-semibold tabular-nums tracking-tight">
                {figure(liabilityCents)}
              </p>
            </div>
          </div>
        </section>

        {writeError && (
          <p className="mt-4 text-[13px] text-[#de071c]" role="alert">
            {writeError}
          </p>
        )}

        <section className="mt-8 rounded-[20px] bg-white px-5 py-5">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-[17px] font-semibold tracking-tight">Allocation</h2>
            <span className="text-[13px] tabular-nums text-[#6e6e73]">{figure(assetCents)}</span>
          </div>
          <AllocationRing
            hydrated={isHydrated}
            totalCents={assetCents}
            format={formatCents}
            segments={[
              { label: 'Cash', cents: liquidCents, color: CASH, percent: cashPct, width: cashW },
              { label: 'Markets', cents: marketCents, color: MARKET, percent: marketPct, width: marketW },
              { label: 'Property', cents: propertyCents, color: PROPERTY, percent: propertyPct, width: propertyW },
            ]}
          />
        </section>

        <p className="mb-2 mt-8 px-4 text-[13px] font-semibold text-[#6e6e73]">Assets</p>
        <div className="overflow-hidden rounded-[20px] bg-white">
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

        <p className="mb-2 mt-6 px-4 text-[13px] font-semibold text-[#6e6e73]">Market assets</p>
        <div className="overflow-hidden rounded-[20px] bg-white">
          {marketAssets.length === 0 && (
            <p className="px-4 py-3.5 text-[15px] text-[#86868b]">No portfolios yet</p>
          )}
          {marketAssets.map((item, i) => (
            <div key={item.id}>
              {i > 0 && <Hairline />}
              <EditableRow
                name={item.name}
                cents={toCents(item.value)}
                disabled={!isHydrated}
                onName={(name) =>
                  patch((p) => ({
                    ...p,
                    marketAssets: p.marketAssets.map((row) =>
                      row.id === item.id ? { ...row, name } : row,
                    ),
                  }))
                }
                onCents={(cents) =>
                  patch((p) => ({
                    ...p,
                    marketAssets: p.marketAssets.map((row) =>
                      row.id === item.id ? { ...row, value: centsToDollars(cents) } : row,
                    ),
                  }))
                }
                onRemove={() =>
                  patch((p) => ({
                    ...p,
                    marketAssets: p.marketAssets.filter((row) => row.id !== item.id),
                  }))
                }
              />
            </div>
          ))}
          <Hairline />
          <button
            type="button"
            onClick={addMarket}
            className="flex h-11 w-full items-center px-4 text-left text-[17px] text-[#0071e3]"
          >
            Add portfolio
          </button>
        </div>

        <p className="mb-2 mt-6 px-4 text-[13px] font-semibold text-[#6e6e73]">Liabilities</p>
        <div className="overflow-hidden rounded-[20px] bg-white">
          {liabilities.length === 0 && (
            <p className="px-4 py-3.5 text-[15px] text-[#86868b]">No loans or cards yet</p>
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
            className="flex h-11 w-full items-center px-4 text-left text-[17px] text-[#0071e3]"
          >
            Add liability
          </button>
        </div>

        <section className="mt-6 overflow-hidden rounded-[20px] bg-white">
          <SummaryLine label="Liquid cash" value={figure(liquidCents)} />
          <Hairline />
          <SummaryLine label="Market assets" value={figure(marketCents)} />
          <Hairline />
          <SummaryLine label="Property" value={figure(propertyCents)} />
          <Hairline />
          <SummaryLine label="Total assets" value={figure(assetCents)} strong />
          <Hairline />
          <SummaryLine label="Total liabilities" value={figure(liabilityCents)} />
          <Hairline />
          <SummaryLine label="Net worth" value={figure(netCents)} strong />
        </section>

        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[17px]">
            <button type="button" onClick={loadDemo} className="text-[#0071e3]">
              Load sample
            </button>
            <button type="button" onClick={downloadBackup} className="text-[#0071e3]">
              Download backup
            </button>
            <button type="button" onClick={handleClear} className="text-[#de071c]">
              Clear
            </button>
          </div>
          <p className="max-w-sm text-center text-[12px] leading-relaxed text-[#86868b]">
            Figures are stored only in this browser. Refresh keeps them. Nothing is sent anywhere.
          </p>
        </div>
      </main>
    </div>
  );
}

function Hairline() {
  return <div className="ml-4 h-px bg-[rgba(60,60,67,0.12)]" />;
}

function Row({
  label,
  caption,
  cents,
  onCents,
  disabled,
}: {
  label: string;
  caption: string;
  cents: number;
  onCents: (cents: number) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-[17px] leading-tight">{label}</p>
        <p className="text-[13px] text-[#6e6e73]">{caption}</p>
      </div>
      <CurrencyInput cents={cents} onCentsChange={onCents} ariaLabel={label} disabled={disabled} />
    </div>
  );
}

function EditableRow({
  name,
  cents,
  onName,
  onCents,
  onRemove,
  disabled,
}: {
  name: string;
  cents: number;
  onName: (name: string) => void;
  onCents: (cents: number) => void;
  onRemove: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5">
      <input
        type="text"
        value={name}
        disabled={disabled}
        onChange={(e) => onName(e.target.value.slice(0, 80))}
        aria-label="Name"
        className="min-w-0 flex-1 bg-transparent text-[17px] outline-none placeholder:text-[#c7c7cc] disabled:opacity-40"
        placeholder="Name"
      />
      <CurrencyInput cents={cents} onCentsChange={onCents} ariaLabel={`${name} amount`} disabled={disabled} />
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${name}`}
        className="h-8 w-8 shrink-0 text-[22px] leading-none text-[#c7c7cc] hover:text-[#de071c]"
      >
        ×
      </button>
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
      <span className={`text-[15px] ${strong ? 'font-semibold' : 'text-[#6e6e73]'}`}>{label}</span>
      <span className={`tabular-nums tracking-tight ${strong ? 'text-[17px] font-semibold' : 'text-[15px]'}`}>
        {value}
      </span>
    </div>
  );
}
