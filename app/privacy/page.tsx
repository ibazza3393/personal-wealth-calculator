import Link from 'next/link';

export const metadata = {
  title: 'Privacy notice',
  description: 'What Next Wealth collects, why, how long it is kept, and how to remove it.',
};

/**
 * Public by design — proxy.ts lets /privacy through without a session.
 *
 * Akahu's accreditation review reads this before they have an account, and so
 * does anyone deciding whether to sign up. A privacy notice behind a login is
 * not a privacy notice. It names Akahu explicitly, which the Tier 2 review
 * checks for.
 */
export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-[680px] px-5 pt-6 pb-16">
      <h1 className="text-[28px] font-semibold tracking-tight">Privacy notice</h1>
      <p className="mt-2 text-[13px] text-[var(--secondary)]">
        How Next Wealth handles your information, under the Privacy Act 2020.
      </p>

      <Section title="What we collect">
        <p>
          <strong>Account identity.</strong> Your email address, and — if you sign in with Google —
          the name and email Google returns. We do not receive your Google password.
        </p>
        <p>
          <strong>Bank data, if you connect a bank.</strong> Through Akahu: your account names and
          types, balances, and transaction history including dates, amounts, descriptions and
          merchant names.
        </p>
        <p>
          <strong>Figures you enter yourself.</strong> Property values, holdings and manual
          balances.
        </p>
      </Section>

      <Section title="Akahu">
        <p>
          We use <strong>Akahu</strong>, New Zealand&rsquo;s open finance platform, as the data
          source and processor for bank connections. When you connect a bank, you authorise Akahu on
          Akahu&rsquo;s own screens and Akahu provides us with read-only account information. We
          never see or store your bank login details, and we hold no permission to move money.
        </p>
        <p>
          Akahu handles that data under its own privacy policy. You can see and revoke every
          app&rsquo;s access at{' '}
          <a href="https://my.akahu.nz" className="underline" rel="noreferrer noopener" target="_blank">
            my.akahu.nz
          </a>
          .
        </p>
      </Section>

      <Section title="Why we collect it">
        <p>
          To show your net worth, categorise your spending, and track both over time. That is the
          only purpose. We do not sell your data, share it with advertisers or data brokers, or use
          it for credit assessment or marketing.
        </p>
      </Section>

      <Section title="How long we keep it">
        <p>
          Transactions are kept for <strong>24 months</strong> — a year of history plus a year to
          compare it against — and older ones are deleted automatically.
        </p>
        <p>
          When you revoke a bank connection, the balances and transactions from that connection are
          deleted. When you revoke all access or delete your account, all bank data we hold for you
          is deleted and your Akahu authorisation is revoked at the same time.
        </p>
      </Section>

      <Section title="How it is protected">
        <p>
          All traffic is encrypted in transit with TLS. Your Akahu access token is encrypted at rest
          with AES-256-GCM under a key held only in our server environment, and is never sent to
          your browser or included in any app download. Every row of your data is restricted to your
          account at the database level, so one account cannot read another&rsquo;s.
        </p>
      </Section>

      <Section title="Your choices">
        <p>
          You can disconnect a single bank or all of them from{' '}
          <Link href="/connections" className="underline">
            Connections
          </Link>
          , and delete your account and everything in it from the same page. Under the Privacy Act
          2020 you may also ask us for a copy of the personal information we hold about you, or ask
          us to correct it.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          For a privacy request or complaint, contact us at the address on the{' '}
          <Link href="/" className="underline">
            home page
          </Link>
          . You may also complain to the{' '}
          <a
            href="https://www.privacy.org.nz"
            className="underline"
            rel="noreferrer noopener"
            target="_blank"
          >
            Office of the Privacy Commissioner
          </a>
          .
        </p>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="panel mt-4 rounded-[20px] px-5 py-5">
      <h2 className="text-[17px] font-semibold">{title}</h2>
      <div className="mt-2 space-y-2 text-[15px]">{children}</div>
    </section>
  );
}
