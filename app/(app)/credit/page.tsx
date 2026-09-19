'use client';

import { SectionHero } from '@/components/SectionHero';

/**
 * Credit score.
 *
 * Deliberately shows no number. Nothing in this app is connected to a credit
 * bureau, and a score is not derivable from the ledger — inventing one, or
 * dressing a placeholder up as a reading, is exactly the kind of fabricated
 * figure the rest of the product has been cleaned of. This page says what it
 * would take instead.
 */
const BUREAUS = [
  {
    region: 'New Zealand',
    names: 'Centrix, Equifax NZ, illion',
    note: 'A consumer score is free directly from each bureau, once a year by law.',
  },
  {
    region: 'Australia',
    names: 'Equifax, Experian, illion',
    note: 'Free consumer access every three months, and after any refusal of credit.',
  },
];

export default function CreditPage() {
  return (
    <main className="pt-4">
      <SectionHero
        tone="dusk"
        lead="Know"
        headline="what lenders see"
        sub="Your credit file decides the rate you are offered. Next Wealth does not have it — and will not guess at it."
        ctaLabel="How to get your score"
        ctaHref="#how"
        note="No score is shown here because none has been retrieved. A number we invented would be worse than none."
      >
        <p className="sh-preview-label">Not connected</p>
        <div className="sh-split">
          <p className="sh-empty-note">
            A credit score comes from a bureau, not from your holdings. There is no way to derive
            one from the figures in this app, so nothing is displayed.
          </p>
        </div>
      </SectionHero>

      <section className="panel liquid-glass-card mt-6 rounded-[26px] px-5 py-5" id="how">
        <h2 className="text-[17px] font-semibold">Where your score actually lives</h2>
        <p className="mt-1 text-[15px] text-[var(--secondary)]">
          Credit reporting is per-country and per-bureau. You can request yours directly, free,
          without going through a third party.
        </p>
        <div className="mt-4 divide-y divide-[var(--separator)]">
          {BUREAUS.map((b) => (
            <div key={b.region} className="py-3">
              <p className="text-[15px] font-medium">{b.region}</p>
              <p className="text-[15px] text-[var(--secondary)]">{b.names}</p>
              <p className="mt-0.5 text-[13px] text-[var(--tertiary)]">{b.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel liquid-glass-card mt-4 rounded-[26px] px-5 py-5">
        <h2 className="text-[17px] font-semibold">What it would take to show it here</h2>
        <ul className="mt-3 space-y-2 text-[15px] text-[var(--secondary)]">
          <li>A commercial agreement with a bureau — none of them offer an open consumer API.</li>
          <li>
            Identity verification strong enough for the bureau to release a file, which is a
            heavier bar than the read-only bank access Akahu provides.
          </li>
          <li>
            Storage of a credit file, which is regulated personal information and cuts against this
            app keeping everything in your own browser.
          </li>
        </ul>
        <p className="mt-4 text-[13px] text-[var(--tertiary)]">
          Worth weighing that last point before building it: the privacy position is currently one
          of the product&rsquo;s strongest claims.
        </p>
      </section>
    </main>
  );
}
