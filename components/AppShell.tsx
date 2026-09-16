'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CURRENCIES, type CurrencyCode } from '@/lib/currency';
import { useWealth } from '@/components/WealthProvider';

const LINKS = [
  { href: '/', label: 'Overview' },
  { href: '/holdings', label: 'Holdings' },
  { href: '/compare', label: 'Compare' },
  { href: '/markets', label: 'Markets' },
];

function CurrencySelect() {
  const { data, patch } = useWealth();
  return (
    <>
      <label className="sr-only" htmlFor="currency">
        Currency
      </label>
      <select
        id="currency"
        value={data.currency}
        onChange={(e) => patch((p) => ({ ...p, currency: e.target.value as CurrencyCode }))}
        className="hit rounded-full border-0 bg-transparent px-3 text-[13px] text-[var(--label)] outline-none"
      >
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.code}
          </option>
        ))}
      </select>
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <aside className="app-rail glass sticky top-0 h-dvh flex-col items-center gap-2 px-2 py-6">
        <Link href="/" className="mb-4 text-[13px] font-semibold tracking-tight">
          W
        </Link>
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`hit flex w-full items-center justify-center rounded-2xl px-1 text-center text-[11px] leading-tight ${
                active ? 'bg-white/40 font-semibold dark:bg-white/10' : 'text-[var(--secondary)]'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </aside>

      <header className="app-nav-top glass sticky top-0 z-20 mx-3 mt-2 rounded-full sm:mx-5">
        <div className="mx-auto flex h-12 max-w-[1100px] items-center gap-4 px-4">
          <Link href="/" className="text-[17px] font-semibold tracking-tight">
            Wealth
          </Link>
          <nav className="app-nav-links hidden flex-1 items-center gap-1 md:flex">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`hit inline-flex items-center rounded-full px-3 text-[13px] ${
                    active ? 'font-medium text-[var(--label)]' : 'text-[var(--secondary)]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <CurrencySelect />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="app-main">{children}</div>

      <nav className="glass fixed inset-x-3 z-30 flex items-center justify-around rounded-full px-2 py-1 sm:hidden"
        style={{ bottom: 'max(10px, var(--safe-b))' }}
      >
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`hit flex flex-1 items-center justify-center rounded-full text-[12px] ${
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
