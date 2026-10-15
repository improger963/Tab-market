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
import ProductCard from '@/components/product/ProductCard';
import ProductGallery from '@/components/product/ProductGallery';
import ProductDetailView from '@/components/product/ProductDetailView';
import CatalogView from '@/components/catalog/CatalogView';
import HomePage from '@/app/page';
import CheckoutPage from '@/app/checkout/page';
import { Product } from '@/types';
import { products } from '@/data/products';
import { useCart } from '@/store/useCart';
import {
  ChevronRight,
  ShieldCheck,
  FileText,
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
    if (currentPath === '/catalog') {
      return { page: 'catalog', categorySlug: 'all' };
    }
    if (currentPath === '/checkout') {
      return { page: 'checkout' };
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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-cyan-500 selection:text-white pb-20 md:pb-0">
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
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 animate-in fade-in-50 duration-200">
          <CatalogView
            initialCategorySlug={route.categorySlug === 'all' ? undefined : route.categorySlug}
          />
        </main>
      )}

      {/* VIEW 3: PRODUCT DETAIL PAGE */}
      {route.page === 'product' && currentProduct && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-12 animate-in fade-in-50 duration-200">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-cyan-600 transition-colors">
              Գլխավոր
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link href="/catalog" className="hover:text-cyan-600 transition-colors">
              Կատալոգ
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link
              href={`/catalog/${currentProduct.categorySlug}`}
              className="hover:text-cyan-600 transition-colors"
            >
              {currentProduct.categoryName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold truncate max-w-xs sm:max-w-md">
              {currentProduct.title}
            </span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column (7 cols): Gallery + Specs */}
            <div className="lg:col-span-7 space-y-8">
              <ProductGallery
                images={currentProduct.images}
                blueprintImage={currentProduct.blueprintImage}
                title={currentProduct.title}
              />

              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                <h2 className="text-base font-extrabold uppercase tracking-wider text-slate-900">
                  Ապրանքի Նկարագրություն
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {currentProduct.shortDesc}
                </p>
                <div className="p-4 rounded-2xl bg-cyan-50/70 border border-cyan-200/80 text-xs text-cyan-950 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
                  <span>
                    Այս մոդելն անցել է գործարանային 10 բար հիդրավլիկ ճնշման փորձարկում և ունի պաշտոնական
                    երաշխիքային կտրոն:
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-600" />
                  <h2 className="text-base font-extrabold uppercase tracking-wider text-slate-900">
                    Տեխնիկական Բնութագիր (Specifications)
                  </h2>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <tbody className="divide-y divide-slate-200">
                      {Object.entries(currentProduct.specs).map(([key, value]) => (
                        <tr key={key} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/50 w-2/5">
                            {key}
                          </td>
                          <td className="py-3 px-4 text-slate-900 font-bold">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): Sticky Buy Box */}
            <div className="lg:col-span-5 sticky top-24">
              <ProductDetailView product={currentProduct} />
            </div>
          </div>

          {/* Related Products */}
          <div className="space-y-6 pt-10 border-t border-slate-200">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-700">
                Առաջարկներ
              </span>
              <h2 className="text-2xl font-black text-slate-950 tracking-tight mt-0.5">
                Նմանատիպ Ապրանքներ Այս Բաժնում
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products
                .filter((p) => p.categorySlug === currentProduct.categorySlug && p.id !== currentProduct.id)
                .slice(0, 4)
                .map((relProduct) => (
                  <ProductCard key={relProduct.id} product={relProduct} />
                ))}
            </div>
          </div>
        </main>
      )}

      {/* VIEW 3 (FALLBACK): PRODUCT NOT FOUND */}
      {route.page === 'product' && !currentProduct && (
        <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-20 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto shadow-inner">
            <PackageX className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Ապրանքը չի գտնվել
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              Հնարավոր է տվյալ ապրանքն այլևս առկա չէ սրահում կամ հասցեն սխալ է մուտքագրվել:
            </p>
          </div>
          <Link
            href="/catalog"
            className="min-h-[48px] inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98"
          >
            <span>Վերադառնալ Կատալոգ</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </main>
      )}

      {/* VIEW 4: CHECKOUT PAGE */}
      {route.page === 'checkout' && (
        <main className="flex-1 w-full animate-in fade-in-50 duration-200">
          <CheckoutPage />
        </main>
      )}

      {/* CAD Blueprint Zoom Modal */}
      {activeCadProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h4 className="font-bold text-sm text-slate-900">{activeCadProduct.title}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-cyan-600 text-xs font-bold">
                    ՀԾ: {activeCadProduct.code}
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

            <div className="p-6 bg-slate-950 flex flex-col items-center justify-center min-h-[340px]">
              <img
                src={
                  activeCadProduct.blueprintImage ||
                  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80'
                }
                alt="CAD Scheme"
                className="max-h-[380px] w-auto object-contain"
              />
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
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
                className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-cyan-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Ավելացնել Զամբյուղ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Global Shell: Slide-Over Cart Drawer */}
      <CartDrawer />

      {/* 4. Global Shell: Footer */}
      <Footer />

      {/* 5. Global Shell: Mobile Nav Bar */}
      <MobileNav />
    </div>
  );
}
