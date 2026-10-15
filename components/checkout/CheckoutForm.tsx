/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import { User, Phone, Mail, MapPin, Truck, CreditCard, Banknote, ShieldCheck } from 'lucide-react';
import { formatAMD, formatArPhone } from '@/lib/utils';

export type DeliveryType = 'yerevan' | 'pickup';
export type PaymentType = 'cash' | 'card' | 'idram';

export interface CheckoutFormData {
  fullName: string;
  phone: string;
  email: string;
  deliveryMethod: DeliveryType;
  addressStreet: string;
  addressApartment: string;
  paymentMethod: PaymentType;
  orderNotes: string;
}

interface CheckoutFormProps {
  data: CheckoutFormData;
  onChange: (updater: (prev: CheckoutFormData) => CheckoutFormData) => void;
  shippingCost: number;
}

export default function CheckoutForm({ data, onChange, shippingCost }: CheckoutFormProps) {
  const updateField = <K extends keyof CheckoutFormData>(field: K, value: CheckoutFormData[K]) => {
    onChange((prev) => ({ ...prev, [field]: value }));
  };

  // Exhaustive payment options — keyed off the typed PaymentType union.
  const PAYMENT_OPTIONS: Array<{ id: PaymentType; title: string; desc: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'cash', title: 'Կանխիկ Վճարում', desc: 'Սրահում՝ կամ առաքիչին ստանալիս', icon: Banknote },
    { id: 'card', title: 'Բանկային Քարտ', desc: 'ArCa / Visa / Mastercard', icon: CreditCard },
    { id: 'idram', title: 'Idram / Rocket Line', desc: '0% ապառիկ տեղում', icon: ShieldCheck },
  ];

  // Shared keyboard activation for radio-style option cards.
  const activateOnKey = (fn: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      fn();
    }
  };

  // Armenian phone auto-formatter — canonical +374 (XX) XX-XX-XX grouping
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateField('phone', formatArPhone(e.target.value));
  };

  return (
    <div className="space-y-8">
      {/* SECTION 1: Customer Personal Details */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E2E8F0] shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-xs">
            1
          </div>
          <h2 className="text-base font-extrabold uppercase tracking-wider text-[#0F172A]">
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
                className="w-full h-12 pl-10 pr-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-base md:text-xs font-medium focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Հեռախոսահամար <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center gap-1 text-xs font-bold text-slate-500 pointer-events-none">
                <span>🇦🇲 +374</span>
                <span className="text-slate-300">|</span>
              </div>
              <input
                type="tel"
                required
                value={data.phone}
                onChange={handlePhoneChange}
                placeholder="(95) 53-04-35"
                className="w-full h-12 pl-22 pr-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-base md:text-xs font-mono font-bold focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Էլ. Փոստ <span className="text-slate-400 font-normal">(ըստ ցանկության)</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={data.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="օր.՝ armen@example.am"
                className="w-full h-12 pl-10 pr-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-base md:text-xs font-medium focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Delivery Method (Strictly 2 Options) */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E2E8F0] shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-xs">
            2
          </div>
          <h2 className="text-base font-extrabold uppercase tracking-wider text-[#0F172A]">
            Ստացման Եղանակ
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="radiogroup" aria-label="Ստացման եղանակ">
          {/* Option 1: Yerevan Delivery */}
          <div
            role="radio"
            aria-checked={data.deliveryMethod === 'yerevan'}
            tabIndex={data.deliveryMethod === 'yerevan' ? 0 : -1}
            onClick={() => updateField('deliveryMethod', 'yerevan')}
            onKeyDown={activateOnKey(() => updateField('deliveryMethod', 'yerevan'))}
            className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
              data.deliveryMethod === 'yerevan'
                ? 'border-[#2563EB] bg-blue-50/50 shadow-xs ring-2 ring-blue-500/10'
                : 'border-[#E2E8F0] hover:border-slate-300 bg-[#F8FAFC]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    data.deliveryMethod === 'yerevan' ? 'bg-[#2563EB] text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  ԱՆՎՃԱՐ (0 ֏)
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#0F172A]">Անվճար Առաքում Երևանի Տարածքում</h3>
              <p className="text-xs text-slate-500 mt-1 leading-normal">
                Առաքիչը կզանգահարի մոտենալուց 30 րոպե առաջ:
              </p>
            </div>
          </div>

          {/* Option 2: Showroom Pickup */}
          <div
            role="radio"
            aria-checked={data.deliveryMethod === 'pickup'}
            tabIndex={data.deliveryMethod === 'pickup' ? 0 : -1}
            onClick={() => updateField('deliveryMethod', 'pickup')}
            onKeyDown={activateOnKey(() => updateField('deliveryMethod', 'pickup'))}
            className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
              data.deliveryMethod === 'pickup'
                ? 'border-[#2563EB] bg-blue-50/50 shadow-xs ring-2 ring-blue-500/10'
                : 'border-[#E2E8F0] hover:border-slate-300 bg-[#F8FAFC]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    data.deliveryMethod === 'pickup' ? 'bg-[#2563EB] text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  ԱՆՎՃԱՐ (0 ֏)
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#0F172A]">Ինքնաարտահանում Սրահից</h3>
              <p className="text-xs text-slate-500 mt-1 leading-normal">
                ք. Երևան, Մելքումովի 40/1 (Ամեն օր՝ 10:00 - 20:00):
              </p>
            </div>
          </div>
        </div>

        {/* Conditional Address Inputs for Yerevan Delivery */}
        {data.deliveryMethod === 'yerevan' && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#0F172A]">Երևանի Առաքման Հասցե</h4>
              <span className="text-[11px] font-black text-emerald-700 tabular-nums">
                Առաքման արժեք՝ {formatAMD(shippingCost)}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Փողոց, Շենք <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required={data.deliveryMethod === 'yerevan'}
                  value={data.addressStreet}
                  onChange={(e) => updateField('addressStreet', e.target.value)}
                  placeholder="օր.՝ Կոմիտասի պող. 25, շենք 3"
                  className="w-full h-12 px-3.5 rounded-xl bg-white border border-[#E2E8F0] text-base md:text-xs focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Բնակարան / Մուտք / Հարկ
                </label>
                <input
                  type="text"
                  value={data.addressApartment}
                  onChange={(e) => updateField('addressApartment', e.target.value)}
                  placeholder="բն. 14, 2-րդ մուտք, 4-րդ հարկ"
                  className="w-full h-12 px-3.5 rounded-xl bg-white border border-[#E2E8F0] text-base md:text-xs focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: Payment Method Selectors */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E2E8F0] shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-xs">
            3
          </div>
          <h2 className="text-base font-extrabold uppercase tracking-wider text-[#0F172A]">
            Վճարման Եղանակ
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5" role="radiogroup" aria-label="Վճարման եղանակ">
          {PAYMENT_OPTIONS.map((item) => {
            const Icon = item.icon;
            const isSelected = data.paymentMethod === item.id;
            return (
              <div
                key={item.id}
                role="radio"
                aria-checked={isSelected}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => updateField('paymentMethod', item.id)}
                onKeyDown={activateOnKey(() => updateField('paymentMethod', item.id))}
                className={`p-4.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#2563EB] bg-blue-50/50 shadow-xs ring-2 ring-blue-500/10'
                    : 'border-[#E2E8F0] hover:border-slate-300 bg-[#F8FAFC]'
                }`}
              >
                <div>
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
                      isSelected ? 'bg-[#2563EB] text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-bold text-[#0F172A] leading-snug">{item.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Notes */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Նշումներ պատվերի վերաբերյալ <span className="text-slate-400 font-normal">(ըստ ցանկության)</span>
          </label>
          <textarea
            rows={2}
            value={data.orderNotes}
            onChange={(e) => updateField('orderNotes', e.target.value)}
            placeholder="Հարկ, դոմոֆոնի կոդ կամ առաքման հատուկ ժամ..."
            className="w-full p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-base md:text-xs focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 font-medium"
          />
        </div>
      </div>
    </div>
  );
}
