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
          <div className="aspect-4/3 rounded-panel overflow-hidden bg-white border border-line shadow-e1 relative">
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              <span className="px-3 py-1 rounded-control bg-ink text-white font-mono font-bold text-xs tracking-wider shadow-e1">
                Կոդ: {product.code}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-white/95 text-ink text-xs font-bold shadow-e1 border border-line">
                {product.brand}
              </span>
            </div>
          </div>

          {product.blueprintImage && (
            <div className="p-5 rounded-panel bg-ink text-white border border-ink space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-accent text-xs font-bold">
                  <Layers className="w-4 h-4" />
                  <span>CAD Տեխնիկական Չափագրային Սխեմա (1:10)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCadZoomed(true)}
                  className="text-xs text-on-dark hover:text-white underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-accent" />
                  Մեծացնել
                </button>
              </div>

              <div
                onClick={() => setIsCadZoomed(true)}
                className="aspect-16/9 rounded-control overflow-hidden bg-ink flex items-center justify-center p-2 border border-ink cursor-pointer group"
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
        <div className="lg:col-span-5 space-y-6 bg-white p-6 rounded-panel border border-line shadow-e1">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-accent-hover bg-accent/5 px-2.5 py-1 rounded-control border border-accent/15">
                {product.categoryName}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-control border border-success">
                <span className="w-2 h-2 rounded-full bg-success "></span>
                Առկա է սրահում ({product.stockQuantity} հատ)
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-ink leading-snug">
              {product.title}
            </h1>

            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center gap-2 p-2 bg-canvas rounded-control border border-line text-xs font-mono">
                <span className="text-muted font-bold">Կոդ ԿՈԴ:</span>
                <span className="font-semibold text-ink">{product.code}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="min-h-[44px] px-3 py-2 rounded-control bg-ink hover:bg-accent text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-accent" />
                    <span>Պատճենված է</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-on-dark" />
                    <span>Պատճենել կոդը</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-control bg-canvas border border-line flex items-baseline justify-between">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-ink tabular-nums">
                {formatAMD(product.price)}
              </div>
              {product.oldPrice && (
                <div className="text-xs text-muted line-through tabular-nums mt-0.5">
                  {formatAMD(product.oldPrice)}
                </div>
              )}
            </div>
            <div className="text-right text-xs text-muted">
              <span>Ներառյալ ԱԱՀ</span>
              <div className="text-success font-semibold">Մելքումովի 40/1 առկա</div>
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
              className="min-h-[48px] w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-control bg-ink hover:bg-accent active:scale-98 text-white font-bold text-sm transition-all shadow-e1 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-accent" />
              <span>Ավելացնել Զամբյուղ</span>
            </button>

            <a
              href={`https://wa.me/37495530435?text=${encodeURIComponent(
                `Բարև Ձեզ, հետաքրքրված եմ Կոդ: ${product.code} (${product.title}) ապրանքով: Առկա՞ է Մելքումովի 40/1 սրահում:`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-control bg-white hover:bg-success/10 text-success border-2 border-success font-bold text-xs transition-all shadow-e1 cursor-pointer"
            >
              <span>Հարցնել մասնագետին WhatsApp-ով</span>
            </a>
          </div>

          <div className="space-y-3 pt-3 border-t border-line">
            <h3 className="text-xs font-bold text-ink flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-accent" />
              Տեխնիկական Տվյալներ
            </h3>
            <div className="border border-line rounded-control overflow-hidden">
              <table className="w-full text-xs text-left">
                <tbody className="divide-y divide-line">
                  {Object.entries(product.specs).map(([k, v]) => (
                    <tr key={k} className="hover:bg-canvas/60">
                      <td className="py-2 px-3 font-semibold text-body bg-line/60 w-2/5">
                        {k}
                      </td>
                      <td className="py-2 px-3 font-medium text-ink">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3.5 rounded-control bg-canvas border border-line space-y-1.5 text-xs text-body">
            <div className="font-bold text-ink flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-accent" />
              Անվճար ստացում խանութ-սրահից
            </div>
            <p>ք. Երևան, Մելքումովի 40/1: Պատրաստ է տրամադրման 15 րոպեի ընթացքում:</p>
          </div>
        </div>
      </div>

      {/* CAD Full Zoom Modal */}
      {isCadZoomed && product.blueprintImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-sm">
          <div className="bg-white rounded-panel max-w-3xl w-full p-4 space-y-4 shadow-e2 border border-line">
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <span className="font-bold text-sm text-ink">
                CAD Գծագիր: {product.title} (Կոդ: {product.code})
              </span>
              <button
                type="button"
                onClick={() => setIsCadZoomed(false)}
                className="p-2 text-muted hover:text-body cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-ink rounded-control p-4 flex items-center justify-center">
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
