/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Layers,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from 'lucide-react';
import { resolveImageUrl } from '@/lib/config';
import { HY } from '@/lib/copy/hy';
import ProductImage from '@/components/ui/ProductImage';

interface ProductGalleryProps {
  images: string[];
  blueprintImage?: string;
  title: string;
}

/**
 * Canonical Armenian strings for this component (byte-verbatim from git HEAD;
 * stored as escapes to stay immune to homoglyph corruption).
 */
const TEXT = {
  T_PHOTOS: '\u053c\u0578\u0582\u057d\u0561\u0576\u056f\u0561\u0580\u0576\u0565\u0580', // Lusanakanner
  T_CAD_MM: 'CAD \u0533\u056e\u0561\u0563\u056b\u0580 (\u0574\u0574)', // CAD Gtsagir (mm)
  T_CAD: 'CAD \u0533\u056e\u0561\u0563\u056b\u0580',
  T_HOVER_HINT: '\u054d\u0561\u0570\u0565\u0581\u0580\u0565\u0584 \u0574\u056f\u0576\u056b\u056f\u0568\u055d \u056d\u0578\u0577\u0578\u0580\u0561\u0581\u0576\u0565\u056c\u0578\u0582 \u0570\u0561\u0574\u0561\u0580',
  T_PREV: '\u0546\u0561\u056d\u0578\u0580\u0564 \u056c\u0578\u0582\u057d\u0561\u0576\u056f\u0561\u0580',
  T_NEXT: '\u0540\u0561\u057b\u0578\u0580\u0564 \u056c\u0578\u0582\u057d\u0561\u0576\u056f\u0561\u0580',
  T_ZOOM: '\u053d\u0578\u0577\u0578\u0580\u0561\u0581\u0576\u0565\u056c',
  T_PHOTO_N: '\u053c\u0578\u0582\u057d\u0561\u0576\u056f\u0561\u0580',
  T_SCALE: '\u0544\u0561\u057d\u0577\u057f\u0561\u0562 1:10 (\u0574\u0574)', // Masshtab 1:10 (mm) — CAD sheet fact
} as const;

