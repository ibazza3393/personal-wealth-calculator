import { NextResponse } from 'next/server';
import { CRYPTO_IDS, isCurrency } from '@/lib/currency';
import { convert, fetchRates } from '@/lib/fx';

export const revalidate = 60;

type Quote = {
  symbol: string;
  price: number;
  changePct: number | null;
  source: 'coingecko' | 'yahoo';
  /** The currency `price` is actually in. When it differs from the requested
   *  `vs`, conversion was not possible and callers must not treat it as `vs`. */
  currency: string;
};

async function gecko(ids: string[], vs: string): Promise<Quote[]> {
  if (ids.length === 0) return [];
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=${vs.toLowerCase()}&include_24hr_change=true`;
  const res = await fetch(url, { next: { revalidate: 60 }, headers: { Accept: 'application/json' } });
  if (!res.ok) return [];
  const json = (await res.json()) as Record<string, Record<string, number>>;
  const vsKey = vs.toLowerCase();
  const out: Quote[] = [];
  for (const [sym, id] of Object.entries(CRYPTO_IDS)) {
    const row = json[id];
    if (!row || typeof row[vsKey] !== 'number') continue;
    out.push({
      symbol: sym,
      price: row[vsKey],
      changePct: typeof row[`${vsKey}_24h_change`] === 'number' ? row[`${vsKey}_24h_change`] : null,
      source: 'coingecko',
      // CoinGecko priced it in `vs` directly, so no conversion is involved.
      currency: vs,
    });
  }
  return out;
}

async function yahoo(symbol: string): Promise<Quote | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
  const res = await fetch(url, {
    next: { revalidate: 60 },
    headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0 WealthDashboard/1.0' },
  });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    chart?: { result?: { meta?: { regularMarketPrice?: number; regularMarketChangePercent?: number; currency?: string } }[] };
  };
  const meta = json.chart?.result?.[0]?.meta;
  if (!meta || typeof meta.regularMarketPrice !== 'number') return null;
  return {
    symbol: symbol.toUpperCase(),
    price: meta.regularMarketPrice,
    changePct: typeof meta.regularMarketChangePercent === 'number' ? meta.regularMarketChangePercent : null,
    source: 'yahoo',
    // Yahoo quotes in the listing's own currency — AIR.NZ is NZD, not USD.
    // Assuming USD here is what double-converted every non-US ticker.
    currency: typeof meta.currency === 'string' ? meta.currency.toUpperCase() : 'USD',
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const vsRaw = (searchParams.get('vs') || 'USD').toUpperCase();
  const vs = isCurrency(vsRaw) ? vsRaw : 'USD';
  const rawSymbols = (searchParams.get('symbols') || 'BTC,ETH,SPY,QQQ,AAPL')
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 12);

  const cryptoSyms = rawSymbols.filter((s) => s in CRYPTO_IDS);
  const stockSyms = rawSymbols.filter((s) => !(s in CRYPTO_IDS));
  const geckoIds = [...new Set(cryptoSyms.map((s) => CRYPTO_IDS[s]))];

  const [crypto, stocks, fx] = await Promise.all([
    gecko(geckoIds, vs),
    Promise.all(stockSyms.map((s) => yahoo(s))),
    fetchRates(),
  ]);

  const quotes: Quote[] = [...crypto];
  for (const q of stocks) {
    if (!q) continue;
    const converted = convert(q.price, q.currency, vs, fx);
    if (converted === null) {
      // No rate for this pair. Report the native price and its real currency
      // rather than passing an unconverted number off as `vs`.
      quotes.push(q);
      continue;
    }
    quotes.push({ ...q, price: converted, currency: vs });
  }

  return NextResponse.json({
    vs,
    asOf: new Date().toISOString(),
    fxAsOf: fx.asOf,
    fxLive: fx.live,
    quotes,
  });
}
