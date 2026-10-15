'use client';

import React from 'react';
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

export default function CheckoutForm({ data, onChange, shippingCost }: CheckoutFormProps) {
  const updateField = <K extends keyof CheckoutFormData>(field: K, value: CheckoutFormData[K]) => {
    onChange((prev) => ({ ...prev, [field]: value }));
  };

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
                className="w-full h-12 pl-10 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus-cobalt transition-all"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
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
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="XX XX-XX-XX"
                className="w-full h-12 pl-22 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold focus:bg-white focus-cobalt transition-all"
              />
            </div>
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
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  ԱՆՎՃԱՐ
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 leading-snug">
                Ինքնարտահանում Սրահից
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                ք. Երևան, Մելքումովի 40/1 (Ամեն օր՝ 09:00 - 19:00)
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
                  <Truck className="w-4 h-4" />
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
                  <Building className="w-4 h-4" />
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

        {/* Conditional Address Inputs for Yerevan Delivery */}
        {data.deliveryMethod === 'yerevan' && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
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
                  className="w-full h-12 px-3.5 rounded-xl bg-white border border-slate-200 text-xs focus-cobalt"
                />
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
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Idram */}
          <div
            onClick={() => updateField('paymentMethod', 'idram')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
              data.paymentMethod === 'idram'
                ? 'border-orange-500 bg-orange-50/30 ring-2 ring-orange-500/10'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-600 flex items-center justify-center font-black text-xs border border-orange-500/20">
                idram
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Idram / Rocket</h3>
                <p className="text-[11px] text-slate-500">Առցանց վճարում դրամապանակով</p>
              </div>
            </div>
            {data.paymentMethod === 'idram' && <Check className="w-4 h-4 text-orange-600" />}
          </div>

          {/* Telcell */}
          <div
            onClick={() => updateField('paymentMethod', 'telcell')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
              data.paymentMethod === 'telcell'
                ? 'border-orange-600 bg-orange-50/30 ring-2 ring-orange-600/10'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600/15 text-orange-700 flex items-center justify-center font-black text-xs border border-orange-600/20">
                Telcell
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Telcell Wallet</h3>
                <p className="text-[11px] text-slate-500">QR / Wallet վճարում</p>
              </div>
            </div>
            {data.paymentMethod === 'telcell' && <Check className="w-4 h-4 text-orange-600" />}
          </div>

          {/* Bank Card */}
          <div
            onClick={() => updateField('paymentMethod', 'card')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
              data.paymentMethod === 'card'
                ? 'border-cyan-600 bg-cyan-50/50 ring-2 ring-cyan-500/10'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Բանկային Քարտ</h3>
                <p className="text-[11px] text-slate-500">ArCa, Visa, Mastercard</p>
              </div>
            </div>
            {data.paymentMethod === 'card' && <Check className="w-4 h-4 text-cyan-600" />}
          </div>

          {/* Cash */}
          <div
            onClick={() => updateField('paymentMethod', 'cash')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
              data.paymentMethod === 'cash'
                ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/10'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Կանխիկ Վճարում</h3>
                <p className="text-[11px] text-slate-500">Սրահում կամ առաքիչին տեղում</p>
              </div>
            </div>
            {data.paymentMethod === 'cash' && <Check className="w-4 h-4 text-emerald-600" />}
          </div>
        </div>
      </div>

      {/* SECTION 4: B2B Electronic Invoice (ArmSoft) */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={data.isB2B}
            onChange={(e) => updateField('isB2B', e.target.checked)}
            className="w-5 h-5 rounded text-cyan-600 focus:ring-cyan-500 border-slate-300 cursor-pointer"
          />
          <div>
            <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-cyan-600" />
              <span>Պահանջվում է անկանխիկ հաշիվ-ապրանքագիր (B2B / ՀԾ)</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Շինարարական կազմակերպությունների և Ա/Ձ-ների համար էլեկտրոնային հաշիվ
            </p>
          </div>
        </label>

        {data.isB2B && (
          <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Կազմակերպության Անվանում կամ Ա/Ձ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required={data.isB2B}
                value={data.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
                placeholder="օր.՝ Շինէքսպերտ ՍՊԸ"
                className="w-full h-12 px-3.5 rounded-xl bg-white border border-slate-200 text-xs focus-cobalt"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                ՀՎՀՀ (8-նիշ TIN) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required={data.isB2B}
                maxLength={8}
                value={data.companyTIN}
                onChange={(e) => updateField('companyTIN', e.target.value.replace(/\D/g, ''))}
                placeholder="օր.՝ 02589412"
                className="w-full h-12 px-3.5 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold focus-cobalt"
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 5: Order Notes */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900">
          Լրացուցիչ Նշումներ կամ Ցուցումներ
        </label>
        <textarea
          rows={3}
          value={data.orderNotes}
          onChange={(e) => updateField('orderNotes', e.target.value)}
          placeholder="օր.՝ 2-րդ մուտք, կոդ 45, կամ զանգահարել նախապես..."
          className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500 transition-all placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}
