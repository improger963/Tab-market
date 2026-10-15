'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeftRight,
  ChevronRight,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Check,
  X,
} from 'lucide-react';
import { useCompare } from '@/store/useCompare';
import { useCart } from '@/store/useCart';
import { useToast } from '@/store/useToast';
import { formatAMD } from '@/lib/utils';
import ProductImage from '@/components/ui/ProductImage';
import { Product } from '@/types';

export default function ComparePage() {
  const { items, removeItem, clearCompare } = useCompare();
  const { addItem, openDrawer } = useCart();
  const { showCartToast } = useToast();
  const [highlightDifferences, setHighlightDifferences] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Collect all unique spec keys across the compared items
  const allSpecKeys = useMemo(() => {
    const keysSet = new Set<string>();
    items.forEach((item) => {
      Object.keys(item.specs || {}).forEach((k) => keysSet.add(k));
    });
    return Array.from(keysSet);
  }, [items]);

  if (!isMounted) return null;

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    showCartToast(product, 1);
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
        <span className="text-[#0F172A] font-bold">Ապրանքների Համեմատում</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-[#2563EB] mb-1">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Տեխնիկական Համեմատական Մատրիցա</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
            Ապրանքների Համեմատում
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {items.length > 0
              ? `Համեմատվում է ${items.length} ապրանք (առավելագույնը՝ 4)`
              : 'Համեմատության ցանկը դատարկ է:'}
          </p>
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-xs font-bold text-slate-700 cursor-pointer select-none transition-colors">
              <input
                type="checkbox"
                checked={highlightDifferences}
                onChange={(e) => setHighlightDifferences(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 accent-[#2563EB]"
              />
              <span>Տարբերվող պարամետրերը</span>
            </label>

            <button
              type="button"
              onClick={clearCompare}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
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
          <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner border border-blue-100">
            <ArrowLeftRight className="w-10 h-10 stroke-[1.5]" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-[#0F172A] tracking-tight">
              Համեմատության ցանկը դատարկ է
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Կատալոգում սեղմեք համեմատության կոճակը՝ մոդելների տեխնիկական պարամետրերը կողք-կողքի համեմատելու համար:
            </p>
          </div>
          <Link
            href="/catalog"
            className="min-h-[48px] inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#0F172A] hover:bg-[#2563EB] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer"
          >
            <span>Անցնել Կատալոգ</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </Link>
        </div>
      ) : (
        /* Comparison Matrix Table */
        <div className="border border-[#E2E8F0] rounded-3xl overflow-hidden bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-[#E2E8F0]">
                  <th className="p-4 sm:p-5 w-48 min-w-[180px] font-extrabold uppercase tracking-wider text-slate-400 text-[11px] align-top">
                    Համեմատվող Մոդելներ
                  </th>
                  {items.map((product) => (
                    <th
                      key={product.id}
                      className="p-4 sm:p-5 min-w-[240px] max-w-[280px] align-top relative border-l border-[#E2E8F0]"
                    >
                      <button
                        type="button"
                        onClick={() => removeItem(product.id)}
                        title="Հեռացնել"
                        className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div className="space-y-3">
                        <div className="aspect-square w-32 h-32 rounded-2xl overflow-hidden bg-[#F8FAFC] border border-slate-200 mx-auto">
                          <ProductImage
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full"
                          />
                        </div>

                        <div>
                          <span className="font-mono text-[10px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            Կոդ: {product.code}
                          </span>
                          <Link
                            href={`/product/${product.slug}`}
                            className="font-bold text-[#0F172A] text-xs block mt-1 hover:text-blue-600 line-clamp-2 leading-snug"
                          >
                            {product.title}
                          </Link>
                        </div>

                        <div className="text-base font-black text-[#0F172A] tabular-nums">
                          {formatAMD(product.price)}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-[#0F172A] hover:bg-[#2563EB] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
                          <span>Զամբյուղ</span>
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {/* Brand Row */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 font-bold text-slate-700 bg-slate-50/60">Արտադրող Բրենդ</td>
                  {items.map((p) => (
                    <td key={p.id} className="p-4 font-bold text-[#0F172A] border-l border-slate-100">
                      {p.brand}
                    </td>
                  ))}
                </tr>

                {/* Category Row */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 font-bold text-slate-700 bg-slate-50/60">Բաժին</td>
                  {items.map((p) => (
                    <td key={p.id} className="p-4 text-slate-700 border-l border-slate-100">
                      {p.categoryName}
                    </td>
                  ))}
                </tr>

                {/* Showroom Stock Row */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 font-bold text-slate-700 bg-slate-50/60">Մելքումովի 40/1 Առկայություն</td>
                  {items.map((p) => (
                    <td key={p.id} className="p-4 border-l border-slate-100">
                      <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Առկա է ({p.stockQuantity} հատ)
                      </span>
                    </td>
                  ))}
                </tr>

                {/* All Dynamic Technical Specifications */}
                {allSpecKeys.map((specKey) => {
                  const values = items.map((p) => p.specs[specKey] || '—');
                  const isDifferent = new Set(values).size > 1;

                  if (highlightDifferences && !isDifferent) {
                    return null;
                  }

                  return (
                    <tr
                      key={specKey}
                      className={`hover:bg-slate-50/50 ${
                        isDifferent && highlightDifferences ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <td className="p-4 font-bold text-slate-700 bg-slate-50/60 flex items-center justify-between">
                        <span>{specKey}</span>
                        {isDifferent && highlightDifferences && (
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                        )}
                      </td>
                      {items.map((p) => (
                        <td
                          key={p.id}
                          className={`p-4 border-l border-slate-100 text-slate-800 ${
                            isDifferent && highlightDifferences ? 'font-bold' : ''
                          }`}
                        >
                          {p.specs[specKey] || '—'}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
