import Link from 'next/link';
import { LEGAL } from '@/lib/legal';

export const metadata = {
  title: `Terms of Use — ${LEGAL.product}`,
  description: `The terms on which ${LEGAL.company} provides the ${LEGAL.product} application.`,
};

export default function TermsPage() {
  return (
    <main className="lx-legal-page">
      <p className="lx-legal-kicker">Legal</p>
      <h1>Terms of Use</h1>
      <p className="lx-legal-meta">
        {LEGAL.product}, an application by {LEGAL.company} · Last updated {LEGAL.lastUpdated}
      </p>

      <div className="lx-legal-body">
        <p>
          <strong>In simple terms</strong> — {LEGAL.product} is here to help you understand and manage
          your finances. These terms are designed to be fair, transparent and protective of your
          rights. You stay in control of your account and your figures, your consumer protections
          under {LEGAL.jurisdiction} law remain intact, and you can stop using {LEGAL.product} at any
          time. {LEGAL.product} gives you numbers, not advice — the decisions are yours.
        </p>
        <p>
          These terms are a contract between you and {LEGAL.company}, trading as {LEGAL.product} (
          <strong>&ldquo;we&rdquo;</strong>, <strong>&ldquo;us&rdquo;</strong>), and govern your use
          of the {LEGAL.product} application and services. By using {LEGAL.product} you agree to them,
          and to our <Link href="/privacy">Privacy Policy</Link>.
        </p>
        <p>
          We may revise these terms from time to time. Revised terms take effect when posted here,
          unless otherwise stated. If a change reduces your rights or increases your
          responsibilities, we will give you at least 30 days&rsquo; notice. Continuing to use{' '}
          {LEGAL.product} after a change takes effect means you accept it. If you do not agree, you
          may close your account at any time.
        </p>

        <h2>1. Not financial advice</h2>
        <p>
          {LEGAL.product} is an information and calculation tool. Net worth figures, allocations,
          forecasts, comparisons and tax estimates are illustrative, are based on the figures and
          assumptions you enter, and are <strong>not</strong> financial, investment, tax or legal
          advice. We are not a registered financial adviser. Before acting on anything you see here,
          consider getting advice from a licensed professional about your own circumstances.
        </p>
        <p>
          Tax calculations use resident rates for {LEGAL.jurisdiction} and Australia and are
          simplified. They will not match your actual tax position.
        </p>

        <h2>2. Opening an account</h2>
        <p>
          You may use {LEGAL.product} without an account. If you create one, you must be at least 16
          years old, give accurate information, and keep your sign-in credentials secure. You are
          responsible for activity that happens under your account.
        </p>

        <h2>3. Your data and your figures</h2>
        <p>
          The figures you enter are yours. They are stored in your own browser unless you sign in and
          enable syncing. We do not sell them, and we do not use them to market to third parties.
          Deleting them is something you can do yourself at any time. How we handle personal
          information is set out in our <Link href="/privacy">Privacy Policy</Link>.
        </p>

        <h2>4. Connected accounts</h2>
        <p>
          Where you connect a bank or provider, you do so under consent you give to a licensed
          intermediary — Akahu in {LEGAL.jurisdiction}, or the Consumer Data Right regime in
          Australia. Those connections are read-only. {LEGAL.product} cannot move money, make
          payments or change anything at your bank. You can revoke a connection at any time, and you
          are responsible for keeping your consents current.
        </p>

        <h2>5. Restricted activities</h2>
        <p>In using {LEGAL.product}, you must not:</p>
        <ul>
          <li>breach these terms, any other agreement with us, or any law;</li>
          <li>misuse our or any third party&rsquo;s intellectual property or privacy rights;</li>
          <li>act in a manner that is defamatory, threatening or harassing;</li>
          <li>provide false, inaccurate or misleading information;</li>
          <li>
            interfere with or disrupt the {LEGAL.product} services, or any networks or servers used to
            provide them;
          </li>
          <li>
            attempt to gain unauthorised access to any account, system or data, or use automated means
            to scrape or overload the service; or
          </li>
          <li>use the service to access financial information you are not entitled to access.</li>
        </ul>

        <h2>6. Our rights</h2>
        <p>
          We may suspend or terminate your access to {LEGAL.product} if you breach these terms, or
          where we reasonably need to in order to protect the service or other users. We may change,
          suspend or discontinue features. Our failure to act on a breach is not a waiver of our right
          to act on it, or on a later breach.
        </p>

        <h2>7. Warranty and liability</h2>
        <p>
          Nothing in these terms is intended to limit your rights under the Consumer Guarantees Act
          1993, the Fair Trading Act 1986, or any other obligation that cannot be excluded by law.
        </p>
        <p>
          Otherwise, {LEGAL.product} is provided &ldquo;as is&rdquo;, without warranty of any kind,
          express or implied. We do not warrant that the service will be uninterrupted or error-free,
          that market prices or exchange rates will be accurate or current, or that any projection
          will be achieved. To the extent permitted by law, we are not liable for any indirect or
          consequential loss, or for any loss arising from decisions you make based on the figures the
          service produces.
        </p>
        <p>
          You indemnify us against claims arising from your breach of these terms or your misuse of
          the service.
        </p>

        <h2>8. Third party data and services</h2>
        <p>
          Market data is sourced from third parties, including CoinGecko and Yahoo Finance, and bank
          connections are provided by Akahu ({LEGAL.jurisdiction}) and CDR data holders (Australia).
          We do not control those services and are not responsible for their content, accuracy or
          availability.
        </p>

        <h2>9. Intellectual property</h2>
        <p>
          &ldquo;{LEGAL.product}&rdquo; and the logos, content, software and systems used to provide
          the service are owned by {LEGAL.company} or its licensors. You may use them only as these
          terms allow.
        </p>

        <h2>10. Support and communications</h2>
        <p>
          Support is available at{' '}
          <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a> during standard{' '}
          {LEGAL.jurisdiction} business hours. By using {LEGAL.product} you agree we may send you
          service communications about your account. You can opt out of marketing communications at
          any time using the unsubscribe link or by writing to us.
        </p>

        <h2>11. General</h2>
        <ul>
          <li>These terms are the entire agreement between you and us in relation to the service.</li>
          <li>
            If any provision is held to be invalid, illegal or unenforceable, it is severed and the
            rest remains in force.
          </li>
          <li>You may not transfer your rights under these terms without our consent.</li>
          <li>
            These terms are governed by the laws of {LEGAL.jurisdiction}, and you submit to the
            non-exclusive jurisdiction of its courts.
          </li>
        </ul>

        <h2>12. Contact</h2>
        <p>
          {LEGAL.company}
          <br />
          {LEGAL.jurisdiction}
          <br />
          <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>
        </p>
      </div>

      <Link href="/" className="lx-legal-back">
        ← Back to {LEGAL.product}
      </Link>
    </main>
  );
}
