/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { Camera, Layers, Maximize2, ShieldCheck, X, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const currentImage = images[selectedImageIndex] || images[0];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40 && activeTab === 'photo' && images.length > 1) {
      if (diff > 0) {
        // Swipe left -> next
        setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      } else {
        // Swipe right -> prev
        setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      }
    }
    setTouchStartX(null);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* CAD Blueprint toggle placed directly above the image for instant thumb accessibility */}
      <div className="flex items-center gap-2 p-1 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] w-full sm:w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('photo')}
          className={`flex-1 sm:flex-none min-h-[42px] px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'photo'
              ? 'bg-white text-[#0F172A] shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-[#0F172A]'
          }`}
        >
          <Camera className="w-4 h-4 text-blue-600" aria-hidden="true" />
          <span>Լուսանկարներ</span>
        </button>

        {blueprintImage && (
          <button
            type="button"
            onClick={() => setActiveTab('blueprint')}
            className={`flex-1 sm:flex-none min-h-[42px] px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'blueprint'
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0F172A]'
            }`}
          >
            <Layers className="w-4 h-4 text-blue-400" aria-hidden="true" />
            <span>CAD Գծագիր (մմ)</span>
          </button>
        )}
      </div>

      {/* Main Viewport Container with Swipe Gestures and Desktop Lens Zoom */}
      <div
        className="relative aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-[#E2E8F0] shadow-xs group cursor-zoom-in touch-pan-y"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {activeTab === 'photo' ? (
          <div className="w-full h-full relative overflow-hidden bg-[#F8FAFC] flex items-center justify-center select-none">
            <img
              src={currentImage}
              alt={title}
              className={`w-full h-full object-cover transition-transform duration-200 ease-out ${
                isZoomed ? 'scale-175' : 'scale-100 group-hover:scale-104'
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

            {/* Desktop zoom tip */}
            <div className="hidden sm:block absolute bottom-3 right-3 bg-[#0F172A]/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg pointer-events-none border border-slate-700">
              Սահեցրեք մկնիկը՝ խոշորացնելու համար
            </div>

            {/* Mobile swipe arrows */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex((p) => (p > 0 ? p - 1 : images.length - 1));
                  }}
                  className="sm:hidden absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur text-slate-800 shadow-md flex items-center justify-center"
                  aria-label="Նախորդ լուսանկար"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex((p) => (p < images.length - 1 ? p + 1 : 0));
                  }}
                  className="sm:hidden absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur text-slate-800 shadow-md flex items-center justify-center"
                  aria-label="Հաջորդ լուսանկար"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="w-full h-full bg-[#0F172A] p-4 sm:p-6 flex flex-col items-center justify-center relative group/blueprint">
            <img
              src={blueprintImage}
              alt={`${title} - CAD Blueprint`}
              className="max-h-[85%] max-w-[85%] object-contain cursor-pointer"
              onClick={() => setIsBlueprintModalOpen(true)}
            />
            {/* Inspect Blueprint Lightbox Trigger Button */}
            <button
              type="button"
              onClick={() => setIsBlueprintModalOpen(true)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
              <span>Խոշորացնել</span>
            </button>

            {/* Engineering Badge */}
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 font-mono bg-black/60 backdrop-blur-md px-3 py-1.5 sm:py-2 rounded-xl border border-slate-800">
              <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                DIN EN
              </span>
              <span>Մասշտաբ 1:10 (մմ)</span>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Swipe Dots & Thumbnails Row */}
      {activeTab === 'photo' && images.length > 1 && (
        <div className="space-y-2">
          {/* Mobile Dot Indicators */}
          <div className="flex sm:hidden items-center justify-center gap-1.5 py-1">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImageIndex(idx)}
                aria-label={`Լուսանկար ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  selectedImageIndex === idx ? 'w-5 bg-[#2563EB]' : 'w-1.5 bg-slate-300'
                }`}
              />
            ))}
          </div>

          {/* Desktop/Tablet Thumbnail Strip */}
          <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-1 no-scrollbar">
            {images.map((img, idx) => {
              const isSelected = selectedImageIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-[#F8FAFC] cursor-pointer ${
                    isSelected
                      ? 'border-[#2563EB] ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-[#E2E8F0] hover:border-slate-300'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Blueprint Zoom Modal */}
      {isBlueprintModalOpen && blueprintImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0F172A]/80 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
            <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between sticky top-0 bg-white z-10">
              <h4 className="font-bold text-sm text-[#0F172A] truncate mr-2">{title} - CAD Գծագիր</h4>
              <button
                type="button"
                onClick={() => setIsBlueprintModalOpen(false)}
                className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 bg-[#0F172A] flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
              <img src={blueprintImage} alt="CAD Scheme Full" className="max-h-[500px] w-auto object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
