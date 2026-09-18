'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useSyncExternalStore } from 'react';
import { AuthButton } from '@/components/AuthButton';
import { SfIcon, type SfName } from '@/components/SfIcon';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CURRENCIES, type CurrencyCode } from '@/lib/currency';
import { SIDEBAR_KEY } from '@/lib/types';
import { useWealth } from '@/components/WealthProvider';

type NavLink = { href: string; label: string; icon: SfName };

/** Grouped the way the portal reads: what you track, then what connects it. */
const NAV_GROUPS: { label: string; links: NavLink[] }[] = [
  {
    label: 'Track',
    links: [
      { href: '/dashboard', label: 'Overview', icon: 'square.grid.2x2' },
      { href: '/holdings', label: 'Holdings', icon: 'chart.bar' },
      { href: '/spend', label: 'Spend', icon: 'creditcard' },
      { href: '/markets', label: 'Markets', icon: 'chart.line.uptrend.xyaxis' },
      { href: '/equity', label: 'Equity', icon: 'chart.bar' },
    ],
  },
  {
    label: 'Plan',
    links: [
      { href: '/forecast', label: 'Forecast', icon: 'chart.line.uptrend.xyaxis' },
      { href: '/compare', label: 'Compare', icon: 'arrow.left.arrow.right' },
      { href: '/credit', label: 'Credit', icon: 'creditcard' },
      { href: '/connections', label: 'Connections', icon: 'link' },
    ],
  },
];

const LINKS = NAV_GROUPS.flatMap((g) => g.links);

const listeners = new Set<() => void>();

function readCollapsed() {
  try {
    return window.localStorage.getItem(SIDEBAR_KEY) === 'collapsed';
  } catch {
    return false;
  }
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

function pageTitle(path: string) {
  return LINKS.find((l) => l.href === path)?.label ?? 'Overview';
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data, patch } = useWealth();
  const title = pageTitle(pathname);
  const collapsed = useSyncExternalStore(subscribe, readCollapsed, () => false);

  const toggle = useCallback(() => {
    const next = !readCollapsed();
    try {
      window.localStorage.setItem(SIDEBAR_KEY, next ? 'collapsed' : 'expanded');
    } catch {
      /* ignore */
    }
    listeners.forEach((fn) => fn());
  }, []);

  const scene = (
    <div className="lg-scene" aria-hidden>
      <span className="lg-orb lg-orb-a" />
      <span className="lg-orb lg-orb-b" />
      <span className="lg-orb lg-orb-c" />
    </div>
  );

  // The landing page and onboarding bring their own chrome — no sidebar,
  // topbar or tab bar.
  if (pathname === '/' || pathname === '/welcome') {
    return (
      <>
        {scene}
        {children}
      </>
    );
  }

  return (
    <>
      {scene}
      <div className={`origin-shell${collapsed ? ' is-collapsed' : ''}`}>
        <aside className="origin-sidebar glass liquid-glass-chrome">
          <div className="origin-logo-row">
            <Link href="/dashboard" className="origin-logo">
              N
              <span className="nav-label">ext Wealth</span>
            </Link>
            <button
              type="button"
              className="sidebar-toggle hit"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              onClick={toggle}
            >
              <SfIcon name={collapsed ? 'sidebar.right' : 'sidebar.left'} />
            </button>
          </div>
          <nav className="origin-side-nav" aria-label="Primary">
            {NAV_GROUPS.map((group) => (
              <div className="origin-nav-group" key={group.label}>
                <p className="origin-nav-label nav-label">{group.label}</p>
                {group.links.map((link) => {
                  const active = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`origin-side-link${active ? ' is-active' : ''}`}
                      title={link.label}
                    >
                      <SfIcon name={link.icon} />
                      <span className="nav-label">{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
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
            <AuthButton />
            <ThemeToggle />
          </div>
        </aside>

        <div className="origin-body">
          <div className="origin-col">
            <header className="origin-topbar glass liquid-glass-chrome">
              <h1>
                {title} · Planning
              </h1>
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
                <AuthButton />
                <ThemeToggle />
              </div>
            </header>
            <div className="origin-content">{children}</div>
          </div>

          <nav className="origin-mobile-nav glass liquid-glass-chrome" aria-label="Pages">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} className={active ? 'is-active' : ''} title={link.label}>
                  <SfIcon name={link.icon} />
                  <span className="nav-label">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