/**
 * Gallery: pointer devices get hover lens-zoom, touch gets swipe + arrows +
 * tap-to-expand on the CAD blueprint. Thumbnails >= 44px. CAD toggle kept.
 * The fabricated "DIN EN" certification stamp is removed — no data field
 * backs it. Zoom hint only renders on hover-capable pointers.
 */
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

  // Keyboard + focus model for the CAD lightbox: Escape dismisses, focus moves
  // into the dialog on open and returns to the trigger on close.
  const blueprintModalRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!isBlueprintModalOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    requestAnimationFrame(() => blueprintModalRef.current?.focus({ preventScroll: true }));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsBlueprintModalOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [isBlueprintModalOpen]);

  const currentImage = resolveImageUrl(images[selectedImageIndex] || images[0]);
  const resolvedBlueprint = resolveImageUrl(blueprintImage);

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
        setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      } else {
        setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      }
    }
    setTouchStartX(null);
  };

  const toggleBase =
    'btn-tactile inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-control px-4 py-2 text-xs font-semibold transition-colors duration-hover ease-precision focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 sm:flex-none';

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Photo / CAD toggle */}
      <div className="flex w-full gap-1 rounded-card border border-line bg-canvas p-1 sm:w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('photo')}
          aria-pressed={activeTab === 'photo'}
          className={`${toggleBase} ${
 activeTab === 'photo'
 ? 'border border-line bg-surface text-ink'
 : 'border border-transparent text-body hover:text-ink'
 }`}
        >
          <Camera className="h-4 w-4 text-accent" aria-hidden="true" />
          <span>{TEXT.T_PHOTOS}</span>
        </button>

        {resolvedBlueprint && (
          <button
            type="button"
            onClick={() => setActiveTab('blueprint')}
            aria-pressed={activeTab === 'blueprint'}
            className={`${toggleBase} ${
 activeTab === 'blueprint'
 ? 'bg-ink text-white'
 : 'border border-transparent text-body hover:text-ink'
 }`}
          >
            <Layers className="h-4 w-4 text-accent" aria-hidden="true" />
            <span>{TEXT.T_CAD_MM}</span>
          </button>
        )}
      </div>

      {/* Main viewport: hover lens-zoom (pointer) + swipe (touch) */}
      <div
        className="group relative aspect-square cursor-zoom-in touch-pan-y overflow-hidden rounded-card border border-line bg-canvas"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {activeTab === 'photo' ? (
          <div className="relative flex h-full w-full select-none items-center justify-center overflow-hidden bg-canvas">
            {currentImage ? (
              <img
                src={currentImage}
                alt={title}
                className={`h-full w-full object-contain p-4 transition-transform duration-hover ease-precision sm:p-6 ${
 isZoomed ? 'scale-[1.75]' : 'group-hover:scale-[1.03]'
 }`}
                style={isZoomed ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` } : undefined}
                loading="eager"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-ice-chrome ring-ice">
                <ImageIcon className="h-16 w-16 text-faint" aria-hidden="true" />
                <span className="sr-only">{title}</span>
              </div>
            )}

            {/* Desktop zoom hint (pointer devices only) */}
            <div className="pointer-events-none absolute bottom-3 right-3 hidden rounded-control bg-ink/80 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm sm:block">
              {TEXT.T_HOVER_HINT}
            </div>

            {/* Mobile swipe arrows (44px targets) */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex((p) => (p > 0 ? p - 1 : images.length - 1));
                  }}
                  aria-label={TEXT.T_PREV}
                  className="btn-tactile absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface/90 text-ink shadow-e1 backdrop-blur-sm transition-colors duration-hover hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 sm:hidden"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex((p) => (p < images.length - 1 ? p + 1 : 0));
                  }}
                  aria-label={TEXT.T_NEXT}
                  className="btn-tactile absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface/90 text-ink shadow-e1 backdrop-blur-sm transition-colors duration-hover hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 sm:hidden"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="relative flex h-full w-full flex-col items-center justify-center bg-ink p-4 sm:p-6">
            <img
              src={resolvedBlueprint!}
              alt={`${title} - CAD Blueprint`}
              className="max-h-[85%] max-w-[85%] cursor-zoom-in object-contain"
              onClick={() => setIsBlueprintModalOpen(true)}
            />
            <button
              type="button"
              onClick={() => setIsBlueprintModalOpen(true)}
              className="btn-tactile absolute right-3 top-3 flex min-h-[44px] items-center gap-1.5 rounded-control border border-line/20 bg-surface/10 px-3.5 py-2 text-xs font-semibold text-white transition-colors duration-hover hover:bg-surface/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 sm:right-4 sm:top-4"
            >
              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{TEXT.T_ZOOM}</span>
            </button>

            {/* CAD sheet meta strip — scale is a property of the drawing file */}
            <div className="absolute inset-x-3 bottom-3 flex items-end justify-between font-mono text-xs text-on-dark-muted sm:inset-x-4 sm:bottom-4">
              <span>{TEXT.T_SCALE}</span>
            </div>
          </div>
        )}
      </div>

      {/* Dots (mobile) + thumbnail strip (>=44px targets) */}
      {activeTab === 'photo' && images.length > 1 && (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-1 sm:hidden">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImageIndex(idx)}
                aria-label={`${TEXT.T_PHOTO_N} ${idx + 1}`}
                aria-current={selectedImageIndex === idx}
                className="flex min-h-[44px] items-center px-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                <span
                  aria-hidden="true"
                  className={`h-1.5 rounded-full transition-all duration-hover ease-precision ${
 selectedImageIndex === idx ? 'w-5 bg-accent' : 'w-1.5 bg-line-strong'
 }`}
                />
              </button>
            ))}
          </div>

          <div className="no-scrollbar flex items-center gap-2.5 overflow-x-auto pb-1 sm:gap-3">
            {images.map((img, idx) => {
              const isSelected = selectedImageIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  aria-label={`${TEXT.T_PHOTO_N} ${idx + 1}`}
                  aria-current={isSelected}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-control border-2 bg-canvas transition-colors duration-hover ease-precision focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 sm:h-[72px] sm:w-[72px] ${
 isSelected ? 'border-accent' : 'border-line hover:border-line-strong'
 }`}
                >
                  <ProductImage src={img} alt="" className="h-full w-full" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Blueprint lightbox */}
      {isBlueprintModalOpen && resolvedBlueprint && (
        <div
          className="fixed inset-0 z-overlay flex animate-fade-in cursor-pointer items-center justify-center bg-ink/80 p-3 backdrop-blur-sm sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} ${TEXT.T_CAD}`}
          onClick={() => setIsBlueprintModalOpen(false)}
        >
          <div
            ref={blueprintModalRef}
            tabIndex={-1}
            className="flex max-h-[90dvh] w-full max-w-3xl cursor-default flex-col overflow-y-auto rounded-panel border border-line bg-surface shadow-e2 outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface p-4">
              <h4 className="mr-2 truncate text-sm font-semibold text-ink">
                {title} - {TEXT.T_CAD}
              </h4>
              <button
                type="button"
                onClick={() => setIsBlueprintModalOpen(false)}
                aria-label={HY.CLOSE}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-control text-muted transition-colors duration-hover hover:bg-canvas hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex min-h-[300px] items-center justify-center bg-ink p-4 sm:min-h-[400px] sm:p-6">
              <img
                src={resolvedBlueprint}
                alt="CAD Scheme Full"
                className="max-h-[500px] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
