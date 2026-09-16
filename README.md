# Wealth

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/import?repository-url=https%3A%2F%2Fgithub.com%2Fibazza3393%2Fpersonal-wealth-calculator)

A local-first net worth dashboard. All figures stay in this browser.

## What it does

- **Private by design** — calculations and storage run only on the client.
- **Hydration-safe storage** — `useSyncExternalStore` so SSR HTML matches the first client pass; saved figures load after mount without crashing on a bad JSON blob.
- **Integer-cent math** — assets and liabilities are summed in cents, then formatted. `$0.10 + $0.20` is `$0.30`.
- **Inputs** — cash, property, stocks, bitcoin, other crypto, bonds, funds, retirement, business, loans.
- **Dark mode** — follows the system, with a Light/Dark toggle (saved locally).
- **Compare paths** — Housing vs Renting vs S&P 500, same capital and monthly budget. Illustrative, not advice.
- **Auto-save** — every change writes to `localStorage` under `personal-wealth-data`.
- **Sample data, JSON backup, clear**.

## Develop

```bash
npm install
npm run dev
```

Money helpers: `npx tsx lib/money.test.ts`

## Deploy

Import the GitHub repo in Vercel. No env vars.

## Layout

```
app/page.tsx              Dashboard UI
app/layout.tsx            Metadata + theme-color
lib/useLocalStorage.ts    SSR-safe store
lib/money.ts              Cent arithmetic + percent remainder
lib/sanitize.ts           localStorage schema guard
```
