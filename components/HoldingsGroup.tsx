'use client';

import { CurrencyInput } from '@/components/CurrencyInput';
import { parseUnits, toCents } from '@/lib/money';
import { MAX_ITEMS } from '@/lib/sanitize';
import type { Holding } from '@/lib/types';

export function Hairline() {
  return <div className="ml-4 h-px bg-[var(--separator)]" />;
}

export function Row({
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
        <p className="text-[13px] text-[var(--secondary)]">{caption}</p>
      </div>
      <CurrencyInput cents={cents} onCentsChange={onCents} ariaLabel={label} disabled={disabled} />
    </div>
  );
}

export function EditableRow({
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
        className="min-w-0 flex-1 bg-transparent text-[17px] text-[var(--label)] outline-none placeholder:text-[var(--tertiary)] disabled:opacity-40"
        placeholder="Name"
      />
      <CurrencyInput cents={cents} onCentsChange={onCents} ariaLabel={`${name} amount`} disabled={disabled} />
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${name}`}
        className="h-8 w-8 shrink-0 text-[22px] leading-none text-[var(--tertiary)] hover:text-[var(--red)]"
      >
        ×
      </button>
    </div>
  );
}

export function PricedRow({
  name,
  symbol,
  units,
  liveLabel,
  fallbackCents,
  onName,
  onSymbol,
  onUnits,
  onCents,
  onRemove,
  disabled,
}: {
  name: string;
  symbol: string;
  units: number;
  liveLabel: string;
  fallbackCents: number;
  onName: (name: string) => void;
  onSymbol: (symbol: string) => void;
  onUnits: (units: number) => void;
  onCents: (cents: number) => void;
  onRemove: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2.5">
      <input
        type="text"
        value={name}
        disabled={disabled}
        onChange={(e) => onName(e.target.value.slice(0, 80))}
        aria-label="Name"
        placeholder="Name"
        className="min-w-[8rem] flex-1 bg-transparent text-[17px] outline-none placeholder:text-[var(--tertiary)]"
      />
      <input
        type="text"
        value={symbol}
        disabled={disabled}
        onChange={(e) => onSymbol(e.target.value.toUpperCase().slice(0, 8))}
        aria-label="Symbol"
        placeholder="BTC"
        className="w-16 bg-transparent text-[13px] font-medium tracking-wide text-[var(--secondary)] outline-none placeholder:text-[var(--tertiary)]"
      />
      <input
        type="text"
        inputMode="decimal"
        value={units ? String(units) : ''}
        disabled={disabled}
        onChange={(e) => onUnits(parseUnits(e.target.value))}
        aria-label="Units"
        placeholder="Units"
        className="w-20 bg-transparent text-right text-[15px] tabular-nums outline-none placeholder:text-[var(--tertiary)]"
      />
      <div className="ml-auto text-right">
        <p className="text-[15px] font-medium tabular-nums">{liveLabel}</p>
        {!units && (
          <CurrencyInput
            cents={fallbackCents}
            onCentsChange={onCents}
            ariaLabel={`${name} amount`}
            disabled={disabled}
          />
        )}
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${name}`}
        className="h-8 w-8 text-[22px] leading-none text-[var(--tertiary)] hover:text-[var(--red)]"
      >
        ×
      </button>
    </div>
  );
}

export function HoldingsGroup({
  title,
  empty,
  add,
  items,
  disabled,
  priced,
  liveLabel,
  onAdd,
  onName,
  onSymbol,
  onUnits,
  onCents,
  onRemove,
}: {
  title: string;
  empty: string;
  add: string;
  items: Holding[];
  disabled: boolean;
  priced?: boolean;
  liveLabel: (item: Holding) => string;
  onAdd: () => void;
  onName: (id: string, name: string) => void;
  onSymbol: (id: string, symbol: string) => void;
  onUnits: (id: string, units: number) => void;
  onCents: (id: string, cents: number) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <>
      <p className="mb-2 mt-6 px-4 text-[13px] font-semibold text-[var(--secondary)]">{title}</p>
      <div className="overflow-hidden rounded-[20px] bg-[var(--elevated)]">
        {items.length === 0 && (
          <p className="px-4 py-3.5 text-[15px] text-[var(--tertiary)]">{empty}</p>
        )}
        {items.map((item, i) => (
          <div key={item.id}>
            {i > 0 && <Hairline />}
            {priced ? (
              <PricedRow
                name={item.name}
                symbol={item.symbol ?? ''}
                units={item.units ?? 0}
                liveLabel={liveLabel(item)}
                fallbackCents={toCents(item.value)}
                disabled={disabled}
                onName={(name) => onName(item.id, name)}
                onSymbol={(symbol) => onSymbol(item.id, symbol)}
                onUnits={(units) => onUnits(item.id, units)}
                onCents={(cents) => onCents(item.id, cents)}
                onRemove={() => onRemove(item.id)}
              />
            ) : (
              <EditableRow
                name={item.name}
                cents={toCents(item.value)}
                disabled={disabled}
                onName={(name) => onName(item.id, name)}
                onCents={(cents) => onCents(item.id, cents)}
                onRemove={() => onRemove(item.id)}
              />
            )}
          </div>
        ))}
        {items.length < MAX_ITEMS && (
          <>
            <Hairline />
            <button
              type="button"
              onClick={onAdd}
              className="flex h-11 w-full items-center px-4 text-left text-[17px] text-[var(--blue)]"
            >
              {add}
            </button>
          </>
        )}
      </div>
    </>
  );
}
