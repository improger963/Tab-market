/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { Sparkles, Calculator, Check, ArrowRight, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { formatAMD } from '@/lib/utils';
import { useCart } from '@/store/useCart';

export default function BespokeConfiguratorWidget() {
  const [style, setStyle] = useState<'minimal' | 'classic' | 'industrial'>('minimal');
  const [finish, setFinish] = useState<'chrome' | 'gold' | 'black' | 'gunmetal'>('chrome');
  const [hasShowerSystem, setHasShowerSystem] = useState(true);
  const [hasCabinet, setHasCabinet] = useState(true);
  const [isAdded, setIsAdded] = useState(false);
  const { addItem, openDrawer } = useCart();

  // Price calculations
  const basePrice = style === 'minimal' ? 180000 : style === 'classic' ? 240000 : 210000;
  const finishMultiplier = finish === 'gold' ? 1.35 : finish === 'black' ? 1.2 : finish === 'gunmetal' ? 1.25 : 1.0;
  const showerPrice = hasShowerSystem ? 145000 : 0;
  const cabinetPrice = hasCabinet ? 190000 : 0;

  const totalPrice = Math.round((basePrice + showerPrice + cabinetPrice) * finishMultiplier);

  const handleAddPackage = () => {
    addItem({
      id: 99201,
      code: 'CFG-99201',
      title: `Անհատական Լոգարանի Փաթեթ (${style === 'minimal' ? 'Մինիմալիստական' : style === 'classic' ? 'Կլասիկ' : 'Ինդուստրիալ'} - ${finish === 'chrome' ? 'Քրոմ' : finish === 'gold' ? 'Ոսկեգույն' : finish === 'black' ? 'Սև Մատե' : 'Գանմեթալ'})`,
      slug: 'bespoke-bathroom-package',
      price: totalPrice,
      oldPrice: Math.round(totalPrice * 1.2),
      images: ['https://picsum.photos/seed/bathroompkg/600/600'],
      categorySlug: 'ceramics',
      categoryName: 'Սանկերամիկա',
      brand: 'TAB.AM BESPOKE',
      inStock: true,
      stockQuantity: 25,
      shortDesc: 'Բարձրակարգ լոգարանի ամբողջական փաթեթ Եվրոպական ստանդարտներով:',
      specs: {
        'Նյութ': 'Ծանր լատուն CW617N / SUS304',
        'Քարթրիջ': 'Sedal կերամիկական (Իսպանիա)',
        'Երաշխիք': '5 Տարի',
      },
    });
    setIsAdded(true);
    openDrawer();
    setTimeout(() => setIsAdded(false), 3000);
  };

  return (
    <section className="bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#0F172A] text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-blue-500/30 relative overflow-hidden">
      {/* Decorative background grid and glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(37,99,235,0.25),transparent_60%)] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-black tracking-wider uppercase border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            Ինտերակտիվ Լոգարանի Կոնֆիգուրատոր
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Նախագծեք Ձեր Երազանքի Լոգարանը Անմիջապես
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            Ընտրեք ոճը, հարդարումը և լրացուցիչ սարքավորումները: Ստացեք հստակ արժեք և 1 սեղմումով պատվիրեք ամբողջական համակարգը անվճար առաքմամբ:
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Config Controls */}
          <div className="lg:col-span-2 space-y-6 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/15">
            {/* Style Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                1. Ընտրեք Նախագծային Ոճը
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'minimal', label: 'Մինիմալիստական', sub: 'Grohe Essence' },
                  { id: 'classic', label: 'Կլասիկ Շքեղություն', sub: 'Hansgrohe Vernis' },
                  { id: 'industrial', label: 'Ինդուստրիալ', sub: 'Matte Gunmetal' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setStyle(item.id as any)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      style === item.id
                        ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-600/30'
                        : 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-black">{item.label}</div>
                    <div className={`text-[10px] mt-1 ${style === item.id ? 'text-blue-100' : 'text-slate-400'}`}>
                      {item.sub}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Finish / Color Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                2. Մակերեսի Հարդարում (PVD / Electroplate)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'chrome', label: 'Փայլուն Քրոմ', color: 'bg-slate-200 text-slate-900' },
                  { id: 'gold', label: 'Խոզանակած Ոսկի', color: 'bg-amber-400 text-slate-900' },
                  { id: 'black', label: 'Սև Մատե', color: 'bg-slate-900 text-white border border-slate-700' },
                  { id: 'gunmetal', label: 'Գանմեթալ', color: 'bg-zinc-600 text-white' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFinish(item.id as any)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      finish === item.id
                        ? 'ring-2 ring-white border-white font-bold bg-white/20 text-white shadow-md'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full mx-auto mb-1.5 ${item.color}`} />
                    <div className="text-xs font-semibold">{item.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Addons toggles */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                3. Հավելյալ Համակարգեր
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setHasShowerSystem(!hasShowerSystem)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    hasShowerSystem
                      ? 'bg-blue-600/30 border-blue-400 text-white'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  <span className="text-xs font-bold">Ցնցուղային Համակարգ (Thermostatic)</span>
                  <div className={`w-5 h-5 rounded flex items-center justify-center ${hasShowerSystem ? 'bg-blue-500 text-white' : 'bg-white/10'}`}>
                    {hasShowerSystem && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setHasCabinet(!hasCabinet)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    hasCabinet
                      ? 'bg-blue-600/30 border-blue-400 text-white'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  <span className="text-xs font-bold">Լոգարանի Պահարան + Հայելի</span>
                  <div className={`w-5 h-5 rounded flex items-center justify-center ${hasCabinet ? 'bg-blue-500 text-white' : 'bg-white/10'}`}>
                    {hasCabinet && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Price Summary Box */}
          <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-2xl flex flex-col justify-between space-y-6 border border-slate-200">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 mb-1">
                Հաշվարկված Փաթեթային Արժեք
              </div>
              <div className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
                {formatAMD(totalPrice)}
              </div>
              <div className="text-xs text-slate-500 mt-1 line-through">
                {formatAMD(Math.round(totalPrice * 1.2))}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Անվճար առաքում և տեղադրման խորհրդատվություն</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>5 Տարի Պաշտոնական Երաշխիք</span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Sedal կերամիկական քարտրիջներ</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddPackage}
              className={`w-full min-h-[50px] py-3.5 px-6 rounded-xl font-black text-sm tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 ${
                isAdded
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-[#0F172A] hover:bg-blue-600 text-white shadow-blue-600/20'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-5 h-5 text-white" />
                  <span>Հաջողությամբ Ավելացված է Զամբյուղ</span>
                </>
              ) : (
                <>
                  <span>Ավելացնել Ամբողջ Փաթեթը Զամբյուղ</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
