'use client';

import React, { useState } from 'react';
import { Camera, Layers, Maximize2, ShieldCheck } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  blueprintImage?: string;
  title: string;
}

export default function ProductGallery({
  images,
  blueprintImage,
  title,
}: ProductGalleryProps) {
  const [activeTab, setActiveTab] = useState<'photo' | 'blueprint'>('photo');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const currentImage = images[selectedImageIndex] || images[0];

  return (
    <div className="space-y-4">
      {/* Switcher Tab between Photos and CAD Blueprint */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('photo')}
          className={`min-h-[38px] px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'photo'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Camera className="w-3.5 h-3.5 text-cyan-600" />
          <span>Լուսանկարներ</span>
        </button>

        {blueprintImage && (
          <button
            type="button"
            onClick={() => setActiveTab('blueprint')}
            className={`min-h-[38px] px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'blueprint'
                ? 'bg-slate-950 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Տեխնիկական Գծագիր / Չափսեր (մմ)</span>
          </button>
        )}
      </div>

      {/* Main Viewport Container */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-xs group">
        {activeTab === 'photo' ? (
          <div className="w-full h-full relative overflow-hidden bg-slate-50 flex items-center justify-center">
            <img
              src={currentImage}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
              loading="eager"
            />
          </div>
        ) : (
          <div className="w-full h-full bg-slate-950 p-6 flex flex-col items-center justify-center relative">
            <img
              src={blueprintImage}
              alt={`${title} - CAD Blueprint`}
              className="max-h-[85%] max-w-[85%] object-contain"
            />
            {/* Engineering Badge */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] text-slate-400 font-mono bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800">
              <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                DIN EN Ստանդարտ
              </span>
              <span>Չափսերը նշված են մմ-ով (Scale 1:10)</span>
            </div>
          </div>
        )}
      </div>

      {/* Thumbnails Row (Visible if in photo mode and multiple images exist) */}
      {activeTab === 'photo' && images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
          {images.map((img, idx) => {
            const isSelected = selectedImageIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-slate-100 cursor-pointer ${
                  isSelected
                    ? 'border-cyan-600 ring-2 ring-cyan-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
