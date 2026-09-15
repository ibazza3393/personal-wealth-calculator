'use client';

import { useState } from 'react';
import { inputValueFromCents, parseDollars, toCents } from '@/lib/money';

type Props = {
  cents: number;
  onCentsChange: (cents: number) => void;
  ariaLabel: string;
  disabled?: boolean;
};

export function CurrencyInput({ cents, onCentsChange, ariaLabel, disabled }: Props) {
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
      value={focused ? draft : inputValueFromCents(cents)}
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
      className="h-11 w-[7.5rem] bg-transparent text-right text-[17px] font-normal tabular-nums tracking-tight text-[#1d1d1f] outline-none placeholder:text-[#c7c7cc] disabled:opacity-40"
    />
  );
}
