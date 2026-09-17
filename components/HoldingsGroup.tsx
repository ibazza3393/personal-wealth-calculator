'use client';

import { CurrencyInput } from '@/components/CurrencyInput';
import { parseUnits, toCents } from '@/lib/money';
import { MAX_ITEMS } from '@/lib/sanitize';
import type { CurrencyCode } from '@/lib/currency';
import type { Holding } from '@/lib/types';

export function Hairline() {
  return <div className="h-px bg-[var(--separators,#e6e6e6)] dark:bg-[rgba(84,84,88,0.65)]" />;
}

export function Row({
  label,
  caption,
  cents,
  onCents,
  disabled,
  currency = 'USD',
}: {
  label: string;
  caption: string;
  cents: number;
  onCents: (cents: number) => void;
  disabled: boolean;
  currency?: CurrencyCode;
}) {
  return (
    <div className="flex min-h-[68px] items-center gap-4 px-4">
      <div className="min-w-0 flex-1">
        <p className="text-[17px] leading-[22px] tracking-[-0.43px]">{label}</p>
        <p className="text-[13px] leading-[18px] text-[var(--secondary)]">{caption}</p>
      </div>
      <CurrencyInput
        cents={cents}
        currency={currency}
        onCentsChange={onCents}
        ariaLabel={label}
        disabled={disabled}
      />
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
  currency = 'USD',
}: {
  name: string;
  cents: number;
  onName: (name: string) => void;
  onCents: (cents: number) => void;
  onRemove: () => void;
  disabled: boolean;
  currency?: CurrencyCode;
}) {
  return (
    <div className="flex min-h-[52px] items-center gap-4 px-4">
      <input
        type="text"
        value={name}
        disabled={disabled}
        onChange={(e) => onName(e.target.value.slice(0, 80))}
        aria-label="Name"
        className="min-w-0 flex-1 bg-transparent text-[17px] leading-[22px] tracking-[-0.43px] text-[var(--label)] outline-none placeholder:text-[var(--tertiary)] disabled:opacity-40"
        placeholder="Name"
      />
      <CurrencyInput
        cents={cents}
        currency={currency}
        onCentsChange={onCents}
        ariaLabel={`${name} amount`}
        disabled={disabled}
      />
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${name}`}
        className="hit shrink-0 text-[22px] leading-none text-[var(--tertiary)] hover:text-[var(--red)]"
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
  tickerPlaceholder,
  onName,
  onSymbol,
  onUnits,
  onCents,
  onRemove,
  disabled,
  currency,
}: {
  name: string;
  symbol: string;
  units: number;
  liveLabel: string;
  fallbackCents: number;
  tickerPlaceholder: string;
  onName: (name: string) => void;
  onSymbol: (symbol: string) => void;
  onUnits: (units: number) => void;
  onCents: (cents: number) => void;
  onRemove: () => void;
  disabled: boolean;
  currency: CurrencyCode;
}) {
  return (
    <div className="flex min-h-[68px] items-center gap-4 px-4">
      <div className="min-w-0 flex-1">
        <input
          type="text"
          value={name}
          disabled={disabled}
          onChange={(e) => onName(e.target.value.slice(0, 80))}
          aria-label="Name"
          placeholder="Name"
          className="w-full bg-transparent text-[17px] leading-[22px] tracking-[-0.43px] outline-none placeholder:text-[var(--tertiary)]"
        />
        <div className="mt-0.5 flex items-center gap-2 text-[13px] text-[var(--secondary)]">
          <input
            type="text"
            value={symbol}
            disabled={disabled}
            onChange={(e) => onSymbol(e.target.value.toUpperCase().slice(0, 8))}
            aria-label="Symbol"
            placeholder={tickerPlaceholder}
            className="w-16 bg-transparent font-medium tracking-wide outline-none placeholder:text-[var(--tertiary)]"
          />
          <span aria-hidden>·</span>
          <input
            type="text"
            inputMode="decimal"
            value={units ? String(units) : ''}
            disabled={disabled}
            onChange={(e) => onUnits(parseUnits(e.target.value))}
            aria-label="Units"
            placeholder="0"
            className="w-16 bg-transparent tabular-nums outline-none placeholder:text-[var(--tertiary)]"
          />
          <span>sh</span>
        </div>
      </div>
      <div className="text-right">
        {units ? (
          <p className="text-[17px] leading-[22px] tabular-nums tracking-[-0.43px]">{liveLabel}</p>
        ) : (
          <CurrencyInput
            cents={fallbackCents}
            currency={currency}
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
        className="hit shrink-0 text-[22px] leading-none text-[var(--tertiary)] hover:text-[var(--red)]"
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
  tickerPlaceholder,
  currency,
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
  tickerPlaceholder: string;
  currency: CurrencyCode;
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
      <p className="mb-2 mt-6 text-[13px] font-semibold leading-[18px] text-[var(--secondary)]">{title}</p>
      <div className="overflow-hidden rounded-[26px] bg-[var(--elevated)]">
        {items.length === 0 && <p className="px-4 py-3.5 text-[15px] text-[var(--tertiary)]">{empty}</p>}
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
                tickerPlaceholder={tickerPlaceholder}
                currency={currency}
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
                currency={currency}
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
            {items.length > 0 && <Hairline />}
            <button
              type="button"
              onClick={onAdd}
              className="flex h-[52px] w-full items-center px-4 text-left text-[17px] leading-[22px] text-[var(--blue)]"
            >
              {add}
            </button>
          </>
        )}
      </div>
    </>
  );
}
