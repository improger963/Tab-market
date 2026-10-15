'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Phone, Zap, ShieldCheck } from 'lucide-react';
import { Product } from '@/types';
import { formatAMD } from '@/lib/utils';

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
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Zap className="w-4 h-4 fill-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Արագ Պատվեր 1 Քլիքով</h3>
              <p className="text-[11px] text-slate-400">Առանց երկար գրանցման և քարտ մուտքագրելու</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Miniature Info */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-16 h-16 rounded-xl object-cover bg-white border border-slate-200 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <span className="font-mono text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
              ՀԾ: {product.code}
            </span>
            <h4 className="text-xs font-bold text-slate-900 truncate mt-1">
              {product.title}
            </h4>
            <div className="text-xs font-black text-cyan-700 mt-0.5 tabular-nums">
              {formatAMD(product.price)}
            </div>
          </div>
        </div>

        {/* Form Body or Success State */}
        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
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
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Հեռախոսահամար *
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center gap-1.5 text-xs font-bold text-slate-500 pointer-events-none">
                    <span>🇦🇲 +374</span>
                    <span className="text-slate-300">|</span>
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="XX XX-XX-XX"
                    className="w-full h-11 pl-20 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-3 rounded-xl bg-cyan-50/70 border border-cyan-200/80 text-[11px] text-cyan-900 leading-relaxed">
                💡 <b>Արագ սպասարկում:</b> Մեր մասնագետը կզանգահարի ձեզ 15 րոպեի ընթացքում՝ պատվերը հաստատելու և առաքման մանրամասները ճշտելու համար:
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[48px] py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 active:scale-98 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Գրանցվում է...</span>
                ) : (
                  <>
                    <Phone className="w-4 h-4" />
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
