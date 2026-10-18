/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CircleUser, LogOut, MapPin, Package, UserCog } from 'lucide-react';
import { useAuth } from '@/store/useAuth';
import { AUTH_HY } from '@/lib/copy/authHy';
import { cn } from '@/lib/utils';

/**
 * HEADER ACCOUNT TRIGGER.
 *
 * Signed out it is one button that opens the auth dialog. Signed in it opens a
 * `role="menu"` with roving keyboard focus, Escape/outside-click dismissal and
 * focus returned to the trigger — the same control on every breakpoint, which is
 * why the mobile layout gets the account entry in the header instead of a sixth
 * item in the bottom dock.
 *
 * Only the masked phone is ever rendered here; the account never prints a full
 * number in a shared-screen surface.
 */

const MENU_ITEMS = [
  { href: '/account/orders', label: AUTH_HY.ACCOUNT_MY_ORDERS, Icon: Package },
  { href: '/account/profile', label: AUTH_HY.ACCOUNT_PROFILE, Icon: UserCog },
  { href: '/account/addresses', label: AUTH_HY.ACCOUNT_ADDRESSES, Icon: MapPin },
] as const;

export default function AccountTrigger() {
  const { user, openAuthModal, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const signedIn = user !== null;

  // Escape + outside click, the two dismissals a menu must answer to.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const onPointerDown = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [open]);

  // Focus the first item when the menu opens: a mouse user is already there, a
  // keyboard user gets a valid starting point instead of a stranded tab order.
  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => document.getElementById('account-menu-orders')?.focus());
  }, [open]);

  const onMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>('[role^="menuitem"]')
    );
    if (items.length === 0) return;
    const index = items.indexOf(document.activeElement as HTMLElement);
    const move = (next: number) => {
      event.preventDefault();
      (items[(next + items.length) % items.length] as HTMLElement)?.focus();
    };
    if (event.key === 'ArrowDown') move(index + 1);
    else if (event.key === 'ArrowUp') move(index - 1);
    else if (event.key === 'Home') move(0);
    else if (event.key === 'End') move(items.length - 1);
    else if (event.key === 'Tab') {
      // Tabbing out is a dismissal, exactly like a native menu.
      setOpen(false);
    }
  };

  const handleTrigger = () => {
    if (!signedIn) {
      openAuthModal('login');
      return;
    }
    setOpen((previous) => !previous);
  };

  const handleLogout = async () => {
    setOpen(false);
    // The cart survives logout on purpose — an abandoned basket is the
    // customer's, not the session's.
    await logout();
  };

  const triggerLabel = signedIn
    ? AUTH_HY.ACCOUNT_TRIGGER_LOGGED_IN.replace('{name}', user.fullName)
    : AUTH_HY.ACCOUNT_TRIGGER_LOGGED_OUT;

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleTrigger}
        aria-label={triggerLabel}
        aria-haspopup={signedIn ? 'menu' : undefined}
        aria-expanded={signedIn ? open : undefined}
        aria-controls={signedIn ? 'account-menu' : undefined}
        className={cn(
          'min-h-[44px] min-w-[44px] flex items-center gap-2 px-2 sm:px-3 rounded-control border transition-colors duration-hover cursor-pointer btn-tactile focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          signedIn
            ? 'bg-surface hover:bg-canvas border-line text-ink'
            : 'bg-canvas hover:bg-line/60 border-line text-body hover:text-ink'
        )}
      >
        <CircleUser className="w-5 h-5" aria-hidden="true" />
        {/* Name stays on tablet/desktop only; the icon is the mobile affordance. */}
        {signedIn ? (
          <span className="hidden sm:max-w-[9rem] sm:inline sm:truncate text-xs font-bold">
            {user.fullName.split(' ')[0]}
          </span>
        ) : null}
      </button>

      {signedIn && open ? (
        <div
          id="account-menu"
          role="menu"
          aria-label={AUTH_HY.ACCOUNT_MENU_LABEL}
          onKeyDown={onMenuKeyDown}
          className="absolute right-0 top-full mt-2 w-[min(19rem,calc(100vw-1.5rem))] rounded-panel border border-line bg-surface/95 backdrop-blur-sm shadow-e2 p-2 z-overlay animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="px-3 py-2.5 rounded-card bg-canvas border border-line mb-1.5">
            <p className="text-xs font-bold text-ink truncate">{user.fullName}</p>
            <p className="text-xs text-muted mt-0.5 tabular-nums">{user.maskedPhone}</p>
          </div>

          {MENU_ITEMS.map((item, index) => (
            <Link
              key={item.href}
              id={`account-menu-${item.href.split('/').pop()}`}
              href={item.href}
              role="menuitem"
              tabIndex={index === 0 ? 0 : -1}
              onClick={() => setOpen(false)}
              className="min-h-[44px] flex items-center gap-3 px-3 py-2 rounded-control text-xs font-semibold text-body hover:text-ink hover:bg-canvas transition-colors duration-hover cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <item.Icon className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          ))}

          <div className="mt-1.5 pt-1.5 border-t border-line">
            <button
              type="button"
              role="menuitem"
              tabIndex={-1}
              onClick={handleLogout}
              className="min-h-[44px] w-full flex items-center gap-3 px-3 py-2 rounded-control text-xs font-semibold text-body hover:text-danger hover:bg-canvas transition-colors duration-hover cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{AUTH_HY.ACCOUNT_LOGOUT}</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
