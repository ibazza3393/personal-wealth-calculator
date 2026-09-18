import Link from 'next/link';
import { LEGAL } from '@/lib/legal';

export const metadata = {
  title: `Privacy Policy — ${LEGAL.product}`,
  description: `How ${LEGAL.company} collects, uses and protects personal information in the ${LEGAL.product} application.`,
};

export default function PrivacyPage() {
  return (
    <main className="lx-legal-page">
      <p className="lx-legal-kicker">Legal</p>
      <h1>Privacy Policy</h1>
      <p className="lx-legal-meta">
        {LEGAL.product}, an application by {LEGAL.company} · Last updated {LEGAL.lastUpdated}
      </p>

      <div className="lx-legal-body">
        <p>
          <strong>In simple terms</strong> — {LEGAL.product} is built to help you understand what you
          own and what you owe. The figures you enter stay on your own device. We never ask for your
          internet banking password, we cannot move your money, and we do not sell your personal
          information to anyone.
        </p>
        <p>
          This Policy explains what we collect, why we collect it, and what you can do about it. It
          applies to the {LEGAL.product} application and website, operated by {LEGAL.company} (
          <strong>&ldquo;we&rdquo;</strong>, <strong>&ldquo;us&rdquo;</strong>), a company
          incorporated in {LEGAL.jurisdiction}, and should be read together with our{' '}
          <Link href="/terms">Terms of Use</Link>.
        </p>

        <h2>1. What personal information we collect</h2>
        <p>We collect only what the product needs to work:</p>
        <ul>
          <li>
            <strong>Account information</strong> — your name and email address, collected when you
            create an account or sign in with Google.
          </li>
          <li>
            <strong>Financial figures you enter</strong> — cash, KiwiSaver or super, shares, crypto,
            property, debts, income and expenses, and the assumptions you set for forecasts and
            comparisons.
          </li>
          <li>
            <strong>Connected account data</strong> — where you choose to connect a bank or provider,
            the balances and account details that provider shares with us under the consent you give.
          </li>
          <li>
            <strong>Technical information</strong> — basic device, browser and log information needed
            to keep the service secure and working.
          </li>
        </ul>
        <p>
          We do not collect your internet banking password, and we do not ask for identity documents
          or biometrics.
        </p>

        <h2>2. Where your figures are stored</h2>
        <p>
          The figures you type into {LEGAL.product} are written to local storage in your own browser,
          on your own device. They are not uploaded to us unless you sign in and turn on syncing so
          your data is available on more than one device. If you use the product without an account,
          there is no copy of your holdings on our systems at all.
        </p>
        <p>
          Clearing your browser data, or using the in-app delete option, removes those figures from
          your device. Deleting your account removes the information we hold about you, other than
          anything we are legally required to keep.
        </p>

        <h2>3. Bank and provider connections</h2>
        <p>
          Bank data reaches us through licensed intermediaries — Akahu in {LEGAL.jurisdiction} and the
          Consumer Data Right regime in Australia. These connections are:
        </p>
        <ul>
          <li>
            <strong>Consent-based</strong> — you authorise the connection with your bank or provider,
            not with us, and you can revoke it at any time.
          </li>
          <li>
            <strong>Read-only</strong> — the connection can see balances and transactions. Nothing in{' '}
            {LEGAL.product} can move money, open accounts or make payments.
          </li>
          <li>
            <strong>Password-free</strong> — we never see, store or ask for your banking credentials.
          </li>
        </ul>

        <h2>4. How we use your personal information</h2>
        <p>We use personal information to:</p>
        <ul>
          <li>provide the application, calculate your net worth, and produce your projections;</li>
          <li>authenticate you and keep your account secure;</li>
          <li>respond to you when you contact us for support;</li>
          <li>fix faults, diagnose errors and improve the product; and</li>
          <li>meet our legal obligations in {LEGAL.jurisdiction} and Australia.</li>
        </ul>
        <p>
          Market prices and exchange rates are fetched from public data sources. Those requests carry
          the symbols being priced — they never carry your holdings, quantities or balances.
        </p>

        <h2>5. Who we share it with</h2>
        <p>
          We do not sell your personal information. We share it only with service providers who help
          us run the product — authentication and hosting providers, and the account-connection
          intermediaries named above — and only to the extent they need it to provide that service.
          We may also disclose information where we are required to by law.
        </p>

        <h2>6. Security and storage</h2>
        <p>
          We use reputable cloud infrastructure providers, and information may be stored on servers
          located outside {LEGAL.jurisdiction}. We take reasonable steps to protect personal
          information from loss, misuse and unauthorised access, but no method of transmission or
          storage is completely secure, and we cannot guarantee absolute security.
        </p>

        <h2>7. Cookies</h2>
        <p>
          We use cookies and similar browser storage to keep you signed in and to remember your
          preferences, such as your theme and display currency. You can block cookies in your browser
          settings, but parts of the service may stop working.
        </p>

        <h2>8. Access, correction and deletion</h2>
        <p>
          You have the right to ask for access to the personal information we hold about you, to ask
          us to correct it, and to ask us to delete it. Most of it you can view, edit and delete
          yourself inside the application. For anything else, contact us at{' '}
          <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
        </p>

        <h2>9. Children</h2>
        <p>
          {LEGAL.product} is not intended for people under 16, and we do not knowingly collect their
          personal information.
        </p>

        <h2>10. Changes to this Policy</h2>
        <p>
          We may update this Policy from time to time. We will post the updated version here and
          change the &ldquo;last updated&rdquo; date above. If a change materially reduces your
          rights, we will give you notice before it takes effect.
        </p>

        <h2>11. Contact us</h2>
        <p>
          {LEGAL.company}
          <br />
          {LEGAL.jurisdiction}
          <br />
          <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>
        </p>
        <p>
          This Policy is governed by the laws of {LEGAL.jurisdiction}, including the Privacy Act 2020.
        </p>
      </div>

      <Link href="/" className="lx-legal-back">
        ← Back to {LEGAL.product}
      </Link>
    </main>
  );
}
