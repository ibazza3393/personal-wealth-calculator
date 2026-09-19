import type { Metadata, Viewport } from 'next';
import './globals.css';
import { GlassScene } from '@/components/GlassScene';

export const metadata: Metadata = {
  title: 'Next Wealth',
  description:
    'Private NZ/AU net worth. Read-only bank access via Akahu — never passwords.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Next Wealth',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5f7' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  viewportFit: 'cover',
  width: 'device-width',
  initialScale: 1,
};

const THEME_BOOT = `(function(){try{var t=localStorage.getItem('wealth-theme');var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);document.documentElement.classList.toggle('light',!d);}catch(e){}})();`;

/**
 * Sends a first-time visitor to onboarding before anything paints.
 *
 * React could only make this call after hydration, which meant the app shell
 * and a grid of skeletons appeared first and then vanished — it read as "the
 * dashboard opened, then threw me into setup". The answer lives in local
 * storage, so like the theme above it can be read synchronously here and
 * acted on before the first frame. The dashboard keeps its own check for the
 * case where scripts are blocked.
 */
const ONBOARDING_BOOT = `(function(){try{if(location.pathname!=='/dashboard')return;if(localStorage.getItem('wealth-onboarded-v1')==='done')return;var raw=localStorage.getItem('personal-wealth-data');if(raw){var d=JSON.parse(raw);if(d&&(d.liquidCash||d.propertyValue||(d.holdings&&d.holdings.length)||(d.liabilities&&d.liabilities.length)||(d.budget&&d.budget.monthlyIncome)))return;}location.replace('/welcome');}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        <script dangerouslySetInnerHTML={{ __html: ONBOARDING_BOOT }} />
      </head>
      <body className="min-h-full flex flex-col">
        {/* The providers and the app shell used to live here, which handed
            every route — the landing page, the privacy notice, sign-in — the
            entire client bundle and a quotes fetch it had no use for. They
            now wrap only the (app) group. The scene stays global because
            every page is drawn on it, and it ships no JavaScript. */}
        <GlassScene />
        {children}
      </body>
    </html>
  );
}
