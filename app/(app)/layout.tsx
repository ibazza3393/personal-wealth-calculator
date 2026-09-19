import { AppShell } from '@/components/AppShell';
import { LedgerProvider } from '@/components/LedgerProvider';
import { WealthProvider } from '@/components/WealthProvider';

/**
 * Everything behind the sign-in wall.
 *
 * The two providers and the navigation live here rather than in the root
 * layout, so the public pages in (site) — landing, privacy, terms, sign-in,
 * sign-up — are not made to load them. Those pages showed no figures and no
 * navigation, yet were paying for both, plus a quotes request and an FX
 * request on every visit.
 *
 * A route group changes no URLs: /dashboard is still /dashboard.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <WealthProvider>
      <LedgerProvider>
        <AppShell>{children}</AppShell>
      </LedgerProvider>
    </WealthProvider>
  );
}
