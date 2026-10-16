import React from 'react';

export default function CatalogFilterSkeleton() {
  return (
    <div className="space-y-5 text-ink">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-line">
        <div className="w-20 h-4 bg-line rounded-control" />
        <div className="w-16 h-3 bg-line rounded-control" />
      </div>

      {/* Stock toggle placeholder */}
      <div className="p-3.5 rounded-panel bg-success/10 border border-success h-16 flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="w-32 h-3 bg-success/80 rounded" />
          <div className="w-40 h-2.5 bg-success rounded" />
        </div>
        <div className="w-4 h-4 rounded bg-success" />
      </div>

      {/* Accordion 1: Categories */}
      <div className="border border-line rounded-panel overflow-hidden bg-white">
        <div className="p-3.5 bg-canvas flex items-center justify-between">
          <div className="w-24 h-3.5 bg-line rounded" />
          <div className="w-4 h-4 bg-line rounded-full" />
        </div>
        <div className="p-3 space-y-1.5 border-t border-canvas">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-full bg-canvas rounded-control" />
          ))}
        </div>
      </div>

      {/* Accordion 2: Colors */}
      <div className="border border-line rounded-panel overflow-hidden bg-white">
        <div className="p-3.5 bg-canvas flex items-center justify-between">
          <div className="w-28 h-3.5 bg-line rounded" />
          <div className="w-4 h-4 bg-line rounded-full" />
        </div>
        <div className="p-3 grid grid-cols-2 gap-2 border-t border-canvas">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-full bg-canvas rounded-control" />
          ))}
        </div>
      </div>

      {/* Accordion 3: Sizes */}
      <div className="border border-line rounded-panel overflow-hidden bg-white">
        <div className="p-3.5 bg-canvas flex items-center justify-between">
          <div className="w-28 h-3.5 bg-line rounded" />
          <div className="w-4 h-4 bg-line rounded-full" />
        </div>
        <div className="p-3 flex flex-wrap gap-2 border-t border-canvas">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-20 h-8 bg-canvas rounded-control" />
          ))}
        </div>
      </div>

      {/* Accordion 4: Price */}
      <div className="border border-line rounded-panel overflow-hidden bg-white">
        <div className="p-3.5 bg-canvas flex items-center justify-between">
          <div className="w-24 h-3.5 bg-line rounded" />
          <div className="w-4 h-4 bg-line rounded-full" />
        </div>
        <div className="p-3 space-y-2 border-t border-canvas">
          <div className="grid grid-cols-2 gap-2">
            <div className="h-10 bg-canvas rounded-control" />
            <div className="h-10 bg-canvas rounded-control" />
          </div>
          <div className="h-2 bg-line rounded w-full mt-2" />
        </div>
      </div>
    </div>
  );
}
