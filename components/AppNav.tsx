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

export function AppNav() {
  const pathname = usePathname();
  const { data, patch } = useWealth();

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--separator)] bg-[color-mix(in_srgb,var(--bg)_72%,transparent)] backdrop-blur-2xl">
      <div className="mx-auto flex h-12 max-w-[1100px] items-center gap-6 px-5">
        <Link href="/" className="text-[17px] font-semibold tracking-tight">
          Wealth
        </Link>
        <nav className="hidden flex-1 items-center gap-1 sm:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-1 text-[13px] ${
                  active
                    ? 'bg-[var(--elevated)] font-medium text-[var(--label)] shadow-sm'
                    : 'text-[var(--secondary)] hover:text-[var(--label)]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <label className="sr-only" htmlFor="currency">
            Currency
          </label>
          <select
            id="currency"
            value={data.currency}
            onChange={(e) =>
              patch((p) => ({ ...p, currency: e.target.value as CurrencyCode }))
            }
            className="h-8 rounded-full border-0 bg-[var(--elevated)] px-3 text-[13px] text-[var(--label)] outline-none"
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
      <nav className="flex gap-1 overflow-x-auto px-5 pb-2 sm:hidden">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-full px-3 py-1 text-[13px] ${
                active ? 'bg-[var(--elevated)] font-medium' : 'text-[var(--secondary)]'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
