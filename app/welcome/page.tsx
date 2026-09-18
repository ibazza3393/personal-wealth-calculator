'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWealth } from '@/components/WealthProvider';
import { CURRENCIES, type CurrencyCode } from '@/lib/currency';
import { formatCents, inputValueFromCents, parseDollars, toCents } from '@/lib/money';
import { ONBOARDING_KEY } from '@/lib/types';

/** Region drives the sensible default currency — a NZ user should not land on USD. */
const REGIONS = [
  { code: 'NZ' as const, label: 'New Zealand', currency: 'NZD' as CurrencyCode },
  { code: 'AU' as const, label: 'Australia', currency: 'AUD' as CurrencyCode },
];

const STEPS = ['Start', 'You', 'Own', 'Owe', 'Keep', 'Done'] as const;
const LAST = STEPS.length - 1;
/** The numbered questions, which is what the "Step n of 4" kicker counts.
 *  Start and Done bracket them and are not steps you fill in, so the bar
 *  tracks the same four rather than showing six ticks against a label of 4. */
const QUESTIONS = 4;

function markOnboarded() {
  try {
    window.localStorage.setItem(ONBOARDING_KEY, 'done');
  } catch {
    /* Private mode — the flow still works, it just runs again next visit. */
  }
}

/**
 * Money field. Opaque on purpose: the brief puts glass around a form, never
 * underneath it, because legibility beats the effect on an input surface.
 */
