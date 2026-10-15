'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Check, Copy, Layers } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/store/useCart';
import { useToast } from '@/store/useToast';
import { formatAMD } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, openDrawer } = useCart();
  const { showCartToast, showCopyToast } = useToast();
  const [copied, setCopied] = useState(false);

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

  // Extract up to 2 key technical specs
  const keySpecs = Object.entries(product.specs || {}).slice(1, 3);

  return (
    <div className="bg-white/95 backdrop-blur-xs border border-slate-200/80 hover:border-slate-300 hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 ease-out rounded-2xl overflow-hidden flex flex-col justify-between group relative">
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

        {/* Top Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none gap-2">
          {/* Discount badge */}
          {discountPercent ? (
            <span className="px-2 py-1 rounded-lg bg-rose-600 text-white font-extrabold text-[11px] tracking-tight shadow-md">
              -{discountPercent}%
            </span>
          ) : (
            <span />
          )}

          {/* Stock status chip */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-emerald-700 text-[11px] font-bold border border-emerald-200/80 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Առկա է սրահում
          </span>
        </div>

        {/* CAD Blueprint indicator badge if scheme is available */}
        {product.blueprintImage && (
          <div className="absolute bottom-3 right-3 pointer-events-none">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur text-cyan-300 text-[10px] font-mono font-bold shadow-xs">
              <Layers className="w-3 h-3 text-cyan-400" />
              CAD Գծագիր
            </span>
          </div>
        )}
      </div>

      {/* Info Body Area */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
              {product.brand}
            </span>
            <span className="text-[11px] text-slate-400 font-medium truncate max-w-[120px]">
              {product.categoryName}
            </span>
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
              className="min-h-[32px] min-w-[32px] px-2 py-1 flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-cyan-700 bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-200 rounded-md transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-cyan-600" />
                  <span className="text-cyan-700 font-bold">Պատճենված է!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-slate-400" />
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
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-cyan-600 active:scale-95 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ավելացնել</span>
          </button>
        </div>
      </div>
    </div>
  );
}
