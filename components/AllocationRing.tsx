'use client';

type Segment = {
  label: string;
  cents: number;
  color: string;
  percent: number;
  width: number;
};

type Props = {
  segments: Segment[];
  totalCents: number;
  format: (cents: number) => string;
  hydrated: boolean;
};

export function AllocationRing({ segments, totalCents, format, hydrated }: Props) {
  const r = 36;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const visible = segments.filter((s) => s.cents > 0);
  const list = visible.length ? visible : segments;

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 88 88" className="h-[88px] w-[88px] shrink-0 -rotate-90" aria-hidden>
        <circle cx="44" cy="44" r={r} fill="none" stroke="var(--ring-track)" strokeWidth="8" />
        {totalCents > 0 &&
          list.map((seg) => {
            const len = (seg.width / 100) * c;
            const dashOffset = -offset;
            offset += len;
            if (len <= 0) return null;
            return (
              <circle
                key={seg.label}
                cx="44"
                cy="44"
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth="8"
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={dashOffset}
              />
            );
          })}
      </svg>
      <ul className="min-w-0 flex-1 space-y-2.5">
        {list.map((seg) => (
          <li key={seg.label} className="flex items-baseline justify-between gap-3 text-[13px]">
            <span className="flex min-w-0 items-center gap-2 text-[var(--label)]">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: seg.color }} />
              <span className="truncate">{seg.label}</span>
              <span className="tabular-nums text-[var(--secondary)]">
                {hydrated ? `${seg.percent}%` : '—'}
              </span>
            </span>
            <span className="shrink-0 tabular-nums text-[var(--secondary)]">
              {hydrated ? format(seg.cents) : '—'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
