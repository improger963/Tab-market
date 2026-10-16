/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import { MapPin, Clock, Phone, MessageCircle, Truck } from 'lucide-react';
import { DELIVERY_CONFIG, SHOWROOM_INFO } from '@/lib/config';
import { HY } from '@/lib/copy/hy';

/**
 * Global utility bar. Every fact (address, hours, phone, WhatsApp, free
 * delivery) renders from lib/config — nothing is hardcoded here. The free
 * delivery chip hides itself as soon as DELIVERY_CONFIG.yerevanFreeAlways
 * stops being true, so the bar can never lie about delivery.
 */
export default function TopBar() {
  return (
    <div className="flex h-[var(--topbar-h)] select-none items-center border-b border-white/10 bg-ink text-on-dark transition-colors">
      {/* Fixed-height, single line. Left group truncates, right group is shrink-proof. */}
      <div className="container-lux flex min-w-0 items-center justify-between gap-3">
        {/* Left: showroom address (always) + delivery/hours (secondary, hidden on small) */}
        <div className="flex min-w-0 items-center gap-2">
          <a
            href={SHOWROOM_INFO.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex self-stretch min-w-0 items-center gap-1.5 rounded-control font-medium text-white transition-colors duration-hover hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
            <span className="truncate">{SHOWROOM_INFO.address}</span>
          </a>

          {DELIVERY_CONFIG.yerevanFreeAlways ? (
            <span className="hidden shrink-0 items-center gap-1.5 rounded-control border border-white/15 bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white md:inline-flex">
              <Truck className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
              <span>{HY.FREE_DELIVERY_YEREVAN}</span>
            </span>
          ) : null}

          <span className="hidden shrink-0 items-center gap-1.5 text-xs font-medium text-on-dark lg:inline-flex">
            <Clock className="h-3.5 w-3.5 text-on-dark-muted" aria-hidden="true" />
            <span>{SHOWROOM_INFO.hoursLabel}</span>
          </span>
        </div>

        {/* Right: tappable phone (always) + WhatsApp (secondary, hidden on small) */}
        <div className="flex shrink-0 items-center gap-3">
          <a
            href={`tel:+${SHOWROOM_INFO.phoneIntl}`}
            className="inline-flex self-stretch items-center gap-1.5 rounded-control px-2 text-xs font-bold tabular-nums text-white transition-colors duration-hover hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            title={`${HY.CALL} ${SHOWROOM_INFO.phone}`}
          >
            <Phone className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
            <span>{SHOWROOM_INFO.phone}</span>
          </a>

          <a
            href={`https://wa.me/${SHOWROOM_INFO.phoneIntl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-tactile hidden items-center gap-1.5 self-stretch rounded-full bg-success px-3 text-xs font-semibold text-white transition-colors duration-hover hover:bg-accent sm:inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <MessageCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
