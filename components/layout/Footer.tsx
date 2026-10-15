/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, ShieldCheck, FileCheck2, Banknote } from 'lucide-react';
import { categories } from '@/data/categories';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 pb-20 md:pb-6">
      {/* Upper Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
        {/* Column 1: Brand & Physical Showroom */}
        <div className="space-y-4">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-black tracking-tight text-white">
              TAB<span className="text-cyan-500">.AM</span>
            </span>
            <span className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mt-0.5">
              ՍԱՆՏԵԽՆԻԿԱ & ՋԵՌՈՒՑՈՒՄ
            </span>
          </Link>

          <p className="text-slate-400 leading-relaxed text-xs">
            Գնե՛ք հատով՝ մեծածախի արժեքով: Գործում է առաքում՝ անմիջապես գնման օրը: Պաշտոնական ներկրող (LEDEME, VIEIR, HANSEN, GANZER, GERHANS, ACCOONA, LEMARK) և ArmSoft (ՀԾ) ինտեգրված կենտրոնացված պահեստ:
          </p>

          <div className="space-y-2 pt-1 text-slate-300">
            <a
              href="https://maps.google.com/?q=Yerevan+Melkumovi+40/1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 hover:text-cyan-400 transition-colors group"
            >
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
              <span>ք. Երևան, Մելքումովի 40/1 (Դավթաշեն / Աջափնյակ)</span>
            </a>

            <div className="flex flex-wrap items-center gap-1.5">
              <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
              <a href="tel:095530435" className="hover:text-white font-semibold tabular-nums">
                095 53-04-35
              </a>
              <span className="text-slate-700">,</span>
              <a href="tel:094530435" className="hover:text-white font-semibold tabular-nums">
                094 53-04-35
              </a>
              <span className="text-slate-700">,</span>
              <a href="tel:099530435" className="hover:text-white font-semibold tabular-nums">
                099 53-04-35
              </a>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Երկ - Կիրակի՝ 10:00 - 20:00 (առանց հանգստյան օրերի)</span>
            </div>
          </div>
        </div>

        {/* Column 2: Catalog Categories */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            Ապրանքացանկ (Կատալոգ)
          </h4>
          <ul className="space-y-2 text-slate-400">
            {categories.slice(0, 8).map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/catalog/${cat.slug}`}
                  className="hover:text-cyan-400 transition-colors flex items-center justify-between group py-0.5"
                >
                  <span className="group-hover:translate-x-1 transition-transform truncate">
                    {cat.title}
                  </span>
                  <span className="text-[10px] text-slate-600 bg-slate-900 px-1.5 py-0.2 rounded font-mono shrink-0">
                    {cat.itemCount}+
                  </span>
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/catalog"
                className="text-cyan-400 hover:text-cyan-300 font-semibold inline-block pt-1"
              >
                Դիտել բոլոր 16 բաժինները →
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Customer Service & B2B Contractors */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            Վարպետներին & B2B Գործընկերներին
          </h4>
          <ul className="space-y-2 text-slate-400">
            <li className="flex items-start gap-2">
              <FileCheck2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                ՀԾ էլեկտրոնային հաշիվ-ապրանքագրեր շինարարական կազմակերպություններին (ՀՎՀՀ / TIN)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>1-ից 5 տարվա պաշտոնական գործարանային երաշխիք բոլոր ապրանքների համար</span>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <a href="mailto:info@tab.am" className="hover:text-white transition-colors">
                info@tab.am (նախահաշիվների սպասարկում)
              </a>
            </li>
          </ul>

          <div className="pt-2">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
              <span className="font-bold text-white block mb-0.5">Պաշտոնական Ապրանքանիշեր</span>
              LEDEME, VIEIR, HANSEN, GANZER, GERHANS, ACCOONA, LEMARK
            </div>
          </div>
        </div>

        {/* Column 4: Payment Methods & Guarantees */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            Վճարման Եղանակներ
          </h4>
          <p className="text-slate-400 text-xs">
            Ընդունվում են վճարումներ ինչպես առցանց, այնպես էլ Մելքումովի 40/1 սրահում տեղում:
          </p>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-center font-bold text-slate-300 text-[11px]">
              Idram
            </div>
            <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-center font-bold text-slate-300 text-[11px]">
              Telcell
            </div>
            <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-center font-bold text-slate-300 text-[11px]">
              ArCa
            </div>
            <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-center font-bold text-slate-300 text-[11px]">
              Visa
            </div>
            <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-center font-bold text-slate-300 text-[11px]">
              Mastercard
            </div>
            <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-center font-bold text-slate-300 text-[11px] flex items-center justify-center gap-1">
              <Banknote className="w-3 h-3 text-emerald-400" />
              <span>Կանխիկ</span>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-500">
            Բոլոր գները նշված են ՀՀ Դրամով (AMD / ֏)՝ ներառյալ ԱԱՀ:
          </div>
        </div>
      </div>

      {/* Bottom Legal / Copyright Strip */}
      <div className="border-t border-slate-900 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © {currentYear} tab.am — Բոլոր իրավունքները պաշտպանված են: Մելքումովի 40/1 | 095 53-04-35
          </div>
          <div className="flex items-center gap-4">
            <span>ՀԾ (ArmSoft) Sync Ready</span>
            <span className="text-slate-800">•</span>
            <span>Բաց է 10:00 - 20:00</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
