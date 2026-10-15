'use client';

import React, { useState } from 'react';
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
  FileText,
  Clock,
} from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/store/useCart';
import { useToast } from '@/store/useToast';
import { formatAMD } from '@/lib/utils';
import QuickOrderModal from './QuickOrderModal';
import StickyMobileBuyBar from './StickyMobileBuyBar';

interface ProductDetailViewProps {
  product: Product;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const { addItem, openDrawer } = useCart();
  const { showCartToast, showCopyToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false);

  // Compute discount percentage
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

  return (
    <div className="space-y-6">
      {/* Sticky Buy Box Card */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
        {/* Category & Brand Badges */}
        <div className="flex items-center justify-between gap-2">
          <Link
            href={`/catalog/${product.categorySlug}`}
            className="text-xs font-bold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200/80 px-2.5 py-1 rounded-lg transition-colors"
          >
            {product.categoryName}
          </Link>
          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
            {product.brand}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-tight">
          {product.title}
        </h1>

        {/* ArmSoft ERP SKU Strip with 1-Click Copy */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-mono text-xs font-bold shadow-2xs">
            <span className="text-cyan-400">ՀԾ ԿՈԴ:</span>
            <span>{product.code}</span>
          </div>

          <button
            type="button"
            onClick={handleCopyCode}
            title="Պատճենել ՀԾ Կոդը"
            className="min-h-[36px] px-3 py-1.5 rounded-xl border border-slate-200 hover:border-cyan-300 bg-slate-50 hover:bg-cyan-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedCode ? (
              <>
                <Check className="w-3.5 h-3.5 text-cyan-600" />
                <span className="text-cyan-700 font-bold">Պատճենված է!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Պատճենել կոդը</span>
              </>
            )}
          </button>
        </div>

        {/* Live Showroom Stock Status Badge */}
        <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-950">
              Առկա է Մելքումովի 40/1 սրահում
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-white text-emerald-800 text-[11px] font-black border border-emerald-200 shadow-2xs tabular-nums">
            {product.stockQuantity} հատ
          </span>
        </div>

        {/* Pricing Block */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-3xl sm:text-4xl font-black text-slate-950 tabular-nums tracking-tight">
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
          <p className="text-[11px] text-slate-400 font-medium">Գինը ներառում է ԱԱՀ (VAT included)</p>
        </div>

        {/* Quantity Incrementer & Dual Purchase Actions */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-slate-200 rounded-2xl bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Նվազեցնել քանակը"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-600 hover:bg-white rounded-xl transition-colors cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>

              <span className="w-10 text-center text-sm font-extrabold text-slate-900 tabular-nums">
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
              className="flex-1 min-h-[52px] px-6 py-3.5 rounded-2xl bg-cyan-600 hover:bg-cyan-700 active:scale-98 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Ավելացնել Զամբյուղ</span>
            </button>
          </div>

          {/* Secondary 1-Click Fast Order Button */}
          <button
            type="button"
            onClick={() => setIsQuickOrderOpen(true)}
            className="w-full min-h-[48px] py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 active:scale-98 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs border border-slate-800"
          >
            <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400" />
            <span>Արագ Պատվեր 1 Քլիքով</span>
          </button>
        </div>

        {/* Trust & Delivery Card */}
        <div className="pt-4 border-t border-slate-100 space-y-3 text-xs text-slate-600">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
            <span>
              <b>Անվճար ստացում</b> Մելքումովի 40/1 սրահից (Այսօր, 15 րոպեից)
            </span>
          </div>

          <div className="flex items-start gap-2.5">
            <Truck className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
            <span>
              <b>Առաքում Երևանում 24 ժամում</b>, ՀՀ մարզեր՝ 2-3 աշխատանքային օրում
            </span>
          </div>

          <div className="flex items-start gap-2.5">
            <FileCheck2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
            <span>
              Պաշտոնական երաշխիք և <b>անկանխիկ B2B հաշիվ-ապրանքագիր (ՀՎՀՀ)</b> շինարարներին
            </span>
          </div>
        </div>
      </div>

      {/* 1-Click Fast Order Modal */}
      <QuickOrderModal
        product={product}
        isOpen={isQuickOrderOpen}
        onClose={() => setIsQuickOrderOpen(false)}
      />

      {/* Sticky Mobile Buy Bar */}
      <StickyMobileBuyBar product={product} />
    </div>
  );
}
