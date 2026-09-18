import Link from 'next/link';
import { LEGAL } from '@/lib/legal';

export const metadata = {
  title: `Terms of Use — ${LEGAL.product}`,
  description: `The deal between you and ${LEGAL.company}: what ${LEGAL.product} does, what it will never do, and where the limits sit.`,
};

export default function TermsPage() {
  return (
    <main className="lx-legal-page">
      <p className="lx-legal-kicker">Legal</p>
      <h1>
        The deal, in
        <br />
        <em>plain</em> words.
      </h1>
      <p className="lx-legal-meta">
        Terms of Use · {LEGAL.product}, by {LEGAL.company} · Updated {LEGAL.lastUpdated}
      </p>

      <div className="lx-legal-body">
        <p className="lx-legal-lede">
          {LEGAL.product} gives you a number and shows you where it goes from here. It does not tell
          you what to do with your money &mdash; that call stays yours. You keep control of your
          account and your figures, your consumer rights under {LEGAL.jurisdiction} law are untouched,
          and you can walk away whenever you like.
        </p>

        <p>
          This is an agreement between you and {LEGAL.company}, trading as {LEGAL.product} (
          <strong>we</strong>, <strong>us</strong>), covering the {LEGAL.product} app and services.
          Using it means you accept these terms and our <Link href="/privacy">Privacy Policy</Link>.
        </p>
        <p>
          We may revise them. New terms take effect when posted here, except where a change cuts into
          your rights or adds to your obligations &mdash; then you get at least 30 days&rsquo; notice.
          Keep using {LEGAL.product} afterwards and you have accepted it. Disagree, and you can close
          your account at any time.
        </p>

        <h2>Numbers, not advice</h2>
        <p>
          This is a calculator, not an adviser. Net worth, allocation, forecasts, comparisons and tax
          estimates are illustrative, built from the figures and assumptions <em>you</em> enter, and
          are not financial, investment, tax or legal advice. We are not a registered financial
          adviser. Before you act on anything you see here, talk to someone licensed who knows your
          situation.
        </p>
        <p>
          Tax uses resident rates for {LEGAL.jurisdiction} and Australia, simplified. It will not
          match your actual tax position.
        </p>

        <h2>Your account</h2>
        <p>
          You can use {LEGAL.product} without one. If you create one, be at least 16, give us
          accurate details, and keep your sign-in secure. What happens under your account is your
          responsibility.
        </p>

        <h2>Your figures are yours</h2>
        <p>
          They live in your browser unless you sign in and switch on syncing. We do not sell them and
          we do not market off them. You can delete them yourself, any time. The detail is in the{' '}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>

        <h2>Connections are read-only</h2>
        <p>
          Connect a bank and the consent goes to a licensed intermediary &mdash; Akahu in{' '}
          {LEGAL.jurisdiction}, or the Consumer Data Right regime in Australia. Those connections
          read balances. {LEGAL.product} cannot move money, make payments, or change a thing at your
          bank. Revoke a connection whenever you want; keeping your consents current is on you.
        </p>

        <h2>What you agree not to do</h2>
        <ul>
          <li>break these terms, another agreement with us, or the law;</li>
          <li>misuse anyone&rsquo;s intellectual property or privacy rights, ours included;</li>
          <li>feed us information you know is false or misleading;</li>
          <li>harass or threaten our people, or other users;</li>
          <li>disrupt the service, or the networks and servers behind it;</li>
          <li>
            scrape it, overload it, or try to reach an account, system or dataset you have no right
            to; or
          </li>
          <li>use it to look at financial information that is not yours to see.</li>
        </ul>

        <h2>What we can do</h2>
        <p>
          We can suspend or close your access if you break these terms, or where we reasonably need
          to protect the service or the people using it. We can change features, and we can retire
          them. Letting one breach go is not us giving up the right to act on the next.
        </p>

        <h2>What we promise, and what we don&rsquo;t</h2>
        <p>
          Nothing here limits your rights under the Consumer Guarantees Act 1993, the Fair Trading
          Act 1986, or any other protection the law will not let us exclude.
        </p>
        <p>
          Beyond that, {LEGAL.product} comes as it is. We do not promise it will be uninterrupted or
          free of errors, that prices and exchange rates will be accurate or current, or that any
          projection will come true &mdash; a forecast is arithmetic on an assumption, not a
          prediction. To the extent the law allows, we are not liable for indirect or consequential
          loss, or for decisions you make off the back of the numbers.
        </p>
        <p>
          If your breach of these terms or misuse of the service lands us in a claim, you cover us
          for it.
        </p>

        <h2>Where the data comes from</h2>
        <p>
          Market prices come from third parties, including CoinGecko and Yahoo Finance. Bank
          connections come from Akahu ({LEGAL.jurisdiction}) and CDR data holders (Australia). We do
          not run those services and are not responsible for their accuracy or availability.
        </p>

        <h2>Our name and our work</h2>
        <p>
          &ldquo;{LEGAL.product}&rdquo;, the logo, the content, the software and the systems behind
          the service belong to {LEGAL.company} or its licensors. Use them as these terms allow, and
          no further.
        </p>

        <h2>Support and email</h2>
        <p>
          Reach us at <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a> during{' '}
          {LEGAL.jurisdiction} business hours. We will email you about your account and the service.
          Marketing email you can switch off any time &mdash; unsubscribe, or just tell us.
        </p>

        <h2>The fine print</h2>
        <ul>
          <li>These terms are the whole agreement between us about the service.</li>
          <li>If a clause turns out to be unenforceable, it drops out and the rest stands.</li>
          <li>You cannot hand your rights under these terms to someone else without our say-so.</li>
          <li>
            {LEGAL.jurisdiction} law governs them, and its courts have non-exclusive jurisdiction.
          </li>
        </ul>

        <h2>Talk to us</h2>
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
