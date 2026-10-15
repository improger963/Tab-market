/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Truck,
  Building,
  CreditCard,
  Banknote,
  FileCheck2,
  Phone,
  User,
  Mail,
  ShieldCheck,
  Check,
} from 'lucide-react';

export type DeliveryType = 'pickup' | 'yerevan' | 'regional';
export type PaymentType = 'idram' | 'telcell' | 'card' | 'cash';

export interface CheckoutFormData {
  fullName: string;
  phone: string;
  email: string;
  deliveryMethod: DeliveryType;
  addressStreet: string;
  addressApartment: string;
  addressFloor: string;
  marz: string;
  city: string;
  paymentMethod: PaymentType;
  isB2B: boolean;
  companyName: string;
  companyTIN: string;
  orderNotes: string;
}

interface CheckoutFormProps {
  data: CheckoutFormData;
  onChange: (updater: (prev: CheckoutFormData) => CheckoutFormData) => void;
  shippingCost: number;
  hasAttemptedSubmit?: boolean;
}

const ARMENIAN_MARZES = [
  'Կոտայք',
  'Արարատ',
  'Արմավիր',
  'Շիրակ',
  'Լոռի',
  'Գեղարքունիք',
  'Սյունիք',
  'Տավուշ',
  'Արագածոտն',
  'Վայոց Ձոր',
];

