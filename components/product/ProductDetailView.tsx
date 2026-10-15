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
  PackageCheck,
} from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/store/useCart';
import { useToast } from '@/store/useToast';
import { useWishlist } from '@/store/useWishlist';
import { useRecentlyViewed } from '@/store/useRecentlyViewed';
import { formatAMD, displayTitle } from '@/lib/utils';
import QuickOrderModal from './QuickOrderModal';
import StickyMobileBuyBar from './StickyMobileBuyBar';

interface ProductDetailViewProps {
  product: Product;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const { addItem, openDrawer } = useCart();
  const { showCartToast, showCopyToast, showToast } = useToast();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addProduct } = useRecentlyViewed();

  const [quantity, setQuantity] = useState(1);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false);
  const [isHeartPopping, setIsHeartPopping] = useState(false);

  const isWishlisted = isInWishlist(product.id);

  useEffect(() => {
    addProduct(product);
  }, [product, addProduct]);

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
    addItem(product, quantity);
    showCartToast(product, quantity);
    openDrawer();
  };

  const handleToggleWishlist = () => {
    setIsHeartPopping(true);
    setTimeout(() => setIsHeartPopping(false), 350);

    const added = toggleWishlist(product);
    if (added) {
      showToast('Ավելացվեց սիրվածների ցանկում', product.title);
    } else {
      showToast('Հեռացվեց սիրվածների ցանկից', product.title);
    }
  };

  // Consolidated 4-chip spec highlights (single source: derived from product.specs)
  const findSpec = (key: string) =>
    Object.entries(product.specs).find(([k]) => k.includes(key))?.[1];

  const materialSpec = findSpec('Նյութ');
  const cartridgeSpec = findSpec('Քարտրիջ') ?? findSpec('Cartridge');
  const warrantySpec = findSpec('Երաշխիք');

  // Render chips ONLY when the per-product spec field exists — no invented fallbacks.
  const specChips = [
    materialSpec && { emoji: '💧', label: 'Կորպուսը՝', value: materialSpec },
    cartridgeSpec && { emoji: '⚙️', label: 'Քարտրիջը՝', value: cartridgeSpec },
    { emoji: '🚚', label: 'Առաքումը՝', value: 'Անվճար Երևանում' },
    warrantySpec && { emoji: '🛡️', label: 'Երաշխիքը՝', value: `${warrantySpec} Պաշտոնական` },
  ].filter((c): c is { emoji: string; label: string; value: string } => Boolean(c));

  // WhatsApp pre-filled inquiry CTA (exact spec copy)
  const whatsappUrl = `https://wa.me/37495530435?text=${encodeURIComponent(
    `Բարև ձեզ, ինձ հետաքրքրում է ${product.title}: Խնդրում եմ ասեք՝ առկա՞ է Մելքումովի 40/1 սրահում:`
  )}`;

  return (
    <div className="space-y-6">
      {/* Sticky Buy Box Card */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E2E8F0] shadow-sm space-y-6">
        {/* Category & Rating */}
        <div className="flex items-center justify-between gap-2">
          <Link
            href={`/category/${product.categorySlug}`}
            className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg transition-colors btn-tactile"
          >
            {product.categoryName}
          </Link>

          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
            <span className="text-[#0F172A] tabular-nums">{product.rating}</span>
            <span className="text-slate-400 text-[11px]">({product.reviewsCount} կարծիք)</span>
          </div>
        </div>

        {/* Brand Eyebrow + Title */}
        <div className="space-y-1">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
            {product.brand}
          </p>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight leading-tight">
            {displayTitle(product.title)}
          </h1>
        </div>

        {/*  SKU Strip + Wishlist/Compare */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0F172A] text-white font-mono text-xs font-bold shadow-2xs">
            <span className="text-blue-400">կոդ ԿՈԴ:</span>
            <span>{product.code}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCode}
              title="Պատճենել Կոդ Կոդը"
              className="min-h-[40px] px-3 py-2 rounded-xl border border-slate-200 hover:border-blue-300 bg-white hover:bg-blue-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer btn-tactile"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                  <span>Պատճենված է</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Կոդ</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleToggleWishlist}
              className={`min-h-[40px] px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer btn-tactile ${
                isWishlisted
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              } ${isHeartPopping ? 'animate-heart-pop' : ''}`}
            >
              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{isWishlisted ? 'Սիրված է' : 'Սիրված'}</span>
            </button>
          </div>
        </div>

        {/* Live Showroom Stock Indicator */}
        <div className="flex items-center gap-2 text-xs">
          {product.inStock ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-beacon shrink-0" aria-hidden="true" />
              <span className="font-extrabold text-emerald-700">Առկա է սրահում</span>
              <span className="font-semibold text-slate-500">
                Մելքումովի 40/1 · {product.stockQuantity} հատ
              </span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" aria-hidden="true" />
              <span className="font-extrabold text-rose-600">Սպասման պատվեր</span>
              <span className="font-semibold text-slate-500">Հարցնել WhatsApp-ով</span>
            </>
          )}
        </div>

        {/* Pricing Block */}
        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-3xl sm:text-4xl font-black text-[#0F172A] tabular-nums tracking-tight">
              {formatAMD(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-sm text-slate-400 line-through tabular-nums font-semibold">
                {formatAMD(product.oldPrice)}
              </span>
            )}
            {discountPercent && (
              <span className="px-2 py-0.5 rounded-lg bg-rose-600 text-white text-xs font-extrabold shadow-2xs shimmer-glint">
                -{discountPercent}%
              </span>
            )}
          </div>
        </div>

        {/* Quantity Incrementer & Purchase Actions */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-[#E2E8F0] rounded-2xl bg-[#F8FAFC] p-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Նվազեցնել քանակը"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-600 hover:bg-white rounded-xl transition-colors cursor-pointer btn-tactile"
              >
                <Minus className="w-4 h-4" />
              </button>

              <span className="w-10 text-center text-sm font-extrabold text-[#0F172A] tabular-nums">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                aria-label="Ավելացնել քանակը"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-600 hover:bg-white rounded-xl transition-colors cursor-pointer btn-tactile"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Primary Add to Cart Button */}
            <button
              id="main-add-to-cart-btn"
              type="button"
              onClick={handleAddToCart}
              className="flex-1 min-h-[50px] px-6 py-3.5 rounded-xl bg-[#0F172A] hover:bg-[#2563EB] text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer btn-tactile shimmer-glint"
            >
              <ShoppingBag className="w-4 h-4 text-blue-400" />
              <span>Ավելացնել Զամբյուղ</span>
            </button>
          </div>

          {/* Secondary 1-Click Fast Order Button */}
          <button
            type="button"
            onClick={() => setIsQuickOrderOpen(true)}
            className="w-full min-h-[46px] py-3 rounded-xl bg-white hover:bg-slate-50 text-[#0F172A] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs border border-[#E2E8F0] btn-tactile"
          >
            <Zap className="w-4 h-4 text-blue-600 fill-blue-600" />
            <span>Արագ Պատվեր 1 Քլիքով</span>
          </button>

          {/* WhatsApp Inquiry CTA with Continuous Green Ambient Pulse Ring on Hover */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[46px] py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md btn-tactile hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]"
          >
            <MessageCircle className="w-4 h-4 animate-bounce" />
            <span>Հարցնել մասնագետին WhatsApp-ով</span>
          </a>
        </div>

        {/* Consolidated 4-Chip Specs Highlight Grid (single row, no duplicates) */}
        <div className="pt-4 border-t border-[#E2E8F0] grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          {specChips.map((chip) => (
            <div
              key={chip.label}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F8FAFC] border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all group cursor-default"
            >
              <span className="text-base leading-none shrink-0 group-hover:scale-110 transition-transform" aria-hidden="true">
                {chip.emoji}
              </span>
              <span className="font-semibold text-slate-700 leading-snug">
                <b className="text-[#0F172A]">{chip.label}</b> {chip.value}
              </span>
            </div>
          ))}
        </div>

        {/* "What's in the Box" (Ի՞նչ կա տուփի մեջ) visual checklist */}
        <div className="pt-4 border-t border-[#E2E8F0] space-y-3">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#0F172A]">
              Ի՞նչ կա տուփի մեջ
            </h2>
          </div>

          <ul className="grid grid-cols-1 gap-2">
            {[
              product.categorySlug === 'faucets' ? 'Լվացարանի ծորակ' : 'Հիմնական ապրանք',
              ...(product.categorySlug === 'faucets'
                ? ['Ճկուն միացման խողովակներ 45սմ (զույգ)']
                : ['Մոնտաժման / ամրացման հավաքածու']),
              'Արագ ամրացման մանեկներ և միջադիրներ',
              'Պաշտոնական երաշխիքային անձնագիր',
            ].map((boxItem) => (
              <li
                key={boxItem}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs font-semibold text-slate-700"
              >
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </span>
                <span>{boxItem}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ============================================================
          Technical Dossier Tabs (single specs-table source) rendered
          below-the-fold via <ProductDossierTabs /> in the page layout.
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
