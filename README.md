# Wealth

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/import?repository-url=https%3A%2F%2Fgithub.com%2Fibazza3393%2Fpersonal-wealth-calculator)

A NZ/AU net worth dashboard. Manual figures stay in this browser; connected bank data is held per-user in Supabase under row-level security, with read-only Akahu access each user grants and can revoke.

## ANZ ledger

Canonical tables live in `lib/domain.ts`. Overview shows a dual NZD/AUD snapshot from NZ (Akahu) + AU (CDR, still stubbed) + property. `/connections` is the pipe UI. NZ bank OAuth is live; AU CDR is not.

KiwiSaver is **not** on official NZ open banking. This repo will not scrape provider logins. Use CSV/manual, or Akahu if they support your scheme as a classic connection. Sorted.org.nz scrapers only publish **public fund fees/returns**, not your balance.

Hybrid: keep Next on Vercel (quotes API). Native is a Capacitor WebView of that URL — see `native/README.md`. Add to Home Screen works via `manifest.webmanifest`.

## Akahu (multi-user, Tier 2)

Each user grants their own read-only access through Akahu's hosted OAuth flow.
The app no longer carries a single `AKAHU_USER_TOKEN` in its environment — that
was the Tier 0 "Personal App" shape, which cannot carry a second user and
quietly stamped one person's bank data onto whoever was signed in.

1. Register the app with Akahu and copy the **App Token** and **App Secret**.
2. Register the redirect URI: `https://<your-host>/api/akahu/callback`.
3. `openssl rand -base64 32` → `AKAHU_TOKEN_KEY`.
4. Copy `.env.example` to `.env.local` (never commit it) and fill it in.
5. Apply the migrations in `supabase/migrations/`.
6. `npm run dev` → sign in → **Connect** → Akahu → **Connections**.

### How access is held

- The **App Secret** and every **user access token** are read only on the
  server (`lib/akahu/`, marked `server-only` so importing them from a client
  component is a build error). Neither is ever sent to the browser or bundled
  into the Capacitor build.
- User tokens are encrypted at rest with **AES-256-GCM** under
  `AKAHU_TOKEN_KEY`, which lives in the server environment. A database dump
  without that key is ciphertext.
- `akahu_tokens` and `akahu_oauth_state` have **RLS enabled with no policy**,
  so they are unreachable with the publishable key under any session. Only the
  secret key reaches them, and only from `lib/akahu/token.ts`.
- The OAuth `state` is a 256-bit random value held server-side, bound to one
  user, single-use, and valid for ten minutes.

### Revocation

- **Per connection** — `DELETE /api/akahu/connections/[id]` → Akahu
  `DELETE /authorisations/{id}`.
- **Everything** — `DELETE /api/akahu/token` → Akahu `DELETE /token`.
- **Account deletion** — `DELETE /api/account` revokes at Akahu first, then
  deletes the user, whose cascade takes all bank data with it.
- **Revoked elsewhere** (at my.akahu.nz) — handled twice over: the signed
  `TOKEN DELETE` webhook at `/api/akahu/webhook`, and a `401` from Akahu
  treated as a dead token (`AkahuRevokedError`). Either marks the token revoked
  and purges the bank data, and `/connections` then shows a reconnect prompt.

### Retention

`purge_expired_bank_data()` drops transactions past 24 months; schedule it with
pg_cron. `purge_user_bank_data(uuid)` clears one user's bank data and runs on
revoke and on account deletion. The privacy notice at `/privacy` is public, as
Akahu's review requires, and names Akahu as the data source.

Every route except `/`, `/signin`, `/signup`, `/privacy`, `/auth/*` and the
Akahu webhook is gated by the Supabase session in `proxy.ts`. The webhook is
public because Akahu posts with no session; it authenticates with an RSA-SHA256
signature over the raw body, verified before the body is read.

## What it does

- **Private by design** — manual figures never leave the browser. Bank data is per-user, row-level-secured, and deleted when you revoke.
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
