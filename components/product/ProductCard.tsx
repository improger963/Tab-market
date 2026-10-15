/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
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
  MessageCircle,
  Zap,
} from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/store/useCart';
import { useToast } from '@/store/useToast';
import { useWishlist } from '@/store/useWishlist';
import { useCompare } from '@/store/useCompare';
import { formatAMD, displayTitle } from '@/lib/utils';
import { resolveImageUrl } from '@/lib/config';
import ProductImage from '@/components/ui/ProductImage';

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
  const [justAdded, setJustAdded] = useState(false);

  const isWishlisted = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);

  // Compute discount percentage if oldPrice exists
  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  // Rocket line installment monthly estimate (approx price / 6)
  const monthlyInstallment = product.price ? Math.round(product.price / 6) : 0;

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
    // Tactile checkmark confirmation flash on the button
    setJustAdded(true);
  };

  useEffect(() => {
    if (!justAdded) return;
    const timer = setTimeout(() => setJustAdded(false), 1200);
    return () => clearTimeout(timer);
  }, [justAdded]);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHeartPopping(true);
    setTimeout(() => setIsHeartPopping(false), 350);

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

  // WhatsApp inquiry URL for hidden price / custom order
  const whatsappUrl = `https://wa.me/37495530435?text=${encodeURIComponent(
    `Բարև ձեզ, ինձ հետաքրքրում է այս ապրանքի գինը և առկայությունը՝ ${product.title} (կոդ ԿՈԴ: ${product.code}) Մելքումովի 40/1 սրահում:`
  )}`;

  // Micro-spec pills: Material, Warranty, Connection size (from product.specs)
  const specPills = ['Նյութ', 'Երաշխիք', 'Միացում']
    .map((key) => {
      const entry = Object.entries(product.specs).find(
        ([k]) => k.toLowerCase() === key.toLowerCase()
      );
      if (!entry) return null;
      const value = entry[1].replace(/\s*\(.*?\)\s*/g, '').trim();
      return { label: value.length > 20 ? `${value.slice(0, 19)}…` : value };
    })
    .filter((pill): pill is { label: string } => pill !== null);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:-translate-y-1.5 hover:shadow-2xl hover:border-blue-400/50 transition-all duration-300 ease-out flex flex-col justify-between group relative overflow-hidden">
      {/* Top Image Container: Ice-white pedestal */}
      <div className="relative aspect-square bg-[#F8FAFC] overflow-hidden m-1.5 sm:m-2 rounded-xl">
        <Link
          href={`/product/${product.slug}`}
          className="block w-full h-full cursor-pointer focus:outline-hidden"
          aria-label={product.title}
        >
          <ProductImage
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full"
            imgClassName="scale-[1.02] group-hover:scale-[1.06] transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Top Floating Overlay Controls */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between pointer-events-none gap-1 z-10">
          {/* Left: Badges */}
          <div className="flex flex-col gap-1 items-start">
            {discountPercent ? (
              <span className="px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg bg-rose-600 text-white font-extrabold text-[10px] sm:text-[11px] tracking-tight shadow-md shimmer-glint">
                -{discountPercent}%
              </span>
            ) : null}

            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full glass-surface text-slate-800 text-[9px] sm:text-[10px] font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-beacon shrink-0"></span>
              <span className="hidden xs:inline">Առկա է</span>
            </span>
          </div>

          {/* Right: Wishlist & Compare Buttons */}
          <div className="flex flex-col gap-1 pointer-events-auto">
            <motion.button
              type="button"
              whileTap={{ scale: 0.85 }}
              onClick={handleToggleWishlist}
              title={isWishlisted ? 'Հեռացնել սիրվածներից' : 'Ավելացնել սիրվածներում'}
              aria-label="Wishlist toggle"
              className={`w-9 h-9 sm:w-10 sm:h-10 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center shadow-md glass-surface transition-all cursor-pointer ${
                isWishlisted
                  ? 'bg-rose-50 text-rose-500 border-rose-200 shadow-rose-200/50'
                  : 'hover:bg-white text-slate-600 hover:text-rose-500 border-white/80'
              } ${isHeartPopping ? 'animate-heart-pop' : ''}`}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-colors ${
                  isWishlisted ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]' : ''
                }`}
                aria-hidden="true"
              />
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.85 }}
              onClick={handleToggleCompare}
              title={isCompared ? 'Հեռացնել համեմատությունից' : 'Համեմատել'}
              aria-label="Compare toggle"
              className={`w-9 h-9 sm:w-10 sm:h-10 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center shadow-md glass-surface transition-all cursor-pointer ${
                isCompared
                  ? 'bg-blue-50 text-blue-600 border-blue-300 shadow-blue-200/50'
                  : 'hover:bg-white text-slate-600 hover:text-blue-600 border-white/80'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" aria-hidden="true" />
            </motion.button>
          </div>
        </div>

        {/* CAD Blueprint indicator badge if a real scheme image is available */}
        {resolveImageUrl(product.blueprintImage) && (
          <div className="absolute bottom-2 right-2 pointer-events-none">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0F172A]/90 backdrop-blur-md text-blue-300 text-[9px] sm:text-[10px] font-mono font-bold shadow-xs">
              <Layers className="w-3 h-3 text-blue-400" aria-hidden="true" />
              CAD
            </span>
          </div>
        )}
      </div>

      {/* Info Body Area */}
      <div className="p-2.5 sm:p-4 pt-0 sm:pt-1 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 truncate">
              {product.brand}
            </span>
            {product.rating ? (
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-amber-500 shrink-0">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                <span className="text-slate-800 tabular-nums">{product.rating}</span>
              </div>
            ) : null}
          </div>

          <Link
            href={`/product/${product.slug}`}
            className="font-semibold sm:font-bold text-[#0F172A] text-xs sm:text-sm leading-snug hover:text-blue-600 transition-colors line-clamp-2 min-h-[2.4rem] sm:min-h-[2.5rem] block cursor-pointer"
          >
            {displayTitle(product.title)}
          </Link>

          {/* SKU chip */}
          <div className="pt-0.5 flex items-center justify-between gap-1.5">
            <div className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md bg-[#F8FAFC] border border-slate-200 text-slate-800 font-mono text-[10px] font-medium shadow-2xs truncate">
              <span className="text-slate-400 text-[9px]">ԿՈԴ:</span>
              <span className="text-slate-900 font-bold">{product.code}</span>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              title="Պատճենել Կոդ"
              className="hidden sm:inline-flex min-h-[30px] px-1.5 py-0.5 items-center gap-1 text-[10px] font-semibold text-slate-600 hover:text-blue-700 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-md transition-colors cursor-pointer active:scale-95 shrink-0 btn-tactile"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-blue-600" aria-hidden="true" />
                  <span className="text-blue-700 font-bold">Կոպի</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-slate-400" aria-hidden="true" />
                  <span>Կոդ</span>
                </>
              )}
            </button>
          </div>

          {/* Micro-spec pills: Material / Warranty / Connection */}
          {specPills.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {specPills.map((pill) => (
                <span
                  key={pill.label}
                  className="px-1.5 py-0.5 rounded-md bg-[#F8FAFC] border border-slate-200 text-[9px] sm:text-[10px] font-semibold text-slate-600 truncate max-w-[110px]"
                >
                  {pill.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Configurable Price Architecture & Rocket Line Badge */}
        <div className="pt-2 sm:pt-3 border-t border-slate-100 space-y-2">
          {product.price && product.price > 0 ? (
            <>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="text-sm sm:text-lg font-bold sm:font-extrabold text-[#0F172A] tabular-nums tracking-tight truncate">
                    {formatAMD(product.price)}
                  </div>
                  {product.oldPrice && (
                    <div className="text-[10px] sm:text-xs text-slate-400 line-through tabular-nums -mt-0.5 truncate">
                      {formatAMD(product.oldPrice)}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  aria-label={`Ավելացնել ${product.title} զամբյուղ`}
                  className={`w-full sm:w-auto min-h-[44px] sm:min-w-[104px] px-2.5 sm:px-3.5 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer shrink-0 btn-tactile shimmer-glint ${
                    justAdded ? 'bg-emerald-600 hover:bg-emerald-600 shadow-emerald-500/30' : 'bg-[#0F172A] hover:bg-[#2563EB]'
                  }`}
                >
                  {justAdded ? (
                    <Check className="w-4 h-4 text-white animate-check-pop" aria-hidden="true" />
                  ) : (
                    <ShoppingBag className="w-4 h-4 text-blue-400" aria-hidden="true" />
                  )}
                  <span className="whitespace-nowrap">
                    {justAdded ? 'Ավելացված' : 'Ավելացնել'}
                  </span>
                </button>
              </div>

              {/* Rocket Line Installment Badge */}
              <div className="flex items-center gap-1.5 text-[10px] text-blue-700 bg-blue-50/80 px-2 py-1.5 rounded-lg border border-blue-200/80 font-semibold tabular-nums">
                <Zap className="w-3 h-3 text-blue-600 shrink-0 fill-blue-600 animate-pulse" />
                <span>Rocket Line՝ սկսած {formatAMD(monthlyInstallment)}/ամս</span>
              </div>
            </>
          ) : (
            /* Hidden or Null Price: Ask Price / Custom Order WhatsApp button */
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700">Գինը՝ ըստ հարցման</div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[40px] py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer btn-tactile"
              >
                <MessageCircle className="w-4 h-4 animate-bounce" />
                <span>Հարցնել գինը WhatsApp-ով</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
