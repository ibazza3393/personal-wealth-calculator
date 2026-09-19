import Link from 'next/link';

export const metadata = {
  title: 'Connect your bank',
  description: 'What Next Wealth asks for, how long it lasts, and how to stop it.',
};

/**
 * The consumer information page Akahu Tier 2 requires: shown immediately
 * before the user is sent into Akahu's hosted connect flow, covering what the
 * access is for, its scope and duration, any other use of the data, and an
 * accurate description of Akahu.
 *
 * The "Continue" control is a plain link to /api/akahu/connect rather than a
 * button with a fetch, so the browser follows the redirect to Akahu itself and
 * this page never touches a credential.
 */
export default function ConnectPage() {
  return (
    <main className="mx-auto max-w-[640px] px-5 pt-6 pb-16">
      <h1 className="text-[28px] font-semibold tracking-tight">Connect your bank</h1>
      <p className="mt-2 text-[15px] text-[var(--secondary)]">
        Read-only access to your account information. Next Wealth can never move money, and never
        sees your bank password.
      </p>

      <section className="panel mt-6 rounded-[20px] px-5 py-5">
        <h2 className="text-[17px] font-semibold">What we do with it</h2>
        <p className="mt-2 text-[15px]">
          We read your balances and transactions so the app can show your net worth without you
          typing it in, categorise your spending, and track it month to month. That is the whole
          feature — the data is not sold, shared, or used to build a profile, and it is not used for
          advertising or credit scoring.
        </p>
      </section>

      <section className="panel mt-4 rounded-[20px] px-5 py-5">
        <h2 className="text-[17px] font-semibold">What we ask for, and for how long</h2>
        <ul className="mt-2 space-y-2 text-[15px]">
          <li>
            <strong>Ongoing access, not a one-off.</strong> We fetch up to 12 months of transaction
            history, then sync daily until you disconnect. This does not expire on its own.
          </li>
          <li>
            <strong>Read-only.</strong> Balances, transactions and account details. No payment
            permission is requested.
          </li>
          <li>
            <strong>You can stop it at any time</strong> from{' '}
            <Link href="/connections" className="underline">
              Connections
            </Link>
            , either one bank at a time or all at once. Deleting your Next Wealth account revokes
            everything automatically.
          </li>
          <li>
            <strong>We delete what we no longer need.</strong> Transactions older than 24 months are
            purged, and revoking access deletes the bank data we hold for you.
          </li>
        </ul>
      </section>

      <section className="panel mt-4 rounded-[20px] px-5 py-5">
        <h2 className="text-[17px] font-semibold">About Akahu</h2>
        <p className="mt-2 text-[15px]">
          Akahu is New Zealand&rsquo;s open finance platform. We use Akahu to connect to your bank
          securely: you sign in with your bank on Akahu&rsquo;s own screens, and Akahu passes us
          read-only account data. Your bank login details are entered with your bank or Akahu, never
          with Next Wealth, and we never receive or store them.
        </p>
        <p className="mt-2 text-[13px] text-[var(--secondary)]">
          You can review and revoke every app&rsquo;s access, including ours, at{' '}
          <a href="https://my.akahu.nz" className="underline" rel="noreferrer noopener" target="_blank">
            my.akahu.nz
          </a>
          .
        </p>
      </section>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <a href="/api/akahu/connect" className="origin-btn">
          Continue to Akahu
        </a>
        <Link href="/connections" className="origin-btn-ghost">
          Not now
        </Link>
      </div>

      <p className="mt-4 text-[13px] text-[var(--secondary)]">
        By continuing you agree to our{' '}
        <Link href="/privacy" className="underline">
          privacy notice
        </Link>
        .
      </p>
    </main>
  );
}
