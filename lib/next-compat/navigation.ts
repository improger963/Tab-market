import React, { useSyncExternalStore } from 'react';

// Minimal next/navigation shim for the Vite runtime (history routing via popstate).

function subscribe(callback: () => void) {
  window.addEventListener('popstate', callback);
  return () => window.removeEventListener('popstate', callback);
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
    push(href: string) {
      if (window.location.pathname + window.location.search !== href) {
        window.history.pushState({}, '', href);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    },
    replace(href: string) {
      window.history.replaceState({}, '', href);
      window.dispatchEvent(new PopStateEvent('popstate'));
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
  window.history.replaceState({}, '', '/404');
  window.dispatchEvent(new PopStateEvent('popstate'));
  throw new Error('NOT_FOUND');
}

export function redirect(href: string): never {
  window.history.replaceState({}, '', href);
  window.dispatchEvent(new PopStateEvent('popstate'));
  throw new Error('REDIRECT');
}
