/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import TopBar from '@/components/layout/TopBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import CartDrawer from '@/components/cart/CartDrawer';
import ToastContainer from '@/components/ui/ToastContainer';
import ProductCard from '@/components/product/ProductCard';
import ProductGallery from '@/components/product/ProductGallery';
import ProductDetailView from '@/components/product/ProductDetailView';
import ProductDossierTabs from '@/components/product/ProductDossierTabs';
import CatalogView from '@/components/catalog/CatalogView';
import BrandPageClient from '@/components/brand/BrandPageClient';
import HomePage from '@/app/page';
import CheckoutPage from '@/app/checkout/page';
import WishlistPage from '@/app/wishlist/page';
import ComparePage from '@/app/compare/page';
import TrackOrderPage from '@/app/track-order/page';
import ProductReviews from '@/components/product/ProductReviews';
import RecentlyViewed from '@/components/product/RecentlyViewed';
import { Product } from '@/types';
import { products } from '@/data/products';
import { resolveImageUrl } from '@/lib/config';
import { displayTitle } from '@/lib/utils';
import { useCart } from '@/store/useCart';
import {
  ChevronRight,
  X,
  PackageX,
  ArrowRight,
} from 'lucide-react';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Parse route parameters
  const route = useMemo(() => {
    if (currentPath.startsWith('/product/')) {
      const slug = currentPath.replace('/product/', '').split('/')[0];
      return { page: 'product', slug };
    }
    if (currentPath.startsWith('/catalog/')) {
      const categorySlug = currentPath.replace('/catalog/', '').split('/')[0];
      return { page: 'catalog', categorySlug };
    }
    if (currentPath.startsWith('/category/')) {
      const categorySlug = currentPath.replace('/category/', '').split('/')[0];
      return { page: 'catalog', categorySlug };
    }
    if (currentPath.startsWith('/brand/')) {
      const slug = currentPath.replace('/brand/', '').split('/')[0];
      return { page: 'brand', slug };
    }
    if (currentPath === '/catalog') {
      return { page: 'catalog', categorySlug: 'all' };
    }
    if (currentPath === '/checkout') {
      return { page: 'checkout' };
    }
    if (currentPath === '/wishlist') {
      return { page: 'wishlist' };
    }
    if (currentPath === '/compare') {
      return { page: 'compare' };
    }
    if (currentPath === '/track-order') {
      return { page: 'track-order' };
    }
    return { page: 'home' };
  }, [currentPath]);

  // Global Cart State
  const { addItem, openDrawer } = useCart();

  // Active product CAD modal
  const [activeCadProduct, setActiveCadProduct] = useState<Product | null>(null);

  // Single Product view data
  const currentProduct = useMemo(() => {
    if (route.page === 'product' && route.slug) {
      return products.find((p) => p.slug === route.slug) || null;
    }
    return null;
  }, [route]);

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans selection:bg-[#2563EB] selection:text-white overflow-x-clip w-full pb-shell">
      {/* 1. Global Shell: TopBar */}
      <TopBar />

      {/* 2. Global Shell: Header with LiveSearch & Cart Trigger */}
      <Header />

      {/* VIEW 1: HOME PAGE */}
      {route.page === 'home' && (
        <main className="flex-1 w-full animate-in fade-in-50 duration-200">
          <HomePage />
        </main>
      )}

      {/* VIEW 2: CATALOG PAGE */}
      {route.page === 'catalog' && (
        <main className="flex-1 container-lux py-8 animate-in fade-in-50 duration-200">
          <CatalogView
            initialCategorySlug={route.categorySlug === 'all' ? undefined : route.categorySlug}
          />
        </main>
      )}

      {/* VIEW 3: PRODUCT DETAIL PAGE */}
      {route.page === 'product' && currentProduct && (
        <main className="flex-1 container-lux py-8 space-y-12 animate-in fade-in-50 duration-200">
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
            <Link
              href={`/category/${currentProduct.categorySlug}`}
              className="hover:text-blue-600 transition-colors"
            >
              {currentProduct.categoryName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[#0F172A] font-bold truncate max-w-xs sm:max-w-md">
              {displayTitle(currentProduct.title)}
            </span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
            {/* Gallery: 1st on mobile, left 7 cols on desktop */}
            <div className="lg:col-span-7">
              <ProductGallery
                images={currentProduct.images}
                blueprintImage={currentProduct.blueprintImage}
                title={currentProduct.title}
              />
            </div>

            {/* Buy Box: 2nd on mobile (immediately following gallery), right 5 cols on desktop (sticky top-28 spanning gallery and specs) */}
            <div className="lg:col-span-5 lg:row-span-2 lg:sticky lg:top-[calc(var(--topbar-h)+var(--header-h)+1rem)]">
              <ProductDetailView product={currentProduct} />
            </div>

            {/* Description & Dossier Tabs: 3rd on mobile, underneath gallery on desktop in left 7 cols */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              <div className="bg-white p-5 sm:p-8 rounded-3xl border border-[#E2E8F0] shadow-xs space-y-4">
                <h2 className="text-base font-extrabold uppercase tracking-wider text-[#0F172A]">
                  Ապրանքի Նկարագրություն
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {currentProduct.shortDesc}
                </p>
              </div>

              {/* Interactive Technical Dossier Tabs — the ONLY full specs table on the page */}
              <ProductDossierTabs product={currentProduct} />
            </div>
          </div>

          {/* Related Products */}
          <div className="space-y-6 pt-10 border-t border-[#E2E8F0]">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#2563EB]">
                Առաջարկներ
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight mt-0.5">
                Նմանատիպ Ապրանքներ Այս Բաժնում
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {products
                .filter((p) => p.categorySlug === currentProduct.categorySlug && p.id !== currentProduct.id)
                .slice(0, 4)
                .map((relProduct) => (
                  <ProductCard key={relProduct.id} product={relProduct} />
                ))}
            </div>
          </div>

          {/* Customer Reviews & Social Proof */}
          <ProductReviews product={currentProduct} />

          {/* Recently Viewed Carousel */}
          <RecentlyViewed currentProductId={currentProduct.id} />
        </main>
      )}

      {/* VIEW 3 (FALLBACK): PRODUCT NOT FOUND */}
      {route.page === 'product' && !currentProduct && (
        <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-20 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto shadow-inner">
            <PackageX className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
              Ապրանքը չի գտնվել
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              Հնարավոր է տվյալ ապրանքն այլևս առկա չէ սրահում կամ հասցեն սխալ է մուտքագրվել:
            </p>
          </div>
          <Link
            href="/catalog"
            className="min-h-[48px] inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#0F172A] hover:bg-[#2563EB] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98"
          >
            <span>Վերադառնալ Կատալոգ</span>
            <ArrowRight className="w-4 h-4 text-blue-400" />
          </Link>
        </main>
      )}

      {/* VIEW 4: CHECKOUT PAGE */}
      {route.page === 'checkout' && (
        <main className="flex-1 w-full animate-in fade-in-50 duration-200">
          <CheckoutPage />
        </main>
      )}

      {/* VIEW 5: WISHLIST PAGE */}
      {route.page === 'wishlist' && (
        <main className="flex-1 w-full animate-in fade-in-50 duration-200">
          <WishlistPage />
        </main>
      )}

      {/* VIEW 6: PRODUCT COMPARISON PAGE */}
      {route.page === 'compare' && (
        <main className="flex-1 w-full animate-in fade-in-50 duration-200">
          <ComparePage />
        </main>
      )}

      {/* VIEW 7: ORDER TRACKING PAGE */}
      {route.page === 'track-order' && (
        <main className="flex-1 w-full animate-in fade-in-50 duration-200">
          <TrackOrderPage />
        </main>
      )}

      {/* VIEW 8: DEDICATED BRAND LANDING PAGE */}
      {route.page === 'brand' && route.slug && (
        <main className="flex-1 w-full animate-in fade-in-50 duration-200">
          <BrandPageClient slug={route.slug} />
        </main>
      )}

      {/* CAD Blueprint Zoom Modal */}
      {activeCadProduct && (
        <div className="fixed inset-0 z-overlay flex items-center justify-center p-4 bg-[#0F172A]/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90dvh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
            <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h4 className="font-bold text-sm text-[#0F172A]">{activeCadProduct.title}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-blue-600 text-xs font-bold">
                    Կոդ: {activeCadProduct.code}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-xs text-slate-500">CAD Տեխնիկական Սխեմա (մմ)</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveCadProduct(null)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-[#0F172A] flex flex-col items-center justify-center min-h-[340px]">
              {resolveImageUrl(activeCadProduct.blueprintImage) ? (
                <img
                  src={resolveImageUrl(activeCadProduct.blueprintImage)!}
                  alt="CAD Scheme"
                  className="max-h-[380px] w-auto object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
                  <PackageX className="w-12 h-12" aria-hidden="true" />
                  <span className="text-xs font-semibold">CAD գծագիրը ներառված չէ</span>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#E2E8F0] bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Առկա է Մելքումովի 40/1 սրահում ({activeCadProduct.stockQuantity} հատ)
              </span>
              <button
                type="button"
                onClick={() => {
                  addItem(activeCadProduct, 1);
                  setActiveCadProduct(null);
                  openDrawer();
                }}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#2563EB] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Ավելացնել Զամբյուղ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Global Shell: Slide-Over Cart Drawer */}
      <CartDrawer />

      {/* Global Shell: Toast Notifications */}
      <ToastContainer />

      {/* 4. Global Shell: Footer */}
      <Footer />

      {/* 5. Global Shell: Mobile Nav Bar */}
      <MobileNav />
    </div>
  );
}
