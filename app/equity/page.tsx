'use client';

import { SectionHero, SheetStat } from '@/components/SectionHero';
import { useWealth } from '@/components/WealthProvider';
import { formatCents, toCents } from '@/lib/money';

/**
 * Home equity: what the property is worth against what is still owed on it.
 * Two segments, so the bar carries a legend and direct labels — identity is
 * never colour alone. Palette validated for both modes (see globals.css).
 */
export default function EquityPage() {
  const { data, patch, isHydrated } = useWealth();
  const { currency, propertyValue, liabilities } = data;

  const mortgage = liabilities.find((l) => /mortgage|home loan/i.test(l.name));
  const valueCents = toCents(propertyValue);
  const owingCents = toCents(mortgage?.value ?? 0);
  const equityCents = Math.max(0, valueCents - owingCents);
  const lvr = valueCents > 0 ? Math.round((owingCents / valueCents) * 100) : 0;
  const equityPct = valueCents > 0 ? Math.round((equityCents / valueCents) * 100) : 0;

  const figure = (cents: number) => (isHydrated ? formatCents(cents, currency, 0) : '—');

  if (isHydrated && valueCents === 0) {
    return (
      <main className="pt-4">
        <SectionHero
          tone="ember"
          lead="Own"
          headline="more of your home"
          sub="Set your property against the mortgage still on it, and watch the share that is actually yours grow."
          ctaLabel="Add your property"
          ctaHref="/holdings"
          note="Both figures come from Holdings. Nothing is estimated on your behalf."
        >
          <p className="sh-preview-label">What you&rsquo;ll see</p>
          <div className="sh-grid">
            <div className="sh-tile">
              <SheetStat label="Your equity" value="$430,000" />
            </div>
            <div className="sh-tile">
              <SheetStat label="Loan to value" value="48%" />
            </div>
          </div>
        </SectionHero>
      </main>
    );
  }

  return (
    <main className="pt-4">
      <h1 className="text-[28px] font-semibold tracking-tight">Equity</h1>
      <p className="mt-1 max-w-xl text-[15px] text-[var(--secondary)]">
        The share of your property you actually own, against what the bank still holds.
      </p>

      <section className="panel liquid-glass-card mt-6 rounded-[26px] px-5 py-5">
        <p className="hero-caption">Your equity</p>
        <p className="hero-current tabular-nums">{figure(equityCents)}</p>
        <p className="mt-1 text-[13px] text-[var(--secondary)]">
          {equityPct}% of {figure(valueCents)}
        </p>

        {/* Stacked composition. A 2px surface gap separates the segments, and
            each is directly labelled so colour is not the only cue. */}
        <div className="eq-bar" role="img" aria-label={`Equity ${figure(equityCents)}, still owing ${figure(owingCents)}.`}>
          {equityCents > 0 && (
            <span className="eq-seg eq-seg-equity" style={{ flexGrow: equityCents }} />
          )}
          {owingCents > 0 && (
            <span className="eq-seg eq-seg-owing" style={{ flexGrow: owingCents }} />
          )}
        </div>

        <ul className="eq-legend">
          <li>
            <span className="eq-key eq-key-equity" aria-hidden />
            <span className="eq-key-label">Your equity</span>
            <strong>{figure(equityCents)}</strong>
          </li>
          <li>
            <span className="eq-key eq-key-owing" aria-hidden />
            <span className="eq-key-label">Still owing</span>
            <strong>{figure(owingCents)}</strong>
          </li>
        </ul>
      </section>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Tile label="Property value" value={figure(valueCents)} />
        <Tile label="Mortgage" value={figure(owingCents)} />
        <Tile label="Loan to value" value={`${lvr}%`} />
      </div>

      <section className="panel liquid-glass-card mt-4 rounded-[26px] px-5 py-5">
        <h2 className="text-[17px] font-semibold">Keep it current</h2>
        <p className="mt-1 text-[15px] text-[var(--secondary)]">
          These come straight from Holdings. Update the estimated value when you get a fresh
          appraisal, and the mortgage as you pay it down.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a className="origin-btn-ghost inline-flex items-center hit px-3" href="/holdings">
            Edit in Holdings
          </a>
          {owingCents === 0 && valueCents > 0 && (
            <button
              type="button"
              className="origin-btn-ghost hit px-3"
              onClick={() =>
                patch((p) => ({
                  ...p,
                  liabilities: [
                    ...p.liabilities,
                    { id: crypto.randomUUID(), name: 'Mortgage', value: 0 },
                  ],
                }))
              }
            >
              Add a mortgage
            </button>
          )}
        </div>
        {owingCents === 0 && valueCents > 0 && (
          <p className="mt-3 text-[13px] text-[var(--tertiary)]">
            No mortgage recorded, so this shows the property as fully owned.
          </p>
        )}
      </section>
    </main>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel liquid-glass-card rounded-[20px] px-4 py-3">
      <p className="text-[12px] text-[var(--secondary)]">{label}</p>
      <p className="mt-0.5 text-[17px] font-semibold tabular-nums">{value}</p>
    </div>
  );
}
