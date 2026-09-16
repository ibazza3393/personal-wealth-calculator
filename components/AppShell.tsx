'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CURRENCIES, type CurrencyCode } from '@/lib/currency';
import { useWealth } from '@/components/WealthProvider';

const LINKS = [
  { href: '/', label: 'Overview' },
  { href: '/holdings', label: 'Holdings' },
  { href: '/spend', label: 'Spend' },
  { href: '/compare', label: 'Compare' },
  { href: '/markets', label: 'Markets' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data, patch } = useWealth();

  return (
    <div className="app-shell">
      <div className="scene" aria-hidden>
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="orb orb-c" />
      </div>

      <header className="pointer-events-none sticky top-0 z-20 flex justify-center px-3 pt-3 sm:px-5">
        <div className="nav-capsule pointer-events-auto glass flex h-14 w-full max-w-[980px] items-center gap-3 rounded-full pl-2 pr-2">
          <Link
            href="/"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-[13px] font-semibold text-white dark:bg-white dark:text-black"
          >
            W
          </Link>
          <div className="hidden h-6 w-px bg-white/30 sm:block" />
          <nav className="hidden min-w-0 flex-1 items-center gap-0 overflow-x-auto sm:flex">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`hit inline-flex shrink-0 items-center px-3 text-[14px] ${
                    active ? 'font-semibold text-[var(--label)]' : 'text-[var(--label)]/70'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <select
              aria-label="Tax region"
              value={data.taxRegion}
              onChange={(e) =>
                patch((p) => ({ ...p, taxRegion: e.target.value as 'AU' | 'NZ' }))
              }
              className="h-9 rounded-full bg-transparent px-2 text-[13px] outline-none"
            >
              <option value="NZ">NZ</option>
              <option value="AU">AU</option>
            </select>
            <select
              aria-label="Currency"
              value={data.currency}
              onChange={(e) =>
                patch((p) => ({ ...p, currency: e.target.value as CurrencyCode }))
              }
              className="h-9 rounded-full bg-transparent px-2 text-[13px] outline-none"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="app-main">{children}</div>

      <nav
        className="nav-capsule glass pointer-events-auto fixed inset-x-3 z-30 flex items-center justify-around rounded-full px-1 py-1 sm:hidden"
        style={{ bottom: 'max(10px, var(--safe-b))' }}
      >
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`hit flex flex-1 items-center justify-center rounded-full text-[11px] ${
                active ? 'font-semibold' : 'text-[var(--secondary)]'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
