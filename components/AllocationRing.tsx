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
  const size = 196;
  const cx = size / 2;
  const stroke = 22;
  const r = (size - stroke) / 2 - 4;
  const c = 2 * Math.PI * r;
  const gap = 10;
  const visible = segments.filter((s) => s.cents > 0);
  const list = visible.length ? visible : segments;

  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
      <div className="relative h-[196px] w-[196px] shrink-0">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90" aria-hidden>
          <circle
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            stroke="var(--ring-track)"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          {totalCents > 0 &&
            list.map((seg) => {
              const raw = (seg.width / 100) * c;
              const len = Math.max(0, raw - gap);
              const dashOffset = -offset;
              offset += raw;
              if (len <= 0) return null;
              return (
                <circle
                  key={seg.label}
                  cx={cx}
                  cy={cx}
                  r={r}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={stroke}
                  strokeLinecap="round"
                  strokeDasharray={`${len} ${c - len}`}
                  strokeDashoffset={dashOffset}
                />
              );
            })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
          <p className="text-[11px] font-semibold tracking-[0.12em] text-[var(--tertiary)]">TOTAL</p>
          <p className="mt-1 text-[22px] font-semibold leading-none tracking-[-0.03em] tabular-nums">
            {hydrated ? format(totalCents) : '—'}
          </p>
        </div>
      </div>
      <ul className="min-w-0 w-full flex-1 space-y-3">
        {list.map((seg) => (
          <li key={seg.label} className="flex items-baseline justify-between gap-3 text-[15px]">
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: seg.color }} />
              <span className="truncate">{seg.label}</span>
            </span>
            <span className="shrink-0 tabular-nums text-[var(--secondary)]">
              {hydrated ? `${seg.percent}%  ${format(seg.cents)}` : '—'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
