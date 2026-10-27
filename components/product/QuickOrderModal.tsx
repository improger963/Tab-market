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
      className="fixed inset-0 z-overlay overflow-y-auto flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-ink/70 backdrop-blur-sm transition-opacity animate-in fade-in cursor-pointer"
      />

      {/* Modal Dialog / Mobile Bottom Sheet */}
      <div className="relative w-full max-w-lg bg-white rounded-t-panel sm:rounded-panel shadow-e2 border border-line overflow-hidden z-10 animate-in slide-in-from-bottom duration-200 max-h-[92dvh] flex flex-col">
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 bg-ink">
          <div className="w-12 h-1.5 rounded-full bg-body" />
        </div>

        {/* Header */}
        <div className="p-4 sm:p-5 bg-ink text-white flex items-center justify-between border-b border-ink">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-control bg-accent/20 text-accent flex items-center justify-center border border-accent/30">
              <Zap className="w-4 h-4 fill-accent" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Արագ Պատվեր 1 Քլիքով</h3>
              <p className="text-xs text-muted">Առանց երկար գրանցման և քարտ մուտքագրելու</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Փակել"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted hover:text-white rounded-control transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Miniature Info */}
        <div className="p-4 bg-canvas border-b border-line flex items-center gap-3">
          <ProductImage
            src={product.images[0]}
            alt={product.title}
            className="w-16 h-16 rounded-control bg-white border border-line shrink-0"
          />
          <div className="min-w-0 flex-1">
            <span className="font-mono text-xs font-bold text-body bg-white px-2 py-0.5 rounded border border-line">
              Կոդ: {product.code}
            </span>
            <h4 className="text-xs font-bold text-ink truncate mt-1">
              {product.title}
            </h4>
            <div className="text-xs font-bold text-ink mt-0.5 tabular-nums">
              {formatAMD(product.price)}
            </div>
          </div>
        </div>

        {/* Form Body or Success State with Safe Area Padding */}
        <div className="p-5 sm:p-6 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] sm:pb-6 overflow-y-auto">
          {isSuccess ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-ink">
                Ձեր պատվերն ընդունված է!
              </h4>
              <p className="text-xs text-body max-w-xs mx-auto leading-relaxed">
                Մելքումովի 40/1 սրահի մենեջերը շուտով կկապվի Ձեզ հետ պատվերը հաստատելու համար:
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-body mb-1">
                  Ձեր Անունը *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Օրինակ՝ Արթուր Գասպարյան"
                  className="w-full h-12 px-3.5 rounded-control bg-white border border-line text-base md:text-xs focus:border-accent focus:ring-2 focus:ring-accent/20 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-body mb-1">
                  Հեռախոսահամար *
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center gap-1.5 text-xs font-bold text-muted pointer-events-none">
                    <span>+374</span>
                    <span className="text-line-strong">|</span>
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="XX XX-XX-XX"
                    className="w-full h-12 pl-22 pr-3 rounded-control bg-white border border-line text-base md:text-xs font-mono font-bold focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-3 rounded-control bg-accent/5 border border-accent/15 text-xs text-ink leading-relaxed">
                <b>Արագ սպասարկում:</b> Մեր մասնագետը կզանգահարի ձեզ 15 րոպեի ընթացքում՝ պատվերը հաստատելու և առաքման մանրամասները ճշտելու համար:
              </div>

              {/* Submit Button: Royal Blue CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[50px] py-3.5 rounded-control bg-ink hover:bg-accent active:scale-98 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-e1 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Գրանցվում է...</span>
                ) : (
                  <>
                    <Phone className="w-4 h-4 text-accent" />
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
