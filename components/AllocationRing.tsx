'use client';

import { useId, useState } from 'react';

export type AllocRow = { label: string; cents: number };
export type AllocGroup = {
  key: string;
  label: string;
  cents: number;
  percent: number;
  /** Ring sweep share, which rounds differently from the label percent. */
  width: number;
  rows: AllocRow[];
};

type Props = {
  groups: AllocGroup[];
  totalCents: number;
  format: (cents: number) => string;
  hydrated: boolean;
  /** Shown inside the empty ring when nothing has been recorded yet. */
  emptyHint?: string;
};

const SIZE = 240;
const CX = SIZE / 2;
const R = 92;
/** Thick band with round caps, so each arc reads as one solid stroke. */
const BAND = 26;
const TAU = Math.PI * 2;

function arcPath(a0: number, a1: number) {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const x0 = CX + R * Math.cos(a0);
  const y0 = CX + R * Math.sin(a0);
  const x1 = CX + R * Math.cos(a1);
  const y1 = CX + R * Math.sin(a1);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${R} ${R} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

/**
 * Allocation as four fixed groups, never more. Seven asset classes in one ring
 * produced slivers a few pixels wide that no palette can keep apart — the
 * detail lives in the list below, where identity comes from the label rather
 * than from a colour. The four group colours are fixed to the group, so a
 * change in the data never repaints them, and the palette is validated for
 * both modes and for colour-vision deficiency (see globals.css).
 */
export function AllocationRing({ groups, totalCents, format, hydrated, emptyHint }: Props) {
  const titleId = useId();
  const [active, setActive] = useState<string | null>(null);
  const live = groups.filter((g) => g.cents > 0);
  const current = live.find((g) => g.key === active) ?? null;

  // Round caps eat roughly half a band width at each end, so the gap between
  // arcs is measured in the same units rather than guessed.
  const capRad = BAND / 2 / R;
  let cursor = -Math.PI / 2;

  return (
    <div className="alloc">
      <div className="alloc-ring">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="alloc-svg" role="img" aria-labelledby={titleId}>
          <title id={titleId}>
            {live.length
              ? `Allocation: ${live.map((g) => `${g.label} ${g.percent}%`).join(', ')}.`
              : 'Allocation: nothing recorded yet.'}
          </title>
          <circle
            cx={CX}
            cy={CX}
            r={R}
            fill="none"
            stroke="var(--ring-track)"
            strokeWidth={BAND}
          />
          {totalCents > 0 &&
            live.map((g) => {
              const sweep = (g.width / 100) * TAU;
              // A slice too thin to survive its own round caps is drawn as a
              // dot at its midpoint rather than as a backwards arc.
              const inset = Math.min(capRad, sweep / 2 - 0.004);
              const a0 = cursor + inset;
              const a1 = cursor + sweep - inset;
              cursor += sweep;
              const dim = active !== null && active !== g.key;
              return (
                <path
                  key={g.key}
                  d={arcPath(a0, Math.max(a1, a0 + 0.001))}
                  fill="none"
                  stroke={`var(--alloc-${g.key})`}
                  strokeWidth={BAND}
                  strokeLinecap="round"
                  className={`alloc-arc${dim ? ' is-dim' : ''}`}
                  onMouseEnter={() => setActive(g.key)}
                  onMouseLeave={() => setActive(null)}
                />
              );
            })}
        </svg>
        <div className="alloc-centre" aria-hidden>
          <p className="alloc-centre-label">{current ? current.label : 'Total'}</p>
          <p className="alloc-centre-value tabular-nums">
            {hydrated ? format(current ? current.cents : totalCents) : '—'}
          </p>
          {current && <p className="alloc-centre-sub tabular-nums">{current.percent}%</p>}
        </div>
      </div>

      {live.length === 0 && emptyHint && <p className="alloc-empty">{emptyHint}</p>}

      <ul className="alloc-legend">
        {live.map((g) => (
          <li key={g.key}>
            <button
              type="button"
              className={`alloc-legend-row${active === g.key ? ' is-on' : ''}`}
              onMouseEnter={() => setActive(g.key)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(g.key)}
              onBlur={() => setActive(null)}
              onClick={() => setActive((a) => (a === g.key ? null : g.key))}
              aria-pressed={active === g.key}
            >
              <span className="alloc-key" style={{ background: `var(--alloc-${g.key})` }} aria-hidden />
              <span className="alloc-legend-label">{g.label}</span>
              <span className="alloc-legend-pct tabular-nums">{hydrated ? `${g.percent}%` : '—'}</span>
              <span className="alloc-legend-value tabular-nums">{hydrated ? format(g.cents) : '—'}</span>
            </button>
            {g.rows.length > 1 && (
              <ul className="alloc-sub">
                {g.rows.map((r) => (
                  <li key={r.label}>
                    <span className="alloc-sub-label">{r.label}</span>
                    <span className="alloc-sub-value tabular-nums">{hydrated ? format(r.cents) : '—'}</span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
