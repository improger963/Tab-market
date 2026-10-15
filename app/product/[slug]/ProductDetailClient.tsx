'use client';

import React, { useState } from 'react';
import { ShoppingBag, Copy, Check, Layers, FileText, MapPin, X } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/store/useCart';
import { useToast } from '@/store/useToast';
import { formatAMD } from '@/lib/utils';
import StickyMobileBuyBar from '@/components/product/StickyMobileBuyBar';

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addItem, openDrawer } = useCart();
  const { showCartToast, showCopyToast } = useToast();
  const [copiedCode, setCopiedCode] = useState(false);
  const [isCadZoomed, setIsCadZoomed] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(product.code);
    setCopiedCode(true);
    showCopyToast(product.code);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Images & CAD Scheme */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-4/3 rounded-2xl overflow-hidden bg-white border border-[#E2E8F0] shadow-xs relative">
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              <span className="px-3 py-1 rounded-md bg-[#0F172A] text-white font-mono font-bold text-xs tracking-wider shadow-md">
                ՀԾ: {product.code}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-white/95 text-slate-800 text-[11px] font-bold shadow-xs border border-slate-200">
                {product.brand}
              </span>
            </div>
          </div>

          {product.blueprintImage && (
            <div className="p-5 rounded-2xl bg-[#0F172A] text-white border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-400 text-xs font-bold">
                  <Layers className="w-4 h-4" />
                  <span>CAD Տեխնիկական Չափագրային Սխեմա (1:10)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCadZoomed(true)}
                  className="text-xs text-slate-300 hover:text-white underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  Մեծացնել
                </button>
              </div>

              <div
                onClick={() => setIsCadZoomed(true)}
                className="aspect-16/9 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center p-2 border border-slate-800 cursor-pointer group"
              >
                <img
                  src={product.blueprintImage}
                  alt="CAD Scheme"
                  className="max-h-full w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right: Info & Actions */}
        <div className="lg:col-span-5 space-y-6 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                {product.categoryName}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Առկա է սրահում ({product.stockQuantity} հատ)
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] leading-snug">
              {product.title}
            </h1>

            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center gap-2 p-2 bg-[#F8FAFC] rounded-xl border border-slate-200 text-xs font-mono">
                <span className="text-slate-500 font-bold">ՀԾ ԿՈԴ:</span>
                <span className="font-extrabold text-[#0F172A]">{product.code}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-[#0F172A] hover:bg-[#2563EB] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-blue-400" />
                    <span>Պատճենված է</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-300" />
                    <span>Պատճենել կոդը</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-baseline justify-between">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#0F172A] tabular-nums">
                {formatAMD(product.price)}
              </div>
              {product.oldPrice && (
                <div className="text-xs text-slate-400 line-through tabular-nums mt-0.5">
                  {formatAMD(product.oldPrice)}
                </div>
              )}
            </div>
            <div className="text-right text-xs text-slate-500">
              <span>Ներառյալ ԱԱՀ</span>
              <div className="text-emerald-700 font-semibold">Մելքումովի 40/1 առկա</div>
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              id="main-add-to-cart-btn"
              type="button"
              onClick={() => {
                addItem(product, 1);
                showCartToast(product, 1);
                openDrawer();
              }}
              className="min-h-[48px] w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#0F172A] hover:bg-[#2563EB] active:scale-98 text-white font-bold text-sm uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-blue-400" />
              <span>Ավելացնել Զամբյուղ</span>
            </button>

            <a
              href={`https://wa.me/37495530435?text=${encodeURIComponent(
                `Բարև Ձեզ, հետաքրքրված եմ ՀԾ: ${product.code} (${product.title}) ապրանքով: Առկա՞ է Մելքումովի 40/1 սրահում:`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 border-2 border-emerald-500 font-bold text-xs uppercase tracking-wider transition-all shadow-2xs cursor-pointer"
            >
              <span>Հարցնել մասնագետին WhatsApp-ով</span>
            </a>
          </div>

          <div className="space-y-3 pt-3 border-t border-[#E2E8F0]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              Տեխնիկական Տվյալներ
            </h3>
            <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <tbody className="divide-y divide-[#E2E8F0]">
                  {Object.entries(product.specs).map(([k, v]) => (
                    <tr key={k} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-50/50 w-2/5">
                        {k}
                      </td>
                      <td className="py-2 px-3 font-medium text-[#0F172A]">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5 text-xs text-slate-600">
            <div className="font-bold text-[#0F172A] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              Անվճար ստացում խանութ-սրահից
            </div>
            <p>ք. Երևան, Մելքումովի 40/1: Պատրաստ է տրամադրման 15 րոպեի ընթացքում:</p>
          </div>
        </div>
      </div>

      {/* CAD Full Zoom Modal */}
      {isCadZoomed && product.blueprintImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/80 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-4 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <span className="font-bold text-sm text-[#0F172A]">
                CAD Գծագիր: {product.title} (ՀԾ: {product.code})
              </span>
              <button
                type="button"
                onClick={() => setIsCadZoomed(false)}
                className="p-2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-[#0F172A] rounded-xl p-4 flex items-center justify-center">
              <img
                src={product.blueprintImage}
                alt="CAD Scheme Zoom"
                className="max-h-[500px] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Sticky Mobile Buy Bar */}
      <StickyMobileBuyBar product={product} />
    </>
  );
}
