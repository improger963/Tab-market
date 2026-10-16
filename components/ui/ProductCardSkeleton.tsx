import React from 'react';

export default function ProductCardSkeleton() {
  return (
    <div className="bg-white/90 backdrop-blur-sm border border-line rounded-panel overflow-hidden flex flex-col justify-between shadow-e1">
      {/* Aspect square image placeholder */}
      <div className="aspect-square bg-line relative">
        <div className="absolute top-3 left-3 w-12 h-5 bg-line rounded-card" />
        <div className="absolute top-3 right-3 w-24 h-5 bg-line rounded-full" />
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Brand & Category line */}
          <div className="flex justify-between items-center">
            <div className="w-16 h-3 bg-line rounded" />
            <div className="w-20 h-3 bg-line rounded" />
          </div>

          {/* Title lines */}
          <div className="w-full h-4 bg-line rounded" />
          <div className="w-3/4 h-4 bg-line rounded" />

          {/* SKU Pill chip */}
          <div className="w-24 h-6 bg-line rounded-card mt-2" />

          {/* Specs tags */}
          <div className="flex gap-1.5 pt-1">
            <div className="w-16 h-5 bg-canvas rounded-control" />
            <div className="w-20 h-5 bg-canvas rounded-control" />
          </div>
        </div>

        {/* Price and Action Bar */}
        <div className="pt-3 border-t border-canvas flex items-center justify-between">
          <div className="space-y-1">
            <div className="w-20 h-5 bg-line rounded" />
            <div className="w-12 h-3 bg-line rounded" />
          </div>
          <div className="w-10 h-10 rounded-control bg-line" />
        </div>
      </div>
    </div>
  );
}
