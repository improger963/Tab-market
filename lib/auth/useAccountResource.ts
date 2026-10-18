/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

/**
 * LOAD-ON-MOUNT RESOURCE for the account panels.
 *
 * Every `/me/*` screen needs the same three states (loading, error with retry,
 * ready) and the same self-healing: a 401 anywhere means the cookie died, so the
 * snapshot is refreshed, which drops the customer back to the sign-in entry with
 * `next` intact instead of showing a dead form.
 *
 * `load` is captured in a ref on purpose — panels pass a new closure every
 * render, and re-running the effect on identity would loop.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccountApiError } from '@/services/api';
import { AUTH_HY } from '@/lib/copy/authHy';
import { useAuth } from '@/store/useAuth';

export type ResourceStatus = 'loading' | 'ready' | 'error';

export interface AccountResource<T> {
  status: ResourceStatus;
  data: T | null;
  error: string | null;
  reload: () => void;
  /** Local write after a mutation (rename, default flip) without a refetch. */
  setData: (value: T) => void;
}

export function useAccountResource<T>(load: () => Promise<T>): AccountResource<T> {
  const loadRef = useRef(load);
  loadRef.current = load;

  const [status, setStatus] = useState<ResourceStatus>('loading');
  const [data, setDataState] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    setError(null);

    loadRef.current()
      .then((value) => {
        if (!active) return;
        setDataState(value);
        setStatus('ready');
      })
      .catch((cause: unknown) => {
        if (!active) return;
        if (cause instanceof AccountApiError && cause.isUnauthenticated) {
          // Session ended: re-read identity so the route guard can redirect.
          void useAuth.getState().refreshMe();
          setError(AUTH_HY.ERR_SESSION_EXPIRED);
        } else {
          setError(
            cause instanceof AccountApiError ? cause.message : AUTH_HY.ACCOUNT_LOAD_ERROR
          );
        }
        setStatus('error');
      });

    return () => {
      active = false;
    };
    // `nonce` is the only trigger: retry is explicit, never implicit.
  }, [nonce]);

  const reload = useCallback(() => setNonce((value) => value + 1), []);
  const setData = useCallback((value: T) => {
    setDataState(value);
    setStatus('ready');
    setError(null);
  }, []);

  return { status, data, error, reload, setData };
}
