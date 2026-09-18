'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
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

function markOnboarded() {
  try {
    window.localStorage.setItem(ONBOARDING_KEY, 'done');
  } catch {
    /* Private mode — the flow still works, it just runs again next visit. */
  }
}

/**
 * A large, centred money field. The app's CurrencyInput is a compact
 * right-aligned row control; onboarding wants one number per screen.
 */
function BigMoney({
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
    <label className="ob-field">
      <span className="ob-field-label">{label}</span>
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        autoFocus={autoFocus}
        aria-label={label}
        className="ob-field-input"
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

export default function WelcomePage() {
  const router = useRouter();
  const { data, patch, isHydrated } = useWealth();
  const [step, setStep] = useState(0);

  // Retirement balance lives in holdings; onboarding edits the first one it
  // finds so re-running the flow does not stack duplicates.
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

  const finish = () => {
    markOnboarded();
    router.push('/dashboard');
  };

  const skip = () => {
    markOnboarded();
    router.push('/dashboard');
  };

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div className="ob">
      <header className="ob-top">
        <span className="ob-mark">
          <span className="ob-mark-glyph" aria-hidden>
            N
          </span>
          Next Wealth
        </span>
        {step < STEPS.length - 1 && (
          <button type="button" className="ob-skip" onClick={skip}>
            Skip for now
          </button>
        )}
      </header>

      <div className="ob-progress" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1} aria-label="Setup progress">
        {STEPS.map((s, i) => (
          <span key={s} className={`ob-tick${i <= step ? ' is-on' : ''}`} />
        ))}
      </div>

      <main className="ob-stage">
        <section key={step} className="ob-card panel liquid-glass-card">
          {step === 0 && (
            <>
              <p className="ob-kicker">Welcome</p>
              <h1 className="ob-h1">
                Let&rsquo;s find your <em>real</em> number.
              </h1>
              <p className="ob-lede">
                Four short steps. At the end you get a net worth built from your figures —
                not a demo, and not a guess.
              </p>
              <ul className="ob-points">
                <li>
                  <strong>Nothing leaves this device.</strong> Every figure is written to your own
                  browser storage.
                </li>
                <li>
                  <strong>No bank passwords, ever.</strong> Connect accounts later through Akahu or
                  CDR, read-only.
                </li>
                <li>
                  <strong>Change anything later.</strong> Nothing here is locked in.
                </li>
              </ul>
            </>
          )}

          {step === 1 && (
            <>
              <p className="ob-kicker">Step 1 of 4</p>
              <h1 className="ob-h1">
                Where do you <em>pay tax?</em>
              </h1>
              <p className="ob-lede">This sets your tax rates and the currency your figures show in.</p>
              <div className="ob-segments">
                {REGIONS.map((r) => (
                  <button
                    key={r.code}
                    type="button"
                    className={`ob-segment${data.taxRegion === r.code ? ' is-on' : ''}`}
                    aria-pressed={data.taxRegion === r.code}
                    onClick={() =>
                      patch((p) => ({ ...p, taxRegion: r.code, currency: r.currency }))
                    }
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              <label className="ob-field ob-field-inline">
                <span className="ob-field-label">Show amounts in</span>
                <select
                  className="ob-select"
                  value={data.currency}
                  onChange={(e) =>
                    patch((p) => ({ ...p, currency: e.target.value as CurrencyCode }))
                  }
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
              <p className="ob-kicker">Step 2 of 4</p>
              <h1 className="ob-h1">
                What do you <em>own?</em>
              </h1>
              <p className="ob-lede">Round numbers are fine. Leave anything blank that does not apply.</p>
              <BigMoney
                autoFocus
                label="Cash in the bank"
                currency={currency}
                cents={toCents(data.liquidCash)}
                onCents={(c) => patch((p) => ({ ...p, liquidCash: c / 100 }))}
              />
              <BigMoney
                label="Property, at today's value"
                currency={currency}
                cents={toCents(data.propertyValue)}
                onCents={(c) => patch((p) => ({ ...p, propertyValue: c / 100 }))}
              />
              <BigMoney
                label={data.taxRegion === 'NZ' ? 'KiwiSaver' : 'Superannuation'}
                currency={currency}
                cents={toCents(retirement?.value ?? 0)}
                onCents={setRetirement}
              />
              <p className="ob-note">Shares and crypto come next, on the Holdings page.</p>
            </>
          )}

          {step === 3 && (
            <>
              <p className="ob-kicker">Step 3 of 4</p>
              <h1 className="ob-h1">
                What do you <em>owe?</em>
              </h1>
              <p className="ob-lede">
                Debt counts against you here — that is the difference between a net worth and a
                brag.
              </p>
              <BigMoney
                autoFocus
                label="Mortgage still owing"
                currency={currency}
                cents={toCents(mortgage?.value ?? 0)}
                onCents={(c) => setNamedLiability('Mortgage', c)}
              />
              <BigMoney
                label="Everything else — cards, loans, student debt"
                currency={currency}
                cents={toCents(otherDebt?.value ?? 0)}
                onCents={(c) => setNamedLiability('Other debts', c)}
              />
            </>
          )}

          {step === 4 && (
            <>
              <p className="ob-kicker">Step 4 of 4</p>
              <h1 className="ob-h1">
                What do you <em>keep?</em>
              </h1>
              <p className="ob-lede">
                Your savings rate drives the projection. Without it we would be making the number
                up.
              </p>
              <BigMoney
                autoFocus
                label="Take-home pay, per month"
                currency={currency}
                cents={toCents(income)}
                onCents={(c) =>
                  patch((p) => ({ ...p, budget: { ...p.budget, monthlyIncome: c / 100 } }))
                }
              />
              <BigMoney
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
                <p className="ob-readout">
                  You keep <strong>{formatCents(toCents(leftover), currency, 0)}</strong> a month —
                  a savings rate of <strong>{rate}%</strong>.
                </p>
              )}
            </>
          )}

          {step === 5 && (
            <>
              <p className="ob-kicker">All set</p>
              <h1 className="ob-h1">
                Your net worth is <em>this.</em>
              </h1>
              <p className="ob-figure">{isHydrated ? formatCents(netCents, currency, 0) : '—'}</p>
              <div className="ob-summary">
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
              <p className="ob-note">
                Every figure is editable, and the projection on your dashboard is driven by the
                savings rate you just entered.
              </p>
            </>
          )}

          <div className="ob-actions">
            {step > 0 && step < STEPS.length - 1 && (
              <button type="button" className="cta cta-secondary" onClick={back}>
                Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button type="button" className="cta cta-primary" onClick={next}>
                {step === 0 ? 'Get started' : 'Continue'}
              </button>
            ) : (
              <button type="button" className="cta cta-primary" onClick={finish}>
                Open my dashboard
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
