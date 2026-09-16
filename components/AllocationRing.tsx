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

function polar(cx: number, cy: number, r: number, a: number) {
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
}

function wedge(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number) {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const [x0, y0] = polar(cx, cy, r1, a0);
  const [x1, y1] = polar(cx, cy, r1, a1);
  const [x2, y2] = polar(cx, cy, r0, a1);
  const [x3, y3] = polar(cx, cy, r0, a0);
  return `M${x0.toFixed(3)} ${y0.toFixed(3)} A${r1} ${r1} 0 ${large} 1 ${x1.toFixed(3)} ${y1.toFixed(3)} L${x2.toFixed(3)} ${y2.toFixed(3)} A${r0} ${r0} 0 ${large} 0 ${x3.toFixed(3)} ${y3.toFixed(3)} Z`;
}

export function AllocationRing({ segments, totalCents, format, hydrated }: Props) {
  const size = 220;
  const cx = size / 2;
  const rOuter = 96;
  const rInner = 68;
  const visible = segments.filter((s) => s.cents > 0);
  const list = visible.length ? visible : segments;
  const TAU = Math.PI * 2;
  const start0 = -Math.PI / 2;
  const gap = list.length > 1 ? 0.035 : 0;

  let cursor = start0;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-8">
      <div className="relative h-[220px] w-[220px] shrink-0">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full" aria-hidden>
          <path
            d={wedge(cx, cx, rInner, rOuter, 0, TAU - 0.001)}
            fill="var(--ring-track)"
          />
          {totalCents > 0 &&
            list.map((seg) => {
              const sweep = (seg.width / 100) * TAU;
              const a0 = cursor + gap / 2;
              const a1 = cursor + sweep - gap / 2;
              cursor += sweep;
              if (a1 <= a0) return null;
              return <path key={seg.label} d={wedge(cx, cx, rInner, rOuter, a0, a1)} fill={seg.color} />;
            })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[var(--tertiary)]">TOTAL</p>
          <p className="mt-1 text-[22px] font-semibold leading-none tracking-[-0.03em] tabular-nums">
            {hydrated ? format(totalCents) : '—'}
          </p>
        </div>
      </div>
      <ul className="min-w-0 w-full flex-1 divide-y divide-[var(--separator)]">
        {list.map((seg) => (
          <li key={seg.label} className="flex items-center justify-between gap-3 py-2.5 text-[15px]">
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: seg.color }} />
              <span className="truncate">{seg.label}</span>
            </span>
            <span className="shrink-0 tabular-nums text-[var(--secondary)]">
              {hydrated ? `${seg.percent}%   ${format(seg.cents)}` : '—'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
