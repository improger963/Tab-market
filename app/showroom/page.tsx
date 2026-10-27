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
  Navigation,
  ArrowRight,
  Truck,
  ShieldCheck,
  Wrench,
  Ruler,
  Users,
  Car,
  Warehouse,
  Store,
  type LucideIcon,
} from 'lucide-react';
import {
  business,
  googleMapsUrl,
  yandexMapsUrl,
  type IconKey,
} from '@/config/site';
import { SHOWROOM_INFO } from '@/lib/config';
import { HY } from '@/lib/copy/hy';
import { PAGES_HY } from '@/lib/copy/pagesHy';
import { usePageSeo, buildLocalBusinessJsonLd } from '@/lib/seo';
import OpenStatusBadge from '@/components/showroom/OpenStatusBadge';
import { cn } from '@/lib/utils';

/**
 * Service icon registry. `config/site.ts` may only reference these keys —
 * the icon library is `lucide-react` (already a dependency); emojis are
 * never used anywhere on this page.
 */
const SERVICE_ICONS: Record<IconKey, LucideIcon> = {
  mapPin: MapPin,
  clock: Clock,
  phone: Phone,
  truck: Truck,
  shieldCheck: ShieldCheck,
  wrench: Wrench,
  ruler: Ruler,
  warehouse: Warehouse,
  parking: Car,
  users: Users,
};

/** Shared card chrome from the design spec: white panel, hairline border. */
const CARD_CLASS = 'rounded-2xl border border-line bg-surface p-5 sm:p-6';

