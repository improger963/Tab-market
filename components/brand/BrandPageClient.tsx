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
  Truck,
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
        <div className="w-20 h-20 rounded-panel bg-canvas text-faint flex items-center justify-center mx-auto">
          <PackageX className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-ink tracking-tight">
            Բրենդը չի գտնվել
          </h1>
          <p className="text-xs sm:text-sm text-muted max-w-sm mx-auto leading-relaxed">
            Հնարավոր է բրենդի հասցեն սխալ է մուտքագրվել կամ այն դեռևս չի ներկայացվում
            Մելքումովի 40/1 սրահում:
          </p>
        </div>
        <Link
          href="/catalog"
          className="min-h-[48px] inline-flex items-center gap-2 px-8 py-3 rounded-panel bg-ink hover:bg-accent text-white font-bold text-xs transition-all shadow-e1 active:scale-98"
        >
          <span>Վերադառնալ Կատալոգ</span>
          <ArrowRight className="w-4 h-4 text-accent" />
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
    <div className="container-lux py-8 space-y-10">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs text-muted overflow-x-auto no-scrollbar whitespace-nowrap"
      >
        <Link href="/" className="hover:text-accent transition-colors">
          Գլխավոր
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-muted" />
        <Link href="/catalog" className="hover:text-accent transition-colors">
          Կատալոգ
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-muted" />
        <span className="text-ink font-bold">{brand.name}</span>
      </nav>

      {/* Brand Hero Header */}
      <div className="bg-ink text-white rounded-panel p-8 sm:p-12 border border-ink shadow-e2 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent border border-accent/30 text-xs font-bold">
              <Award className="w-4 h-4 text-accent" />
              <span>Պաշտոնական Արտադրող • {brand.country}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/15 text-success border border-success/30 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-success text-success" />
              <span>{brand.rating}</span>
            </span>
          </div>

          {/* Brand Logo Monogram + Name */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-panel bg-ice-chrome border-ice-chrome text-ink font-bold text-2xl tracking-wider flex items-center justify-center shrink-0">
              {brand.name.slice(0, 3)}
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase">
              {brand.name}
            </h1>
          </div>

          <p className="text-on-dark text-xs sm:text-sm leading-relaxed">
            {brand.desc}։ Բոլոր մոդելներն անցել են գործարանային հիդրավլիկ փորձարկում և
            ունեն պաշտոնական երաշխիքային սպասարկում tab.am-ում (Մելքումովի 40/1):
          </p>
        </div>

        {/* Official Warranty Badge */}
        <div className="w-full md:w-auto bg-ink/90 border border-body/80 p-5 rounded-panel flex items-center gap-4 shrink-0 shadow-e1">
          <div className="w-12 h-12 rounded-control bg-accent text-white flex items-center justify-center font-bold text-lg shrink-0">
            5տ
          </div>
          <div className="text-xs">
            <span className="font-bold text-white block">5 տարվա գործարանային երաշխիք</span>
            <span className="text-muted">Անվճար փոխարինում սրահից</span>
          </div>
        </div>
      </div>

      {/* Showroom Availability Strip */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-body bg-canvas border border-line rounded-panel px-5 py-3.5">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-accent" />
          Առկա է Մելքումովի 40/1 սրահում
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-accent" />
          {brand.badge} • Պաշտոնական ներկրում
        </span>
        <span className="inline-flex items-center gap-1.5">
          <TruckFreeBadge />
        </span>
      </div>

      {/* Product Catalog Grid for this Brand */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
            {brand.name} Տեսականի ({brandProducts.length} ապրանք)
          </h2>
        </div>

        {brandProducts.length === 0 ? (
          <div className="bg-white rounded-panel border border-line p-12 text-center space-y-4">
            <p className="text-sm text-muted">
              Այս պահին {brand.name} բրենդի առանձնացված մոդելները համալրվում են ընդհանուր
              պահեստից:
            </p>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-control bg-ink text-white text-xs font-bold hover:bg-accent transition-all"
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
    <span className="inline-flex items-center gap-1.5 text-success">
      <span className="w-4 h-4 rounded-full bg-success/10 text-success flex items-center justify-center text-xs font-bold">
        <Truck className="w-3 h-3" />
      </span>
      Անվճար առաքում Երևանում
    </span>
  );
}
