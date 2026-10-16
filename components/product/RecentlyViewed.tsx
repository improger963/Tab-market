'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { History, ArrowRight } from 'lucide-react';
import { useRecentlyViewed } from '@/store/useRecentlyViewed';
import ProductCard from './ProductCard';

interface RecentlyViewedProps {
  currentProductId?: number;
}

export default function RecentlyViewed({ currentProductId }: RecentlyViewedProps) {
  const { items } = useRecentlyViewed();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // Filter out the current product being viewed
  const displayItems = items
    .filter((p) => p.id !== currentProductId)
    .slice(0, 4);

  if (displayItems.length === 0) return null;

  return (
    <section className="space-y-6 pt-10 border-t border-line">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent">
            <History className="w-3.5 h-3.5" />
            <span>Դուք Վերջերս Դիտել Եք</span>
          </div>
          <h2 className="text-2xl font-bold text-ink tracking-tight mt-0.5">
            Վերջին Դիտված Ապրանքները
          </h2>
        </div>

        <Link
          href="/catalog"
          className="text-xs font-bold text-accent hover:text-accent-hover flex items-center gap-1 transition-colors"
        >
          <span>Կատալոգ</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
        {displayItems.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
