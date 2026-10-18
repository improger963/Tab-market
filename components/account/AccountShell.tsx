/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

/**
 * `/account` SHELL — route guard, section navigation and the panel switch.
 *
 * The guard is client-side on purpose: this build is a Vite SPA, so there is no
 * Next `middleware.ts` to run in. A session is required, and a guest is sent to
 * `/?auth=login&next=<path>` with `next` validated by `sanitizeNextPath` before
 * it is ever stored. Two consequences worth stating: nothing under `/me/*` is
 * fetched while the snapshot is missing (a guest never fires an authenticated
 * request that would only 401), and the protected panels mount only once a
 * session is proven. The real backend must still enforce this server-side — the
 * deliverable spells out the redirect rule for the Laravel/Next swap.
 *
 * Tabs are real links to real routes (`/account/orders` and friends), so the
 * back button walks sections the way it walks any other page, and the older
 * `?tab=` entry points redirect onto those routes instead of forking the UI.
 */
import React, { useEffect } from 'react';
import Link from 'next/link';
import { MapPin, ReceiptText, UserCog } from 'lucide-react';
import { usePathname, useSearchParams, pushRoute } from '@/lib/next-compat/navigation';
import { authEntryPath } from '@/lib/auth/session';
import { AUTH_HY } from '@/lib/copy/authHy';
import { cn } from '@/lib/utils';
import { useAuth } from '@/store/useAuth';
import OrdersPanel from '@/components/account/OrdersPanel';
import ProfilePanel from '@/components/account/ProfilePanel';
import AddressesPanel from '@/components/account/AddressesPanel';

export type AccountSection = 'orders' | 'profile' | 'addresses';

const SECTIONS: {
  key: AccountSection;
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: 'orders', href: '/account/orders', label: AUTH_HY.ORDERS_TITLE, Icon: ReceiptText },
  { key: 'profile', href: '/account/profile', label: AUTH_HY.PROFILE_TITLE, Icon: UserCog },
  { key: 'addresses', href: '/account/addresses', label: AUTH_HY.ADDRESSES_TITLE, Icon: MapPin },
];

export function isAccountSection(value: string | null | undefined): value is AccountSection {
  return value === 'orders' || value === 'profile' || value === 'addresses';
}

function PanelSkeleton() {
  // A quiet full-height placeholder while the session is being proven, so the
  // redirect never flashes an empty shell then a jumping page.
  return (
    <div className="space-y-4" role="status" aria-label={AUTH_HY.LOADING}>
      <div className="h-8 w-48 skeleton-block rounded-full" />
      <div className="h-52 w-full skeleton-block rounded-panel" />
    </div>
  );
}

export default function AccountShell({ section }: { section: AccountSection }) {
  const user = useAuth((state) => state.user);
  const hydrated = useAuth((state) => state.hydrated);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const authorized = hydrated && user !== null;

  // 1. Guard. Runs before the panels render, so an unauthenticated visit is
  //    redirected without ever asking the API who the customer is.
  useEffect(() => {
    if (!hydrated) return;
    if (user) return;
    pushRoute(authEntryPath('login', pathname), { replace: true, scroll: false });
  }, [hydrated, user, pathname]);

  // 2. Legacy `?tab=` entry points: send them to the route they mean, and drop
  //    the parameter either way so the address bar stays honest about the tab.
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (!tab && !searchParams.toString()) return;
    const target = isAccountSection(tab) ? SECTIONS.find((item) => item.key === tab) : undefined;
    pushRoute(target ? target.href : pathname, { replace: true, scroll: false });
    // Once per mount: the redirect itself changes the URL, and re-running on the
    // cleaned search string would only repeat a no-op.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 3. Arrow-key navigation across the tab list (roving tabindex).
  function handleTabKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const active = SECTIONS.findIndex((item) => item.key === section);
    const backward = event.key === 'ArrowLeft' || event.key === 'ArrowUp';
    let next = active;
    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = SECTIONS.length - 1;
    else next = (active + (backward ? -1 : 1) + SECTIONS.length) % SECTIONS.length;
    document.getElementById(`account-tab-${SECTIONS[next].key}`)?.focus();
  }

  const current = SECTIONS.find((item) => item.key === section) ?? SECTIONS[0];

  return (
    <div className="container-lux py-8 sm:py-12">
      <header className="mb-6 space-y-1 sm:mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {AUTH_HY.ACCOUNT_TITLE}
        </h1>
        <p className="text-sm text-muted">{AUTH_HY.ACCOUNT_SUB}</p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Section navigation: a column on desktop, a scrollable strip on mobile */}
        <nav
          aria-label={AUTH_HY.ACCOUNT_TABS_LABEL}
          className="lg:col-span-3 lg:sticky lg:top-[calc(var(--topbar-h)+var(--header-h)+1rem)]"
        >
          <div
            role="tablist"
            aria-orientation="vertical"
            onKeyDown={handleTabKeyDown}
            className="scrollbar-none flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
          >
            {SECTIONS.map((item) => {
              const selected = item.key === current.key;
              const Icon = item.Icon;
              return (
                <Link
                  key={item.key}
                  id={`account-tab-${item.key}`}
                  href={item.href}
                  role="tab"
                  aria-selected={selected}
                  aria-controls="account-panel"
                  tabIndex={selected ? 0 : -1}
                  className={cn(
                    'btn-tactile inline-flex min-h-[48px] shrink-0 items-center gap-2.5 rounded-control border px-4 py-2.5 text-sm font-semibold transition-colors duration-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                    selected
                      ? 'border-ink bg-ink text-white'
                      : 'border-line bg-surface text-body hover:bg-canvas hover:text-ink'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="min-w-0 lg:col-span-9">
          {!authorized ? (
            <PanelSkeleton />
          ) : (
            <>
              <h2 className="mb-4 text-lg font-bold tracking-tight text-ink sm:text-xl">
                {current.label}
              </h2>
              <section
                id="account-panel"
                role="tabpanel"
                aria-labelledby={`account-tab-${current.key}`}
                tabIndex={-1}
                className="focus-visible:outline-none"
              >
                {current.key === 'orders' && <OrdersPanel />}
                {current.key === 'profile' && <ProfilePanel />}
                {current.key === 'addresses' && <AddressesPanel />}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
