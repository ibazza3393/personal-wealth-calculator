import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppNav } from '@/components/AppNav';
import { WealthProvider } from '@/components/WealthProvider';

export const metadata: Metadata = {
  title: 'Wealth',
  description:
    'Private net worth dashboard with live Bitcoin and market quotes. Holdings stay in your browser.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5f7' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
};

const THEME_BOOT = `(function(){try{var t=localStorage.getItem('wealth-theme');var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

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
          <AppNav />
          <div className="flex-1">{children}</div>
        </WealthProvider>
      </body>
    </html>
  );
}
