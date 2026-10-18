/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  MessageCircle,
  Truck,
  Store,
} from 'lucide-react';
import { business, whatsappUrl } from '@/config/site';
import { DELIVERY_CONFIG, SHOWROOM_INFO } from '@/lib/config';
import { HY } from '@/lib/copy/hy';
import { AUTH_HY } from '@/lib/copy/authHy';
import { PAGES_HY } from '@/lib/copy/pagesHy';
import { usePageSeo, buildLocalBusinessJsonLd } from '@/lib/seo';
import OpenStatusBadge from '@/components/showroom/OpenStatusBadge';
import ContactForm from '@/components/contact/ContactForm';
import { cn } from '@/lib/utils';

const CARD_CLASS = 'rounded-2xl border border-line bg-surface p-5 sm:p-6';

/** Absolute site origin, safe on server and client (no render-time `window`). */
const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://tab.am';

/**
 * ContactPage graph node — the LocalBusiness node is shared with /showroom so
 * the two pages describe the same facts. No email/social is emitted unless it
 * exists in `config/site.ts`.
 */
function buildContactPageJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: PAGES_HY.CONTACT_H1,
    url: `${SITE_ORIGIN}/contact`,
    description: `${business.address.line} · ${SHOWROOM_INFO.hoursLabel}`,
  };
}

export default function ContactPage() {
  usePageSeo({
    title: PAGES_HY.CONTACT_DOC_TITLE,
    description: `${business.address.line} · ${SHOWROOM_INFO.hoursLabel}`,
    canonicalPath: '/contact',
    jsonLd: [buildContactPageJsonLd(), buildLocalBusinessJsonLd()],
  });

  const waUrl = whatsappUrl();

  return (
    <div className="container-lux py-10 sm:py-14 space-y-10">
      {/* --- Header ---------------------------------------------------------- */}
      <section className="max-w-3xl">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-ink tracking-tight hyphens-auto">
          {PAGES_HY.CONTACT_H1}
        </h1>
      </section>

      <div className="grid gap-8 lg:grid-cols-5 items-start">
        {/* Mobile: compact channels row + form first; desktop: form on the right */}
        <div className="lg:col-span-3 order-1 lg:order-2 space-y-6">
          {/* Compact direct-channel row, mobile only (form follows it). */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {business.phones.slice(0, 2).map((phone) => (
              <a
                key={phone.e164}
                href={`tel:${phone.e164}`}
                className="inline-flex shrink-0 min-h-[44px] items-center gap-2 rounded-control border border-line bg-surface px-3 text-xs font-bold text-ink tabular-nums transition-colors duration-hover hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Phone className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                {phone.display}
              </a>
            ))}
            {waUrl ? (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 min-h-[44px] items-center gap-2 rounded-control bg-success px-3 text-xs font-bold text-white transition-colors duration-hover hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                WhatsApp
              </a>
            ) : null}
          </div>

          <div className={cn(CARD_CLASS, 'sm:p-8')}>
            <h2 className="text-base font-bold text-ink mb-5 hyphens-auto">
              {PAGES_HY.CONTACT_INTRO}
            </h2>
            <ContactForm />
          </div>
        </div>

        {/* --- Left: direct channels ---------------------------------------- */}
        <aside className="lg:col-span-2 order-2 lg:order-1 space-y-4" aria-label={PAGES_HY.CHANNELS_TITLE}>
          <div className={CARD_CLASS}>
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
              <Phone className="h-4 w-4 text-accent" aria-hidden="true" />
              {PAGES_HY.LABEL_PHONES}
            </h2>
            <ul className="mt-2 space-y-1">
              {business.phones.map((phone) => (
                <li key={phone.e164}>
                  <a
                    href={`tel:${phone.e164}`}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-control px-2 -mx-2 text-sm font-bold text-ink hover:text-accent transition-colors duration-hover tabular-nums hyphens-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {phone.display}
                  </a>
                </li>
              ))}
            </ul>
            {waUrl ? (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-tactile mt-3 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-control bg-success px-4 text-sm font-semibold text-white transition-colors duration-hover hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 hyphens-auto"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                {PAGES_HY.WHATSAPP_BUTTON}
              </a>
            ) : null}
          </div>

          {business.email ? (
            <div className={CARD_CLASS}>
              <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
                <Mail className="h-4 w-4 text-accent" aria-hidden="true" />
                {AUTH_HY.FIELD_EMAIL}
              </h2>
              <a
                href={`mailto:${business.email}`}
                className="mt-2 inline-flex min-h-[44px] items-center rounded-control px-2 -mx-2 text-sm font-semibold text-ink hover:text-accent transition-colors duration-hover break-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {business.email}
              </a>
            </div>
          ) : null}

          <div className={CARD_CLASS}>
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
              <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
              {PAGES_HY.LABEL_ADDRESS}
            </h2>
            <p className="mt-2 text-sm leading-6 text-body hyphens-auto">{business.address.line}</p>
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink mt-4">
              <Clock className="h-4 w-4 text-accent" aria-hidden="true" />
              {PAGES_HY.LABEL_HOURS}
            </h2>
            <p className="mt-2 text-sm leading-6 text-body tabular-nums hyphens-auto">
              {SHOWROOM_INFO.hoursLabel}
            </p>
            <OpenStatusBadge className="mt-1 text-body" />
            <Link
              href="/showroom"
              className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-control text-sm font-bold text-accent hover:text-accent-hover transition-colors duration-hover hyphens-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Store className="h-4 w-4" aria-hidden="true" />
              {HY.OUR_SHOWROOM}
            </Link>
          </div>

          {/* Delivery statement only when the checkout config still says so. */}
          {DELIVERY_CONFIG.yerevanFreeAlways ? (
            <div className={cn(CARD_CLASS, 'flex items-start gap-3')}>
              <Truck className="h-5 w-5 shrink-0 text-accent mt-0.5" aria-hidden="true" />
              <p className="text-sm text-body hyphens-auto">{HY.FREE_DELIVERY_YEREVAN}</p>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
