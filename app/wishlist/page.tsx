'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ChevronRight, ArrowRight, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlist } from '@/store/useWishlist';
import { useCart } from '@/store/useCart';
import { useToast } from '@/store/useToast';
import ProductCard from '@/components/product/ProductCard';

export default function WishlistPage() {
  const { items, clearWishlist } = useWishlist();
  const { addItem, openDrawer } = useCart();
  const { showToast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const handleMoveAllToCart = () => {
    items.forEach((p) => addItem(p, 1));
    showToast(`${items.length} ապրանք ավելացվեց զամբյուղ`, 'Զամբյուղ');
    openDrawer();
  };

  return (
    <div className="container-lux py-8 space-y-8 animate-in fade-in-50 duration-200">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Գլխավոր
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/catalog" className="hover:text-blue-600 transition-colors">
          Կատալոգ
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[#0F172A] font-bold">Սիրված Ապրանքներ (Wishlist)</span>
      </nav>

      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-rose-600 mb-1">
            <Heart className="w-3.5 h-3.5 fill-rose-500" />
            <span>Պահպանված Մոդելներ</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
            Սիրված Ապրանքներ
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {items.length > 0
              ? `Դուք պահպանել եք ${items.length} ապրանք Մելքումովի 40/1 սրահի կատալոգից:`
              : 'Ցանկը դատարկ է:'}
          </p>
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleMoveAllToCart}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#2563EB] active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-blue-400" />
              <span>Տեղափոխել Բոլորը Զամբյուղ</span>
            </button>

            <button
              type="button"
              onClick={clearWishlist}
              className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Մաքրել</span>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {items.length === 0 ? (
        <div className="max-w-md mx-auto py-16 text-center space-y-5">
          <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-inner border border-rose-100">
            <Heart className="w-10 h-10 stroke-[1.5]" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-[#0F172A] tracking-tight">
              Ձեր նախընտրածների ցանկը դատարկ է
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Կատալոգից ապրանքներ ընտրելիս սեղմեք սրտիկի վրա՝ հետագայում արագ գտնելու կամ միասին պատվիրելու համար:
            </p>
          </div>
          <Link
            href="/catalog"
            className="min-h-[48px] inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#0F172A] hover:bg-[#2563EB] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer"
          >
            <span>Անցնել Կատալոգ</span>
            <ArrowRight className="w-4 h-4 text-blue-400" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
