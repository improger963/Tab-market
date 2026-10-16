/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import { ImageIcon } from 'lucide-react';
import { resolveImageUrl } from '@/lib/config';
import { cn } from '@/lib/utils';

interface ProductImageProps {
  /** Raw image reference from the product's own data (absolute URL or IMAGE_BASE-relative path). */
  src?: string | null;
  alt: string;
  /** Classes for the outer fixed-ratio wrapper (controls aspect ratio & rounding). */
  className?: string;
  /** Classes for the inner <img>. */
  imgClassName?: string;
  /** eager for LCP/hero & PDP main image, lazy (default) everywhere else. */
  eager?: boolean;
  /** Accessible label shown on the neutral placeholder (defaults to a decorative icon only). */
  placeholderLabel?: string;
}

/**
 * Single neutral product-image renderer used across cards, cart, checkout, PDP,
 * search and galleries. Renders the product's own image when present, otherwise
 * a neutral placeholder (slate background + icon, no marketing claims). The
 * wrapper keeps a fixed aspect ratio so there is zero cumulative layout shift.
 */
export default function ProductImage({
  src,
  alt,
  className,
  imgClassName,
  eager = false,
  placeholderLabel,
}: ProductImageProps) {
  const resolved = resolveImageUrl(src);

  if (!resolved) {
    return (
      <div
        role="img"
        aria-label={placeholderLabel ?? alt}
        className={cn(
          'flex items-center justify-center bg-canvas text-faint',
          className,
        )}
      >
        <ImageIcon className="h-1/4 max-h-12 min-h-6 w-auto" aria-hidden="true" />
        {placeholderLabel && (
          <span className="sr-only">{placeholderLabel}</span>
        )}
      </div>
    );
  }

  return (
    <div className={cn('overflow-hidden bg-canvas', className)}>
      <img
        src={resolved}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className={cn('h-full w-full object-cover', imgClassName)}
      />
    </div>
  );
}