function MoneyField({
  cents,
  onCents,
  currency,
  label,
  autoFocus,
}: {
  cents: number;
  onCents: (cents: number) => void;
  currency: CurrencyCode;
  label: string;
  autoFocus?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState('');

  return (
    <label className="obx-field">
      <span className="obx-field-label">{label}</span>
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        autoFocus={autoFocus}
        aria-label={label}
        className="obx-field-input"
        placeholder={formatCents(0, currency, 0)}
        value={focused ? draft : cents ? formatCents(cents, currency, cents % 100 === 0 ? 0 : 2) : ''}
        onFocus={() => {
          setDraft(inputValueFromCents(cents));
          setFocused(true);
        }}
        onChange={(e) => {
          setDraft(e.target.value);
          onCents(toCents(parseDollars(e.target.value)));
        }}
        onBlur={() => setFocused(false)}
      />
    </label>
  );
}

/**
 * Step 0 preview. Same glass shell, three rotating panes — the reusable
 * pattern from the reference, showing what the product gives back.
 */
function Rotator() {
  const [pane, setPane] = useState(0);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const id = window.setInterval(() => setPane((p) => (p + 1) % 3), 4200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div>
      <div className="obx-rotator" aria-live="off">
        {pane === 0 && (
          <div className="obx-pane" key="net">
            <p className="obx-pane-label">Net worth</p>
            <p className="obx-pane-figure">$1,284,320</p>
            <svg className="obx-spark" viewBox="0 0 300 48" preserveAspectRatio="none" aria-hidden>
              <defs>
                <linearGradient id="obxFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7fe8d6" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#7fe8d6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0 40 L38 35 L75 37 L113 26 L150 29 L188 17 L225 21 L263 9 L300 4 L300 48 L0 48 Z"
                fill="url(#obxFill)"
              />
              <path
                d="M0 40 L38 35 L75 37 L113 26 L150 29 L188 17 L225 21 L263 9 L300 4"
                fill="none"
                stroke="#7fe8d6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}

        {pane === 1 && (
          <div className="obx-pane" key="alloc">
            <p className="obx-pane-label">Allocation</p>
            <p className="obx-pane-figure">6 asset classes</p>
            <div className="obx-bars" aria-hidden>
              <span style={{ width: '38%', background: '#5cb8f5' }} />
              <span style={{ width: '24%', background: '#ffd60a' }} />
              <span style={{ width: '18%', background: '#7fe8d6' }} />
              <span style={{ width: '12%', background: '#a5b4fc' }} />
              <span style={{ width: '8%', background: '#f0abfc' }} />
            </div>
            <div className="obx-split">
              <div className="obx-split-row">
                <span>Property</span>
                <strong>$842,000</strong>
              </div>
              <div className="obx-split-row">
                <span>KiwiSaver</span>
                <strong>$186,400</strong>
              </div>
            </div>
          </div>
        )}

        {pane === 2 && (
          <div className="obx-pane" key="split">
            <p className="obx-pane-label">Assets &amp; debts</p>
            <div className="obx-split" style={{ marginTop: 10 }}>
              <div className="obx-split-row">
                <span>Everything you own</span>
                <strong>$1,696,320</strong>
              </div>
              <div className="obx-split-row">
                <span>Everything you owe</span>
                <strong>−$412,000</strong>
              </div>
              <div className="obx-split-row">
                <span>Net</span>
                <strong>$1,284,320</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="obx-dots" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span key={i} className={`obx-dot${i === pane ? ' is-on' : ''}`} />
        ))}
      </div>
    </div>
  );
}

export default function WelcomePage() {
  const router = useRouter();
  const { data, patch, isHydrated } = useWealth();
  const [step, setStep] = useState(0);

  // Onboarding edits the rows it created rather than stacking duplicates when
  // the flow is run a second time.
  const retirement = useMemo(
    () => data.holdings.find((h) => h.kind === 'retirement'),
    [data.holdings],
  );
  const mortgage = useMemo(
    () => data.liabilities.find((l) => l.name === 'Mortgage'),
    [data.liabilities],
  );
  const otherDebt = useMemo(
    () => data.liabilities.find((l) => l.name === 'Other debts'),
    [data.liabilities],
  );

  const setRetirement = useCallback(
    (cents: number) =>
      patch((p) => {
        const value = cents / 100;
        const existing = p.holdings.find((h) => h.kind === 'retirement');
        if (existing) {
          return {
            ...p,
            holdings: p.holdings.map((h) => (h.id === existing.id ? { ...h, value } : h)),
          };
        }
        if (!value) return p;
        return {
          ...p,
          holdings: [
            ...p.holdings,
            { id: crypto.randomUUID(), kind: 'retirement' as const, name: 'KiwiSaver / super', value },
          ],
        };
      }),
    [patch],
  );

  const setNamedLiability = useCallback(
    (name: string, cents: number) =>
      patch((p) => {
        const value = cents / 100;
        const existing = p.liabilities.find((l) => l.name === name);
        if (existing) {
          return {
            ...p,
            liabilities: p.liabilities.map((l) => (l.id === existing.id ? { ...l, value } : l)),
          };
        }
        if (!value) return p;
        return { ...p, liabilities: [...p.liabilities, { id: crypto.randomUUID(), name, value }] };
      }),
    [patch],
  );

  const currency = data.currency;
  const assetCents =
    toCents(data.liquidCash) +
    toCents(data.propertyValue) +
    data.holdings.reduce((sum, h) => sum + toCents(h.value), 0);
  const debtCents = data.liabilities.reduce((sum, l) => sum + toCents(l.value), 0);
  const netCents = assetCents - debtCents;

  const income = data.budget.monthlyIncome;
  const spend = data.budget.items.reduce((sum, i) => sum + i.amount, 0);
  const leftover = Math.max(0, income - spend);
  const rate = income > 0 ? Math.round((leftover / income) * 100) : 0;

  const leave = () => {
    markOnboarded();
    router.push('/dashboard');
  };

  const next = () => setStep((s) => Math.min(LAST, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const HEAD = [
    {
      kicker: 'Welcome',
      title: (
        <>
          Let&rsquo;s find your <em>real</em> number.
        </>
      ),
      lede: 'Four short steps. At the end you get a net worth built from your figures — not a demo, and not a guess.',
    },
    {
      kicker: 'Step 1 of 4',
      title: (
        <>
          Where do you <em>pay tax?</em>
        </>
      ),
      lede: 'This sets your tax rates and the currency your figures show in.',
    },
    {
      kicker: 'Step 2 of 4',
      title: (
        <>
          What do you <em>own?</em>
        </>
      ),
      lede: 'Round numbers are fine. Leave anything blank that does not apply.',
    },
    {
      kicker: 'Step 3 of 4',
      title: (
        <>
          What do you <em>owe?</em>
        </>
      ),
      lede: 'Debt counts against you here — that is the difference between a net worth and a brag.',
    },
    {
      kicker: 'Step 4 of 4',
      title: (
        <>
          What do you <em>keep?</em>
        </>
      ),
      lede: 'Your savings rate drives the projection. Without it we would be making the number up.',
    },
    {
      kicker: 'All set',
      title: (
        <>
          Your net worth is <em>this.</em>
        </>
      ),
      lede: 'Every figure stays editable, and your dashboard projection now runs off the rate you entered.',
    },
  ][step];

  return (
    <div className="obx">
      <div className="obx-bg" aria-hidden>
        <span className="obx-drift obx-drift-a" />
        <span className="obx-drift obx-drift-b" />
      </div>

      <header className="obx-top">
        <span className="obx-mark">
          <span className="obx-mark-glyph" aria-hidden>
            N
          </span>
          Next Wealth
        </span>
        {step < LAST && (
          <button type="button" className="obx-skip" onClick={leave}>
            Skip for now
          </button>
        )}
      </header>

      <div
        className="obx-progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={QUESTIONS}
        aria-valuenow={Math.max(0, Math.min(QUESTIONS, step))}
        aria-label="Setup progress"
      >
        {Array.from({ length: QUESTIONS }, (_, i) => (
          <span key={i} className={`obx-tick${step > i ? ' is-on' : ''}`} />
        ))}
      </div>

      <main className="obx-stage">
        {/* Headline sits directly on the drifting background — no card. */}
        <div className="obx-head">
          <p className="obx-kicker">{HEAD.kicker}</p>
          <h1 className="obx-h1">{HEAD.title}</h1>
          <p className="obx-lede">{HEAD.lede}</p>
        </div>

        {/* One glass shell; only the contents change between beats. */}
        <section key={step} className="obx-card glass-md">
          {step === 0 && <Rotator />}

          {step === 1 && (
            <>
              <div className="obx-segments">
                {REGIONS.map((r) => (
                  <button
                    key={r.code}
                    type="button"
                    className={`obx-segment${data.taxRegion === r.code ? ' is-on' : ''}`}
                    aria-pressed={data.taxRegion === r.code}
                    onClick={() => patch((p) => ({ ...p, taxRegion: r.code, currency: r.currency }))}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              <label className="obx-field" style={{ marginTop: 18, display: 'block' }}>
                <span className="obx-field-label">Show amounts in</span>
                <select
                  className="obx-select"
                  value={data.currency}
                  onChange={(e) => patch((p) => ({ ...p, currency: e.target.value as CurrencyCode }))}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} — {c.label}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}

          {step === 2 && (
            <>
              <MoneyField
                autoFocus
                label="Cash in the bank"
                currency={currency}
                cents={toCents(data.liquidCash)}
                onCents={(c) => patch((p) => ({ ...p, liquidCash: c / 100 }))}
              />
              <MoneyField
                label="Property, at today's value"
                currency={currency}
                cents={toCents(data.propertyValue)}
                onCents={(c) => patch((p) => ({ ...p, propertyValue: c / 100 }))}
              />
              <MoneyField
                label={data.taxRegion === 'NZ' ? 'KiwiSaver' : 'Superannuation'}
                currency={currency}
                cents={toCents(retirement?.value ?? 0)}
                onCents={setRetirement}
              />
              <p className="obx-note">Shares and crypto come next, on the Holdings page.</p>
            </>
          )}

          {step === 3 && (
            <>
              <MoneyField
                autoFocus
                label="Mortgage still owing"
                currency={currency}
                cents={toCents(mortgage?.value ?? 0)}
                onCents={(c) => setNamedLiability('Mortgage', c)}
              />
              <MoneyField
                label="Everything else — cards, loans, student debt"
                currency={currency}
                cents={toCents(otherDebt?.value ?? 0)}
                onCents={(c) => setNamedLiability('Other debts', c)}
              />
            </>
          )}

          {step === 4 && (
            <>
              <MoneyField
                autoFocus
                label="Take-home pay, per month"
                currency={currency}
                cents={toCents(income)}
                onCents={(c) =>
                  patch((p) => ({ ...p, budget: { ...p.budget, monthlyIncome: c / 100 } }))
                }
              />
              <MoneyField
                label="Everything you spend, per month"
                currency={currency}
                cents={toCents(spend)}
                onCents={(c) =>
                  patch((p) => ({
                    ...p,
                    budget: {
                      ...p.budget,
                      items: [
                        {
                          id: p.budget.items[0]?.id ?? crypto.randomUUID(),
                          kind: 'other' as const,
                          name: 'Monthly spend',
                          amount: c / 100,
                        },
                      ],
                    },
                  }))
                }
              />
              {income > 0 && (
                <p className="obx-readout">
                  You keep <strong>{formatCents(toCents(leftover), currency, 0)}</strong> a month —
                  a savings rate of <strong>{rate}%</strong>.
                </p>
              )}
            </>
          )}

          {step === LAST && (
            <>
              <p className="obx-figure">{isHydrated ? formatCents(netCents, currency, 0) : '—'}</p>
              <div className="obx-summary">
                <div>
                  <span>Assets</span>
                  <strong>{formatCents(assetCents, currency, 0)}</strong>
                </div>
                <div>
                  <span>Debts</span>
                  <strong>−{formatCents(debtCents, currency, 0)}</strong>
                </div>
                <div>
                  <span>Savings rate</span>
                  <strong>{rate}%</strong>
                </div>
              </div>
            </>
          )}
        </section>

        {/* The primary action is the only fully opaque object on the screen. */}
        <div className="obx-actions">
          {step > 0 && step < LAST && (
            <button type="button" className="obx-back" onClick={back}>
              Back
            </button>
          )}
          {step < LAST ? (
            <button type="button" className="obx-cta" onClick={next}>
              {step === 0 ? 'Get started' : 'Continue'}
            </button>
          ) : (
            <button type="button" className="obx-cta" onClick={leave}>
              Open my dashboard
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
