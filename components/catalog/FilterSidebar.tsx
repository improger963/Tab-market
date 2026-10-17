'use client';

import React, { useState } from 'react';
import {
  RotateCcw,
  Check,
  ChevronDown,
  Layers,
  Palette,
  Ruler,
  Briefcase,
  DollarSign,
  X,
} from 'lucide-react';
import { categories } from '@/data/categories';
import { brands } from '@/data/brands';
import { formatAMD } from '@/lib/utils';

export interface FilterState {
  category: string | null;
  brands: string[];
  colors: string[];
  diameters: string[];
  materials: string[];
  inStockOnly: boolean;
  minPrice: number;
  maxPrice: number;
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (updater: (prev: FilterState) => FilterState) => void;
  onReset: () => void;
  priceBounds: { min: number; max: number };
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

// Brand facets come from the generated brand list, which the importer builds
// from the price list's own brand column: only brands with real listings
// appear, and listings without a brand stay unfilterable instead of turning
// into a phantom "(none)" brand.
const AVAILABLE_BRANDS = brands.map((b) => b.name);

const COLOR_SWATCHES = [
  { id: 'chrome', label: 'Քրոմ', bgClass: 'bg-finish-chrome', textClass: 'text-ink' },
  { id: 'gold', label: 'Ոսկեգույն', bgClass: 'bg-finish-gold', textClass: 'text-ink' },
  { id: 'black', label: 'Մատ Սև', bgClass: 'bg-finish-black', textClass: 'text-white' },
  { id: 'gunmetal', label: 'Gunmetal', bgClass: 'bg-finish-gunmetal', textClass: 'text-white' },
  { id: 'white', label: 'Սպիտակ', bgClass: 'bg-finish-white', textClass: 'text-ink' },
];

const DIAMETERS = [
  { id: '1/2', label: '1/2″ (դյույմ)' },
  { id: '3/4', label: '3/4″ (դյույմ)' },
  { id: '32mm', label: '32 մմ' },
  { id: '110mm', label: '110 մմ' },
  { id: '16mm', label: '16 մմ (PEX)' },
];

const MATERIALS = [
  { id: 'brass', label: 'Լատուն (Brass CW617N)' },
  { id: 'stainless', label: 'Չժանգոտվող (SUS304)' },
  { id: 'ceramic', label: 'Սանֆարֆոր / Կերամիկա' },
  { id: 'pex', label: 'Մետաղապլաստ (PEX-AL)' },
];

export default function FilterSidebar({
  filters,
  onChange,
  onReset,
  priceBounds,
  isMobileDrawer = false,
  onCloseMobileDrawer,
}: FilterSidebarProps) {
  // Collapsible section states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    categories: true,
    colors: true,
    diameters: true,
    brandsMaterials: true,
    price: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleArrayItem = (key: 'brands' | 'colors' | 'diameters' | 'materials', item: string) => {
    onChange((prev) => {
      const exists = prev[key].includes(item);
      const nextList = exists ? prev[key].filter((x) => x !== item) : [...prev[key], item];
      return { ...prev, [key]: nextList };
    });
  };

  // Active counts for badges
  const categoryActiveCount = filters.category ? 1 : 0;
  const colorsActiveCount = filters.colors.length;
  const diametersActiveCount = filters.diameters.length;
  const brandsMaterialsActiveCount = filters.brands.length + filters.materials.length;
  const isPriceFiltered = filters.minPrice > priceBounds.min || filters.maxPrice < priceBounds.max;
  const priceActiveCount = isPriceFiltered ? 1 : 0;

  const totalActiveCount =
    categoryActiveCount +
    colorsActiveCount +
    diametersActiveCount +
    brandsMaterialsActiveCount +
    priceActiveCount +
    (filters.inStockOnly ? 1 : 0);

  return (
    <div className="space-y-5 text-ink">
      {/* Global Header & Overall Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-line">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-ink">
            Ֆիլտրեր
          </span>
          {totalActiveCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-accent text-white text-xs font-bold tabular-nums">
              {totalActiveCount}
            </span>
          )}
        </div>
        {totalActiveCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-accent hover:text-accent-hover flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Մաքրել բոլորը</span>
          </button>
        )}
      </div>

      {/* Showroom Stock Direct Filter Card */}
      <div className="p-3.5 rounded-panel bg-success/10 border border-success transition-colors">
        <label className="flex items-center justify-between cursor-pointer select-none">
          <div className="pr-2">
            <span className="text-xs font-bold text-ink flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success "></span>
              Մելքումովի 40/1 առկայություն
            </span>
            <span className="text-xs text-success font-medium block mt-0.5">
              Միայն պահեստում առկա ապրանքները
            </span>
          </div>
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, inStockOnly: e.target.checked }))
            }
            className="w-4 h-4 rounded text-success focus:ring-success border-line-strong cursor-pointer accent-success"
          />
        </label>
      </div>

      {/* 1. Accordion: Categories */}
      <div className="border border-line rounded-panel overflow-hidden bg-white">
        <div
          role="button"
          tabIndex={0}
          onClick={() => toggleSection('categories')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleSection('categories');
            }
          }}
          className="w-full p-3.5 flex items-center justify-between bg-canvas hover:bg-line/60 transition-colors cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-muted" />
            <span className="text-xs font-semibold text-ink">
              Կատեգորիաներ
            </span>
            {categoryActiveCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-accent/80 text-accent-hover text-xs font-bold">
                {categoryActiveCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {categoryActiveCount > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange((prev) => ({ ...prev, category: null }));
                }}
                className="text-xs text-accent hover:text-accent-hover font-bold underline"
              >
                Մաքրել
              </button>
            )}
            <ChevronDown
              className={`w-4 h-4 text-muted transition-transform duration-200 ${
 openSections.categories ? 'rotate-180' : ''
 }`}
            />
          </div>
        </div>

        {openSections.categories && (
          <div className="p-3 space-y-1 border-t border-canvas">
            <button
              type="button"
              onClick={() => onChange((prev) => ({ ...prev, category: null }))}
              className={`w-full min-h-[36px] px-3 py-1.5 rounded-control text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer text-left ${
 filters.category === null
 ? 'bg-ink text-white shadow-e1'
 : 'bg-canvas hover:bg-line/60 text-body'
 }`}
            >
              <span>Բոլոր բաժինները</span>
            </button>

            {categories.map((cat) => {
              const isSelected = filters.category === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onChange((prev) => ({ ...prev, category: cat.slug }))}
                  className={`w-full min-h-[36px] px-3 py-1.5 rounded-control text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer text-left ${
 isSelected
 ? 'bg-accent text-white shadow-e1'
 : 'bg-canvas hover:bg-line/60 text-body'
 }`}
                >
                  <span className="truncate pr-2">{cat.title}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold tabular-nums shrink-0 ${
 isSelected ? 'bg-accent-hover text-white' : 'bg-line text-body'
 }`}
                  >
                    {cat.itemCount}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Accordion: Color & Finish Swatches */}
      <div className="border border-line rounded-panel overflow-hidden bg-white">
        <div
          role="button"
          tabIndex={0}
          onClick={() => toggleSection('colors')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleSection('colors');
            }
          }}
          className="w-full p-3.5 flex items-center justify-between bg-canvas hover:bg-line/60 transition-colors cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-muted" />
            <span className="text-xs font-semibold text-ink">
              Գույն / Ծածկույթ
            </span>
            {colorsActiveCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-accent/80 text-accent-hover text-xs font-bold">
                {colorsActiveCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {colorsActiveCount > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange((prev) => ({ ...prev, colors: [] }));
                }}
                className="text-xs text-accent hover:text-accent-hover font-bold underline"
              >
                Մաքրել
              </button>
            )}
            <ChevronDown
              className={`w-4 h-4 text-muted transition-transform duration-200 ${
 openSections.colors ? 'rotate-180' : ''
 }`}
            />
          </div>
        </div>

        {openSections.colors && (
          <div className="p-3 border-t border-canvas">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {COLOR_SWATCHES.map((swatch) => {
                const isSelected = filters.colors.includes(swatch.id);
                return (
                  <button
                    key={swatch.id}
                    type="button"
                    onClick={() => toggleArrayItem('colors', swatch.id)}
                    className={`min-h-[42px] px-3 py-2 rounded-control border text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
 isSelected
 ? 'border-accent bg-accent/5 text-ink ring-2 ring-accent/20 shadow-e1'
 : 'border-line bg-canvas hover:bg-white hover:border-line-strong text-body'
 }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center transition-transform ${swatch.bgClass} ${
 isSelected ? 'scale-110 ring-2 ring-accent' : ''
 }`}
                    >
                      {isSelected && (
                        <Check className={`w-3 h-3 stroke-[3] ${swatch.id === 'white' ? 'text-ink' : 'text-white'}`} />
                      )}
                    </span>
                    <span className="truncate">{swatch.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. Accordion: Diameters & Sizes */}
      <div className="border border-line rounded-panel overflow-hidden bg-white">
        <div
          role="button"
          tabIndex={0}
          onClick={() => toggleSection('diameters')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleSection('diameters');
            }
          }}
          className="w-full p-3.5 flex items-center justify-between bg-canvas hover:bg-line/60 transition-colors cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-muted" />
            <span className="text-xs font-semibold text-ink">
              Տրամագիծ և Չափսեր
            </span>
            {diametersActiveCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-accent/80 text-accent-hover text-xs font-bold">
                {diametersActiveCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {diametersActiveCount > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange((prev) => ({ ...prev, diameters: [] }));
                }}
                className="text-xs text-accent hover:text-accent-hover font-bold underline"
              >
                Մաքրել
              </button>
            )}
            <ChevronDown
              className={`w-4 h-4 text-muted transition-transform duration-200 ${
 openSections.diameters ? 'rotate-180' : ''
 }`}
            />
          </div>
        </div>

        {openSections.diameters && (
          <div className="p-3 border-t border-canvas">
            <div className="flex flex-wrap gap-2">
              {DIAMETERS.map((d) => {
                const isChecked = filters.diameters.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleArrayItem('diameters', d.id)}
                    className={`min-h-[38px] px-3.5 py-1.5 rounded-control border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
 isChecked
 ? 'bg-ink text-white border-ink shadow-e1'
 : 'bg-canvas text-body border-line hover:border-line-strong hover:bg-white'
 }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 text-accent" />}
                    <span>{d.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. Accordion: Brands & Materials */}
      <div className="border border-line rounded-panel overflow-hidden bg-white">
        <div
          role="button"
          tabIndex={0}
          onClick={() => toggleSection('brandsMaterials')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleSection('brandsMaterials');
            }
          }}
          className="w-full p-3.5 flex items-center justify-between bg-canvas hover:bg-line/60 transition-colors cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-muted" />
            <span className="text-xs font-semibold text-ink">
              Նյութեր և Բրենդներ
            </span>
            {brandsMaterialsActiveCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-accent/80 text-accent-hover text-xs font-bold">
                {brandsMaterialsActiveCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {brandsMaterialsActiveCount > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange((prev) => ({ ...prev, brands: [], materials: [] }));
                }}
                className="text-xs text-accent hover:text-accent-hover font-bold underline"
              >
                Մաքրել
              </button>
            )}
            <ChevronDown
              className={`w-4 h-4 text-muted transition-transform duration-200 ${
 openSections.brandsMaterials ? 'rotate-180' : ''
 }`}
            />
          </div>
        </div>

        {openSections.brandsMaterials && (
          <div className="p-3 border-t border-canvas space-y-4">
            {/* Brands subset */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted block">
                Արտադրող Բրենդներ
              </span>
              {/* The sheet lists 60+ brands; keep the facet scrollable so the
                  sidebar stays usable at every viewport height. */}
              <div className="flex flex-wrap gap-1.5 max-h-60 overflow-y-auto overscroll-contain pr-1">
                {AVAILABLE_BRANDS.map((brand) => {
                  const isChecked = filters.brands.includes(brand);
                  return (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => toggleArrayItem('brands', brand)}
                      className={`min-h-[34px] px-3 py-1 rounded-control border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
 isChecked
 ? 'bg-accent text-white border-accent shadow-e1'
 : 'bg-canvas text-body border-line hover:border-line-strong hover:bg-white'
 }`}
                    >
                      {isChecked && <Check className="w-3 h-3 text-white" />}
                      <span>{brand}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Materials subset */}
            <div className="space-y-2 pt-2 border-t border-canvas">
              <span className="text-xs font-semibold text-muted block">
                Կորպուսի Նյութ
              </span>
              <div className="space-y-1.5">
                {MATERIALS.map((m) => {
                  const isChecked = filters.materials.includes(m.id);
                  return (
                    <label
                      key={m.id}
                      className="flex items-center justify-between p-2 rounded-control hover:bg-canvas text-xs font-semibold text-body cursor-pointer select-none transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleArrayItem('materials', m.id)}
                          className="w-4 h-4 rounded text-accent focus:ring-accent border-line-strong cursor-pointer accent-accent"
                        />
                        <span>{m.label}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Accordion: Price Range */}
      <div className="border border-line rounded-panel overflow-hidden bg-white">
        <div
          role="button"
          tabIndex={0}
          onClick={() => toggleSection('price')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleSection('price');
            }
          }}
          className="w-full p-3.5 flex items-center justify-between bg-canvas hover:bg-line/60 transition-colors cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted" />
            <span className="text-xs font-semibold text-ink">
              Գնային Միջակայք
            </span>
            {priceActiveCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-accent/80 text-accent-hover text-xs font-bold">
                1
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {priceActiveCount > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange((prev) => ({
                    ...prev,
                    minPrice: priceBounds.min,
                    maxPrice: priceBounds.max,
                  }));
                }}
                className="text-xs text-accent hover:text-accent-hover font-bold underline"
              >
                Մաքրել
              </button>
            )}
            <ChevronDown
              className={`w-4 h-4 text-muted transition-transform duration-200 ${
 openSections.price ? 'rotate-180' : ''
 }`}
            />
          </div>
        </div>

        {openSections.price && (
          <div className="p-3 border-t border-canvas space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-xs text-muted font-semibold block mb-1">Սկսած՝</span>
                <input
                  type="number"
                  value={filters.minPrice}
                  min={priceBounds.min}
                  max={filters.maxPrice}
                  onChange={(e) =>
                    onChange((prev) => ({ ...prev, minPrice: Number(e.target.value) || 0 }))
                  }
                  className="w-full text-xs h-10 px-2.5 rounded-control bg-white border border-line font-bold focus:border-accent focus:ring-2 focus:ring-accent/20 tabular-nums"
                />
              </div>
              <div>
                <span className="text-xs text-muted font-semibold block mb-1">Մինչև՝</span>
                <input
                  type="number"
                  value={filters.maxPrice}
                  min={filters.minPrice}
                  max={priceBounds.max}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      maxPrice: Number(e.target.value) || priceBounds.max,
                    }))
                  }
                  className="w-full text-xs h-10 px-2.5 rounded-control bg-white border border-line font-bold focus:border-accent focus:ring-2 focus:ring-accent/20 tabular-nums"
                />
              </div>
            </div>

            <input
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              step={500}
              value={filters.maxPrice}
              onChange={(e) =>
                onChange((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))
              }
              className="w-full accent-accent cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted font-mono">
              <span>{formatAMD(priceBounds.min)}</span>
              <span>{formatAMD(priceBounds.max)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Drawer mobile apply button */}
      {isMobileDrawer && onCloseMobileDrawer && (
        <div className="pt-4 border-t border-line">
          <button
            type="button"
            onClick={onCloseMobileDrawer}
            className="w-full min-h-[48px] py-3 rounded-control bg-ink hover:bg-accent-hover text-white text-xs font-bold shadow-e1"
          >
            Կիրառել Ֆիլտրերը
          </button>
        </div>
      )}
    </div>
  );
}
