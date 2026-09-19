'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useState, useSyncExternalStore } from 'react';
import { AuthButton } from '@/components/AuthButton';
import { NavSheet, type NavGroup, type NavLink } from '@/components/NavSheet';
import { SfIcon } from '@/components/SfIcon';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CURRENCIES, type CurrencyCode } from '@/lib/currency';
import { SIDEBAR_KEY } from '@/lib/types';
import { useUser } from '@/lib/useUser';
import { useWealth } from '@/components/WealthProvider';

/** Grouped the way the portal reads: what you track, then what you plan. */
const NAV_GROUPS: NavGroup[] = [
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

/**
 * iOS tab bars top out at five and read best at four: three destinations plus
 * More, which raises a bottom sheet holding everything else.
 */
const TABS: NavLink[] = [
  { href: '/dashboard', label: 'Overview', icon: 'square.grid.2x2' },
  { href: '/holdings', label: 'Holdings', icon: 'chart.bar' },
  { href: '/spend', label: 'Spend', icon: 'creditcard' },
];

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
  const user = useUser();
  const title = pageTitle(pathname);
  const collapsed = useSyncExternalStore(subscribe, readCollapsed, () => false);
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const toggle = useCallback(() => {
    const next = !readCollapsed();
    try {
      window.localStorage.setItem(SIDEBAR_KEY, next ? 'collapsed' : 'expanded');
    } catch {
      /* ignore */
    }
    listeners.forEach((fn) => fn());
  }, []);

  // Onboarding brings its own chrome — no sidebar, topbar or tab bar. The
  // landing, legal and auth pages used to be listed here too; they now sit in
  // the (site) group, outside this shell entirely, so there is nothing left to
  // opt them out of. The background scene moved to the root layout, which is
  // what lets those pages keep it without mounting any of this.
  if (pathname === '/welcome') {
    return <>{children}</>;
  }

  // Only the Overview greets by name; every other page states where you are.
  const heading =
    pathname === '/dashboard' && user.firstName ? `Welcome, ${user.firstName}` : title;

  return (
    <>
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
            <label className="origin-side-field nav-label">
              <span>Tax region</span>
              <select
                aria-label="Tax region"
                value={data.taxRegion}
                onChange={(e) => patch((p) => ({ ...p, taxRegion: e.target.value as 'AU' | 'NZ' }))}
              >
                <option value="NZ">New Zealand</option>
                <option value="AU">Australia</option>
              </select>
            </label>
            <label className="origin-side-field nav-label">
              <span>Show amounts in</span>
              <select
                aria-label="Currency"
                value={data.currency}
                onChange={(e) => patch((p) => ({ ...p, currency: e.target.value as CurrencyCode }))}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="origin-side-actions">
              <AuthButton />
              <ThemeToggle />
            </div>
          </div>
        </aside>

        <div className="origin-body">
          <div className="origin-col">
            <header className="origin-topbar glass liquid-glass-chrome">
              <span className="origin-avatar-spacer" aria-hidden />
              <h1>{heading}</h1>
              {user.initials ? (
                <button
                  type="button"
                  className="origin-avatar-btn hit"
                  aria-label="Open menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen(true)}
                >
                  <span aria-hidden>{user.initials}</span>
                </button>
              ) : (
                <span className="origin-avatar-spacer" aria-hidden />
              )}
            </header>
            <div className="origin-content">{children}</div>
          </div>

          <nav className="origin-mobile-nav glass liquid-glass-chrome" aria-label="Pages">
            {TABS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} className={active ? 'is-active' : ''}>
                  <SfIcon name={link.icon} />
                  <span className="tab-label">{link.label}</span>
                </Link>
              );
            })}
            <button
              type="button"
              className={LINKS.some((l) => l.href === pathname) && !TABS.some((t) => t.href === pathname) ? 'is-active' : ''}
              aria-label="More pages"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <SfIcon name="ellipsis" />
              <span className="tab-label">More</span>
            </button>
          </nav>
        </div>
      </div>

      <NavSheet open={menuOpen} onClose={closeMenu} groups={NAV_GROUPS} pathname={pathname} />
    </>
  );
}
