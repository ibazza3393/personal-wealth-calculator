import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppShell } from '@/components/AppShell';
import { LedgerProvider } from '@/components/LedgerProvider';
import { WealthProvider } from '@/components/WealthProvider';

export const metadata: Metadata = {
  title: 'Next Wealth',
  description:
    'Private NZ/AU net worth. Holdings stay in your browser. Banks via Akahu later — never passwords.',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <WealthProvider>
          <LedgerProvider>
            <AppShell>{children}</AppShell>
          </LedgerProvider>
        </WealthProvider>
      </body>
    </html>
  );
}
