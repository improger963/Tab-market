/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import { User, Phone, Mail, MapPin, Truck, CreditCard, Banknote, ShieldCheck } from 'lucide-react';
import type { UserAddress } from '@/types/api';
import { formatAMD, formatArPhone } from '@/lib/utils';
import {
  CheckoutGuestHint,
  SaveAddressToggle,
  SavedAddressPicker,
} from '@/components/checkout/CheckoutAccountControls';

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

/**
 * The optional account layer rendered over the delivery fields. It is passed in
 * whole or not at all: no `account` prop means this is a guest, and the form
 * behaves exactly as it did before accounts existed.
 */
export interface CheckoutAccountUi {
  addresses: UserAddress[];
  /** Account read still in flight: the picker holds its height. */
  loading: boolean;
  /** `null` = «other address», i.e. what is typed stays untouched. */
  selectedAddressId: string | null;
  onSelectAddress: (id: string | null) => void;
  saveAddress: boolean;
  onToggleSaveAddress: (value: boolean) => void;
  saveNote: string | null;
}

interface CheckoutFormProps {
  data: CheckoutFormData;
  onChange: (updater: (prev: CheckoutFormData) => CheckoutFormData) => void;
  shippingCost: number;
  account?: CheckoutAccountUi | null;
  /** Offered to guests only. Non-blocking: it never opens by itself. */
  onOpenAuth?: (() => void) | null;
}

