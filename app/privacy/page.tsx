import Link from 'next/link';
import { LEGAL } from '@/lib/legal';

export const metadata = {
  title: `Privacy notice — ${LEGAL.product}`,
  description: `What ${LEGAL.product} collects, why, how long it is kept, and how to remove it.`,
};

/**
 * Public by design — proxy.ts lets /privacy through without a session.
 *
 * Akahu's accreditation review reads this before they have an account, and so
 * does anyone deciding whether to sign up. A privacy notice behind a login is
 * not a privacy notice. It names Akahu explicitly, which the Tier 2 review
 * checks for, and states retention and deletion in concrete terms.
 */
export default function PrivacyPage() {
  return (
    <main className="lx-legal-page">
      <p className="lx-legal-kicker">Legal</p>
      <h1>
        Your money, and
        <br />
        <em>your</em> business.
      </h1>
      <p className="lx-legal-meta">
        Privacy notice · {LEGAL.product}, by {LEGAL.company} · Updated {LEGAL.lastUpdated}
      </p>

      <div className="lx-legal-body">
        <p className="lx-legal-lede">
          We never see a banking password, nothing here can move your money, and none of your data
          is for sale. What we do hold, we hold for one purpose, we encrypt it, and we delete it
          when you say so. This is how that works, under the Privacy Act 2020.
        </p>

        <p>
          It covers the {LEGAL.product} app and website, run by {LEGAL.company} (<strong>we</strong>,{' '}
          <strong>us</strong>), a company registered in {LEGAL.jurisdiction}. Read it alongside the{' '}
          <Link href="/terms">Terms of Use</Link>.
        </p>

        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Who you are.</strong> Your email address, and &mdash; if you sign in with Google
            &mdash; the name and email Google returns. We never receive your Google password.
          </li>
          <li>
            <strong>Bank data, if you connect a bank.</strong> Through Akahu: your account names and
            types, balances, and transaction history, including dates, amounts, descriptions and
            merchant names.
          </li>
          <li>
            <strong>The figures you enter yourself.</strong> Property values, holdings, manual
            balances, spending, and the assumptions behind your forecasts.
          </li>
        </ul>
        <p>
          We do not ask for identity documents, and we do not collect biometrics.
        </p>

        <h2>Where it lives</h2>
        <p>
          What you type yourself is written to local storage in your own browser. Use{' '}
          {LEGAL.product} without connecting a bank and your figures never leave your device.
        </p>
        <p>
          Connect a bank and the balances and transactions Akahu returns are stored on our servers
          against your account, because the sync has to run whether or not your browser is open.
          Every row is restricted to your account at the database level, so one account cannot read
          another&rsquo;s.
        </p>

        <h2>Never your password</h2>
        <p>
          We use <strong>Akahu</strong>, New Zealand&rsquo;s open finance platform, as the data
          source and processor for bank connections. You authorise Akahu on Akahu&rsquo;s own
          screens, and Akahu passes us read-only account information. We never see or store your
          bank login details, and we hold no permission to move money.
        </p>
        <p>
          Akahu handles that data under its own privacy policy. You can see and revoke every
          app&rsquo;s access at{' '}
          <a href="https://my.akahu.nz" rel="noreferrer noopener" target="_blank">
            my.akahu.nz
          </a>
          . In Australia, connections run under the Consumer Data Right regime on the same terms:
          your consent, read-only, revocable by you.
        </p>

        <h2>Why we collect it</h2>
        <p>
          To show your net worth, categorise your spending, and track both over time. That is the
          only purpose. We do not sell your data, share it with advertisers or data brokers, or use
          it for credit assessment or marketing.
        </p>
        <p>
          Prices and exchange rates come from public market data. Those requests carry the ticker
          being priced and nothing else &mdash; not how much of it you hold, and not what you are
          worth.
        </p>

        <h2>How long we keep it</h2>
        <p>
          Transactions are kept for <strong>24 months</strong> &mdash; a year of history plus a year
          to compare it against &mdash; and older ones are deleted automatically.
        </p>
        <p>
          Revoke a bank connection and the balances and transactions from that connection are
          deleted. Revoke all access, or delete your account, and every piece of bank data we hold
          for you is deleted and your Akahu authorisation is revoked at the same time.
        </p>

        <h2>How it is protected</h2>
        <p>
          All traffic is encrypted in transit with TLS. Your Akahu access token is encrypted at rest
          with AES-256-GCM under a key held only in our server environment, and is never sent to
          your browser or included in any app download. Row-level security keeps your data to your
          account.
        </p>
        <p>
          No system is perfectly secure, and we will not pretend otherwise &mdash; but there is no
          password of yours for anyone to take, and no ability to move money for anyone to abuse.
        </p>

        <h2>Your choices</h2>
        <p>
          Disconnect one bank or all of them from{' '}
          <Link href="/connections">Connections</Link>, and delete your account and everything in it
          from the same page. Under the Privacy Act 2020 you can also ask us for a copy of the
          personal information we hold about you, or ask us to correct it.
        </p>

        <h2>Cookies, briefly</h2>
        <p>
          We use cookies and browser storage to keep you signed in and to remember your preferences,
          like your theme and display currency. Block them in your browser if you would rather
          &mdash; parts of the app will stop working.
        </p>

        <h2>Under 16</h2>
        <p>
          {LEGAL.product} is not built for people under 16, and we do not knowingly collect their
          personal information.
        </p>

        <h2>When this changes</h2>
        <p>
          We will post the new version here and update the date above. If a change cuts into your
          rights, we will tell you before it takes effect.
        </p>

        <h2>Talk to us</h2>
        <p>
          {LEGAL.company}
          <br />
          {LEGAL.jurisdiction}
          <br />
          <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>
        </p>
        <p>
          For a privacy request or complaint, email us at that address. You can also complain to the{' '}
          <a href="https://www.privacy.org.nz" rel="noreferrer noopener" target="_blank">
            Office of the Privacy Commissioner
          </a>
          .
        </p>
      </div>

      <Link href="/" className="lx-legal-back">
        ← Back to {LEGAL.product}
      </Link>
    </main>
  );
}
