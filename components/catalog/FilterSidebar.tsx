'use client';

import React from 'react';
import { RotateCcw, Check, Sparkles } from 'lucide-react';
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
  { id: 'chrome', label: 'Քրոմ', bgClass: 'bg-gradient-to-tr from-slate-200 via-slate-100 to-slate-300 border-slate-300' },
  { id: 'black', label: 'Մատ Սև', bgClass: 'bg-slate-900 border-slate-700 text-white' },
  { id: 'gold', label: 'Ոսկեգույն', bgClass: 'bg-gradient-to-tr from-amber-400 to-yellow-200 border-amber-300' },
  { id: 'white', label: 'Սպիտակ', bgClass: 'bg-white border-slate-300' },
  { id: 'gunmetal', label: 'Gunmetal', bgClass: 'bg-gradient-to-tr from-stone-600 to-stone-800 border-stone-600 text-white' },
];

const DIAMETERS = [
  { id: '1/2', label: '1/2 դյույմ' },
  { id: '3/4', label: '3/4 դյույմ' },
  { id: '32mm', label: '32 մմ' },
  { id: '110mm', label: '110 մմ' },
  { id: '16mm', label: '16 մմ (PEX)' },
];

const MATERIALS = [
  { id: 'brass', label: 'Լատուն (Brass CW617N)' },
  { id: 'stainless', label: 'Չժանգոտվող պողպատ (SUS304)' },
  { id: 'ceramic', label: 'Սանֆարֆոր / Կերամիկա' },
  { id: 'pex', label: 'Մետաղապլաստ (PEX-AL-PEX)' },
];

export default function FilterSidebar({
  filters,
  onChange,
  onReset,
  priceBounds,
  isMobileDrawer = false,
  onCloseMobileDrawer,
}: FilterSidebarProps) {
  const toggleArrayItem = (key: 'brands' | 'colors' | 'diameters' | 'materials', item: string) => {
    onChange((prev) => {
      const exists = prev[key].includes(item);
      const nextList = exists ? prev[key].filter((x) => x !== item) : [...prev[key], item];
      return { ...prev, [key]: nextList };
    });
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header action */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <span className="text-xs font-black uppercase tracking-wider text-slate-900">
          Ֆիլտրեր
        </span>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Մաքրել</span>
        </button>
      </div>

      {/* 1. Category Selector */}
      <div className="space-y-2.5">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
          Բաժիններ
        </label>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => onChange((prev) => ({ ...prev, category: null }))}
            className={`w-full min-h-[40px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer text-left ${
              filters.category === null
                ? 'bg-slate-950 text-white'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
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
                className={`w-full min-h-[40px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer text-left ${
                  isSelected
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>{cat.title}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isSelected ? 'bg-cyan-700 text-white' : 'bg-slate-200/80 text-slate-600'
                  }`}
                >
                  {cat.itemCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Showroom Stock Toggle */}
      <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
        <label className="flex items-center justify-between cursor-pointer select-none">
          <div className="pr-2">
            <span className="text-xs font-bold text-emerald-950 block">
              Մելքումովի 40/1 առկայություն
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">
              Միայն սրահում առկա ապրանքները
            </span>
          </div>
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, inStockOnly: e.target.checked }))
            }
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
          />
        </label>
      </div>

      {/* 3. Color / Finish Swatches */}
      <div className="space-y-2.5">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
          Գույն / Ծածկույթ
        </label>
        <div className="grid grid-cols-2 gap-2">
          {COLOR_SWATCHES.map((swatch) => {
            const isSelected = filters.colors.includes(swatch.id);
            return (
              <button
                key={swatch.id}
                type="button"
                onClick={() => toggleArrayItem('colors', swatch.id)}
                className={`min-h-[42px] px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-cyan-600 bg-cyan-50/70 text-cyan-950 ring-2 ring-cyan-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full border shadow-2xs shrink-0 flex items-center justify-center ${swatch.bgClass}`}
                >
                  {isSelected && <Check className="w-2.5 h-2.5 text-cyan-600" />}
                </span>
                <span className="truncate">{swatch.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Price Range Slider & Inputs */}
      <div className="space-y-3">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
          Գնային Միջակայք (AMD)
        </label>
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
              className="w-full text-xs h-10 px-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-hidden focus:ring-2 focus:ring-cyan-500 tabular-nums"
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
                onChange((prev) => ({ ...prev, maxPrice: Number(e.target.value) || priceBounds.max }))
              }
              className="w-full text-xs h-10 px-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-hidden focus:ring-2 focus:ring-cyan-500 tabular-nums"
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
          className="w-full accent-cyan-600 cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-slate-400 font-mono">
          <span>{formatAMD(priceBounds.min)}</span>
          <span>{formatAMD(priceBounds.max)}</span>
        </div>
      </div>

      {/* 5. Brands */}
      <div className="space-y-2.5">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
          Արտադրող Բրենդներ
        </label>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {AVAILABLE_BRANDS.map((brand) => {
            const isChecked = filters.brands.includes(brand);
            return (
              <label
                key={brand}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer select-none transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleArrayItem('brands', brand)}
                    className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 border-slate-300 cursor-pointer"
                  />
                  <span>{brand}</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* 6. Technical Plumbing Sizes & Diameters */}
      <div className="space-y-2.5">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
          Միացման Տրամագիծ (Չափս)
        </label>
        <div className="space-y-1.5">
          {DIAMETERS.map((d) => {
            const isChecked = filters.diameters.includes(d.id);
            return (
              <label
                key={d.id}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer select-none transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleArrayItem('diameters', d.id)}
                    className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 border-slate-300 cursor-pointer"
                  />
                  <span>{d.label}</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* 7. Materials */}
      <div className="space-y-2.5">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
          Կորպուսի Նյութ
        </label>
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
                    className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 border-slate-300 cursor-pointer"
                  />
                  <span>{m.label}</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Drawer mobile apply button */}
      {isMobileDrawer && onCloseMobileDrawer && (
        <div className="pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onCloseMobileDrawer}
            className="w-full min-h-[48px] py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold uppercase tracking-wider shadow-md"
          >
            Կիրառել Ֆիլտրերը
          </button>
        </div>
      )}
    </div>
  );
}
