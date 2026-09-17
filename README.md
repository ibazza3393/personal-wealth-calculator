# Wealth

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/import?repository-url=https%3A%2F%2Fgithub.com%2Fibazza3393%2Fpersonal-wealth-calculator)

A local-first NZ/AU net worth dashboard. Figures stay in this browser until you connect Akahu. Google sign-in is identity only — holdings are not uploaded.

## ANZ ledger (single user)

Canonical tables live in `lib/domain.ts`. Overview shows a dual NZD/AUD snapshot from mock NZ (Akahu) + AU (CDR, consent expiring) + a Grey Lynn property. `/connections` is the pipe UI. Real bank OAuth is stubbed.

KiwiSaver is **not** on official NZ open banking. This repo will not scrape provider logins. Use CSV/manual, or Akahu if they support your scheme as a classic connection. Sorted.org.nz scrapers only publish **public fund fees/returns**, not your balance.

Hybrid: keep Next on Vercel (quotes API). Native is a Capacitor WebView of that URL — see `native/README.md`. Add to Home Screen works via `manifest.webmanifest`.

## Akahu Personal App (free, you only)

Akahu does not charge for a Personal App that reads **your** accounts (1 user, no payments, daily refresh).

1. Create a profile and connect a bank at [my.akahu.nz](https://my.akahu.nz).
2. Developers page → Personal App → copy **App ID Token** and **User Access Token**.
3. Copy `.env.example` to `.env.local` (never commit it).
4. `npm run dev` → Connections → **Connect NZ bank (Akahu)**.

Tokens are used only in `app/api/akahu/route.ts`. Do not put them on the public Vercel project without `WEALTH_PERSONAL_KEY` — that URL would otherwise expose your balances.

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

## Sign in (Google)

Uses Supabase Auth. Put `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local` (and Vercel). Never commit values. Apple SSO is off until a Services ID exists.

## Deploy

Import the GitHub repo in Vercel. Quotes need no env. Google sign-in needs the two `NEXT_PUBLIC_SUPABASE_*` names above (values from the Vercel ↔ Supabase integration, not from git).

## Layout

```
app/page.tsx              Dashboard UI
app/layout.tsx            Metadata + theme-color
lib/useLocalStorage.ts    SSR-safe store
lib/money.ts              Cent arithmetic + percent remainder
lib/sanitize.ts           localStorage schema guard
```
