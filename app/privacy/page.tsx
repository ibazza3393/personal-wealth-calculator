import Link from 'next/link';
import { LEGAL } from '@/lib/legal';

export const metadata = {
  title: `Privacy Policy — ${LEGAL.product}`,
  description: `What ${LEGAL.product} collects, where your figures live, and what we will never do with them.`,
};

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
        Privacy Policy · {LEGAL.product}, by {LEGAL.company} · Updated {LEGAL.lastUpdated}
      </p>

      <div className="lx-legal-body">
        <p className="lx-legal-lede">
          The figures you type stay on your own device. We never ask for a banking password. Nothing
          here can move your money, and none of it is for sale. That is the whole idea, and the rest
          of this page is the detail behind it.
        </p>

        <p>
          This applies to the {LEGAL.product} app and website, run by {LEGAL.company} (
          <strong>we</strong>, <strong>us</strong>), a company registered in {LEGAL.jurisdiction}.
          Read it alongside the <Link href="/terms">Terms of Use</Link>.
        </p>

        <h2>What we collect</h2>
        <p>Only what the product needs to work:</p>
        <ul>
          <li>
            <strong>Your account</strong> — name and email, when you create one or sign in with
            Google.
          </li>
          <li>
            <strong>The figures you enter</strong> — cash, KiwiSaver, super, shares, crypto,
            property, debts, income, spending, and the assumptions behind your forecasts.
          </li>
          <li>
            <strong>Connected balances</strong> — if you connect a bank, what that bank shares under
            the consent you gave it.
          </li>
          <li>
            <strong>The basics</strong> — device, browser and log data, to keep the service up and
            secure.
          </li>
        </ul>
        <p>
          We do not ask for your banking password. We do not ask for identity documents, and we do
          not collect biometrics.
        </p>

        <h2>Where your figures live</h2>
        <p>
          On your device. What you type is written to local storage in your own browser. Use{' '}
          {LEGAL.product} without an account and there is no copy of your holdings anywhere but
          there &mdash; no database of ours to breach.
        </p>
        <p>
          Sign in and turn on syncing, and a copy is kept so your number follows you between
          devices. Clear your browser data, or delete it in the app, and it is gone from that device.
          Delete your account and we remove what we hold, except anything the law requires us to
          keep.
        </p>

        <h2>Never your password</h2>
        <p>
          Bank data reaches us through licensed intermediaries &mdash; Akahu in {LEGAL.jurisdiction},
          and the Consumer Data Right regime in Australia. Three things are always true of those
          connections:
        </p>
        <ul>
          <li>
            <strong>You give the consent</strong>, to your bank, and you can pull it back whenever
            you like.
          </li>
          <li>
            <strong>They are read-only.</strong> The connection sees balances. Nothing in{' '}
            {LEGAL.product} can move money, open an account or make a payment.
          </li>
          <li>
            <strong>Your credentials stay yours.</strong> We never see them, store them or ask for
            them.
          </li>
        </ul>

        <h2>What we do with it</h2>
        <p>We use what we hold to:</p>
        <ul>
          <li>run the app &mdash; your net worth, your allocation, your projections;</li>
          <li>keep you signed in and your account secure;</li>
          <li>answer you when you get in touch;</li>
          <li>find and fix what is broken; and</li>
          <li>meet our legal obligations in {LEGAL.jurisdiction} and Australia.</li>
        </ul>
        <p>
          Prices and exchange rates come from public market data. Those requests carry the ticker
          being priced and nothing else &mdash; not how much of it you hold, and not what you are
          worth.
        </p>

        <h2>Who else sees it</h2>
        <p>
          We do not sell your personal information, and we do not hand it to advertisers. It reaches
          the providers who help us run the product &mdash; hosting, authentication, and the bank
          connection intermediaries above &mdash; and only as far as they need it to do that job. We
          disclose it otherwise only where the law requires.
        </p>

        <h2>How we keep it safe</h2>
        <p>
          We use established cloud providers, which means some information is stored on servers
          outside {LEGAL.jurisdiction}. We take reasonable steps to protect it from loss, misuse and
          unauthorised access. No system is perfectly secure, and we will not pretend otherwise.
        </p>

        <h2>Cookies, briefly</h2>
        <p>
          We use cookies and browser storage to keep you signed in and to remember your preferences,
          like your theme and display currency. Block them in your browser if you would rather
          &mdash; parts of the app will stop working.
        </p>

        <h2>Your call, always</h2>
        <p>
          You can ask us what we hold about you, ask us to correct it, and ask us to delete it. Most
          of it you can see, edit and delete yourself inside the app. For anything else, email{' '}
          <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
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
          This policy is governed by {LEGAL.jurisdiction} law, including the Privacy Act 2020.
        </p>
      </div>

      <Link href="/" className="lx-legal-back">
        ← Back to {LEGAL.product}
      </Link>
    </main>
  );
}
