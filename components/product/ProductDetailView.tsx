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
  MapPin,
  Truck,
  ShieldCheck,
  FileCheck2,
  Plus,
  Minus,
  Heart,
  ArrowLeftRight,
  Star,
  MessageCircle,
} from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/store/useCart';
import { useToast } from '@/store/useToast';
import { useWishlist } from '@/store/useWishlist';
import { useCompare } from '@/store/useCompare';
import { useRecentlyViewed } from '@/store/useRecentlyViewed';
import { formatAMD } from '@/lib/utils';
import QuickOrderModal from './QuickOrderModal';
import StickyMobileBuyBar from './StickyMobileBuyBar';
import ARPreviewModal from './ARPreviewModal';

interface ProductDetailViewProps {
  product: Product;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const { addItem, openDrawer } = useCart();
  const { showCartToast, showCopyToast, showToast } = useToast();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, toggleCompare } = useCompare();
  const { addProduct } = useRecentlyViewed();

  const [quantity, setQuantity] = useState(1);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false);
  const [isARModalOpen, setIsARModalOpen] = useState(false);

  const isWishlisted = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);

  useEffect(() => {
    addProduct(product);
  }, [product, addProduct]);

  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  const monthlyInstallment = product.price ? Math.round(product.price / 6) : 0;

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
    const added = toggleWishlist(product);
    if (added) {
      showToast('Ավելացվեց սիրվածների ցանկում', product.title);
    } else {
      showToast('Հեռացվեց սիրվածների ցանկից', product.title);
    }
  };

  const handleToggleCompare = () => {
    const res = toggleCompare(product);
    showToast(res.message, product.title);
  };

  // WhatsApp pre-filled inquiry CTA
  const whatsappUrl = `https://wa.me/37495530435?text=${encodeURIComponent(
    `Բարև ձեզ, ինձ հետաքրքրում է ${product.title}: Խնդրում եմ ասեք՝ առկա՞ է Մելքումովի 40/1 սրահում:`
  )}`;

  return (
    <div className="space-y-6">
      {/* Sticky Buy Box Card */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E2E8F0] shadow-xs space-y-6">
        {/* Category & Rating */}
        <div className="flex items-center justify-between gap-2">
          <Link
            href={`/category/${product.categorySlug}`}
            className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg transition-colors"
          >
            {product.categoryName}
          </Link>

          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
            <span className="text-[#0F172A]">{product.rating || 4.9}</span>
            <span className="text-slate-400 text-[11px]">({product.reviewsCount || 16} կարծիք)</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight leading-tight">
          {product.title}
        </h1>

        {/* ArmSoft SKU Strip + Wishlist/Compare */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0F172A] text-white font-mono text-xs font-bold shadow-2xs">
            <span className="text-blue-400">ՀԾ ԿՈԴ:</span>
            <span>{product.code}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCode}
              title="Պատճենել ՀԾ Կոդը"
              className="min-h-[40px] px-3 py-2 rounded-xl border border-slate-200 hover:border-blue-300 bg-white hover:bg-blue-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
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
              className={`min-h-[40px] px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isWishlisted
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
              <span>{isWishlisted ? 'Սիրված է' : 'Սիրված'}</span>
            </button>
          </div>
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
              <span className="px-2 py-0.5 rounded-lg bg-rose-600 text-white text-xs font-extrabold shadow-2xs">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Rocket Line Installment Badge */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold">
            <Zap className="w-4 h-4 text-blue-600 shrink-0 fill-blue-600" />
            <span>
              Հասանելի է <b>Rocket Line</b>-ով (0% տոկոսադրույքով ապառիկ՝ {formatAMD(monthlyInstallment)}/ամս)
            </span>
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
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-600 hover:bg-white rounded-xl transition-colors cursor-pointer"
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
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-600 hover:bg-white rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Primary Add to Cart Button */}
            <button
              id="main-add-to-cart-btn"
              type="button"
              onClick={handleAddToCart}
              className="flex-1 min-h-[50px] px-6 py-3.5 rounded-xl bg-[#0F172A] hover:bg-[#2563EB] active:scale-98 text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-blue-400" />
              <span>Ավելացնել Զամբյուղ</span>
            </button>
          </div>

          {/* Secondary 1-Click Fast Order Button */}
          <button
            type="button"
            onClick={() => setIsQuickOrderOpen(true)}
            className="w-full min-h-[46px] py-3 rounded-xl bg-white hover:bg-slate-50 active:scale-98 text-[#0F172A] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs border border-[#E2E8F0]"
          >
            <Zap className="w-4 h-4 text-blue-600 fill-blue-600" />
            <span>Արագ Պատվեր 1 Քլիքով</span>
          </button>

          {/* WhatsApp Inquiry CTA */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[46px] py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Հարցնել մասնագետին WhatsApp-ով</span>
          </a>

          {/* AR / 3D Bathroom Preview Button */}
          <button
            type="button"
            onClick={() => setIsARModalOpen(true)}
            className="w-full min-h-[46px] py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-98 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AR / 3D Տեղադրում և Սիմուլյացիա</span>
          </button>
        </div>

        {/* 4 Instant Visual Badge Chips */}
        <div className="pt-4 border-t border-[#E2E8F0] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-semibold">Երաշխիք՝ մինչև 5 տարի</span>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200">
            <FileCheck2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-semibold">Նյութը՝ Պրեմիում Լատուն / Չժանգոտվող պողպատ</span>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200">
            <Truck className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-semibold">Անվճար առաքում Երևանում</span>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-semibold">Անվճար ստացում Մելքումովի 40/1 սրահից</span>
          </div>
        </div>
      </div>

      <QuickOrderModal
        product={product}
        isOpen={isQuickOrderOpen}
        onClose={() => setIsQuickOrderOpen(false)}
      />

      <ARPreviewModal
        product={product}
        isOpen={isARModalOpen}
        onClose={() => setIsARModalOpen(false)}
      />

      <StickyMobileBuyBar product={product} />
    </div>
  );
}
