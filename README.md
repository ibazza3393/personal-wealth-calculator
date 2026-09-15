# Personal Wealth Calculator

A clean, single-page Personal Wealth Calculator built with Next.js App Router. Runs **entirely local-first** — all data and calculations stay in your browser.

## Features

- **Private by Design**: All calculations and storage happen client-side. No data ever leaves your browser.
- **Robust LocalStorage Hook**: Custom `useLocalStorage` hook with proper hydration safety to prevent Next.js SSR layout shifts.
- **Input Categories**:
  - Liquid Cash
  - Property Value
  - Market Assets (dynamic list of portfolios/stocks)
  - Liabilities (dynamic list of loans/credit cards)
- **Instant Calculations**: Net worth, total assets, total liabilities, asset composition bars — all computed in React state.
- **Auto-persist**: Changes are saved automatically to browser LocalStorage.
- **Demo Data & Backup**: Load example numbers or download a JSON backup.
- **Vercel Ready**: Standard setup — deploy instantly with `git push`.

## Tech Stack

- Next.js 16 (App Router + Turbopack)
- TypeScript
- Tailwind CSS
- Lucide icons (minimal)
- Pure React (no external state libs)

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment to Vercel

1. Push this repo to GitHub / GitLab / Bitbucket.
2. Import the project in [Vercel](https://vercel.com).
3. Deploy — no environment variables or extra config needed.

The project includes a standard `.gitignore` and builds cleanly for static + serverless deployment.

## Data Privacy

- Uses a custom `useLocalStorage` hook (`lib/useLocalStorage.ts`).
- All math (totals, net worth, percentages) runs in the component using React state.
- Data key: `personal-wealth-data` in LocalStorage.
- Use the **Clear All Data** button to wipe everything.

## Project Structure

```
app/
  layout.tsx          # Root layout + metadata
  page.tsx            # Main calculator UI (client component)
  globals.css         # Custom styles
lib/
  useLocalStorage.ts  # Hydration-safe localStorage hook
  types.ts            # WealthData, AssetItem, LiabilityItem
```

## Notes

- Designed as a single-page experience.
- Number inputs support decimals.
- Net worth turns green (positive) or red (negative).
- Fully responsive.

Built for privacy and simplicity.
