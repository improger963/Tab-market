/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  ShoppingBag,
  Check,
  Copy,
  Layers,
  Heart,
  ArrowLeftRight,
  Star,
} from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/store/useCart';
import { useToast } from '@/store/useToast';
import { useWishlist } from '@/store/useWishlist';
import { useCompare } from '@/store/useCompare';
import { formatAMD } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { showCartToast, showCopyToast, showToast } = useToast();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, toggleCompare } = useCompare();

  const [copied, setCopied] = useState(false);
  const isWishlisted = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);

  // Compute discount percentage if oldPrice exists
  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

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
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWishlist(product);
    if (added) {
      showToast('Ավելացվեց սիրվածների ցանկում', product.title);
    } else {
      showToast('Հեռացվեց սիրվածների ցանկից', product.title);
    }
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const res = toggleCompare(product);
    showToast(res.message, product.title);
  };

  // Extract up to 2 key technical specs
  const keySpecs = Object.entries(product.specs || {}).slice(1, 3);

  return (
    <div className="bg-white/80 backdrop-blur-xs border border-slate-200/85 hover:border-slate-300 hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 ease-out rounded-2xl overflow-hidden flex flex-col justify-between group relative luxury-card active:scale-[0.98]">
      {/* Top Image Container */}
      <div className="relative aspect-square bg-slate-100 overflow-hidden">
        <Link
          href={`/product/${product.slug}`}
          className="block w-full h-full cursor-pointer focus:outline-hidden"
          aria-label={product.title}
        >
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        </Link>

        {/* Top Floating Overlay Controls */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between pointer-events-none gap-2 z-10">
          {/* Left: Badges */}
          <div className="flex flex-col gap-1.5 items-start">
            {discountPercent ? (
              <span className="px-2 py-0.5 rounded-lg bg-rose-600 text-white font-extrabold text-[11px] tracking-tight shadow-md">
                -{discountPercent}%
              </span>
            ) : null}

            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-sm text-emerald-700 text-[10px] font-bold border border-emerald-200/80 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Առկա է
            </span>
          </div>

          {/* Right: Quick Action Buttons (Wishlist & Compare) */}
          <div className="flex flex-col gap-1.5 pointer-events-auto">
            {/* Wishlist Heart Button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.85 }}
              onClick={handleToggleWishlist}
              title={isWishlisted ? 'Հեռացնել սիրվածներից' : 'Ավելացնել սիրվածներում'}
              aria-label="Wishlist toggle"
              className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer ${
                isWishlisted
                  ? 'bg-rose-50 text-rose-500 border border-rose-200'
                  : 'bg-white/95 hover:bg-white text-slate-500 hover:text-rose-500 border border-slate-200/80 backdrop-blur-xs'
              }`}
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isWishlisted ? 'fill-rose-500 text-rose-500' : ''
                }`}
                aria-hidden="true"
              />
            </motion.button>

            {/* Compare Button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.85 }}
              onClick={handleToggleCompare}
              title={isCompared ? 'Հեռացնել համեմատությունից' : 'Համեմատել'}
              aria-label="Compare toggle"
              className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer ${
                isCompared
                  ? 'bg-cyan-50 text-cyan-600 border border-cyan-300'
                  : 'bg-white/95 hover:bg-white text-slate-500 hover:text-cyan-600 border border-slate-200/80 backdrop-blur-xs'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" aria-hidden="true" />
            </motion.button>
          </div>
        </div>

        {/* CAD Blueprint indicator badge if scheme is available */}
        {product.blueprintImage && (
          <div className="absolute bottom-3 right-3 pointer-events-none">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur text-cyan-300 text-[10px] font-mono font-bold shadow-xs">
              <Layers className="w-3 h-3 text-cyan-400" aria-hidden="true" />
              CAD Գծագիր
            </span>
          </div>
        )}
      </div>

      {/* Info Body Area */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Brand & Star Rating */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
              {product.brand}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" aria-hidden="true" />
              <span className="text-slate-800">{product.rating || 4.9}</span>
              <span className="text-slate-400 text-[10px]">({product.reviewsCount || 14})</span>
            </div>
          </div>

          {/* Title */}
          <Link
            href={`/product/${product.slug}`}
            className="font-bold text-slate-900 text-sm leading-snug hover:text-cyan-600 transition-colors line-clamp-2 block cursor-pointer"
          >
            {product.title}
          </Link>

          {/* ArmSoft ERP SKU Strip */}
          <div className="pt-1 flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px] font-bold">
              <span className="text-slate-400 text-[10px]">ԿՈԴ:</span>
              <span className="text-slate-900">{product.code}</span>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              title="Պատճենել ՀԾ Կոդը"
              aria-label="Պատճենել ՀԾ Կոդը"
              className="min-h-[32px] min-w-[32px] px-2 py-1 flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-cyan-700 bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-200 rounded-md transition-colors cursor-pointer active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-cyan-600" aria-hidden="true" />
                  <span className="text-cyan-700 font-bold">Պատճենված է!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-slate-400" aria-hidden="true" />
                  <span>Պատճենել</span>
                </>
              )}
            </button>
          </div>

          {/* Key Specs Tag Strip */}
          {keySpecs.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {keySpecs.map(([k, v]) => (
                <span
                  key={k}
                  className="bg-slate-50 text-slate-600 border border-slate-200/80 px-2 py-0.5 rounded text-[10px] font-medium leading-tight"
                >
                  <span className="text-slate-400">{k}:</span> <b className="text-slate-800">{v}</b>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pricing & Add to Cart Action Area */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-base sm:text-lg font-black text-slate-950 tabular-nums tracking-tight">
              {formatAMD(product.price)}
            </div>
            {product.oldPrice && (
              <div className="text-xs text-slate-400 line-through tabular-nums -mt-0.5">
                {formatAMD(product.oldPrice)}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            aria-label={`Ավելացնել ${product.title} զամբյուղ`}
            className="min-h-[48px] px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-cyan-600 active:scale-95 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <ShoppingBag className="w-4 h-4 text-cyan-400" aria-hidden="true" />
            <span>Ավելացնել</span>
          </button>
        </div>
      </div>
    </div>
  );
}