export default function CheckoutForm({
  data,
  onChange,
  shippingCost,
  account = null,
  onOpenAuth = null,
}: CheckoutFormProps) {
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
      <div className="bg-white p-6 sm:p-7 rounded-panel border border-line shadow-e1 space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-canvas">
          <div className="w-8 h-8 rounded-control bg-accent/5 text-accent flex items-center justify-center font-bold text-xs">
            1
          </div>
          <h2 className="text-base font-semibold text-ink">
            Գնորդի Տվյալներ
          </h2>
        </div>

        {/* Guests only, and only a suggestion: signing in is a shortcut, never a
            requirement, so the line lives outside the field grid. */}
        {onOpenAuth && <CheckoutGuestHint onSignIn={onOpenAuth} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-body mb-1">
              Անուն, Ազգանուն <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={data.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                placeholder="օր.՝ Արմեն Գասպարյան"
                className="w-full h-12 pl-10 pr-3 rounded-control bg-canvas border border-line text-base md:text-xs font-medium focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              />
              <User className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-body mb-1">
              Հեռախոսահամար <span className="text-danger">*</span>
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center gap-1 text-xs font-bold text-muted pointer-events-none">
                <span>+374</span>
                <span className="text-line-strong">|</span>
              </div>
              <input
                type="tel"
                required
                value={data.phone}
                onChange={handlePhoneChange}
                placeholder="(95) 53-04-35"
                className="w-full h-12 pl-22 pr-3 rounded-control bg-canvas border border-line text-base md:text-xs font-mono font-bold focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-body mb-1">
              Էլ. Փոստ <span className="text-muted font-normal">(ըստ ցանկության)</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={data.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="օր.՝ armen@example.am"
                className="w-full h-12 pl-10 pr-3 rounded-control bg-canvas border border-line text-base md:text-xs font-medium focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              />
              <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Delivery Method (Strictly 2 Options) */}
      <div className="bg-white p-6 sm:p-7 rounded-panel border border-line shadow-e1 space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-canvas">
          <div className="w-8 h-8 rounded-control bg-accent/5 text-accent flex items-center justify-center font-bold text-xs">
            2
          </div>
          <h2 className="text-base font-semibold text-ink">
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
            className={`p-4 sm:p-5 rounded-panel border-2 transition-all cursor-pointer flex flex-col justify-between ${
 data.deliveryMethod === 'yerevan'
 ? 'border-accent bg-accent/5 shadow-e1 ring-2 ring-accent/10'
 : 'border-line hover:border-line-strong bg-canvas'
 }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-9 h-9 rounded-control flex items-center justify-center ${
 data.deliveryMethod === 'yerevan' ? 'bg-accent text-white' : 'bg-line text-body'
 }`}
                >
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-success bg-success/10 border border-success px-2.5 py-0.5 rounded-full">
                  ԱՆՎՃԱՐ (0 ֏)
                </span>
              </div>
              <h3 className="text-sm font-bold text-ink">Անվճար Առաքում Երևանի Տարածքում</h3>
              <p className="text-xs text-muted mt-1 leading-normal">
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
            className={`p-4 sm:p-5 rounded-panel border-2 transition-all cursor-pointer flex flex-col justify-between ${
 data.deliveryMethod === 'pickup'
 ? 'border-accent bg-accent/5 shadow-e1 ring-2 ring-accent/10'
 : 'border-line hover:border-line-strong bg-canvas'
 }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-9 h-9 rounded-control flex items-center justify-center ${
 data.deliveryMethod === 'pickup' ? 'bg-accent text-white' : 'bg-line text-body'
 }`}
                >
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-success bg-success/10 border border-success px-2.5 py-0.5 rounded-full">
                  ԱՆՎՃԱՐ (0 ֏)
                </span>
              </div>
              <h3 className="text-sm font-bold text-ink">Ինքնաարտահանում Սրահից</h3>
              <p className="text-xs text-muted mt-1 leading-normal">
                ք. Երևան, Մելքումովի 40/1 (Ամեն օր՝ 10:00 - 20:00):
              </p>
            </div>
          </div>
        </div>

        {/* Conditional Address Inputs for Yerevan Delivery */}
        {data.deliveryMethod === 'yerevan' && (
          <div className="p-4 sm:p-5 rounded-panel bg-canvas border border-line space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-ink">Երևանի Առաքման Հասցե</h4>
              <span className="text-xs font-bold text-success tabular-nums">
                Առաքման արժեք՝ {formatAMD(shippingCost)}
              </span>
            </div>

            {/* Saved addresses above the fields: choosing one fills them, and the
                customer can still edit every line afterwards. */}
            {account && (
              <SavedAddressPicker
                addresses={account.addresses}
                loading={account.loading}
                value={account.selectedAddressId}
                onSelect={account.onSelectAddress}
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-body mb-1">
                  Փողոց, Շենք <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required={data.deliveryMethod === 'yerevan'}
                  value={data.addressStreet}
                  onChange={(e) => updateField('addressStreet', e.target.value)}
                  placeholder="օր.՝ Կոմիտասի պող. 25, շենք 3"
                  className="w-full h-12 px-3.5 rounded-control bg-white border border-line text-base md:text-xs focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-body mb-1">
                  Բնակարան / Մուտք / Հարկ
                </label>
                <input
                  type="text"
                  value={data.addressApartment}
                  onChange={(e) => updateField('addressApartment', e.target.value)}
                  placeholder="բն. 14, 2-րդ մուտք, 4-րդ հարկ"
                  className="w-full h-12 px-3.5 rounded-control bg-white border border-line text-base md:text-xs focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>

            {/* Logged-in only, and optional: ticking it saves what is in the
                fields as a NEW address. Leaving it unticked changes nothing. */}
            {account && (
              <SaveAddressToggle
                checked={account.saveAddress}
                onChange={account.onToggleSaveAddress}
                note={account.saveNote}
              />
            )}
          </div>
        )}
      </div>

      {/* SECTION 3: Payment Method Selectors */}
      <div className="bg-white p-6 sm:p-7 rounded-panel border border-line shadow-e1 space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-canvas">
          <div className="w-8 h-8 rounded-control bg-accent/5 text-accent flex items-center justify-center font-bold text-xs">
            3
          </div>
          <h2 className="text-base font-semibold text-ink">
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
                className={`p-4.5 rounded-panel border-2 transition-all cursor-pointer flex flex-col justify-between ${
 isSelected
 ? 'border-accent bg-accent/5 shadow-e1 ring-2 ring-accent/10'
 : 'border-line hover:border-line-strong bg-canvas'
 }`}
              >
                <div>
                  <div
                    className={`w-9 h-9 rounded-control flex items-center justify-center mb-3 ${
 isSelected ? 'bg-accent text-white' : 'bg-line text-body'
 }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-bold text-ink leading-snug">{item.title}</h3>
                  <p className="text-xs text-muted mt-1 leading-normal">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Notes */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-body mb-1">
            Նշումներ պատվերի վերաբերյալ <span className="text-muted font-normal">(ըստ ցանկության)</span>
          </label>
          <textarea
            rows={2}
            value={data.orderNotes}
            onChange={(e) => updateField('orderNotes', e.target.value)}
            placeholder="Հարկ, դոմոֆոնի կոդ կամ առաքման հատուկ ժամ..."
            className="w-full p-3 rounded-control bg-canvas border border-line text-base md:text-xs focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 font-medium"
          />
        </div>
      </div>
    </div>
  );
}
