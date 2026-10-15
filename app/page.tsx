import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Tag, ShieldCheck } from 'lucide-react';
import HeroBanner from '@/components/home/HeroBanner';
import CategoryGrid from '@/components/home/CategoryGrid';
import ShowroomTrustSection from '@/components/home/ShowroomTrustSection';
import ProductCard from '@/components/product/ProductCard';
import { products } from '@/data/products';

export default function HomePage() {
  // Filter featured products from ArmSoft inventory
  const featuredProducts = products.filter((p) => p.isFeatured);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-16 sm:space-y-20">
      {/* 1. Architectural Hero Banner & 4 Core Pillars */}
      <HeroBanner />

      {/* 2. Visual Category Showcase */}
      <CategoryGrid />

      {/* 3. Featured Products Section */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-cyan-700 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Առաջարկվող Մոդելներ</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Պահանջված Տեսականի և Նորույթներ
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Մելքումովի 40/1 սրահի ամենաշատ պահանջարկ ունեցող սանտեխնիկան՝ պահեստում առկա:
            </p>
          </div>

          <Link
            href="/catalog"
            className="min-h-[44px] inline-flex items-center gap-2 text-xs font-bold text-cyan-700 hover:text-cyan-800 transition-colors group self-start sm:self-auto"
          >
            <span>Դիտել ամբողջ տեսականին</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Featured Products Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="pt-2 text-center">
          <Link
            href="/catalog"
            className="min-h-[48px] inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer"
          >
            <span>Դիտել Ամբողջ Տեսականին (ArmSoft ERP Կատալոգ)</span>
            <ArrowRight className="w-4 h-4 text-cyan-400" />
          </Link>
        </div>
      </section>

      {/* 4. Promotional Special Banner */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-cyan-900 via-slate-900 to-slate-950 text-white p-8 sm:p-12 border border-cyan-800/40 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold">
            <Tag className="w-3.5 h-3.5" />
            <span>Հատուկ Առաջարկ Շինարարներին և Բնակարանատերերին</span>
          </div>

          <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Մեծ Զեղչեր Լոգասենյակի Հավաքածուների Համար
          </h3>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Գնեք ծորակ + ցնցուղային համակարգ + կախովի զուգարանակոնք մեկ փաթեթով և ստացեք մինչև <b>20% հավելյալ զեղչ</b> անմիջապես Մելքումովի 40/1 սրահում:
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/catalog"
              className="min-h-[44px] inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer"
            >
              <span>Ընտրել Հավաքածու</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </Link>

            <a
              href="tel:095530435"
              className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
            >
              <span>Հարցնել մենեջերին (095 53-04-35)</span>
            </a>
          </div>
        </div>
      </section>

      {/* 5. Physical Showroom & Warehouse Feature */}
      <ShowroomTrustSection />
    </div>
  );
}
