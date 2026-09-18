'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { AuthButton } from '@/components/AuthButton';
import { SfIcon, type SfName } from '@/components/SfIcon';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CURRENCIES, type CurrencyCode } from '@/lib/currency';
import { useUser } from '@/lib/useUser';
import { useWealth } from '@/components/WealthProvider';

export type NavLink = { href: string; label: string; icon: SfName };
export type NavGroup = { label: string; links: NavLink[] };

/**
 * The single navigation surface below the desktop breakpoint: every
 * destination plus the settings that used to be crammed into the top bar.
 * Sheet semantics — Escape closes, focus moves in on open, background scroll
 * is locked while it is up.
 */
export function NavDrawer({
  open,
  onClose,
  groups,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  groups: NavGroup[];
  pathname: string;
}) {
  const { data, patch } = useWealth();
  const user = useUser();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector<HTMLElement>('a, button')?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <div className={`nd-root${open ? ' is-open' : ''}`} aria-hidden={!open}>
      <button type="button" className="nd-scrim" aria-label="Close menu" tabIndex={open ? 0 : -1} onClick={onClose} />
      <div
        className="nd-panel glass-md"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        ref={panel}
      >
        <div className="nd-head">
          <div className="nd-who">
            {user.initials && <span className="nd-avatar" aria-hidden>{user.initials}</span>}
            <div className="nd-who-text">
              <p className="nd-name">{user.name ?? 'Next Wealth'}</p>
              {user.email && <p className="nd-email">{user.email}</p>}
            </div>
          </div>
          <button type="button" className="nd-close hit" aria-label="Close menu" onClick={onClose}>
            <SfIcon name="xmark" />
          </button>
        </div>

        <nav className="nd-nav" aria-label="All pages">
          {groups.map((group) => (
            <div className="nd-group" key={group.label}>
              <p className="nd-group-label">{group.label}</p>
              {group.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nd-link${pathname === link.href ? ' is-active' : ''}`}
                  tabIndex={open ? 0 : -1}
                  onClick={onClose}
                >
                  <SfIcon name={link.icon} />
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="nd-settings">
          <p className="nd-group-label">Settings</p>
          <label className="nd-field">
            <span>Tax region</span>
            <select
              value={data.taxRegion}
              tabIndex={open ? 0 : -1}
              onChange={(e) => patch((p) => ({ ...p, taxRegion: e.target.value as 'AU' | 'NZ' }))}
            >
              <option value="NZ">New Zealand</option>
              <option value="AU">Australia</option>
            </select>
          </label>
          <label className="nd-field">
            <span>Show amounts in</span>
            <select
              value={data.currency}
              tabIndex={open ? 0 : -1}
              onChange={(e) => patch((p) => ({ ...p, currency: e.target.value as CurrencyCode }))}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.label}
                </option>
              ))}
            </select>
          </label>
          <div className="nd-actions">
            <ThemeToggle />
            <AuthButton />
          </div>
        </div>
      </div>
    </div>
  );
}
