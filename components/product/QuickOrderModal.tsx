'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Phone, Zap, ShieldCheck } from 'lucide-react';
import { Product } from '@/types';
import { formatAMD } from '@/lib/utils';
import ProductImage from '@/components/ui/ProductImage';

interface QuickOrderModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickOrderModal({
  product,
  isOpen,
  onClose,
}: QuickOrderModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setName('');
        setPhone('');
        onClose();
      }, 3000);
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#0F172A]/70 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Modal Dialog / Mobile Bottom Sheet */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#E2E8F0] overflow-hidden z-10 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 bg-[#0F172A]">
          <div className="w-12 h-1.5 rounded-full bg-slate-700" />
        </div>

        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#0F172A] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Zap className="w-4 h-4 fill-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Արագ Պատվեր 1 Քլիքով</h3>
              <p className="text-[11px] text-slate-400">Առանց երկար գրանցման և քարտ մուտքագրելու</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Փակել"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Miniature Info */}
        <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center gap-3">
          <ProductImage
            src={product.images[0]}
            alt={product.title}
            className="w-16 h-16 rounded-xl bg-white border border-slate-200 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <span className="font-mono text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
              Կոդ: {product.code}
            </span>
            <h4 className="text-xs font-bold text-[#0F172A] truncate mt-1">
              {product.title}
            </h4>
            <div className="text-xs font-black text-[#0F172A] mt-0.5 tabular-nums">
              {formatAMD(product.price)}
            </div>
          </div>
        </div>

        {/* Form Body or Success State with Safe Area Padding */}
        <div className="p-5 sm:p-6 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] sm:pb-6 overflow-y-auto">
          {isSuccess ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-[#0F172A]">
                Ձեր պատվերն ընդունված է!
              </h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                Մելքումովի 40/1 սրահի մենեջերը շուտով կկապվի Ձեզ հետ պատվերը հաստատելու համար:
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ձեր Անունը *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Օրինակ՝ Արթուր Գասպարյան"
                  className="w-full h-12 px-3.5 rounded-xl bg-white border border-[#E2E8F0] text-base md:text-xs focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Հեռախոսահամար *
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center gap-1.5 text-xs font-bold text-slate-500 pointer-events-none">
                    <span>🇦🇲 +374</span>
                    <span className="text-slate-300">|</span>
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="XX XX-XX-XX"
                    className="w-full h-12 pl-22 pr-3 rounded-xl bg-white border border-[#E2E8F0] text-base md:text-xs font-mono font-bold focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-900 leading-relaxed">
                💡 <b>Արագ սպասարկում:</b> Մեր մասնագետը կզանգահարի ձեզ 15 րոպեի ընթացքում՝ պատվերը հաստատելու և առաքման մանրամասները ճշտելու համար:
              </div>

              {/* Submit Button: Royal Blue CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[50px] py-3.5 rounded-xl bg-[#0F172A] hover:bg-[#2563EB] active:scale-98 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Գրանցվում է...</span>
                ) : (
                  <>
                    <Phone className="w-4 h-4 text-blue-400" />
                    <span>Հաստատել Պատվերը</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