export default function ShowroomPage() {
  usePageSeo({
    title: PAGES_HY.SHOWROOM_DOC_TITLE,
    // Description is composed from two config facts — address + hours.
    description: `${business.address.line} · ${SHOWROOM_INFO.hoursLabel}`,
    canonicalPath: '/showroom',
    jsonLd: buildLocalBusinessJsonLd(),
  });

  const services = business.services ?? [];
  const gallery = business.gallery ?? [];
  const primaryPhone = business.phones[0];

  return (
    <div className="container-lux py-10 sm:py-14 space-y-12">
      {/* --- Header block -------------------------------------------------- */}
      <section className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-2 text-accent">
          <Store className="h-5 w-5" aria-hidden="true" />
          <span className="text-sm font-semibold">{HY.OUR_SHOWROOM}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-ink tracking-tight hyphens-auto">
          {PAGES_HY.SHOWROOM_H1}
        </h1>
        <p className="text-sm sm:text-base text-body hyphens-auto">
          {business.address.line}
        </p>
        <p className="text-sm sm:text-base text-body hyphens-auto">
          {PAGES_HY.SHOWROOM_SUBTITLE}
        </p>
        <OpenStatusBadge className="text-body" />
      </section>

      {/* --- Info cards: address / hours / phones --------------------------- */}
      <section aria-label={HY.OUR_SHOWROOM} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className={CARD_CLASS}>
          <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
            <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
            {PAGES_HY.LABEL_ADDRESS}
          </h2>
          <p className="mt-3 text-sm leading-6 text-body hyphens-auto">
            {business.address.line}
            {business.address.district ? (
              <span className="block text-muted mt-1">{business.address.district}</span>
            ) : null}
          </p>
        </div>

        <div className={CARD_CLASS}>
          <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
            <Clock className="h-4 w-4 text-accent" aria-hidden="true" />
            {PAGES_HY.LABEL_HOURS}
          </h2>
          {/* Static schedule first (config fact), live badge below it. */}
          <p className="mt-3 text-sm leading-6 text-body tabular-nums">
            {SHOWROOM_INFO.hoursLabel}
          </p>
          <OpenStatusBadge className="mt-1 text-body" />
        </div>

        <div className={cn(CARD_CLASS, 'sm:col-span-2 lg:col-span-1')}>
          <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
            <Phone className="h-4 w-4 text-accent" aria-hidden="true" />
            {PAGES_HY.LABEL_PHONES}
          </h2>
          <ul className="mt-2 space-y-1">
            {business.phones.map((phone) => (
              <li key={phone.e164}>
                <a
                  href={`tel:${phone.e164}`}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-control px-2 -mx-2 text-sm font-bold text-ink hover:text-accent transition-colors duration-hover tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {phone.display}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* --- Features grid: only what the owner put in config --------------- */}
      {services.length > 0 ? (
        <section aria-label={HY.OUR_SHOWROOM} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => {
              const Icon = SERVICE_ICONS[service.icon];
              return (
                <div key={service.title} className={cn(CARD_CLASS, 'flex gap-4 items-start')}>
                  <div className="w-10 h-10 shrink-0 rounded-card bg-canvas border border-line flex items-center justify-center">
                    <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-ink hyphens-auto">{service.title}</h3>
                    <p className="mt-1 text-sm text-body hyphens-auto">{service.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {business.parking ? (
        <div className={cn(CARD_CLASS, 'flex items-start gap-4')}>
          <Car className="h-5 w-5 shrink-0 text-accent mt-0.5" aria-hidden="true" />
          {/* The parking sentence itself is the config-provided claim. */}
          <p className="text-sm text-body hyphens-auto">{business.parking}</p>
        </div>
      ) : null}

      {/* --- Gallery: real showroom photography from config, else hidden ---- */}
      {gallery.length > 0 ? (
        <section aria-labelledby="showroom-gallery" className="space-y-6">
          <h2 id="showroom-gallery" className="text-lg sm:text-xl font-bold text-ink">
            {HY.SHOWROOM}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((image) => (
              <div key={image.src} className="overflow-hidden rounded-2xl border border-line bg-canvas aspect-[4/3]">
                <img
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-sheet [@media(hover:hover)]:hover:scale-[1.03]"
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* --- Directions ------------------------------------------------------ */}
      <section aria-labelledby="showroom-directions" className="space-y-6">
        <h2 id="showroom-directions" className="text-lg sm:text-xl font-bold text-ink">
          {PAGES_HY.DIRECTIONS_TITLE}
        </h2>
        <div className="flex flex-wrap gap-3">
          <a
            href={googleMapsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-tactile inline-flex min-h-[48px] items-center gap-2 px-5 py-3 rounded-control bg-ink hover:bg-accent text-white text-sm font-semibold transition-colors duration-hover shadow-e1 hyphens-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <Navigation className="h-4 w-4 text-white" aria-hidden="true" />
            {PAGES_HY.OPEN_IN_GOOGLE}
          </a>
          <a
            href={yandexMapsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-tactile inline-flex min-h-[48px] items-center gap-2 px-5 py-3 rounded-control bg-surface hover:bg-canvas border border-line text-ink text-sm font-semibold transition-colors duration-hover hyphens-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
            {PAGES_HY.OPEN_IN_YANDEX}
          </a>
          <a
            href={`tel:${primaryPhone.e164}`}
            className="btn-tactile inline-flex min-h-[48px] items-center gap-2 px-5 py-3 rounded-control bg-surface hover:bg-canvas border border-line text-ink text-sm font-semibold transition-colors duration-hover hyphens-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <Phone className="h-4 w-4 text-accent" aria-hidden="true" />
            {PAGES_HY.CALL_SHOWROOM}
          </a>
        </div>

        {/* Embedded map only when real coordinates exist — never a guessed pin. */}
        {business.geo ? (
          <div className="rounded-2xl border border-line overflow-hidden aspect-[16/9] bg-canvas">
            <iframe
              title={PAGES_HY.DIRECTIONS_TITLE}
              src={`https://www.google.com/maps?q=${business.geo.lat},${business.geo.lng}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full border-0"
            />
          </div>
        ) : null}
      </section>

      {/* --- Bottom CTA row -------------------------------------------------- */}
      <section className="flex flex-wrap gap-3 border-t border-line pt-8">
        <Link
          href="/catalog"
          className="btn-tactile inline-flex min-h-[48px] items-center gap-2 px-6 py-3 rounded-control bg-ink hover:bg-accent text-white text-sm font-semibold transition-colors duration-hover shadow-e1 hyphens-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          {HY.VIEW_CATALOG_SHORT}
          <ArrowRight className="h-4 w-4 text-white" aria-hidden="true" />
        </Link>
        <Link
          href="/contact"
          className="btn-tactile inline-flex min-h-[48px] items-center gap-2 px-6 py-3 rounded-control bg-surface hover:bg-canvas border border-line text-ink text-sm font-semibold transition-colors duration-hover hyphens-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          {PAGES_HY.CONTACT_H1}
          <ArrowRight className="h-4 w-4 text-accent" aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
