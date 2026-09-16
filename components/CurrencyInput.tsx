'use client';

import { useState } from 'react';
import { formatCents, inputValueFromCents, parseDollars, toCents } from '@/lib/money';
import type { CurrencyCode } from '@/lib/currency';

const fieldClass =
  'h-11 w-[7.5rem] bg-transparent text-right text-[17px] font-normal tabular-nums tracking-tight text-[var(--label)] outline-none placeholder:text-[var(--tertiary)] disabled:opacity-40';

export function CurrencyInput({
  cents,
  onCentsChange,
  ariaLabel,
  disabled,
  currency = 'USD',
}: {
  cents: number;
  onCentsChange: (cents: number) => void;
  ariaLabel: string;
  disabled?: boolean;
  currency?: CurrencyCode;
}) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState('');

  return (
    <input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      spellCheck={false}
      aria-label={ariaLabel}
      disabled={disabled}
      value={focused ? draft : formatCents(cents, currency, cents % 100 === 0 ? 0 : 2)}
      onFocus={() => {
        setDraft(inputValueFromCents(cents));
        setFocused(true);
      }}
      onChange={(e) => {
        const raw = e.target.value.replace(/[^0-9.]/g, '');
        const firstDot = raw.indexOf('.');
        const normalized =
          firstDot === -1
            ? raw.slice(0, 12)
            : `${raw.slice(0, firstDot).slice(0, 12)}.${raw.slice(firstDot + 1).replace(/\./g, '').slice(0, 2)}`;
        setDraft(normalized);
        onCentsChange(toCents(parseDollars(normalized)));
      }}
      onBlur={() => {
        setFocused(false);
        setDraft('');
      }}
      placeholder="0"
      className={fieldClass}
    />
  );
}

export function RateInput({
  value,
  onChange,
  ariaLabel,
  disabled,
}: {
  value: number;
  onChange: (n: number) => void;
  ariaLabel: string;
  disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState('');
  const shown = Number.isInteger(value) ? String(value) : String(value);

  return (
    <div className="flex items-center gap-1">
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        aria-label={ariaLabel}
        disabled={disabled}
        value={focused ? draft : shown}
        onFocus={() => {
          setDraft(shown);
          setFocused(true);
        }}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9.-]/g, '');
          setDraft(raw);
          const n = Number(raw);
          if (Number.isFinite(n)) onChange(n);
        }}
        onBlur={() => {
          setFocused(false);
          setDraft('');
        }}
        className={`${fieldClass} w-[4.5rem]`}
      />
      <span className="text-[15px] text-[var(--secondary)]">%</span>
    </div>
  );
}

export function YearsInput({
  value,
  onChange,
  ariaLabel,
  disabled,
}: {
  value: number;
  onChange: (n: number) => void;
  ariaLabel: string;
  disabled?: boolean;
}) {
  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      aria-label={ariaLabel}
      disabled={disabled}
      value={value ? String(value) : ''}
      onChange={(e) => {
        const n = parseInt(e.target.value.replace(/[^0-9]/g, '').slice(0, 2) || '0', 10);
        onChange(Math.min(40, Math.max(0, n)));
      }}
      className={`${fieldClass} w-[4.5rem]`}
    />
  );
}
