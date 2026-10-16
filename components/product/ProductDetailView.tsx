/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Zap,
  Check,
  Copy,
  Plus,
  Minus,
  Heart,
  Star,
  MessageCircle,
  Layers,
  Cog,
  Truck,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/store/useCart';
import { useToast } from '@/store/useToast';
import { useWishlist } from '@/store/useWishlist';
import { useRecentlyViewed } from '@/store/useRecentlyViewed';
import { formatAMD, displayTitle } from '@/lib/utils';
import { DELIVERY_CONFIG, SHOWROOM_INFO } from '@/lib/config';
import { HY } from '@/lib/copy/hy';
import QuickOrderModal from './QuickOrderModal';
import StickyMobileBuyBar from './StickyMobileBuyBar';

interface ProductDetailViewProps {
  product: Product;
}

/**
 * PDP buy box. Anatomy (fixed order): category + rating -> brand -> title ->
 * code chip + copy -> availability -> price -> quantity + CTAs -> WhatsApp ->
 * data-gated highlight chips.
 *
 * - The ONLY ambient animation on this page is the WhatsApp beacon
 *   (pulse-beacon, reduced-motion disabled via the global CSS block).
 * - Every highlight chip renders only if its backing field exists. The
 *   delivery chip renders only when DELIVERY_CONFIG actually grants free
 *   Yerevan delivery. "What's in the box" was REMOVED: no product field backs
 *   its list items (needs owner decision to add real data).
 * - All Armenian strings come from HY (byte-verified escapes); HEAD's
 *   corrupted chip labels and the "kod KOD:" duplicate were fixed there.
 */
