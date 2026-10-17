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
    <div className="card-lux rounded-card flex flex-col h-full group relative overflow-hidden">
      {/* 1. Pedestal image area: fixed square, contained product, zero crop */}
      <div className="relative aspect-square bg-canvas overflow-hidden m-1.5 sm:m-2 rounded-control">
        <Link
          href={`/product/${product.slug}`}
          className="block w-full h-full cursor-pointer focus:outline-hidden"
          aria-label={product.title}
        >
          <ProductImage
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full bg-canvas"
            imgClassName="object-contain p-3 group-hover:scale-[1.03] transition-transform duration-hover ease-precision"
          />
        </Link>

        {/* 2. Badges (max 2) + quick actions */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between pointer-events-none gap-1 z-10">
          <div className="flex flex-col gap-1 items-start">
            {visibleBadges.includes('discount') ? (
              <span className="px-2 py-0.5 rounded-full bg-danger text-white font-bold text-xs tabular-nums leading-tight">
                -{discountPercent}%
              </span>
            ) : null}

            {visibleBadges.includes('clearance') ? (
              <span className="px-2 py-0.5 rounded-full bg-ink text-white text-xs font-semibold leading-tight">
                {TEXT.L_CLEARANCE}
              </span>
            ) : null}

            {visibleBadges.includes('stock') ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full glass-surface text-body text-xs font-semibold leading-tight">
                {/* Static dot — no ambient pulse on cards */}
                <span className="w-2 h-2 rounded-full bg-success shrink-0" aria-hidden="true"></span>
                <span>{TEXT.L_IN_STOCK}</span>
              </span>
            ) : null}

            {visibleBadges.includes('cad') ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-ink/90 text-white text-xs font-mono font-medium leading-tight">
                <Layers className="w-3 h-3" aria-hidden="true" />
                CAD
              </span>
            ) : null}
          </div>

          {/* Wishlist & Compare (44px hit areas) */}
          <div className="flex flex-col gap-1 pointer-events-auto">
            <button
              type="button"
              onClick={handleToggleWishlist}
              title={isWishlisted ? TEXT.T_REMOVE_FAV : TEXT.T_ADD_FAV}
              aria-label={isWishlisted ? TEXT.T_REMOVE_FAV : TEXT.T_ADD_FAV}
              className={`w-11 h-11 rounded-full flex items-center justify-center shadow-e1 glass-surface transition-colors duration-hover ease-precision cursor-pointer ${
 isWishlisted
 ? 'bg-surface text-danger'
 : 'text-body hover:bg-surface hover:text-ink'
 } ${isHeartPopping ? 'animate-heart-pop' : ''}`}
            >
              <Heart
                className={`w-4 h-4 ${isWishlisted ? 'fill-accent text-accent' : ''}`}
                aria-hidden="true"
              />
            </button>

            <button
              type="button"
              onClick={handleToggleCompare}
              title={isCompared ? TEXT.T_REMOVE_CMP : TEXT.T_COMPARE}
              aria-label={isCompared ? TEXT.T_REMOVE_CMP : TEXT.T_COMPARE}
              className={`w-11 h-11 rounded-full flex items-center justify-center shadow-e1 glass-surface transition-colors duration-hover ease-precision cursor-pointer ${
 isCompared
 ? 'bg-surface text-accent'
 : 'text-body hover:bg-surface hover:text-ink'
 }`}
            >
              <ArrowLeftRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Info body: brand → title → code chip → price → CTA (equal heights) */}
      <div className="p-3 sm:p-4 pt-0 sm:pt-1 flex-1 flex flex-col justify-between space-y-2">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs min-h-[1rem]">
            <span className="text-xs font-semibold text-muted truncate">
              {product.brand}
            </span>
            {product.rating ? (
              <div className="flex items-center gap-1 text-xs font-semibold text-body shrink-0 tabular-nums">
                <Star className="w-3.5 h-3.5 fill-ink text-ink" aria-hidden="true" />
                <span>{product.rating}</span>
              </div>
            ) : null}
          </div>

          <Link
            href={`/product/${product.slug}`}
            className="font-semibold text-ink text-sm sm:text-base leading-snug hover:text-accent transition-colors duration-hover ease-precision line-clamp-2 min-h-[2.5rem] block cursor-pointer"
          >
            {displayTitle(product.title)}
          </Link>

          {/* Code chip - customer-facing label is always "Kod" (TEXT.L_CODE) */}
          <div className="pt-0.5 flex items-center justify-between gap-1.5">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-control bg-canvas border border-line font-mono text-xs text-ink tabular-nums truncate">
              <span className="text-muted">{TEXT.L_CODE}</span>
              <span className="font-bold">{product.code}</span>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              title={TEXT.T_COPY_CODE}
              aria-label={`${TEXT.T_COPY_CODE} ${product.code}`}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1 text-xs font-semibold text-muted hover:text-accent rounded-control transition-colors duration-hover cursor-pointer active:scale-[0.98]"
            >
              {copied ? (
                <Check className="w-4 h-4 text-accent" aria-hidden="true" />
              ) : (
                <Copy className="w-4 h-4" aria-hidden="true" />
              )}
              <span className="sr-only">{TEXT.T_COPY_CODE}</span>
            </button>
          </div>
        </div>

        {/* 4. Price block (visual anchor) + CTA. Installments are only shown
            when a real installment field exists in product data — currently
            none does, so no financing claim is rendered. */}
        <div className="pt-2 border-t border-line flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            {product.price > 0 ? (
              <>
                <div className="text-lg font-bold text-ink tabular-nums tracking-tight">
                  {formatAMD(product.price)}
                </div>
                {product.oldPrice ? (
                  <div className="text-sm text-muted line-through tabular-nums truncate">
                    {formatAMD(product.oldPrice)}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="text-sm font-semibold text-body">{TEXT.L_PRICE_ASK}</div>
            )}
          </div>

          {product.inStock ? (
            <button
              type="button"
              onClick={handleAddToCart}
              aria-label={`${TEXT.L_ADD} ${product.title}` /* zambyugh */}
              className={`w-full sm:w-auto min-h-[44px] sm:min-w-[120px] px-3 py-2 rounded-control text-white text-sm font-semibold transition-colors duration-hover ease-precision flex items-center justify-center gap-1.5 cursor-pointer shrink-0 active:scale-[0.98] ${
 addState === 'added'
 ? 'bg-success'
 : 'bg-ink hover:bg-accent'
 }`}
            >
              {addState === 'loading' ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : addState === 'added' ? (
                <Check className="w-4 h-4 animate-check-pop" aria-hidden="true" />
              ) : (
                <ShoppingBag className="w-4 h-4" aria-hidden="true" />
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
              className="w-full sm:w-auto min-h-[44px] sm:min-w-[120px] px-3 py-2 rounded-control bg-surface border border-line text-body text-sm font-semibold hover:border-line-strong hover:text-ink transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              <span className="whitespace-nowrap">{TEXT.L_ASK}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
