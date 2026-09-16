'use client';

import { useWealth } from '@/components/WealthProvider';
import { formatCents, toCents } from '@/lib/money';

export default function MarketsPage() {
  const { data, quotes, quotesAsOf, quotesError, quotesLoading } = useWealth();
  const { currency } = data;

  return (
    <main className="mx-auto max-w-[980px] px-4 pt-6 sm:px-5">
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
