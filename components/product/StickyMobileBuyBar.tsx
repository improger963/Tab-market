'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/store/useCart';
import { useToast } from '@/store/useToast';
import { formatAMD } from '@/lib/utils';
import ProductImage from '@/components/ui/ProductImage';

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
      className={`lg:hidden fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-buybar max-w-lg mx-auto bg-surface/95 backdrop-blur-sm border border-line p-3 rounded-panel shadow-e2 transition-all duration-300 ease-out transform ${
 isVisible
 ? 'translate-y-0 opacity-100 pointer-events-auto'
 : 'translate-y-12 opacity-0 pointer-events-none'
 }`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Mini product thumbnail, title, and formatted AMD price */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-card border border-line bg-canvas">
            <ProductImage
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full"
            />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-ink truncate leading-tight">
              {product.title}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-bold text-ink tabular-nums">
                {formatAMD(product.price)}
              </span>
              <span className="text-xs text-muted font-mono truncate">
                Կոդ: {product.code}
              </span>
            </div>
          </div>
        </div>

        {/* Right: High-contrast "Ավելացնել" button with shopping bag icon */}
        <button
          type="button"
          onClick={handleAdd}
          className="btn-tactile min-h-[44px] px-4 py-2.5 rounded-control bg-ink hover:bg-accent text-white font-semibold text-sm transition-colors duration-hover shadow-e1 flex items-center gap-2 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          {justAdded ? (
            <>
              <Check className="w-4 h-4 text-success" />
              <span>Ավելացվեց</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 text-white" />
              <span>Ավելացնել</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
