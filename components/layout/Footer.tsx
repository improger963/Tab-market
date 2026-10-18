/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, FileCheck2, Banknote } from 'lucide-react';
import { categories } from '@/data/categories';
import { SHOWROOM_INFO } from '@/lib/config';
import { business } from '@/config/site';
import { HY } from '@/lib/copy/hy';
import { PAGES_HY } from '@/lib/copy/pagesHy';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-ink text-on-dark text-xs border-t border-white/10 pb-8">
      {/* Upper Main Footer Grid */}
      <div className="container-lux py-12 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
        {/* Column 1: Brand & Physical Showroom */}
        <div className="space-y-4">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-bold tracking-tight text-white">
              TAB<span className="text-accent">.AM</span>
            </span>
            <span className="block text-xs font-semibold text-on-dark-muted mt-0.5">
              ՍԱՆՏԵԽՆԻԿԱ & ՋԵՌՈՒՑՈՒՄ
            </span>
          </Link>

          <p className="text-on-dark leading-relaxed text-xs">
 Գնե՛ք հատով՝ մեծածախի արժեքով: Պաշտոնական ներկրող (LEDEME, VIEIR, HANSEN, GANZER, GERHANS, ACCOONA, LEMARK) և ինտեգրված կենտրոնացված պահեստ:
          </p>

          <div className="space-y-2 pt-1 text-white">
            <a
              href={SHOWROOM_INFO.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 hover:text-accent transition-colors group"
            >
              <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
              {SHOWROOM_INFO.address}
            </a>

            <div className="flex flex-wrap items-center gap-1.5">
              <Phone className="w-4 h-4 text-accent shrink-0" />
              <a href={`tel:+${SHOWROOM_INFO.phoneIntl}`} className="hover:text-white font-semibold tabular-nums">
                {SHOWROOM_INFO.phone}
              </a>
            </div>

            <div className="flex items-center gap-2 text-on-dark-muted">
              <Clock className="w-4 h-4 text-on-dark-muted shrink-0" />
              {SHOWROOM_INFO.hoursLabel}
            </div>
          </div>
        </div>

        {/* Column 2: Catalog Categories */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white">
            Ապրանքացանկ (Կատալոգ)
          </h4>
          <ul className="space-y-2 text-on-dark">
            {categories.slice(0, 8).map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/category/${cat.slug}`}
                  className="hover:text-accent transition-colors flex items-center justify-between group py-0.5"
                >
                  <span className="group-hover:translate-x-1 transition-transform truncate">
                    {cat.title}
                  </span>
                  <span className="text-xs text-on-dark bg-white/10 px-1.5 py-0.5 rounded font-mono shrink-0 border border-white/10">
                    {cat.itemCount}+
                  </span>
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/catalog"
                className="text-accent hover:text-accent-hover font-semibold inline-block pt-1"
              >
                Դիտել բոլոր {categories.length} բաժինները →
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Customer Service & B2B Contractors */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white">
            Վարպետներին & B2B Գործընկերներին
          </h4>
          <ul className="space-y-2 text-on-dark">
            <li className="flex items-start gap-2">
              <FileCheck2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <span>
                էլեկտրոնային հաշիվ-ապրանքագրեր շինարարական կազմակերպություններին (ՀՎՀՀ / TIN)
              </span>
            </li>
            {business.email ? (
            <li className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <a href={`mailto:${business.email}`} className="hover:text-white transition-colors">
                {business.email} (նախահաշիվների սպասարկում)
              </a>
            </li>
            ) : null}
            <li className="pt-1">
              <Link
                href="/showroom"
                className="text-accent hover:text-accent-hover font-bold flex items-center gap-1.5 min-h-[44px]"
              >
                <span>{HY.OUR_SHOWROOM} →</span>
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="text-accent hover:text-accent-hover font-bold flex items-center gap-1.5 min-h-[44px]"
              >
                <span>{PAGES_HY.CONTACT_H1} →</span>
              </Link>
            </li>
            <li className="pt-1">
              <Link
                href="/track-order"
                className="text-accent hover:text-accent-hover font-bold flex items-center gap-1.5"
              >
                <span>Ստուգել Պատվերի Կարգավիճակը →</span>
              </Link>
            </li>
          </ul>

          <div className="pt-2">
            <div className="p-3 rounded-control bg-white/5 border border-white/10 text-xs text-on-dark">
              <span className="font-bold text-white block mb-0.5">Պաշտոնական Ապրանքանիշեր</span>
              LEDEME, VIEIR, HANSEN, GANZER, GERHANS, ACCOONA, LEMARK
            </div>
          </div>
        </div>

        {/* Column 4: Payment Methods & Guarantees */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white">
            Վճարման Եղանակներ
          </h4>
          <p className="text-on-dark text-xs">
            Ընդունվում են վճարումներ ինչպես առցանց, այնպես էլ {SHOWROOM_INFO.address} սրահում տեղում:
          </p>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2 bg-white/5 border border-white/10 rounded-card text-center font-bold text-white text-xs">
              Idram
            </div>
            <div className="p-2 bg-white/5 border border-white/10 rounded-card text-center font-bold text-white text-xs">
              Telcell
            </div>
            <div className="p-2 bg-white/5 border border-white/10 rounded-card text-center font-bold text-white text-xs">
              ArCa
            </div>
            <div className="p-2 bg-white/5 border border-white/10 rounded-card text-center font-bold text-white text-xs">
              Visa
            </div>
            <div className="p-2 bg-white/5 border border-white/10 rounded-card text-center font-bold text-white text-xs">
              Mastercard
            </div>
            <div className="p-2 bg-white/5 border border-white/10 rounded-card text-center font-bold text-white text-xs flex items-center justify-center gap-1">
              <Banknote className="w-3 h-3 text-success" />
              <span>Կանխիկ</span>
            </div>
          </div>

          <div className="pt-2 text-xs text-on-dark-muted">
            Բոլոր գները նշված են ՀՀ Դրամով (AMD / ֏)՝ ներառյալ ԱԱՀ:
          </div>
        </div>
      </div>

      {/* Bottom Legal / Copyright Strip */}
      <div className="border-t border-white/10 bg-ink">
        <div className="container-lux py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-on-dark-muted">
          <div>
            © {currentYear} tab.am — Բոլոր իրավունքները պաշտպանված են:
          </div>
        </div>
      </div>
    </footer>
  );
}
