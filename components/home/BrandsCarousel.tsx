/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { brands } from '@/data/brands';
import ProductImage from '@/components/ui/ProductImage';
import { resolveImageUrl } from '@/lib/config';
import { HY } from '@/lib/copy/hy';

/**
 * Brand strip rendered entirely from the generated brand list (data/brands.ts),
 * which the importer derives from the price list's own brand column.
 *
 * Every fact on a card is real: the spelling of the brand, how many listings
 * the price list attributes to it, and a photograph taken from that brand's own
 * listings. Origin, ratings, "official distributor" status and award badges were
 * removed: the price list carries no such columns, so they were invented.
 */
export default function BrandsCarousel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const handleResize = () => checkScroll();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Optional smart auto-scroll when not hovered
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollContainerRef.current.scrollBy({ left: 280, behavior: 'smooth' });
        }
      }
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const scrollBy = (offset: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section 
      className="space-y-6 pt-4 relative group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
            {HY.BRANDS}
          </h2>
          {/* Real count of brands the price list actually attributes listings to. */}
          <p className="text-xs sm:text-sm text-muted mt-1 tabular-nums">
            {brands.length} {HY.BRANDS}
          </p>
        </div>
        
        <div className="flex items-center justify-between sm:justify-end gap-3">
          {/* Carousel Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollBy(-300)}
              disabled={!canScrollLeft}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all shadow-e1 ${
 canScrollLeft 
 ? 'bg-surface border-line-strong text-ink hover:bg-canvas hover:border-accent hover:text-accent cursor-pointer' 
 : 'bg-canvas border-line text-faint cursor-not-allowed'
 }`}
              aria-label="Previous brands"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollBy(300)}
              disabled={!canScrollRight}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all shadow-e1 ${
 canScrollRight 
 ? 'bg-surface border-line-strong text-ink hover:bg-canvas hover:border-accent hover:text-accent cursor-pointer' 
 : 'bg-canvas border-line text-faint cursor-not-allowed'
 }`}
              aria-label="Next brands"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Professional Smart Horizontal Scroll Carousel */}
      <div 
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-4 pt-2 px-1 focus:outline-none focus:ring-2 focus:ring-accent/20 rounded-panel"
        tabIndex={0}
        role="region"
        aria-label="Brands carousel"
      >
        {brands.map((brand, idx) => (
          <motion.div
            key={brand.slug}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(idx, 8) * 0.05 }}
            className="flex-shrink-0 w-[200px] sm:w-[220px] snap-start"
          >
            <Link
              href={`/brand/${brand.slug}`}
              className="group h-full bg-white p-5 rounded-panel border border-line hover:border-accent hover:shadow-e2 transition-[border-color,box-shadow] duration-sheet flex flex-col justify-between cursor-pointer relative overflow-hidden block"
            >
              {/* Listing count - the only claim a card makes besides the name */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-muted bg-canvas px-2 py-0.5 rounded-full tabular-nums">
                  {brand.count} {HY.HAT}
                </span>
              </div>

              <div className="space-y-3 my-2">
                {/* The brand's own photography, taken from one of its listings */}
                <div className="h-24 flex items-center justify-center">
                  {resolveImageUrl(brand.image) ? (
                    <ProductImage
                      src={brand.image}
                      alt={brand.name}
                      className="h-full w-auto max-w-full rounded-control bg-canvas"
                      imgClassName="object-contain p-2"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-panel bg-gradient-to-br from-ink to-ink text-white font-bold text-lg tracking-wider flex items-center justify-center transition-transform group-hover:scale-105 group-hover:bg-accent shadow-e1">
                      {brand.name.slice(0, 3)}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-base text-ink group-hover:text-accent transition-colors uppercase tracking-tight">
                    {brand.name}
                  </h3>
                </div>
              </div>

              {/* Bottom Footer Action */}
              <div className="pt-3 border-t border-line flex items-center justify-between text-xs font-bold text-accent group-hover:text-accent-hover">
                <span>{HY.VIEW_CATALOG_SHORT}</span>
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
