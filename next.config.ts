import type { NextConfig } from 'next';
import bundleAnalyzerInit from '@next/bundle-analyzer';

/**
 * Single source of truth for the image hosts `next/image` may optimise.
 * Product imagery is first-party on `tab.am` today; `IMAGE_HOST` lets the owner
 * point at a self-hosted/CDN asset origin without a code change (Phase 7/8).
 */
const IMAGE_HOSTS: string[] = [
  'tab.am',
  ...(process.env.IMAGE_HOST ? [process.env.IMAGE_HOST] : []),
].filter((host, i, all) => host && all.indexOf(host) === i);

/**
 * 301 map from the legacy tab.am URL space. Empty until the owner provides the
 * old-URL inventory (Phase 12 / owner-decision item). Populating this is a
 * prerequisite for the DNS switch so existing links and SEO equity survive.
 */
const LEGACY_REDIRECTS: { source: string; destination: string }[] = [];

const bundleAnalyzer = bundleAnalyzerInit({
  enabled: process.env.ANALYZE === 'true',
});

const securityHeaders: { key: string; value: string }[] = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
];
if (process.env.NODE_ENV === 'production') {
  securityHeaders.push({
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  });
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: IMAGE_HOSTS.map((hostname) => ({
      protocol: 'https' as const,
      hostname,
    })),
    formats: ['image/avif', 'image/webp'] as ('image/avif' | 'image/webp')[],
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
  async redirects() {
    return LEGACY_REDIRECTS.map((r) => ({ ...r, permanent: true }));
  },
};

export default bundleAnalyzer(nextConfig);
