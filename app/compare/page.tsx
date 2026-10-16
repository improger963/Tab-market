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
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted">
        <Link href="/" className="hover:text-accent transition-colors">
          Գլխավոր
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-muted" />
        <Link href="/catalog" className="hover:text-accent transition-colors">
          Կատալոգ
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-muted" />
        <span className="text-ink font-bold">Ապրանքների Համեմատում</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent mb-1">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Տեխնիկական Համեմատական Մատրիցա</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-ink tracking-tight">
            Ապրանքների Համեմատում
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            {items.length > 0
              ? `Համեմատվում է ${items.length} ապրանք (առավելագույնը՝ 4)`
              : 'Համեմատության ցանկը դատարկ է:'}
          </p>
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-3.5 py-2 rounded-control bg-canvas hover:bg-line text-xs font-bold text-body cursor-pointer select-none transition-colors">
              <input
                type="checkbox"
                checked={highlightDifferences}
                onChange={(e) => setHighlightDifferences(e.target.checked)}
                className="w-4 h-4 rounded text-accent focus:ring-accent border-line-strong accent-accent"
              />
              <span>Տարբերվող պարամետրերը</span>
            </label>

            <button
              type="button"
              onClick={clearCompare}
              className="min-h-[40px] px-3.5 py-2 rounded-control bg-canvas hover:bg-line text-body font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
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
          <div className="w-20 h-20 rounded-panel bg-accent/5 text-accent flex items-center justify-center mx-auto border border-accent/15">
            <ArrowLeftRight className="w-10 h-10 stroke-[1.5]" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-ink tracking-tight">
              Համեմատության ցանկը դատարկ է
            </h2>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Կատալոգում սեղմեք համեմատության կոճակը՝ մոդելների տեխնիկական պարամետրերը կողք-կողքի համեմատելու համար:
            </p>
          </div>
          <Link
            href="/catalog"
            className="min-h-[48px] inline-flex items-center gap-2 px-8 py-3 rounded-panel bg-ink hover:bg-accent text-white font-bold text-xs transition-all shadow-e1 active:scale-98 cursor-pointer"
          >
            <span>Անցնել Կատալոգ</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </Link>
        </div>
      ) : (
        /* Comparison Matrix Table */
        <div className="border border-line rounded-panel overflow-hidden bg-white shadow-e1">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-canvas/80 border-b border-line">
                  <th className="p-4 sm:p-5 w-48 min-w-[180px] font-semibold text-muted text-xs align-top">
                    Համեմատվող Մոդելներ
                  </th>
                  {items.map((product) => (
                    <th
                      key={product.id}
                      className="p-4 sm:p-5 min-w-[240px] max-w-[280px] align-top relative border-l border-line"
                    >
                      <button
                        type="button"
                        onClick={() => removeItem(product.id)}
                        title="Հեռացնել"
                        className="absolute top-3 right-3 w-7 h-7 rounded-card bg-canvas hover:bg-line text-muted hover:text-ink flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div className="space-y-3">
                        <div className="aspect-square w-32 h-32 rounded-panel overflow-hidden bg-canvas border border-line-strong mx-auto">
                          <ProductImage
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full"
                          />
                        </div>

                        <div>
                          <span className="font-mono text-xs font-bold text-ink bg-canvas px-2 py-0.5 rounded border border-line-strong">
                            Կոդ: {product.code}
                          </span>
                          <Link
                            href={`/product/${product.slug}`}
                            className="font-bold text-ink text-xs block mt-1 hover:text-accent line-clamp-2 leading-snug"
                          >
                            {product.title}
                          </Link>
                        </div>

                        <div className="text-base font-bold text-ink tabular-nums">
                          {formatAMD(product.price)}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          className="w-full min-h-[40px] px-3 py-2 rounded-control bg-ink hover:bg-accent text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-e1 active:scale-95"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-accent" />
                          <span>Զամբյուղ</span>
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-line">
                {/* Brand Row */}
                <tr className="hover:bg-line/60">
                  <td className="p-4 font-bold text-body bg-line/60">Արտադրող Բրենդ</td>
                  {items.map((p) => (
                    <td key={p.id} className="p-4 font-bold text-ink border-l border-canvas">
                      {p.brand}
                    </td>
                  ))}
                </tr>

                {/* Category Row */}
                <tr className="hover:bg-line/60">
                  <td className="p-4 font-bold text-body bg-line/60">Բաժին</td>
                  {items.map((p) => (
                    <td key={p.id} className="p-4 text-body border-l border-canvas">
                      {p.categoryName}
                    </td>
                  ))}
                </tr>

                {/* Showroom Stock Row */}
                <tr className="hover:bg-line/60">
                  <td className="p-4 font-bold text-body bg-line/60">Մելքումովի 40/1 Առկայություն</td>
                  {items.map((p) => (
                    <td key={p.id} className="p-4 border-l border-canvas">
                      <span className="inline-flex items-center gap-1.5 font-bold text-success">
                        <Check className="w-3.5 h-3.5 text-success" />
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
                      className={`hover:bg-line/60 ${
 isDifferent && highlightDifferences ? 'bg-warning/10' : ''
 }`}
                    >
                      <td className="p-4 font-bold text-body bg-line/60 flex items-center justify-between">
                        <span>{specKey}</span>
                        {isDifferent && highlightDifferences && (
                          <span className="w-2 h-2 rounded-full bg-warning" />
                        )}
                      </td>
                      {items.map((p) => (
                        <td
                          key={p.id}
                          className={`p-4 border-l border-canvas text-ink ${
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
