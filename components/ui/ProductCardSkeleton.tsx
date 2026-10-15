import React from 'react';

export default function ProductCardSkeleton() {
  return (
    <div className="bg-white/90 backdrop-blur-xs border border-slate-200/90 rounded-2xl overflow-hidden flex flex-col justify-between animate-pulse shadow-xs">
      {/* Aspect square image placeholder */}
      <div className="aspect-square bg-slate-200/80 relative">
        <div className="absolute top-3 left-3 w-12 h-5 bg-slate-300/80 rounded-lg" />
        <div className="absolute top-3 right-3 w-24 h-5 bg-slate-300/80 rounded-full" />
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Brand & Category line */}
          <div className="flex justify-between items-center">
            <div className="w-16 h-3 bg-slate-200 rounded" />
            <div className="w-20 h-3 bg-slate-200 rounded" />
          </div>

          {/* Title lines */}
          <div className="w-full h-4 bg-slate-300/90 rounded" />
          <div className="w-3/4 h-4 bg-slate-200 rounded" />

          {/* SKU Pill chip */}
          <div className="w-24 h-6 bg-slate-200 rounded-lg mt-2" />

          {/* Specs tags */}
          <div className="flex gap-1.5 pt-1">
            <div className="w-16 h-5 bg-slate-100 rounded-md" />
            <div className="w-20 h-5 bg-slate-100 rounded-md" />
          </div>
        </div>

        {/* Price and Action Bar */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <div className="w-20 h-5 bg-slate-300 rounded" />
            <div className="w-12 h-3 bg-slate-200 rounded" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
