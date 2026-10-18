/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useEffect, useState } from 'react';
import { getOpenStatus, type BusinessHours } from '@/config/site';
import { HY } from '@/lib/copy/hy';
import { cn } from '@/lib/utils';

/**
 * Live open/closed line for the showroom and contact screens.
 *
 * The status is only knowable in the visitor's session (and the shop's own
 * Asia/Yerevan timezone), so it is computed AFTER mount. The placeholder keeps
 * the exact same line box with `invisible` verified copy (HY.OPEN), so the
 * swap causes neither a hydration mismatch nor any layout shift, and the row
 * height is reserved whether or not JavaScript ever runs. No animation: the
 * badge is a fact, not an effect, so `prefers-reduced-motion` is trivially
 * respected.
 */
export default function OpenStatusBadge({
  hours,
  className,
}: {
  /** Override the schedule; defaults to `business.hours` from the config. */
  hours?: BusinessHours;
  className?: string;
}) {
  const [status, setStatus] = useState<ReturnType<typeof getOpenStatus> | null>(null);

  useEffect(() => {
    setStatus(getOpenStatus(new Date(), hours));
  }, [hours]);

  return (
    <p className={cn('flex min-h-[24px] items-center gap-2 text-sm leading-6', className)}>
      {status ? (
        <>
          <span
            aria-hidden="true"
            className={cn(
              'h-2 w-2 shrink-0 rounded-full',
              status.open ? 'bg-success' : 'bg-faint',
            )}
          />
          <span className={cn('font-semibold', status.open ? 'text-success' : 'text-muted')}>
            {status.label}
          </span>
        </>
      ) : (
        // Height-reserving placeholder: invisible, aria-hidden, same metrics.
        <span aria-hidden="true" className="invisible font-semibold">
          {HY.OPEN}
        </span>
      )}
    </p>
  );
}
