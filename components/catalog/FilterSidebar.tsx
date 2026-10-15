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

const AVAILABLE_BRANDS = ['GANZER', 'BRAVAT', 'LEDEME', 'VIEIR', 'VALTEC', 'BAXI', 'CERSANIT'];

const COLOR_SWATCHES = [
  { id: 'chrome', label: 'Քրոմ', bgClass: 'bg-metallic-chrome', textClass: 'text-slate-800' },
  { id: 'gold', label: 'Ոսկեգույն', bgClass: 'bg-metallic-gold', textClass: 'text-amber-950' },
  { id: 'black', label: 'Մատ Սև', bgClass: 'bg-metallic-black', textClass: 'text-white' },
  { id: 'gunmetal', label: 'Gunmetal', bgClass: 'bg-metallic-gunmetal', textClass: 'text-white' },
  { id: 'white', label: 'Սպիտակ', bgClass: 'bg-metallic-white', textClass: 'text-slate-900' },
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
    <div className="space-y-5 text-slate-800">
      {/* Global Header & Overall Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-[#0F172A]">
            Ֆիլտրեր
          </span>
          {totalActiveCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[#2563EB] text-white text-[10px] font-black tabular-nums">
              {totalActiveCount}
            </span>
          )}
        </div>
        {totalActiveCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Մաքրել բոլորը</span>
          </button>
        )}
      </div>

      {/* Showroom Stock Direct Filter Card */}
      <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 transition-colors">
        <label className="flex items-center justify-between cursor-pointer select-none">
          <div className="pr-2">
            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Մելքումովի 40/1 առկայություն
            </span>
            <span className="text-[11px] text-emerald-700 font-medium block mt-0.5">
              Միայն պահեստում առկա ապրանքները
            </span>
          </div>
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, inStockOnly: e.target.checked }))
            }
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer accent-emerald-600"
          />
        </label>
      </div>

      {/* 1. Accordion: Categories */}
      <div className="border border-[#E2E8F0] rounded-2xl overflow-hidden bg-white">
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
          className="w-full p-3.5 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#0F172A]">
              Կատեգորիաներ
            </span>
            {categoryActiveCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black">
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
                className="text-[11px] text-blue-600 hover:text-blue-800 font-bold underline"
              >
                Մաքրել
              </button>
            )}
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                openSections.categories ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>

        {openSections.categories && (
          <div className="p-3 space-y-1 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onChange((prev) => ({ ...prev, category: null }))}
              className={`w-full min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer text-left ${
                filters.category === null
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'bg-[#F8FAFC] hover:bg-slate-100 text-slate-700'
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
                  className={`w-full min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'bg-[#F8FAFC] hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="truncate pr-2">{cat.title}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold tabular-nums shrink-0 ${
                      isSelected ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-600'
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
      <div className="border border-[#E2E8F0] rounded-2xl overflow-hidden bg-white">
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
          className="w-full p-3.5 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#0F172A]">
              Գույն / Ծածկույթ
            </span>
            {colorsActiveCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black">
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
                className="text-[11px] text-blue-600 hover:text-blue-800 font-bold underline"
              >
                Մաքրել
              </button>
            )}
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                openSections.colors ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>

        {openSections.colors && (
          <div className="p-3 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {COLOR_SWATCHES.map((swatch) => {
                const isSelected = filters.colors.includes(swatch.id);
                return (
                  <button
                    key={swatch.id}
                    type="button"
                    onClick={() => toggleArrayItem('colors', swatch.id)}
                    className={`min-h-[42px] px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-[#0F172A] ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center transition-transform ${swatch.bgClass} ${
                        isSelected ? 'scale-110 ring-2 ring-blue-600' : ''
                      }`}
                    >
                      {isSelected && (
                        <Check className={`w-3 h-3 stroke-[3] ${swatch.id === 'white' ? 'text-slate-950' : 'text-white'}`} />
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
      <div className="border border-[#E2E8F0] rounded-2xl overflow-hidden bg-white">
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
          className="w-full p-3.5 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#0F172A]">
              Տրամագիծ և Չափսեր
            </span>
            {diametersActiveCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black">
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
                className="text-[11px] text-blue-600 hover:text-blue-800 font-bold underline"
              >
                Մաքրել
              </button>
            )}
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                openSections.diameters ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>

        {openSections.diameters && (
          <div className="p-3 border-t border-slate-100">
            <div className="flex flex-wrap gap-2">
              {DIAMETERS.map((d) => {
                const isChecked = filters.diameters.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleArrayItem('diameters', d.id)}
                    className={`min-h-[38px] px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xs'
                        : 'bg-[#F8FAFC] text-slate-700 border-[#E2E8F0] hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    <span>{d.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. Accordion: Brands & Materials */}
      <div className="border border-[#E2E8F0] rounded-2xl overflow-hidden bg-white">
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
          className="w-full p-3.5 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#0F172A]">
              Նյութեր և Բրենդներ
            </span>
            {brandsMaterialsActiveCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black">
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
                className="text-[11px] text-blue-600 hover:text-blue-800 font-bold underline"
              >
                Մաքրել
              </button>
            )}
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                openSections.brandsMaterials ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>

        {openSections.brandsMaterials && (
          <div className="p-3 border-t border-slate-100 space-y-4">
            {/* Brands subset */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block">
                Արտադրող Բրենդներ
              </span>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_BRANDS.map((brand) => {
                  const isChecked = filters.brands.includes(brand);
                  return (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => toggleArrayItem('brands', brand)}
                      className={`min-h-[34px] px-3 py-1 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-2xs'
                          : 'bg-[#F8FAFC] text-slate-700 border-[#E2E8F0] hover:border-slate-300 hover:bg-white'
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
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block">
                Կորպուսի Նյութ
              </span>
              <div className="space-y-1.5">
                {MATERIALS.map((m) => {
                  const isChecked = filters.materials.includes(m.id);
                  return (
                    <label
                      key={m.id}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer select-none transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleArrayItem('materials', m.id)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer accent-[#2563EB]"
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
      <div className="border border-[#E2E8F0] rounded-2xl overflow-hidden bg-white">
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
          className="w-full p-3.5 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#0F172A]">
              Գնային Միջակայք
            </span>
            {priceActiveCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black">
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
                className="text-[11px] text-blue-600 hover:text-blue-800 font-bold underline"
              >
                Մաքրել
              </button>
            )}
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                openSections.price ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>

        {openSections.price && (
          <div className="p-3 border-t border-slate-100 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block mb-1">Սկսած՝</span>
                <input
                  type="number"
                  value={filters.minPrice}
                  min={priceBounds.min}
                  max={filters.maxPrice}
                  onChange={(e) =>
                    onChange((prev) => ({ ...prev, minPrice: Number(e.target.value) || 0 }))
                  }
                  className="w-full text-xs h-10 px-2.5 rounded-xl bg-white border border-[#E2E8F0] font-bold focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 tabular-nums"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block mb-1">Մինչև՝</span>
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
                  className="w-full text-xs h-10 px-2.5 rounded-xl bg-white border border-[#E2E8F0] font-bold focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 tabular-nums"
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
              className="w-full accent-[#2563EB] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>{formatAMD(priceBounds.min)}</span>
              <span>{formatAMD(priceBounds.max)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Drawer mobile apply button */}
      {isMobileDrawer && onCloseMobileDrawer && (
        <div className="pt-4 border-t border-[#E2E8F0]">
          <button
            type="button"
            onClick={onCloseMobileDrawer}
            className="w-full min-h-[48px] py-3 rounded-xl bg-[#0F172A] hover:bg-[#1E3A8A] text-white text-xs font-bold uppercase tracking-wider shadow-md"
          >
            Կիրառել Ֆիլտրերը
          </button>
        </div>
      )}
    </div>
  );
}
