/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Check,
  Copy,
  Layers,
  Heart,
  ArrowLeftRight,
  Star,
  Loader2,
  MessageCircle,
} from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/store/useCart';
import { useToast } from '@/store/useToast';
import { useWishlist } from '@/store/useWishlist';
import { useCompare } from '@/store/useCompare';
import { formatAMD, displayTitle } from '@/lib/utils';
import { resolveImageUrl, SHOWROOM_INFO } from '@/lib/config';
import ProductImage from '@/components/ui/ProductImage';

/**
 * Customer-facing Armenian copy. Written as \u escapes on purpose:
 * typing Armenian literals through editors/transcripts has previously produced
 * homoglyph corruption. Keep this block codepoint-only.
 */
const TEXT = {
  T_FAV_ADDED: '\u0531\u057e\u0565\u056c\u0561\u0581\u057e\u0565\u0581 \u057d\u056b\u0580\u057e\u0561\u056e\u0576\u0565\u0580\u056b \u0581\u0561\u0576\u056f\u0578\u0582\u0574',
  T_FAV_REMOVED: '\u0540\u0565\u057c\u0561\u0581\u057e\u0565\u0581 \u057d\u056b\u0580\u057e\u0561\u056e\u0576\u0565\u0580\u056b \u0581\u0561\u0576\u056f\u056b\u0581',
  T_REMOVE_FAV: '\u0540\u0565\u057c\u0561\u0581\u0576\u0565\u056c \u057d\u056b\u0580\u057e\u0561\u056e\u0576\u0565\u0580\u056b\u0581',
  T_ADD_FAV: '\u0531\u057e\u0565\u056c\u0561\u0581\u0576\u0565\u056c \u057d\u056b\u0580\u057e\u0561\u056e\u0576\u0565\u0580\u0578\u0582\u0574',
  T_REMOVE_CMP: '\u0540\u0565\u057c\u0561\u0581\u0576\u0565\u056c \u0570\u0561\u0574\u0565\u0574\u0561\u057f\u0578\u0582\u0569\u0575\u0578\u0582\u0576\u056b\u0581',
  T_COMPARE: '\u0540\u0561\u0574\u0565\u0574\u0561\u057f\u0565\u056c',
  T_COPY_CODE: '\u054a\u0561\u057f\u0573\u0565\u0576\u0565\u056c \u053f\u0578\u0564',
  L_CODE: '\u053f\u0578\u0564:',
  L_IN_STOCK: '\u054d\u0580\u0561\u0570\u0578\u0582\u0574 \u056f\u0561',
  // Quoted from the price list's own clearance section name (products.xlsx).
  L_CLEARANCE: '\u053C\u056B\u056F\u057E\u056B\u0564\u0561\u0581\u056B\u0561',
  L_PRICE_ASK: '\u0533\u056b\u0576\u0568\u055d \u0568\u057d\u057f \u0570\u0561\u0580\u0581\u0574\u0561\u0576',
  L_ADD: '\u0531\u057e\u0565\u056c\u0561\u0581\u0576\u0565\u056c',
  L_ADDED: '\u0531\u057e\u0565\u056c\u0561\u0581\u057e\u0565\u0581',
  L_ADDING: '\u0531\u057e\u0565\u056c\u0561\u0581\u0578\u0582\u0574 \u0567\u2026',
  L_ASK: '\u0540\u0561\u0580\u0581\u0576\u0565\u056c',
  WA_HEAD: '\u0532\u0561\u0580\u0587 \u0571\u0565\u0566, \u056b\u0576\u0571 \u0570\u0565\u057f\u0561\u0584\u0580\u0584\u0580\u0578\u0582\u0574 \u0567 \u0561\u0575\u057d \u0561\u057a\u0580\u0561\u0576\u0584\u056b \u0563\u056b\u0576\u0568 \u0587 \u0561\u057c\u056f\u0561\u0575\u0578\u0582\u0569\u0575\u0578\u0582\u0576\u0568\u055d ',
  WA_MID: ' (\u053f\u0578\u0564: ',
  WA_TAIL: ') ',
  WA_END: ' \u057d\u0580\u0561\u0570\u0578\u0582\u0574:',
} as const;

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { showCartToast, showCopyToast, showToast } = useToast();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, toggleCompare } = useCompare();

  const [copied, setCopied] = useState(false);
  const [isHeartPopping, setIsHeartPopping] = useState(false);
  // Two-step add feedback: brief loading (spinner, same size) then success.
  const [addState, setAddState] = useState<'idle' | 'loading' | 'added'>('idle');

  const isWishlisted = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);

  // Discount badge renders ONLY from real data: oldPrice > price.
  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  useEffect(() => {
    if (addState !== 'loading') return;
    const timer = setTimeout(() => setAddState('added'), 240);
    return () => clearTimeout(timer);
  }, [addState]);

  useEffect(() => {
    if (addState !== 'added') return;
    const timer = setTimeout(() => setAddState('idle'), 1200);
    return () => clearTimeout(timer);
  }, [addState]);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard?.writeText(product.code);
    setCopied(true);
    showCopyToast(product.code);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    showCartToast(product, 1);
    setAddState('loading');
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHeartPopping(true);
    setTimeout(() => setIsHeartPopping(false), 350);

    const added = toggleWishlist(product);
    if (added) {
      showToast(TEXT.T_FAV_ADDED, product.title);
    } else {
      showToast(TEXT.T_FAV_REMOVED, product.title);
    }
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const res = toggleCompare(product);
    showToast(res.message, product.title);
  };

  // WhatsApp inquiry URL (hidden-price / custom-order path)
  const whatsappUrl = `https://wa.me/${SHOWROOM_INFO.phoneIntl}?text=${encodeURIComponent(
    TEXT.WA_HEAD + product.title + TEXT.WA_MID + product.code + TEXT.WA_TAIL + SHOWROOM_INFO.address + TEXT.WA_END,
  )}`;

  // Image badges render only from real data, and a card never carries more than
  // two. Priority: an actual price cut, the price list's own clearance tag, then
  // one status indicator (showroom availability, else the CAD drawing).
  const statusBadge = product.inStock
    ? 'stock'
    : resolveImageUrl(product.blueprintImage)
      ? 'cad'
      : null;
  const visibleBadges = ([
    discountPercent ? 'discount' : null,
    product.clearance ? 'clearance' : null,
    statusBadge,
  ].filter(Boolean) as string[]).slice(0, 2);

  return (
    <div className="card-lux group relative flex h-full flex-col justify-between rounded-card p-3 sm:p-4">
      {/* 1. Pedestal: ice-white canvas, product floats centered, zero crop.
          A still gallery spotlight falls from the top so the canvas reads as
          deep architecture, not a flat box. Gentle 500ms scale on hover —
          the sculpture breathes with you. */}
      <div className="relative m-0 aspect-square overflow-hidden rounded-card border border-line/50 bg-canvas p-4 sm:m-0">
        <span
          aria-hidden="true"
          className="card-spotlight pointer-events-none absolute inset-0 rounded-card"
        />
        <Link
          href={`/product/${product.slug}`}
          className="block h-full w-full cursor-pointer focus:outline-hidden"
          aria-label={product.title}
        >
          <ProductImage
            src={product.images[0]}
            alt={product.title}
            className="h-full w-full bg-canvas"
            imgClassName="object-contain group-hover:scale-105 transition-transform duration-sheet ease-precision"
          />
        </Link>

        {/* 2. Floating layers over the pedestal: code pill + data badges (max 2)
            on the left, quick actions on the right. */}
        <div className="pointer-events-none absolute inset-x-2 top-2 z-10 flex items-start justify-between gap-1 sm:inset-x-3 sm:top-3">
          <div className="flex flex-col items-start gap-1.5">
            {/* Minimalist mono code pill — tap to copy, frosted over the canvas */}
            <button
              type="button"
              onClick={handleCopyCode}
              title={TEXT.T_COPY_CODE}
              aria-label={`${TEXT.T_COPY_CODE} ${product.code}`}
              className="pointer-events-auto inline-flex max-w-full items-center gap-1 rounded-control border border-line/60 bg-surface/90 px-2 py-0.5 font-mono text-caption tabular-nums text-body shadow-e1 backdrop-blur-md transition-colors duration-hover hover:border-accent/40 hover:text-ink cursor-pointer active:scale-[0.98]"
            >
              <span className="truncate font-bold text-ink">{product.code}</span>
              {copied ? (
                <Check className="h-3 w-3 shrink-0 text-accent" aria-hidden="true" />
              ) : (
                <Copy className="h-3 w-3 shrink-0 opacity-60" aria-hidden="true" />
              )}
            </button>

            {visibleBadges.includes('discount') ? (
              <span className="rounded-full bg-danger px-2 py-0.5 text-xs font-bold leading-tight tabular-nums text-white shadow-e1">
                -{discountPercent}%
              </span>
            ) : null}

            {visibleBadges.includes('clearance') ? (
              <span className="rounded-full bg-ink px-2 py-0.5 text-xs font-semibold leading-tight text-white shadow-e1">
                {TEXT.L_CLEARANCE}
              </span>
            ) : null}

            {visibleBadges.includes('stock') ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line/60 bg-surface/90 px-2 py-0.5 text-xs font-semibold leading-tight text-ink shadow-e1 backdrop-blur-md">
                {/* Emerald breathing dot — live showroom stock beacon */}
                <span className="breathe-dot h-2 w-2 shrink-0 rounded-full bg-success" aria-hidden="true"></span>
                <span>{TEXT.L_IN_STOCK}</span>
              </span>
            ) : null}

            {visibleBadges.includes('cad') ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-ink/90 px-2 py-0.5 font-mono text-xs font-medium leading-tight text-white shadow-e1 backdrop-blur-md">
                <Layers className="h-3 w-3" aria-hidden="true" />
                CAD
              </span>
            ) : null}
          </div>

          {/* Wishlist & Compare (44px hit areas, frosted discs) */}
          <div className="pointer-events-auto flex flex-col gap-1.5">
            <button
              type="button"
              onClick={handleToggleWishlist}
              aria-pressed={isWishlisted}
              title={isWishlisted ? TEXT.T_REMOVE_FAV : TEXT.T_ADD_FAV}
              aria-label={isWishlisted ? TEXT.T_REMOVE_FAV : TEXT.T_ADD_FAV}
              className={`btn-tactile flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-line/60 bg-surface/90 shadow-e1 backdrop-blur-md transition-colors duration-hover ease-precision ${
 isWishlisted
 ? 'text-danger border-danger/30 hover:bg-danger/5'
 : 'text-body hover:bg-surface hover:text-ink'
 } ${isHeartPopping ? 'animate-heart-pop' : ''}`}
            >
              <Heart
                className={`h-4 w-4 ${isWishlisted ? 'fill-danger text-danger' : ''}`}
                aria-hidden="true"
              />
            </button>

            <button
              type="button"
              onClick={handleToggleCompare}
              aria-pressed={isCompared}
              title={isCompared ? TEXT.T_REMOVE_CMP : TEXT.T_COMPARE}
              aria-label={isCompared ? TEXT.T_REMOVE_CMP : TEXT.T_COMPARE}
              className={`btn-tactile flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-line/60 bg-surface/90 shadow-e1 backdrop-blur-md transition-colors duration-hover ease-precision ${
 isCompared
 ? 'text-accent border-accent/30 hover:bg-accent/5'
 : 'text-body hover:bg-surface hover:text-ink'
 }`}
            >
              <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Editorial body: brand → title → price anchor → full-width CTA */}
      <div className="flex flex-1 flex-col justify-between gap-2 pt-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2 text-xs min-h-[1rem]">
            <span className="truncate text-caption font-semibold uppercase tracking-wider text-muted">
              {product.brand}
            </span>
            {product.rating ? (
              <div className="flex shrink-0 items-center gap-1 text-xs font-semibold tabular-nums text-body">
                <Star className="h-3.5 w-3.5 fill-ink text-ink" aria-hidden="true" />
                <span>{product.rating}</span>
              </div>
            ) : null}
          </div>

          <Link
            href={`/product/${product.slug}`}
            className="block min-h-[2.5rem] cursor-pointer text-sm font-semibold leading-snug tracking-tight text-ink transition-colors duration-hover ease-precision line-clamp-2 hover:text-accent"
          >
            {displayTitle(product.title)}
          </Link>
        </div>

        {/* 4. Price anchor + tactile full-width CTA. Installments only render
            if real installment data exists — currently none, so no claim. */}
        <div className="flex flex-col gap-2.5">
          <div className="min-w-0">
            {product.price > 0 ? (
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold tracking-tight text-ink tabular-nums">
                  {formatAMD(product.price)}
                </span>
                {product.oldPrice ? (
                  <span className="truncate text-xs font-medium text-muted line-through tabular-nums">
                    {formatAMD(product.oldPrice)}
                  </span>
                ) : null}
              </div>
            ) : (
              <div className="text-sm font-semibold text-body">{TEXT.L_PRICE_ASK}</div>
            )}
          </div>

          {product.inStock ? (
            <button
              type="button"
              onClick={handleAddToCart}
              aria-label={`${TEXT.L_ADD} ${product.title}` /* zambyugh */}
              className={`btn-tactile flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-control px-4 py-2.5 text-sm font-medium text-white shadow-e1 transition-colors duration-200 ease-precision ${
 addState === 'added'
 ? 'bg-success'
 : 'bg-ink hover:bg-accent'
 }`}
            >
              {addState === 'loading' ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : addState === 'added' ? (
                <Check className="h-4 w-4 animate-check-pop" aria-hidden="true" />
              ) : (
                <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              )}
              <span className="whitespace-nowrap">
                {addState === 'loading' ? TEXT.L_ADDING : addState === 'added' ? TEXT.L_ADDED : TEXT.L_ADD}
              </span>
            </button>
          ) : (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-tactile flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-control border border-line bg-canvas px-4 py-2.5 text-sm font-medium text-body transition-colors duration-200 hover:border-line-strong hover:text-ink"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              <span className="whitespace-nowrap">{TEXT.L_ASK}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
