/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Browser-side catalog loader (Phase 3 data/server boundary).
 *
 * The full price list may never sit in the JS bundle; client islands that
 * genuinely need it for instant filtering/search/cross-sell fetch it ONCE per
 * session from `/api/v1/products` and share the module-level promise. Until
 * it resolves, callers render the existing skeletons — the same loading UI
 * `CatalogView` already ships. Server components use `server/catalog.ts`
 * directly and never this module.
 */
import { useEffect, useState } from 'react';
import type { Product } from '@/types';
import { fetchProducts } from '@/services/api';

/** One request for the whole assortment; the API paginates by `limit`. */
const FULL_CATALOG_LIMIT = 100000;

let catalogPromise: Promise<Product[]> | null = null;

export function loadFullCatalog(): Promise<Product[]> {
  if (!catalogPromise) {
    const pending = fetchProducts({ limit: FULL_CATALOG_LIMIT })
      .then((response) => response.data)
      .catch((error) => {
        // A failed fetch must not be cached forever: the next caller retries.
        catalogPromise = null;
        throw error;
      });
    catalogPromise = pending;
  }
  return catalogPromise;
}

/**
 * Hook form for React islands. `null` means "not loaded yet" (render the
 * skeleton); the identity of the resolved array is stable across mount/unmount
 * because every caller shares one promise.
 */
export function useFullCatalog(): Product[] | null {
  const [items, setItems] = useState<Product[] | null>(null);
  useEffect(() => {
    let active = true;
    loadFullCatalog()
      .then((data) => {
        if (active) setItems(data);
      })
      .catch(() => {
        // Surfacing the failure is the caller's job (retry affordance or an
        // honest empty state); the shared promise already reset for retries.
        if (active) setItems([]);
      });
    return () => {
      active = false;
    };
  }, []);
  return items;
}
