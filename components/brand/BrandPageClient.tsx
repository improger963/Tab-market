/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Award,
  ArrowRight,
  ShieldCheck,
  PackageX,
  MapPin,
  Star,
} from 'lucide-react';
import { products } from '@/data/products';
import { BRANDS } from '@/components/home/BrandsCarousel';
import ProductCard from '@/components/product/ProductCard';

interface BrandPageClientProps {
  slug: string;
}

/**
 * Dedicated Brand Landing Page view.
 * Renders an authoritative brand header (origin, official warranty badge,
 * quality statement) followed by the filtered product grid for that brand.
 * Shared by the App Router route and the SPA router so there is a single
 * source of truth for the brand ecosystem.
 */
export default function BrandPageClient({ slug }: BrandPageClientProps) {
  const brand = BRANDS.find((b) => b.slug === slug);

  if (!brand) {
    return (
      <div className="max-w-2xl w-full mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto shadow-inner">
          <PackageX className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
            Բրենդը չի գտնվել
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            Հնարավոր է բրենդի հասցեն սխալ է մուտքագրվել կամ այն դեռևս չի ներկայացվում
            Մելքումովի 40/1 սրահում:
          </p>
        </div>
        <Link
          href="/catalog"
          className="min-h-[48px] inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#0F172A] hover:bg-[#2563EB] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98"
        >
          <span>Վերադառնալ Կատալոգ</span>
          <ArrowRight className="w-4 h-4 text-blue-400" />
        </Link>
      </div>
    );
  }

  // Filter products belonging to this brand (case-insensitive by name or slug)
  const brandProducts = products.filter(
    (p) =>
      p.brand.toLowerCase() === brand.name.toLowerCase() ||
      p.brand.toLowerCase().includes(brand.slug),
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto no-scrollbar whitespace-nowrap"
      >
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Գլխավոր
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/catalog" className="hover:text-blue-600 transition-colors">
          Կատալոգ
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[#0F172A] font-bold">{brand.name}</span>
      </nav>

      {/* Brand Hero Header */}
      <div className="bg-[#0F172A] text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold">
              <Award className="w-4 h-4 text-blue-400" />
              <span>Պաշտոնական Արտադրող • {brand.country}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
              <span>{brand.rating}</span>
            </span>
          </div>

          {/* Brand Logo Monogram + Name */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-ice-chrome border-ice-chrome text-[#0F172A] font-black text-2xl tracking-wider flex items-center justify-center shrink-0">
              {brand.name.slice(0, 3)}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
              {brand.name}
            </h1>
          </div>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            {brand.desc}։ Բոլոր մոդելներն անցել են գործարանային հիդրավլիկ փորձարկում և
            ունեն պաշտոնական երաշխիքային սպասարկում tab.am-ում (Մելքումովի 40/1):
          </p>
        </div>

        {/* Official Warranty Badge */}
        <div className="w-full md:w-auto bg-slate-900/90 border border-slate-700/80 p-5 rounded-2xl flex items-center gap-4 shrink-0 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shrink-0">
            5տ
          </div>
          <div className="text-xs">
            <span className="font-bold text-white block">5 տարվա գործարանային երաշխիք</span>
            <span className="text-slate-400">Անվճար փոխարինում սրահից</span>
          </div>
        </div>
      </div>

      {/* Showroom Availability Strip */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-600 bg-[#F8FAFC] border border-slate-200 rounded-2xl px-5 py-3.5">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-blue-600" />
          Առկա է Մելքումովի 40/1 սրահում
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          {brand.badge} • Պաշտոնական ներկրում
        </span>
        <span className="inline-flex items-center gap-1.5">
          <TruckFreeBadge />
        </span>
      </div>

      {/* Product Catalog Grid for this Brand */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
            {brand.name} Տեսականի ({brandProducts.length} ապրանք)
          </h2>
        </div>

        {brandProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-12 text-center space-y-4">
            <p className="text-sm text-slate-500">
              Այս պահին {brand.name} բրենդի առանձնացված մոդելները համալրվում են ընդհանուր
              պահեստից:
            </p>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F172A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2563EB] transition-all"
            >
              <span>Դիտել Ամբողջ Կատալոգը</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {brandProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Compact free-delivery chip used in the brand availability strip. */
function TruckFreeBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 text-emerald-700">
      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black">
        🚚
      </span>
      Անվճար առաքում Երևանում
    </span>
  );
}
