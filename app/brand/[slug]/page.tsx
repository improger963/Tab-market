/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, ShieldCheck, Award, MapPin, ArrowRight } from 'lucide-react';
import { products } from '@/data/products';
import { BRANDS } from '@/components/home/BrandsCarousel';
import ProductCard from '@/components/product/ProductCard';

interface BrandPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = BRANDS.find((b) => b.slug === slug);

  if (!brand) {
    return { title: 'Բրենդը չի գտնվել | tab.am' };
  }

  return {
    title: `${brand.name} Պաշտոնական Տեսականի | tab.am Երևան`,
    description: `Գնե՛ք ${brand.name} (${brand.country}) բրենդի պրեմիում սանտեխնիկան և ծորակները անմիջապես Մելքումովի 40/1 սրահից: 5 տարվա երաշխիք:`,
  };
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params;
  const brand = BRANDS.find((b) => b.slug === slug);

  if (!brand) {
    notFound();
  }

  // Filter products matching this brand name (case insensitive)
  const brandProducts = products.filter(
    (p) => p.brand.toLowerCase() === brand.name.toLowerCase() || p.brand.toLowerCase().includes(brand.slug)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto no-scrollbar whitespace-nowrap">
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
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold">
            <Award className="w-4 h-4 text-blue-400" />
            <span>Պաշտոնական Արտադրող • {brand.country}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
            {brand.name}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            {brand.desc}։ Բոլոր մոդելներն անցել են գործարանային հիդրավլիկ փորձարկում և ունեն պաշտոնական երաշխիքային սպասարկում tab.am-ում (Մելքումովի 40/1):
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-700/80 p-5 rounded-2xl flex items-center gap-4 shrink-0 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg">
            5տ
          </div>
          <div className="text-xs">
            <span className="font-bold text-white block">Գործարանային Երաշխիք</span>
            <span className="text-slate-400">Անվճար փոխարինում սրահից</span>
          </div>
        </div>
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
              Այս պահին {brand.name} բրենդի առանձնացված մոդելները համալրվում են ընդհանուր պահեստից:
            </p>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F172A] text-white text-xs font-bold uppercase tracking-wider"
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
