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
      // If target element is not found, show only after scrolling down 300px
      const handleScroll = () => {
        setIsVisible(window.scrollY > 350);
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // If main button is NOT intersecting and is above the viewport (boundingClientRect.top < 0)
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

  if (!isVisible) return null;

  return (
    <div className="lg:hidden fixed bottom-14 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-3 shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-6">
      <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
        {/* Left: Thumbnail & Price */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-11 h-11 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
          />
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

        {/* Right: Buy Button */}
        <button
          type="button"
          onClick={handleAdd}
          className="min-h-[44px] px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
        >
          {justAdded ? (
            <>
              <Check className="w-4 h-4 text-emerald-200" />
              <span>Ավելացվեց</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span>Ավելացնել</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