export default function CheckoutForm({
  data,
  onChange,
  shippingCost,
  hasAttemptedSubmit = false,
}: CheckoutFormProps) {
  const updateField = <K extends keyof CheckoutFormData>(field: K, value: CheckoutFormData[K]) => {
    onChange((prev) => ({ ...prev, [field]: value }));
  };

  // Armenian phone auto-formatter: format strictly to +374 (XX) XX-XX-XX
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    // Strip leading 374 if entered
    const digits = raw.startsWith('374') ? raw.slice(3) : raw;
    const trimmed = digits.slice(0, 8); // max 8 local digits (e.g. 95530435)

    let formatted = trimmed;
    if (trimmed.length > 2 && trimmed.length <= 5) {
      formatted = `(${trimmed.slice(0, 2)}) ${trimmed.slice(2)}`;
    } else if (trimmed.length > 5 && trimmed.length <= 7) {
      formatted = `(${trimmed.slice(0, 2)}) ${trimmed.slice(2, 5)}-${trimmed.slice(5)}`;
    } else if (trimmed.length > 7) {
      formatted = `(${trimmed.slice(0, 2)}) ${trimmed.slice(2, 5)}-${trimmed.slice(5, 7)}-${trimmed.slice(7)}`;
    } else if (trimmed.length > 2) {
      formatted = `(${trimmed.slice(0, 2)}) ${trimmed.slice(2)}`;
    }

    updateField('phone', formatted);
  };

  const isPhoneInvalid = hasAttemptedSubmit && !data.phone.trim();
  const isNameInvalid = hasAttemptedSubmit && !data.fullName.trim();
  const isStreetInvalid =
    hasAttemptedSubmit && data.deliveryMethod === 'yerevan' && !data.addressStreet.trim();

  return (
    <div className="space-y-8">
      {/* SECTION 1: Customer Personal Details */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold text-xs">
            1
          </div>
          <h2 className="text-base font-extrabold uppercase tracking-wider text-slate-900">
            Գնորդի Տվյալներ
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Անուն, Ազգանուն <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={data.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                placeholder="օր.՝ Արմեն Գասպարյան"
                className={`w-full h-12 pl-10 pr-3 rounded-xl bg-slate-50 border text-xs font-medium transition-all ${
                  isNameInvalid
                    ? 'border-rose-500 ring-2 ring-rose-500/20 animate-shake bg-rose-50/30'
                    : 'border-slate-200 focus:bg-white focus-cobalt'
                }`}
              />
              <User
                className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                  isNameInvalid ? 'text-rose-500' : 'text-slate-400'
                }`}
                aria-hidden="true"
              />
            </div>
            {isNameInvalid && (
              <p className="text-[11px] text-rose-600 font-bold mt-1">
                Խնդրում ենք լրացնել Ձեր անունը և ազգանունը:
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Հեռախոսահամար <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center gap-1.5 text-xs font-bold text-slate-500 pointer-events-none">
                <span>🇦🇲 +374</span>
                <span className="text-slate-300">|</span>
              </div>
              <input
                type="tel"
                required
                value={data.phone}
                onChange={handlePhoneChange}
                placeholder="95 53-04-35"
                className={`w-full h-12 pl-22 pr-3 rounded-xl bg-slate-50 border text-xs font-mono font-bold transition-all ${
                  isPhoneInvalid
                    ? 'border-rose-500 ring-2 ring-rose-500/20 animate-shake bg-rose-50/30'
                    : 'border-slate-200 focus:bg-white focus-cobalt'
                }`}
              />
            </div>
            {isPhoneInvalid && (
              <p className="text-[11px] text-rose-600 font-bold mt-1">
                Խնդրում ենք մուտքագրել վավեր հեռախոսահամար:
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Էլ. Փոստ <span className="text-[10px] font-normal text-slate-400">(ըստ ցանկության)</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={data.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="օր.՝ info@domain.am"
                className="w-full h-12 pl-10 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus-cobalt transition-all"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Delivery Method */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold text-xs">
            2
          </div>
          <h2 className="text-base font-extrabold uppercase tracking-wider text-slate-900">
            Ստացման / Առաքման Եղանակ
          </h2>
        </div>

        {/* Radio Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 1. Pickup */}
          <div
            onClick={() => updateField('deliveryMethod', 'pickup')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
              data.deliveryMethod === 'pickup'
                ? 'border-cyan-600 bg-cyan-50/50 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    data.deliveryMethod === 'pickup' ? 'bg-cyan-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                </div>
                <span className="text-[11px] font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  ԱՆՎՃԱՐ
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 leading-snug">
                Ինքնարտահանում Սրահից
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                ք. Երևան, Մելքումովի 40/1 (Ամեն օր՝ 10:00 - 20:00)
              </p>
            </div>
          </div>

          {/* 2. Yerevan Delivery */}
          <div
            onClick={() => updateField('deliveryMethod', 'yerevan')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
              data.deliveryMethod === 'yerevan'
                ? 'border-cyan-600 bg-cyan-50/50 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    data.deliveryMethod === 'yerevan' ? 'bg-cyan-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  <Truck className="w-4 h-4" aria-hidden="true" />
                </div>
                <span className="text-[11px] font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded-full tabular-nums">
                  {shippingCost === 0 && data.deliveryMethod === 'yerevan' ? 'ԱՆՎՃԱՐ' : '1,500 ֏'}
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 leading-snug">
                Առաքում Երևանում
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                24 ժամում մինչև Ձեր դուռը: Անվճար՝ 30,000 ֏-ից սկսած
              </p>
            </div>
          </div>

          {/* 3. Regional Delivery */}
          <div
            onClick={() => updateField('deliveryMethod', 'regional')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
              data.deliveryMethod === 'regional'
                ? 'border-cyan-600 bg-cyan-50/50 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    data.deliveryMethod === 'regional' ? 'bg-cyan-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  <Building className="w-4 h-4" aria-hidden="true" />
                </div>
                <span className="text-[11px] font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded-full tabular-nums">
                  3,000 ֏
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 leading-snug">
                Առաքում ՀՀ Մարզեր
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                ՀՀ բոլոր քաղաքներ և գյուղեր 2-3 օրում
              </p>
            </div>
          </div>
        </div>

        {/* Conditional Address Inputs for Yerevan Delivery with Smooth Accordion Fade */}
        {data.deliveryMethod === 'yerevan' && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 transition-all duration-300 ease-out animate-in fade-in slide-in-from-top-2">
            <h4 className="text-xs font-bold text-slate-900">Հասցե Երևանում</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Փողոց, Շենք <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required={data.deliveryMethod === 'yerevan'}
                  value={data.addressStreet}
                  onChange={(e) => updateField('addressStreet', e.target.value)}
                  placeholder="օր.՝ Կոմիտասի պող. 25"
                  className={`w-full h-12 px-3.5 rounded-xl bg-white border text-xs transition-all ${
                    isStreetInvalid
                      ? 'border-rose-500 ring-2 ring-rose-500/20 animate-shake bg-rose-50/30'
                      : 'border-slate-200 focus-cobalt'
                  }`}
                />
                {isStreetInvalid && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1">
                    Խնդրում ենք լրացնել առաքման հասցեն (փողոց, շենք):
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Բնակարան / Մուտք / Հարկ
                </label>
                <input
                  type="text"
                  value={data.addressApartment}
                  onChange={(e) => updateField('addressApartment', e.target.value)}
                  placeholder="բն. 14, 2-րդ մուտք, 4-րդ հարկ"
                  className="w-full h-12 px-3.5 rounded-xl bg-white border border-slate-200 text-xs focus-cobalt"
                />
              </div>
            </div>
          </div>
        )}

        {/* Conditional Address Inputs for Regional Delivery */}
        {data.deliveryMethod === 'regional' && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 transition-all duration-300 ease-out animate-in fade-in slide-in-from-top-2">
            <h4 className="text-xs font-bold text-slate-900">ՀՀ Մարզային Հասցե</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Մարզ <span className="text-rose-500">*</span>
                </label>
                <select
                  value={data.marz}
                  onChange={(e) => updateField('marz', e.target.value)}
                  className="w-full h-12 px-3.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus-cobalt cursor-pointer"
                >
                  <option value="">Ընտրեք մարզը</option>
                  {ARMENIAN_MARZES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Քաղաք / Գյուղ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required={data.deliveryMethod === 'regional'}
                  value={data.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="օր.՝ Աբովյան"
                  className="w-full h-12 px-3.5 rounded-xl bg-white border border-slate-200 text-xs focus-cobalt"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Փողոց, Շենք, Տուն <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required={data.deliveryMethod === 'regional'}
                  value={data.addressStreet}
                  onChange={(e) => updateField('addressStreet', e.target.value)}
                  placeholder="օր.՝ Հանրապետության 12"
                  className="w-full h-12 px-3.5 rounded-xl bg-white border border-slate-200 text-xs focus-cobalt"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: Payment Method */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold text-xs">
            3
          </div>
          <h2 className="text-base font-extrabold uppercase tracking-wider text-slate-900">
            Վճարման Եղանակ
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'card', title: 'Bank Card', label: 'Բանկային Քարտ', icon: CreditCard },
            { id: 'cash', title: 'Cash', label: 'Կանխիկ Սրահում / Տեղում', icon: Banknote },
            { id: 'idram', title: 'Idram', label: 'Idram / Telcell', icon: ShieldCheck },
            { id: 'telcell', title: 'B2B', label: 'B2B (ՀՎՀՀ փոխանցում)', icon: FileCheck2 },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = data.paymentMethod === item.id;
            return (
              <div
                key={item.id}
                onClick={() => updateField('paymentMethod', item.id as any)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-cyan-600 bg-cyan-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
                    isSelected ? 'bg-cyan-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 leading-snug">{item.label}</h3>
              </div>
            );
          })}
        </div>

        {/* B2B Invoicing Checkbox */}
        <div className="pt-2">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={data.isB2B}
              onChange={(e) => updateField('isB2B', e.target.checked)}
              className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 border-slate-300 cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-800">
              Ձևակերպել որպես իրավաբանական անձ (B2B հաշիվ-ապրանքագիր և ՀՎՀՀ)
            </span>
          </label>

          {data.isB2B && (
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Կազմակերպության Անվանում <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.companyName}
                  onChange={(e) => updateField('companyName', e.target.value)}
                  placeholder="օր.՝ «ԱրմենՇին» ՍՊԸ"
                  className="w-full h-12 px-3.5 rounded-xl bg-white border border-slate-200 text-xs focus-cobalt"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  ՀՎՀՀ (TIN) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.companyTIN}
                  onChange={(e) => updateField('companyTIN', e.target.value)}
                  placeholder="օր.՝ 01234567"
                  className="w-full h-12 px-3.5 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold focus-cobalt"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
