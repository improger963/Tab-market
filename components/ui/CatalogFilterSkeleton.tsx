import React from 'react';

export default function CatalogFilterSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="w-20 h-4 bg-slate-300 rounded" />
        <div className="w-14 h-3 bg-slate-200 rounded" />
      </div>

      {/* Categories block */}
      <div className="space-y-2">
        <div className="w-24 h-3 bg-slate-300 rounded" />
        <div className="space-y-1.5 pt-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-9 w-full bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Stock toggle */}
      <div className="p-3 rounded-2xl bg-slate-100 h-14" />

      {/* Colors Swatches */}
      <div className="space-y-2">
        <div className="w-28 h-3 bg-slate-300 rounded" />
        <div className="flex gap-2 pt-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-8 h-8 rounded-full bg-slate-200" />
          ))}
        </div>
      </div>

      {/* Diameters */}
      <div className="space-y-2">
        <div className="w-32 h-3 bg-slate-300 rounded" />
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-20 h-7 bg-slate-100 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Price slider */}
      <div className="space-y-2">
        <div className="w-24 h-3 bg-slate-300 rounded" />
        <div className="h-4 bg-slate-200 rounded w-full mt-2" />
      </div>
    </div>
  );
}
