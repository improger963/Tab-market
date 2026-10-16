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
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted">
        <Link href="/" className="hover:text-accent transition-colors">
          Գլխավոր
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-muted" />
        <Link href="/catalog" className="hover:text-accent transition-colors">
          Կատալոգ
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-muted" />
        <span className="text-ink font-bold">Սիրված Ապրանքներ (Wishlist)</span>
      </nav>

      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-danger mb-1">
            <Heart className="w-3.5 h-3.5 fill-danger" />
            <span>Պահպանված Մոդելներ</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-ink tracking-tight">
            Սիրված Ապրանքներ
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
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
              className="min-h-[44px] px-5 py-2.5 rounded-control bg-ink hover:bg-accent active:scale-95 text-white font-bold text-xs transition-all shadow-e1 flex items-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-accent" />
              <span>Տեղափոխել Բոլորը Զամբյուղ</span>
            </button>

            <button
              type="button"
              onClick={clearWishlist}
              className="min-h-[44px] px-3.5 py-2.5 rounded-control bg-canvas hover:bg-line text-body font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
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
          <div className="w-20 h-20 rounded-panel bg-canvas text-accent flex items-center justify-center mx-auto border border-line">
            <Heart className="w-10 h-10 stroke-[1.5]" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-ink tracking-tight">
              Ձեր նախընտրածների ցանկը դատարկ է
            </h2>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Կատալոգից ապրանքներ ընտրելիս սեղմեք սրտիկի վրա՝ հետագայում արագ գտնելու կամ միասին պատվիրելու համար:
            </p>
          </div>
          <Link
            href="/catalog"
            className="min-h-[48px] inline-flex items-center gap-2 px-8 py-3 rounded-panel bg-ink hover:bg-accent text-white font-bold text-xs transition-all shadow-e1 active:scale-98 cursor-pointer"
          >
            <span>Անցնել Կատալոգ</span>
            <ArrowRight className="w-4 h-4 text-accent" />
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
