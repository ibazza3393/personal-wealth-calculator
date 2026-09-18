import type { ReactNode } from 'react';

/**
 * The portal's empty-state hero.
 *
 * One shell per section: a full-bleed blurred colour field, a serif-italic
 * lead word in an otherwise sans headline, a single opaque white CTA, and a
 * glass preview card showing what the section gives back once it has data.
 * Glass is confined to that preview — the surrounding page stays flat.
 */
export function SectionHero({
  tone,
  lead,
  headline,
  sub,
  ctaLabel,
  ctaHref,
  onCta,
  note,
  children,
}: {
  /** Which colour field sits behind the panel. */
  tone: 'ocean' | 'meadow' | 'dusk' | 'ember';
  /** Set in serif italic, as the reference does with "Track". */
  lead: string;
  headline: string;
  sub: string;
  ctaLabel: string;
  ctaHref?: string;
  onCta?: () => void;
  note?: string;
  /** The glass preview card's contents. */
  children?: ReactNode;
}) {
  return (
    <section className={`sh sh-${tone}`}>
      <div className="sh-field" aria-hidden>
        <span className="sh-wash sh-wash-a" />
        <span className="sh-wash sh-wash-b" />
      </div>

      <div className="sh-inner">
        <h2 className="sh-h">
          <em>{lead}</em> {headline}
        </h2>
        <p className="sh-sub">{sub}</p>

        {ctaHref ? (
          <a className="sh-cta" href={ctaHref}>
            {ctaLabel}
          </a>
        ) : (
          <button type="button" className="sh-cta" onClick={onCta}>
            {ctaLabel}
          </button>
        )}

        {children && <div className="sh-preview glass-md">{children}</div>}

        {note && <p className="sh-note">{note}</p>}
      </div>
    </section>
  );
}

/** Label + value + delta row used inside preview cards. */
export function SheetStat({
  label,
  value,
  delta,
  positive,
}: {
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
}) {
  return (
    <div className="sh-stat">
      <span className="sh-stat-label">{label}</span>
      <strong className="sh-stat-value">{value}</strong>
      {delta && (
        <span className={`sh-stat-delta${positive ? ' is-up' : positive === false ? ' is-down' : ''}`}>
          {delta}
        </span>
      )}
    </div>
  );
}

/** Small sparkline for preview tiles. Decorative. */
export function Spark({ points, stroke = '#ffffff' }: { points: number[]; stroke?: string }) {
  if (points.length < 2) return null;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * 100;
      const y = 28 - ((p - min) / span) * 24;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg className="sh-spark" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden>
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
