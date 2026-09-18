'use client';

import { SectionHero, Spark } from '@/components/SectionHero';
import { useWealth } from '@/components/WealthProvider';
import { formatCents, toCents } from '@/lib/money';

const PREVIEW = [
  { name: 'DJIA', ticker: 'DJI', value: '$42.34k', delta: '1.78%', up: true, pts: [4, 6, 5, 8, 7, 10, 12] },
  { name: 'NASDAQ', ticker: 'IXIC', value: '$19.20k', delta: '2.47%', up: true, pts: [5, 4, 7, 6, 9, 8, 12] },
  { name: 'S&P 500', ticker: 'SPX', value: '$5.92k', delta: '2.47%', up: true, pts: [3, 5, 4, 7, 9, 8, 11] },
  { name: 'VIX', ticker: 'VIX', value: '$18.96', delta: '7.83%', up: false, pts: [11, 10, 12, 9, 7, 8, 5] },
];

export default function MarketsPage() {
  const { data, quotes, quotesAsOf, quotesError, quotesLoading } = useWealth();
  const { currency } = data;

  // Nothing to show until prices land — the section leads with what it will
  // give back rather than an empty table.
  if (quotes.length === 0) {
    return (
      <main className="pt-4">
        <SectionHero
          tone="meadow"
          lead="Track"
          headline="your investments"
          sub="From crypto to index funds, get the context you need to manage your investments with clarity."
          ctaLabel="Add your holdings"
          ctaHref="/holdings"
          note="Public prices only. Your holdings never leave this device."
        >
          <p className="sh-preview-label">Markets at a glance</p>
          <div className="sh-grid">
            {PREVIEW.map((m) => (
              <div className="sh-tile" key={m.name}>
                <Spark points={m.pts} />
                <div className="sh-tile-row">
                  <span className="sh-tile-name">{m.name}</span>
                  <strong className="sh-tile-value">{m.value}</strong>
                </div>
                <div className="sh-tile-row sh-tile-sub">
                  <span>{m.ticker}</span>
                  <span className={m.up ? 'is-up' : 'is-down'}>
                    {m.delta} {m.up ? '↗' : '↘'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionHero>
        {quotesError && (
          <p className="mt-4 text-center text-[13px] text-[var(--tertiary)]">{quotesError}</p>
        )}
      </main>
    );
  }

  return (
    <main className="pt-4">
      <h1 className="text-[28px] font-semibold tracking-tight">Markets</h1>
      <p className="mt-1 max-w-xl text-[15px] text-[var(--secondary)]">
        Public prices only — CoinGecko for crypto, Yahoo Finance for stocks. Your holdings are not sent.
      </p>
      <p className="mt-3 text-[12px] text-[var(--tertiary)]">
        {quotesError ?? (quotesLoading ? 'Loading…' : quotesAsOf ? `As of ${new Date(quotesAsOf).toLocaleString()}` : '')}
      </p>

      <div className="mt-6 overflow-hidden rounded-[20px] bg-[var(--elevated)]">
        <table className="w-full text-[15px]">
          <thead>
            <tr className="border-b border-[var(--separator)] text-left text-[13px] text-[var(--secondary)]">
              <th className="px-4 py-3 font-medium">Symbol</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">24h</th>
              <th className="px-4 py-3 font-medium">Source</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => (
              <tr key={q.symbol} className="border-b border-[var(--separator)] last:border-0">
                <td className="px-4 py-3 font-medium">{q.symbol}</td>
                <td className="px-4 py-3 tabular-nums">{formatCents(toCents(q.price), currency)}</td>
                <td
                  className={`px-4 py-3 tabular-nums ${
                    (q.changePct ?? 0) >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'
                  }`}
                >
                  {q.changePct == null ? '—' : `${q.changePct >= 0 ? '+' : ''}${q.changePct.toFixed(2)}%`}
                </td>
                <td className="px-4 py-3 text-[13px] text-[var(--secondary)]">{q.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
