import React, { useSyncExternalStore } from 'react';

// Minimal next/navigation shim for the Vite runtime (history routing via popstate).

function subscribe(callback: () => void) {
  window.addEventListener('popstate', callback);
  return () => window.removeEventListener('popstate', callback);
}

// Route-change scroll policy lives in one place (the app's popstate handler),
// not at each call site. push/replace set this mode so the handler knows the
// change was a forward navigation (scroll to top, or preserve viewport)
// instead of a real Back/Forward traversal (restore the saved offset).
let pushNavigationMode: 'top' | 'preserve' | null = null;

/** The scroll intent for the popstate emitted by an imperative push/replace. */
export function consumePushNavigation(): 'top' | 'preserve' | null {
  const value = pushNavigationMode;
  pushNavigationMode = null;
  return value;
}

/** Client-side navigation without a reload; the app layer owns the scroll behavior. */
export function pushRoute(
  href: string,
  { replace = false, scroll = true }: { replace?: boolean; scroll?: boolean } = {}
) {
  const current = window.location.pathname + window.location.search;
  if (current === href) return;
  if (replace) {
    window.history.replaceState({}, '', href);
  } else {
    window.history.pushState({}, '', href);
  }
  pushNavigationMode = scroll ? 'top' : 'preserve';
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function useSearchParams(): URLSearchParams {
  const search = useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => ''
  );
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

export function usePathname(): string {
  return useSyncExternalStore(
    subscribe,
    () => window.location.pathname,
    () => '/'
  );
}

export function useRouter() {
  return {
    push(href: string, options?: { scroll?: boolean }) {
      pushRoute(href, options);
    },
    replace(href: string, options?: { scroll?: boolean }) {
      pushRoute(href, { ...options, replace: true });
    },
    back() {
      window.history.back();
    },
    forward() {
      window.history.forward();
    },
    refresh() {
      window.location.reload();
    },
    prefetch() {},
  };
}

export function notFound(): never {
  pushRoute('/404', { replace: true });
  throw new Error('NOT_FOUND');
}

export function redirect(href: string): never {
  pushRoute(href, { replace: true });
  throw new Error('REDIRECT');
}
