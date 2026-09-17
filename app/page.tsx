import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ArrowLeftRight,
  ChartLine,
  CreditCard,
  EyeOff,
  KeyRound,
  Layers,
  Receipt,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { SignInCta } from '@/components/SignInCta';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Next Wealth — every dollar you own, in one number',
  description:
    'A private net worth dashboard for New Zealand and Australia. Read-only bank access, never passwords. Your holdings stay in your browser.',
};

const TRACK_CARDS = [
  {
    icon: Wallet,
    title: 'Know your number',
    body: 'Cash, KiwiSaver, super, shares, crypto, property and debt in one net worth.',
    tone: 'blue' as const,
  },
  {
    icon: Layers,
    title: 'See the mix',
    body: 'Allocation across every asset class, and how far it has drifted.',
    tone: 'violet' as const,
  },
  {
    icon: CreditCard,
    title: 'Watch the outflow',
    body: 'Monthly cashflow by category, with a savings rate that feeds the plan.',
    tone: 'green' as const,
  },
  {
    icon: ChartLine,
    title: 'Price it live',
    body: 'Public quotes value your holdings. Prices come in, holdings never go out.',
    tone: 'amber' as const,
  },
  {
    icon: ArrowLeftRight,
    title: 'Test the big call',
    body: 'Buy, rent or index — same capital, same budget, three ending numbers.',
    tone: 'blue' as const,
  },
  {
    icon: Receipt,
    title: 'Both tax systems',
    body: 'Resident rates for New Zealand and Australia behind every projection.',
    tone: 'violet' as const,
  },
];

const PRIVACY = [
  {
    icon: EyeOff,
    title: 'Stays in your browser',
    body: 'What you type is written to local storage on your own device. There is no holdings database to breach.',
  },
  {
    icon: KeyRound,
    title: 'Never your password',
    body: 'Bank data arrives through Akahu in New Zealand and CDR in Australia — consent-based and revocable by you.',
  },
  {
    icon: ShieldCheck,
    title: 'Read-only, always',
    body: 'Nothing here can move money. The connection sees balances and nothing else.',
  },
];