export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const { addItem, openDrawer } = useCart();
  const { showCartToast, showCopyToast, showToast } = useToast();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addProduct } = useRecentlyViewed();

  const [quantity, setQuantity] = useState(1);
  const [copiedCode, setCopiedCode] = useState(false);
  const [addState, setAddState] = useState<'idle' | 'loading' | 'added'>('idle');
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false);
  const [isHeartPopping, setIsHeartPopping] = useState(false);

  const isWishlisted = isInWishlist(product.id);

  useEffect(() => {
    addProduct(product);
  }, [product, addProduct]);

  useEffect(() => {
    if (addState !== 'added') return;
    const t = setTimeout(() => setAddState('idle'), 2000);
    return () => clearTimeout(t);
  }, [addState]);

  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(product.code);
    setCopiedCode(true);
    showCopyToast(product.code);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleAddToCart = () => {
    setAddState('loading');
    addItem(product, quantity);
    showCartToast(product, quantity);
    setAddState('added');
    openDrawer();
  };

  const handleToggleWishlist = () => {
    setIsHeartPopping(true);
    setTimeout(() => setIsHeartPopping(false), 350);

    const added = toggleWishlist(product);
    if (added) {
      showToast(HY.FAVORITE_ADDED, product.title);
    } else {
      showToast(HY.FAVORITE_REMOVED, product.title);
    }
  };

  // ---- Data-gated spec highlights (render only attributes that exist) -----
  const findSpec = (key: string) =>
    Object.entries(product.specs).find(([k]) => k.includes(key))?.[1];

  const materialSpec = findSpec('\u0546\u0575\u0578\u0582\u0569'); // "Nyut" (Material) spec key, HEAD-verbatim
  const cartridgeSpec = findSpec('\u0554\u0561\u0580\u057f\u0580\u056b\u057b') ?? findSpec('Cartridge'); // "Qartrij", HEAD-verbatim
  const warrantySpec = findSpec('\u0535\u0580\u0561\u0577\u056d\u056b\u0584'); // "Erashkhik", HEAD-verbatim

  type Highlight = {
    Icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
  };

  const highlights: Highlight[] = [];
  if (materialSpec) highlights.push({ Icon: Layers, label: HY.CHIP_CORPUS, value: materialSpec });
  if (cartridgeSpec) highlights.push({ Icon: Cog, label: HY.CHIP_CARTRIDGE, value: cartridgeSpec });
  if (DELIVERY_CONFIG.yerevanFreeAlways)
    highlights.push({ Icon: Truck, label: HY.CHIP_DELIVERY, value: HY.FREE_DELIVERY_YEREVAN });
  if (warrantySpec)
    highlights.push({ Icon: ShieldCheck, label: HY.CHIP_WARRANTY, value: warrantySpec });

  // WhatsApp pre-filled inquiry (title + code + showroom address, config-driven).
  const whatsappUrl = `https://wa.me/${SHOWROOM_INFO.phoneIntl}?text=${encodeURIComponent(
    `${HY.WA_INTERESTED} ${product.title}: ${HY.WA_INQUIRY_TAIL}`
  )}`;

  return (
    <div className="space-y-6">
      <div className="space-y-5 rounded-panel border border-line bg-surface p-5 shadow-e1 sm:p-6">
        {/* Category + rating */}
        <div className="flex items-center justify-between gap-2">
          <Link
            href={`/category/${product.categorySlug}`}
            className="inline-flex min-h-[32px] items-center rounded-full border border-line bg-canvas px-3 py-1 text-xs font-semibold text-body transition-colors duration-hover ease-precision hover:border-line-strong hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            {product.categoryName}
          </Link>

          <span className="inline-flex items-center gap-1.5 text-xs text-body">
            <Star className="h-3.5 w-3.5 fill-ink text-ink" aria-hidden="true" />
            <span className="font-semibold text-ink tabular-nums">{product.rating}</span>
            <span className="text-muted">
              ({product.reviewsCount} {HY.REVIEWS})
            </span>
          </span>
        </div>

        {/* Brand + title */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted">{product.brand}</p>
          <h1 className="text-2xl font-bold leading-snug tracking-tight text-ink sm:text-3xl">
            {displayTitle(product.title)}
          </h1>
        </div>

        {/* Code chip + copy + wishlist */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-canvas px-3 py-1.5 font-mono text-xs font-semibold text-body">
            <span>{HY.CODE_COLON}</span>
            <span className="font-bold text-ink">{product.code}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCode}
              title={HY.COPY_CODE}
              className="btn-tactile inline-flex min-h-[44px] items-center gap-1.5 rounded-control border border-line bg-surface px-3 py-2 text-xs font-semibold text-body transition-colors duration-hover ease-precision hover:border-line-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              {copiedCode ? (
                <>
                  <Check className="h-3.5 w-3.5 animate-check-pop text-success" aria-hidden="true" />
                  <span>{HY.COPIED}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
                  <span>{HY.CODE}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleToggleWishlist}
              aria-pressed={isWishlisted}
              className={`btn-tactile inline-flex min-h-[44px] items-center gap-1.5 rounded-control border px-3 py-2 text-xs font-semibold transition-colors duration-hover ease-precision focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
 isWishlisted
 ? 'border-accent/40 bg-canvas text-accent'
 : 'border-line bg-surface text-body hover:border-line-strong hover:text-ink'
 } ${isHeartPopping ? 'animate-heart-pop' : ''}`}
            >
              <Heart
                className={`h-3.5 w-3.5 ${isWishlisted ? 'fill-accent text-accent' : ''}`}
                aria-hidden="true"
              />
              <span>{isWishlisted ? HY.FAVORITE_ACTIVE : HY.FAVORITE}</span>
            </button>
          </div>
        </div>

        {/* Availability — static dot, text label (never color alone; no pulse here) */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          {product.inStock ? (
            <>
              <span className="h-2 w-2 shrink-0 rounded-full bg-success" aria-hidden="true" />
              <span className="font-semibold text-ink">{HY.IN_STOCK_SHOWROOM}</span>
              <span className="text-muted tabular-nums">
                {DELIVERY_CONFIG.pickupAddress} · {product.stockQuantity} {HY.HAT}
              </span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 shrink-0 rounded-full bg-line-strong" aria-hidden="true" />
              <span className="font-semibold text-ink">{HY.BACK_ORDER}</span>
              <span className="text-muted">{HY.ASK_ON_WHATSAPP}</span>
            </>
          )}
        </div>

        {/* Price block — the visual anchor */}
        <div className="space-y-2 rounded-card border border-line bg-canvas p-4">
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-bold tracking-tight text-ink tabular-nums sm:text-4xl">
              {formatAMD(product.price)}
            </span>
            {product.oldPrice ? (
              <span className="text-sm font-semibold text-muted line-through tabular-nums">
                {formatAMD(product.oldPrice)}
              </span>
            ) : null}
            {discountPercent ? (
              <span className="rounded-full bg-danger px-2 py-0.5 text-xs font-bold text-white tabular-nums">
                -{discountPercent}%
              </span>
            ) : null}
          </div>
        </div>

        {/* Quantity + purchase actions */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-control border border-line bg-canvas p-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label={HY.QTY_DECREASE}
                className="btn-tactile flex min-h-[44px] min-w-[44px] items-center justify-center rounded-control text-body transition-colors duration-hover ease-precision hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                <Minus className="h-4 w-4" />
              </button>

              <span className="w-10 text-center text-sm font-bold text-ink tabular-nums">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                disabled={quantity >= product.stockQuantity}
                aria-label={HY.QTY_INCREASE}
                className="btn-tactile flex min-h-[44px] min-w-[44px] items-center justify-center rounded-control text-body transition-colors duration-hover ease-precision hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              id="main-add-to-cart-btn"
              type="button"
              onClick={handleAddToCart}
              className={`btn-tactile flex min-h-[50px] flex-1 items-center justify-center gap-2 rounded-control px-6 py-3.5 text-sm font-semibold text-white transition-colors duration-hover ease-precision focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
 addState === 'added' ? 'bg-success' : 'bg-ink hover:bg-accent'
 }`}
            >
              {addState === 'loading' ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : addState === 'added' ? (
                <Check className="h-4 w-4 animate-check-pop" aria-hidden="true" />
              ) : (
                <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              )}
              <span>{addState === 'added' ? HY.ADDED : HY.ADD_TO_CART}</span>
            </button>
          </div>

          {/* Secondary 1-click quick order */}
          <button
            type="button"
            onClick={() => setIsQuickOrderOpen(true)}
            className="btn-tactile flex min-h-[46px] w-full items-center justify-center gap-2 rounded-control border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition-colors duration-hover ease-precision hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <Zap className="h-4 w-4 text-accent" aria-hidden="true" />
            <span>{HY.QUICK_ORDER}</span>
          </button>

          {/* WhatsApp inquiry — the ONE ambient pulse in the app (2.6s,
              reduced-motion disabled globally). Outline style keeps AA text. */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pulse-beacon btn-tactile flex min-h-[48px] w-full items-center justify-center gap-2 rounded-control border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition-colors duration-hover ease-precision hover:border-success focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <MessageCircle className="h-4 w-4 text-success" aria-hidden="true" />
            <span>{HY.ASK_SPECIALIST}</span>
          </a>
        </div>

        {/* Data-gated highlight chips: 2 columns, per-attribute cards. */}
        {highlights.length > 0 ? (
          <div className="grid grid-cols-1 gap-2.5 border-t border-line pt-4 text-xs sm:grid-cols-2">
            {highlights.map((chip) => (
              <div
                key={chip.label}
                className="flex items-start gap-2.5 rounded-card border border-line bg-canvas p-3"
              >
                <chip.Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <p className="leading-snug text-body">
                  <span className="font-semibold text-ink">{chip.label}</span> {chip.value}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* ============================================================
          Technical Dossier Tabs (single specs-table source) rendered
          below-the-fold via <ProductDossierTabs /> in the page layout.

          "What's in the box" is intentionally NOT rendered: its items
          were hardcoded category guesses with no product data field
          behind them (needs owner decision to supply real data).
          ============================================================ */}

      <QuickOrderModal
        product={product}
        isOpen={isQuickOrderOpen}
        onClose={() => setIsQuickOrderOpen(false)}
      />

      <StickyMobileBuyBar product={product} />
    </div>
  );
}
