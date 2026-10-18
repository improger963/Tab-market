/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Sitemap for the Next.js App Router build. The Vite SPA runtime does not
 * serve this file (there is no `public/robots.txt` or sitemap in the SPA
 * deployment either — recorded as a deviation in the delivery report); it is
 * the contract the routes must expose once the app runs on Next.
 *
 * Only routes that exist are listed. `/showroom` and `/contact` join the
 * static pages; parameterized product/category/brand routes are omitted here
 * because their slugs would come from `GET /api/v1/products` at generation
 * time in the real deployment.
 */
import type { MetadataRoute } from 'next';

/** Canonical origin. On preview hosts this must stay tab.am for correct
 *  canonical URLs; the `*.vercel.app` noindex rule belongs in robots/middleware
 *  once one exists (currently absent from the project). */
const SITE_URL = 'https://tab.am';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const paths: { path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
    { path: '/', changeFrequency: 'daily', priority: 1 },
    { path: '/catalog', changeFrequency: 'daily', priority: 0.9 },
    { path: '/showroom', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/contact', changeFrequency: 'yearly', priority: 0.6 },
    { path: '/track-order', changeFrequency: 'yearly', priority: 0.4 },
  ];
  return paths.map((entry) => ({
    url: `${SITE_URL}${entry.path}`,
    lastModified: now,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
