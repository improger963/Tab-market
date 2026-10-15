'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/store/useCart';
import { useToast } from '@/store/useToast';
import { formatAMD } from '@/lib/utils';

interface StickyMobileBuyBarProps {
  product: Product;
  targetButtonId?: string;
}

export default function StickyMobileBuyBar({
  product,
  targetButtonId = 'main-add-to-cart-btn',
}: StickyMobileBuyBarProps) {
  const { addItem, openDrawer } = useCart();
  const { showCartToast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    const targetElement = document.getElementById(targetButtonId);
    if (!targetElement) {
      // Fallback: Show when scrolled down past 350px
      const handleScroll = () => {
        setIsVisible(window.scrollY > 350);
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Visible when main button is above viewport
        setIsVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      {
        root: null,
        threshold: 0,
        rootMargin: '0px',
      }
    );

    observer.observe(targetElement);

    return () => {
      observer.disconnect();
    };
  }, [targetButtonId]);

  const handleAdd = () => {
    addItem(product, 1);
    showCartToast(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div
      className={`lg:hidden fixed bottom-[calc(env(safe-area-inset-bottom,12px)+76px)] left-3 right-3 z-30 max-w-lg mx-auto bg-white/95 backdrop-blur-md border border-[#E2E8F0] p-3 rounded-2xl shadow-2xl transition-all duration-300 ease-out transform ${
        isVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-12 opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Mini product thumbnail, title, and formatted AMD price */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#F8FAFC] border border-slate-200 shrink-0">
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-[#0F172A] truncate leading-tight">
              {product.title}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-black text-[#0F172A] tabular-nums">
                {formatAMD(product.price)}
              </span>
              <span className="text-[10px] text-slate-400 font-mono truncate">
                ՀԾ: {product.code}
              </span>
            </div>
          </div>
        </div>

        {/* Right: High-contrast "Ավելացնել" button with shopping bag icon */}
        <button
          type="button"
          onClick={handleAdd}
          className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#2563EB] active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
        >
          {justAdded ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Ավելացվեց</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 text-blue-400" />
              <span>Ավելացնել</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
