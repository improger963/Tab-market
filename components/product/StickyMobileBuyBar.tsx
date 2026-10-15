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
      className={`lg:hidden fixed bottom-15 sm:bottom-16 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-2xl transition-all duration-300 ease-out transform ${
        isVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
        {/* Left: Mini product thumbnail, title, and formatted AMD price */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 truncate leading-tight">
              {product.title}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-black text-cyan-700 tabular-nums">
                {formatAMD(product.price)}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                ՀԾ: {product.code}
              </span>
            </div>
          </div>
        </div>

        {/* Right: High-contrast "Ավելացնել" button with shopping bag icon */}
        <button
          type="button"
          onClick={handleAdd}
          className="min-h-[48px] px-5 py-2.5 rounded-2xl bg-slate-950 hover:bg-cyan-600 active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
        >
          {justAdded ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Ավելացվեց</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 text-cyan-400" />
              <span>Ավելացնել</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
