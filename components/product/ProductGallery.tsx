/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { Camera, Layers, Maximize2, ShieldCheck, X } from 'lucide-react';

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
  const [isBlueprintModalOpen, setIsBlueprintModalOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const currentImage = images[selectedImageIndex] || images[0];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

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
          <Camera className="w-3.5 h-3.5 text-cyan-600" aria-hidden="true" />
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
            <Layers className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
            <span>Տեխնիկական Գծագիր / Չափսեր (մմ)</span>
          </button>
        )}
      </div>

      {/* Main Viewport Container with Interactive Lens Zoom */}
      <div
        className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-xs group cursor-zoom-in"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        {activeTab === 'photo' ? (
          <div className="w-full h-full relative overflow-hidden bg-slate-50 flex items-center justify-center">
            <img
              src={currentImage}
              alt={title}
              className={`w-full h-full object-cover transition-transform duration-200 ease-out ${
                isZoomed ? 'scale-175' : 'scale-100 group-hover:scale-105'
              }`}
              style={
                isZoomed
                  ? {
                      transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                    }
                  : undefined
              }
              loading="eager"
            />
            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg pointer-events-none border border-white/10">
              Սահեցրեք մկնիկը՝ խոշորացնելու համար
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-slate-950 p-6 flex flex-col items-center justify-center relative group/blueprint">
            <img
              src={blueprintImage}
              alt={`${title} - CAD Blueprint`}
              className="max-h-[80%] max-w-[80%] object-contain cursor-pointer"
              onClick={() => setIsBlueprintModalOpen(true)}
            />
            {/* Inspect Blueprint Lightbox Trigger Button */}
            <button
              type="button"
              onClick={() => setIsBlueprintModalOpen(true)}
              className="absolute top-4 right-4 bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
              <span>Խոշորացնել Գծագիրը</span>
            </button>

            {/* Engineering Badge */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] text-slate-400 font-mono bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800">
              <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
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

      {/* CAD Blueprint Lightbox Modal */}
      {isBlueprintModalOpen && blueprintImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8">
          <div className="relative w-full max-w-5xl h-[85vh] bg-slate-950 rounded-3xl border border-slate-800 p-6 flex flex-col items-center justify-center shadow-2xl">
            <button
              type="button"
              onClick={() => setIsBlueprintModalOpen(false)}
              className="absolute top-4 right-4 w-11 h-11 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center border border-slate-700 transition-colors cursor-pointer"
              aria-label="Փակել գծագիրը"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
            <div className="text-center mb-4">
              <h3 className="text-white text-base font-black">{title} - Տեխնիկական Գծագիր</h3>
              <p className="text-slate-400 text-xs">Միլիմետրային ճշգրիտ չափսեր տեղադրման համար</p>
            </div>
            <div className="flex-1 w-full flex items-center justify-center overflow-auto p-4">
              <img
                src={blueprintImage}
                alt={`${title} Blueprint Full`}
                className="max-h-full max-w-full object-contain rounded-xl border border-slate-800 bg-black"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
