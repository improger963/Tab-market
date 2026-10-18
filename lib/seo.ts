/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Per-page SEO for the Vite SPA runtime.
 *
 * The page-level `metadata` exports are dead code while the site ships
 * as a client-rendered SPA, so each page applies its own document head through
 * this hook: title, description, canonical, OpenGraph/Twitter card and a
 * JSON-LD script block. Everything is set AFTER mount, which keeps the effect
 * free of any server/client output difference (there is no SSR to mismatch
 * with, and the shell never renders these tags on the first paint).
 *
 * A real Next.js deployment replaces this hook with `generateMetadata` on the
 * same page files — the inputs (`title`, `description`, `canonicalPath`,
 * `jsonLd`) intentionally mirror that contract.
 */
import { useEffect } from 'react';
import { business } from '@/config/site';

export interface PageSeoInput {
  title: string;
  description: string;
  /** Site-relative canonical path, e.g. `/showroom`. */
  canonicalPath: string;
  /** schema.org object(s) — facts only, built from `config/site.ts`. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const JSON_LD_ID = 'tab-page-json-ld';

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function removeMeta(attr: 'name' | 'property', key: string): void {
  document.head.querySelector(`meta[${attr}="${key}"]`)?.remove();
}

function upsertCanonical(href: string): void {
  let tag = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!tag) {
    tag = document.createElement('link');
    tag.rel = 'canonical';
    document.head.appendChild(tag);
  }
  tag.href = href;
}

export function usePageSeo({ title, description, canonicalPath, jsonLd }: PageSeoInput): void {
  // Stable dependency: the object identity changes every render, the JSON does not.
  const jsonLdText = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    const head = document.head;
    const prevTitle = head.title;
    const prevDescription =
      head.querySelector<HTMLMetaElement>('meta[name="description"]')?.content ?? null;
    const prevCanonical =
      head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? null;
    const url = `${window.location.origin}${canonicalPath}`;

    head.title = title;
    upsertMeta('name', 'description', description);
    upsertCanonical(url);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:site_name', 'tab.am');
    upsertMeta('property', 'og:locale', 'hy_AM');
    upsertMeta('name', 'twitter:card', 'summary');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);

    let script: HTMLScriptElement | null = null;
    if (jsonLdText) {
      script = document.getElementById(JSON_LD_ID) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = JSON_LD_ID;
        script.type = 'application/ld+json';
        head.appendChild(script);
      }
      script.textContent = jsonLdText;
    }

    return () => {
      head.title = prevTitle;
      if (prevDescription === null) removeMeta('name', 'description');
      else upsertMeta('name', 'description', prevDescription);
      if (prevCanonical === null) head.querySelector('link[rel="canonical"]')?.remove();
      else {
        const canonical = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
        if (canonical) canonical.href = prevCanonical;
      }
      removeMeta('property', 'og:title');
      removeMeta('property', 'og:description');
      removeMeta('property', 'og:url');
      removeMeta('property', 'og:type');
      removeMeta('property', 'og:site_name');
      removeMeta('property', 'og:locale');
      removeMeta('name', 'twitter:card');
      removeMeta('name', 'twitter:title');
      removeMeta('name', 'twitter:description');
      if (script) script.remove();
    };
  }, [title, description, canonicalPath, jsonLdText]);
}

/**
 * `LocalBusiness` structured data — facts from `config/site.ts` only.
 * `geo` is emitted solely when the owner has provided real coordinates;
 * nothing else is asserted beyond the typed config. Shared by /showroom
 * and /contact so the two pages can never disagree.
 */
export function buildLocalBusinessJsonLd(): Record<string, unknown> {
  const geo = business.geo;
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address.line,
      addressLocality: business.address.city,
      addressCountry: business.address.country,
    },
    telephone: business.phones.map((phone) => phone.e164),
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        // The config `hours.days` label is the Armenian Tue-Sun range.
        dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: business.hours.open,
        closes: business.hours.close,
      },
    ],
    ...(geo ? { geo: { '@type': 'GeoCoordinates', lat: geo.lat, lng: geo.lng } } : {}),
  };
}