export default async function LandingPage() {
  // Someone with a session came back to the front door — send them inside.
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect('/dashboard');
  }

  return (
    <div className="landing">
      {/* ---------- Nav ---------- */}
      <header className="lx-nav">
        <div className="lx-nav-pill glass liquid-glass-chrome">
          <Link href="/" className="lx-mark">
            <span className="lx-mark-glyph" aria-hidden>
              N
            </span>
            <span className="lx-mark-word">Next Wealth</span>
          </Link>
          <nav className="lx-nav-links" aria-label="Sections">
            <a href="#track">Track</a>
            <a href="#decide">Decide</a>
            <a href="#privacy">Privacy</a>
          </nav>
          <div className="lx-nav-actions">
            <Link href="/dashboard" className="lx-quiet">
              Open app
            </Link>
            <SignInCta variant="primary" label="Get started" />
          </div>
        </div>
      </header>

      <main>
        {/* ---------- Hero over sky ---------- */}
        <section className="lx-hero">
          <div className="lx-sky" aria-hidden>
            <span className="lx-cloud lx-cloud-a" />
            <span className="lx-cloud lx-cloud-b" />
            <span className="lx-cloud lx-cloud-c" />
          </div>

          <div className="lx-hero-copy">
            <h1 className="lx-h1">
              Meet your <em>whole</em>
              <br />
              financial picture.
            </h1>
            <p className="lx-hero-sub">
              Every dollar you own and owe, across New Zealand and Australia, in one private number
              that updates while you sleep.
            </p>
            <div className="lx-hero-cta">
              <SignInCta variant="primary" label="Get started" />
              <Link href="/dashboard" className="cta cta-ghost">
                Explore without an account
              </Link>
            </div>
          </div>

          {/* Device */}
          <div className="lx-device-wrap">
            <div className="lx-device" aria-hidden>
              <div className="lx-device-screen">
                <div className="lx-scr-top">
                  <span className="lx-scr-label">Net worth</span>
                  <span className="lx-scr-chip">NZD</span>
                </div>
                <p className="lx-scr-figure">$1,284,320</p>
                <p className="lx-scr-delta">
                  <span>▲ 4.8%</span> this year
                </p>

                <svg className="lx-scr-spark" viewBox="0 0 280 64" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="lxFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#30d158" stopOpacity="0.34" />
                      <stop offset="100%" stopColor="#30d158" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 52 L35 46 L70 49 L105 36 L140 39 L175 24 L210 28 L245 13 L280 6 L280 64 L0 64 Z"
                    fill="url(#lxFill)"
                  />
                  <path
                    d="M0 52 L35 46 L70 49 L105 36 L140 39 L175 24 L210 28 L245 13 L280 6"
                    fill="none"
                    stroke="#30d158"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <div className="lx-scr-alloc">
                  <span style={{ width: '38%', background: '#0a84ff' }} />
                  <span style={{ width: '24%', background: '#ffd60a' }} />
                  <span style={{ width: '18%', background: '#30d158' }} />
                  <span style={{ width: '12%', background: '#64d2ff' }} />
                  <span style={{ width: '8%', background: '#bf5af2' }} />
                </div>

                <div className="lx-scr-rows">
                  {[
                    ['Property', '$842,000'],
                    ['KiwiSaver', '$186,400'],
                    ['Shares', '$204,180'],
                    ['Mortgage', '−$412,000'],
                  ].map(([k, v]) => (
                    <div className="lx-scr-row" key={k}>
                      <span>{k}</span>
                      <strong>{v}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lx-float lx-float-a" aria-hidden>
              <span>Savings rate</span>
              <strong>31%</strong>
            </div>
            <div className="lx-float lx-float-b" aria-hidden>
              <span>Projected · 30y</span>
              <strong>$4.1m</strong>
            </div>
          </div>
        </section>

        {/* ---------- Statement band ---------- */}
        <section className="lx-band">
          <div className="lx-band-inner">
            <h2 className="lx-h2 lx-h2-center">
              You shouldn&rsquo;t have to <em>guess</em>
              <br />
              what you&rsquo;re worth.
            </h2>
            <div className="lx-band-facts">
              <div>
                <strong>6</strong>
                <span>asset classes</span>
              </div>
              <div>
                <strong>2</strong>
                <span>tax systems</span>
              </div>
              <div>
                <strong>0</strong>
                <span>passwords shared</span>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Track ---------- */}
        <section className="lx-section" id="track">
          <h2 className="lx-h2 lx-h2-center">
            <em>Track</em> your entire
            <br />
            financial life.
          </h2>
          <div className="lx-cards">
            {TRACK_CARDS.map(({ icon: Icon, title, body, tone }) => (
              <article key={title} className={`lx-card panel liquid-glass-card lx-tone-${tone}`}>
                <span className="lx-card-icon" aria-hidden>
                  <Icon size={20} strokeWidth={1.75} />
                </span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ---------- Bento: decide ---------- */}
        <section className="lx-section" id="decide">
          <h2 className="lx-h2 lx-h2-center">
            <em>Decide</em> with numbers,
            <br />
            not vibes.
          </h2>

          <div className="lx-bento">
            <article className="lx-tile lx-tile-lg lx-grad-amber">
              <h3>
                Buy the house, or
                <br />
                <em>invest the deposit?</em>
              </h3>
              <p>
                Same capital, same monthly budget, three paths — home equity net of what the
                mortgage really costs, rent plus the invested difference, or the index alone.
              </p>
            </article>

            <article className="lx-tile lx-tile-dark">
              <div className="lx-paths">
                {[
                  { label: 'Buy & hold', value: '$407,277', pct: 47, tone: '#ffd60a' },
                  { label: 'Rent + invest', value: '$306,290', pct: 36, tone: '#64d2ff' },
                  { label: 'Index only', value: '$858,966', pct: 100, tone: '#30d158' },
                ].map((row) => (
                  <div className="lx-path" key={row.label}>
                    <div className="lx-path-head">
                      <span>{row.label}</span>
                      <strong>{row.value}</strong>
                    </div>
                    <div className="lx-path-track">
                      <span style={{ width: `${row.pct}%`, background: row.tone }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="lx-tile-foot">Illustrative · 10 years · $100k start · $3k/month</p>
            </article>

            <article className="lx-tile lx-tile-dark">
              <p className="lx-tile-kicker">Projection</p>
              <p className="lx-tile-figure">$4,108,540</p>
              <p className="lx-tile-note">
                What today&rsquo;s savings rate becomes in thirty years, at the return you choose.
              </p>
            </article>

            <article className="lx-tile lx-tile-lg lx-grad-green">
              <h3>
                We show the
                <br />
                <em>whole picture.</em>
              </h3>
              <p>
                Debt counts against you, tax comes off the top, and the projection is driven by what
                you actually save — not a number we made up.
              </p>
            </article>
          </div>
        </section>

        {/* ---------- Privacy ---------- */}
        <section className="lx-section" id="privacy">
          <h2 className="lx-h2 lx-h2-center">
            A money app that never
            <br />
            asks for <em>the keys.</em>
          </h2>
          <div className="lx-cards lx-cards-3">
            {PRIVACY.map(({ icon: Icon, title, body }) => (
              <article key={title} className="lx-card panel liquid-glass-card lx-tone-green">
                <span className="lx-card-icon" aria-hidden>
                  <Icon size={20} strokeWidth={1.75} />
                </span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ---------- Final ---------- */}
        <section className="lx-final">
          <div className="lx-final-inner">
            <div className="lx-final-glow" aria-hidden />
            <h2 className="lx-h2 lx-h2-center">
              Find out what you&rsquo;re
              <br />
              <em>actually</em> worth.
            </h2>
            <p className="lx-final-sub">
              Nothing to install. Start without an account and sign in when you want it on every
              device.
            </p>
            <div className="lx-hero-cta lx-center">
              <SignInCta variant="primary" label="Get started" />
              <Link href="/dashboard" className="cta cta-ghost">
                Explore without an account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="lx-footer">
        <div className="lx-footer-top">
          <span className="lx-mark">
            <span className="lx-mark-glyph" aria-hidden>
              N
            </span>
            <span className="lx-mark-word">Next Wealth</span>
          </span>
          <nav aria-label="Footer">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/holdings">Holdings</Link>
            <Link href="/spend">Spend</Link>
            <Link href="/compare">Compare</Link>
            <Link href="/markets">Markets</Link>
            <Link href="/connections">Connections</Link>
          </nav>
        </div>
        <p className="lx-legal">
          Projections and tax figures are illustrative and are not financial advice. Market data from
          CoinGecko and Yahoo Finance. Bank connections via Akahu (NZ) and CDR (AU).
        </p>
      </footer>
    </div>
  );
}
