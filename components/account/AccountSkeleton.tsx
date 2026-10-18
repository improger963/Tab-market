/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';

/**
 * Loading placeholders for `/account/*`. Each one mirrors the ANATOMY and the
 * measured heights of the panel it stands in for, so the swap from skeleton to
 * real data moves nothing on screen. Every block is a `.skeleton-block`
 * (the repo's zero-CLS shimmer) inside a fixed-size track.
 */

/** Matches the order card: header row, 3 line rows, footer with a 44px button. */
function OrderCardSkeleton() {
  return (
    <div className="rounded-panel border border-line bg-surface p-5 space-y-4" aria-hidden="true">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="h-4 w-28 skeleton-block rounded-full" />
          <div className="h-3 w-40 skeleton-block rounded-full" />
        </div>
        <div className="h-7 w-36 shrink-0 skeleton-block rounded-full" />
      </div>

      <div className="space-y-2.5">
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex items-center gap-3">
            <div className="h-14 w-14 shrink-0 rounded-control skeleton-block" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-3/4 skeleton-block rounded-full" />
              <div className="h-3 w-24 skeleton-block rounded-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
        <div className="h-5 w-24 skeleton-block rounded-full" />
        <div className="h-11 w-40 skeleton-block rounded-control" />
      </div>
    </div>
  );
}

/** Shared field row: label line + a 48px control, the exact saved-form geometry. */
function FieldRowSkeleton({ hint }: { hint?: boolean }) {
  return (
    <div className="space-y-2">
      <div className="h-3 w-28 skeleton-block rounded-full" />
      <div className="min-h-[48px] h-12 skeleton-block rounded-control" />
      {hint && <div className="h-3 w-44 skeleton-block rounded-full" />}
    </div>
  );
}

export function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      <OrderCardSkeleton />
      <OrderCardSkeleton />
    </div>
  );
}

/** Matches the profile panel: title block + name/email rows + action row. */
export function ProfileSkeleton() {
  return (
    <div className="rounded-panel border border-line bg-surface p-5 sm:p-6 space-y-6" aria-hidden="true">
      <div className="space-y-2">
        <div className="h-5 w-44 skeleton-block rounded-full" />
        <div className="h-3.5 w-64 skeleton-block rounded-full" />
      </div>
      <div className="space-y-5">
        <FieldRowSkeleton />
        <FieldRowSkeleton hint />
        <FieldRowSkeleton hint />
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
        <div className="h-11 w-28 skeleton-block rounded-control" />
      </div>
    </div>
  );
}

/**
 * Whole-route placeholder: heading, the tab strip and a panel, sized like
 * `AccountShell`. Exported so `app/account/loading.tsx` and the in-app session
 * check draw the identical frame instead of two skeletons that drift apart.
 */
export function AccountRouteSkeleton() {
  return (
    <div className="container-lux py-8 sm:py-12" aria-hidden="true">
      <div className="mb-6 space-y-2 sm:mb-8">
        <div className="h-9 w-56 skeleton-block rounded-full" />
        <div className="h-4 w-72 skeleton-block rounded-full" />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-3">
          <div className="flex gap-2 lg:flex-col">
            {[0, 1, 2].map((row) => (
              <div key={row} className="h-12 w-full min-w-[10rem] shrink-0 skeleton-block rounded-control" />
            ))}
          </div>
        </div>
        <div className="min-w-0 space-y-4 lg:col-span-9">
          <div className="h-8 w-48 skeleton-block rounded-full" />
          <OrdersSkeleton />
        </div>
      </div>
    </div>
  );
}

/** Matches the address list: primary card (taller, badge + actions) + one card. */
export function AddressesSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1].map((card) => (
        <div
          key={card}
          aria-hidden="true"
          className="rounded-panel border border-line bg-surface p-5 space-y-3"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="h-4 w-24 skeleton-block rounded-full" />
            <div className="h-7 w-24 skeleton-block rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="h-3.5 w-5/6 skeleton-block rounded-full" />
            <div className="h-3.5 w-2/3 skeleton-block rounded-full" />
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
            <div className="h-11 w-32 skeleton-block rounded-control" />
            <div className="h-11 w-28 skeleton-block rounded-control" />
          </div>
        </div>
      ))}
      <div className="h-12 w-44 skeleton-block rounded-control" />
    </div>
  );
}
