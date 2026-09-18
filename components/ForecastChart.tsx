'use client';

import { useId, useMemo, useState } from 'react';

export type ForecastPoint = { year: number; cents: number };

const W = 720;
const H = 260;
const PAD = { top: 16, right: 16, bottom: 28, left: 8 };

/**
 * Net worth projected forward — one series over time, so it takes an area +
 * line and no legend (the heading names it). Crosshair and tooltip are on by
 * default; a table view sits behind a toggle so the figures are readable
 * without hovering.
 */
export function ForecastChart({
  points,
  format,
  label = 'Projected net worth',
}: {
  points: ForecastPoint[];
  format: (cents: number) => string;
  label?: string;
}) {
  const gradId = useId();
  const [hover, setHover] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  const geom = useMemo(() => {
    if (points.length < 2) return null;
    const max = Math.max(...points.map((p) => p.cents), 1);
    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top - PAD.bottom;
    const x = (i: number) => PAD.left + (i / (points.length - 1)) * plotW;
    const y = (c: number) => PAD.top + plotH - (c / max) * plotH;
    const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(2)} ${y(p.cents).toFixed(2)}`).join(' ');
    const area = `${line} L${x(points.length - 1).toFixed(2)} ${(PAD.top + plotH).toFixed(2)} L${x(0).toFixed(2)} ${(PAD.top + plotH).toFixed(2)} Z`;
    // Four recessive gridlines, labelled at the ends only.
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({ f, y: PAD.top + plotH - f * plotH, cents: max * f }));
    return { max, x, y, line, area, plotH, plotW, ticks };
  }, [points]);

  if (!geom) return null;

  const active = hover === null ? null : points[hover];

  return (
    <figure className="fc">
      <div className="fc-head">
        <figcaption className="fc-caption">{label}</figcaption>
        <button type="button" className="fc-toggle" onClick={() => setShowTable((s) => !s)}>
          {showTable ? 'Show chart' : 'Show table'}
        </button>
      </div>

      {showTable ? (
        <div className="fc-table-wrap">
          <table className="fc-table">
            <caption className="sr-only">{label} by year</caption>
            <thead>
              <tr>
                <th scope="col">Year</th>
                <th scope="col">{label}</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.year}>
                  <th scope="row">{p.year === 0 ? 'Today' : `Year ${p.year}`}</th>
                  <td>{format(p.cents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="fc-plot">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="fc-svg"
            role="img"
            aria-label={`${label}: ${format(points[0].cents)} today, ${format(
              points[points.length - 1].cents,
            )} after ${points[points.length - 1].year} years.`}
            onMouseLeave={() => setHover(null)}
            onMouseMove={(e) => {
              const box = e.currentTarget.getBoundingClientRect();
              const rel = ((e.clientX - box.left) / box.width) * W;
              const i = Math.round(((rel - PAD.left) / geom.plotW) * (points.length - 1));
              setHover(Math.max(0, Math.min(points.length - 1, i)));
            }}
          >
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--fc-series)" stopOpacity="0.26" />
                <stop offset="100%" stopColor="var(--fc-series)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {geom.ticks.map((t) => (
              <line
                key={t.f}
                x1={PAD.left}
                x2={W - PAD.right}
                y1={t.y}
                y2={t.y}
                className="fc-grid"
              />
            ))}

            <path d={geom.area} fill={`url(#${gradId})`} />
            <path d={geom.line} className="fc-line" />

            {/* Selective direct label: the endpoint only, never every point. */}
            <circle cx={geom.x(points.length - 1)} cy={geom.y(points[points.length - 1].cents)} r="4.5" className="fc-end" />

            {hover !== null && active && (
              <>
                <line x1={geom.x(hover)} x2={geom.x(hover)} y1={PAD.top} y2={PAD.top + geom.plotH} className="fc-cross" />
                <circle cx={geom.x(hover)} cy={geom.y(active.cents)} r="5" className="fc-dot" />
              </>
            )}

            <line x1={PAD.left} x2={W - PAD.right} y1={PAD.top + geom.plotH} y2={PAD.top + geom.plotH} className="fc-axis" />
          </svg>

          {hover !== null && active && (
            <div
              className="fc-tip"
              style={{ left: `${(geom.x(hover) / W) * 100}%` }}
              role="status"
            >
              <span>{active.year === 0 ? 'Today' : `Year ${active.year}`}</span>
              <strong>{format(active.cents)}</strong>
            </div>
          )}

          <div className="fc-xaxis">
            <span>Today</span>
            <span>{`${points[points.length - 1].year} years`}</span>
          </div>
        </div>
      )}
    </figure>
  );
}
