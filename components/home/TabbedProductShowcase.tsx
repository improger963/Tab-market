/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Flame, Sparkles, Tag, ArrowRight } from 'lucide-react';
import { products } from '@/data/products';
import ProductCard from '@/components/product/ProductCard';

export default function TabbedProductShowcase() {
  const [activeTab, setActiveTab] = useState<'hits' | 'new' | 'discount'>('hits');

  const getFilteredProducts = () => {
    if (activeTab === 'hits') {
      return products.filter((p) => p.isFeatured).slice(0, 8);
    }
    if (activeTab === 'new') {
      return products.filter((p) => p.isNew || p.id % 3 === 0).slice(0, 8);
    }
    if (activeTab === 'discount') {
      return products.filter((p) => p.oldPrice && p.oldPrice > p.price).slice(0, 8);
    }
    return products.slice(0, 8);
  };

  const currentList = getFilteredProducts();

  return (
    <section className="space-y-8">
      {/* Header & Instant Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#2563EB]">
            Առաջարկվող Ցուցասրահ
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Բեսթսելերներ և Նորույթներ
          </h2>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#F8FAFC] border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('hits')}
            className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'hits'
                ? 'bg-[#0F172A] text-white shadow-md'
                : 'text-slate-600 hover:text-[#0F172A]'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Հիթ Վաճառք</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('new')}
            className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'new'
                ? 'bg-[#0F172A] text-white shadow-md'
                : 'text-slate-600 hover:text-[#0F172A]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Նորույթներ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('discount')}
            className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'discount'
                ? 'bg-[#0F172A] text-white shadow-md'
                : 'text-slate-600 hover:text-[#0F172A]'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-rose-400" />
            <span>Մեծ Զեղչեր</span>
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
        {currentList.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="pt-2 text-center">
        <Link
          href="/catalog"
          className="min-h-[48px] inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#0F172A] hover:bg-[#1E3A8A] text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer"
        >
          <span>Դիտել Ամբողջ Տեսականին (ArmSoft ERP Կատալոգ)</span>
          <ArrowRight className="w-4 h-4 text-blue-400" />
        </Link>
      </div>
    </section>
  );
}
