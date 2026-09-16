'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CURRENCIES, type CurrencyCode } from '@/lib/currency';
import { useWealth } from '@/components/WealthProvider';

const LINKS = [
  { href: '/', label: 'Overview' },
  { href: '/holdings', label: 'Holdings' },
  { href: '/connections', label: 'Connections' },
  { href: '/spend', label: 'Spend' },
  { href: '/compare', label: 'Compare' },
  { href: '/markets', label: 'Markets' },
];

function pageTitle(path: string) {
  return LINKS.find((l) => l.href === path)?.label ?? 'Overview';
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data, patch } = useWealth();
  const title = pageTitle(pathname);

  return (
    <>
      <div className="lg-scene" aria-hidden>
        <span className="lg-orb lg-orb-a" />
        <span className="lg-orb lg-orb-b" />
        <span className="lg-orb lg-orb-c" />
      </div>
      <div className="origin-shell">
        <aside className="origin-sidebar glass">
          <Link href="/" className="origin-logo">
            Wealth
          </Link>
          <nav className="origin-side-nav" aria-label="Primary">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} className={`origin-side-link${active ? ' is-active' : ''}`}>
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="origin-side-foot">
            <select
              aria-label="Tax region"
              value={data.taxRegion}
              onChange={(e) => patch((p) => ({ ...p, taxRegion: e.target.value as 'AU' | 'NZ' }))}
            >
              <option value="NZ">New Zealand</option>
              <option value="AU">Australia</option>
            </select>
            <select
              aria-label="Currency"
              value={data.currency}
              onChange={(e) => patch((p) => ({ ...p, currency: e.target.value as CurrencyCode }))}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
            <ThemeToggle />
          </div>
        </aside>

        <div className="origin-body">
          <div className="origin-col">
            <header className="origin-topbar glass">
              <div className="origin-title-row">
                <p className="origin-kicker">Planning</p>
                <h1>{title}</h1>
              </div>
              <div className="origin-top-actions">
                <select
                  aria-label="Tax region"
                  className="origin-top-select"
                  value={data.taxRegion}
                  onChange={(e) => patch((p) => ({ ...p, taxRegion: e.target.value as 'AU' | 'NZ' }))}
                >
                  <option value="NZ">NZ</option>
                  <option value="AU">AU</option>
                </select>
                <select
                  aria-label="Currency"
                  className="origin-top-select"
                  value={data.currency}
                  onChange={(e) => patch((p) => ({ ...p, currency: e.target.value as CurrencyCode }))}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code}
                    </option>
                  ))}
                </select>
                <ThemeToggle />
              </div>
            </header>
            <div className="origin-content">{children}</div>
          </div>

          <nav className="origin-mobile-nav glass" aria-label="Pages">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} className={active ? 'is-active' : ''}>
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
