import React from 'react';

export default function CatalogFilterSkeleton() {
  return (
    <div className="space-y-5 animate-pulse text-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="w-20 h-4 bg-slate-200 rounded-md" />
        <div className="w-16 h-3 bg-slate-200 rounded-md" />
      </div>

      {/* Stock toggle placeholder */}
      <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 h-16 flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="w-32 h-3 bg-emerald-200/80 rounded" />
          <div className="w-40 h-2.5 bg-emerald-100 rounded" />
        </div>
        <div className="w-4 h-4 rounded bg-emerald-200" />
      </div>

      {/* Accordion 1: Categories */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
        <div className="p-3.5 bg-slate-50 flex items-center justify-between">
          <div className="w-24 h-3.5 bg-slate-200 rounded" />
          <div className="w-4 h-4 bg-slate-200 rounded-full" />
        </div>
        <div className="p-3 space-y-1.5 border-t border-slate-100">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-full bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Accordion 2: Colors */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
        <div className="p-3.5 bg-slate-50 flex items-center justify-between">
          <div className="w-28 h-3.5 bg-slate-200 rounded" />
          <div className="w-4 h-4 bg-slate-200 rounded-full" />
        </div>
        <div className="p-3 grid grid-cols-2 gap-2 border-t border-slate-100">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-full bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Accordion 3: Sizes */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
        <div className="p-3.5 bg-slate-50 flex items-center justify-between">
          <div className="w-28 h-3.5 bg-slate-200 rounded" />
          <div className="w-4 h-4 bg-slate-200 rounded-full" />
        </div>
        <div className="p-3 flex flex-wrap gap-2 border-t border-slate-100">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-20 h-8 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Accordion 4: Price */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
        <div className="p-3.5 bg-slate-50 flex items-center justify-between">
          <div className="w-24 h-3.5 bg-slate-200 rounded" />
          <div className="w-4 h-4 bg-slate-200 rounded-full" />
        </div>
        <div className="p-3 space-y-2 border-t border-slate-100">
          <div className="grid grid-cols-2 gap-2">
            <div className="h-10 bg-slate-100 rounded-xl" />
            <div className="h-10 bg-slate-100 rounded-xl" />
          </div>
          <div className="h-2 bg-slate-200 rounded w-full mt-2" />
        </div>
      </div>
    </div>
  );
}
