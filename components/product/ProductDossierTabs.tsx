/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  FileCheck2,
  Ruler,
  Wrench,
  Truck,
  MapPin,
  X,
  ZoomIn,
} from 'lucide-react';
import { Product } from '@/types';
import { DELIVERY_CONFIG, SHOWROOM_INFO, resolveImageUrl } from '@/lib/config';
import { displayTitle } from '@/lib/utils';
import { HY } from '@/lib/copy/hy';

interface ProductDossierTabsProps {
  product: Product;
}

/**
 * Canonical strings — byte-verbatim from git HEAD unless noted; sentence
 * case applied by flipping non-initial capitals via the canonical letter
 * pairs only (0532->0562, 054f->057f).
 */
const TEXT = {
  TAB_SPECS: '\u054f\u0565\u056d\u0576\u056b\u056f\u0561\u056f\u0561\u0576 \u0562\u0576\u0578\u0582\u0569\u0561\u0563\u056b\u0580', // head L47, 2nd word sentence-cased
  TAB_BLUEPRINT: '\u0533\u056e\u0561\u0563\u056b\u0580 \u0587 \u0549\u0561\u0583\u057d\u0565\u0580 (\u0574\u0574)', // head L48
  TAB_DELIVERY: '\u0531\u057c\u0561\u0584\u0578\u0582\u0574 \u0587 \u057f\u0565\u0572\u0561\u0564\u0580\u0578\u0582\u0574', // head L49, 3rd word sentence-cased
  BLUEPRINT_OPEN: '\u0532\u0561\u0581\u0565\u056c CAD \u0563\u056e\u0561\u0563\u056b\u0580\u0568 \u056d\u0578\u0577\u0578\u0580\u0561\u0581\u057e\u0561\u056e', // head L116
  CAD_GTSAGIR: 'CAD \u0563\u056e\u0561\u0563\u056b\u0580', // head L170
  CLICK_TO_ZOOM: '\u054d\u0565\u0572\u0574\u0565\u055b\u0584 \u056d\u0578\u0577\u0578\u0580\u0561\u0581\u0576\u0565\u056c\u0578\u0582 \u0570\u0561\u0574\u0561\u0580', // head L126
  CHSAPER_MM: 'CAD \u0549\u0561\u0583\u057d\u0565\u0580 (\u0574\u0574)', // head L184
  DELIVERY_HEAD: '\u0531\u057c\u0561\u0584\u0578\u0582\u0574 \u0535\u0580\u0587\u0561\u0576\u0578\u0582\u0574.', // head L136
  DELIVERY_BODY_HEAD: '\u053c\u0580\u056b\u057e \u0561\u0576\u057e\u0573\u0561\u0580\u055d \u0570\u0565\u0576\u0581 \u057a\u0561\u057f\u057e\u0565\u0580\u056b \u0585\u0580\u0568 (\u056a\u0561\u0574\u0568 ', // head L136-137 prefix; times appended from SHOWROOM_INFO.hours
  DELIVERY_BODY_TAIL: '\u056b\u0581 ', // "-its'" (between the two times, head L137)
  DELIVERY_BODY_END: '):',
  PICKUP_HEAD: '\u054e\u0565\u0580\u0581\u0576\u0565\u056c \u057d\u0580\u0561\u0570\u056b\u0581.', // head L143
  PICKUP_TAIL: '\u057d\u0580\u0561\u0570\u056b\u0581\u055d \u0561\u0576\u057e\u0573\u0561\u0580:', // "srakhits', anvar" — address renders from SHOWROOM_INFO.address
  INSTALL_HEAD: '\u054f\u0565\u0572\u0561\u0564\u0580\u0574\u0561\u0576 \u056d\u0578\u0580\u0570\u0578\u0582\u0580\u0564.', // head L150
  INSTALL_BODY: '\u0544\u0578\u0576\u057f\u0561\u056a\u056b\u0581 \u0561\u057c\u0561\u057b \u056d\u0578\u0580\u0570\u0578\u0582\u0580\u0564 \u0567 \u057f\u0580\u057e\u0578\u0582\u0574 \u056c\u057e\u0561\u0576\u0561\u056c \u057b\u0580\u0561\u0563\u056e\u0565\u0580\u0568\u055d \u056d\u0578\u0572\u0578\u057e\u0561\u056f\u056b \u0561\u0572\u0562\u056b\u0581 \u0584\u0561\u0580\u057f\u0580\u056b\u057b\u0568 \u057a\u0561\u0577\u057f\u057a\u0561\u0576\u0565\u056c\u0578\u0582 \u0570\u0561\u0574\u0561\u0580:', // head L150-151 joined
  NO_DATA: '\u054f\u057e\u0575\u0561\u056c\u0576\u0565\u0580 \u0579\u056b \u0563\u057f\u0576\u057e\u0565\u056c', // composed from HEAD word forms: "Tvyalner chi gtstvets" (both verbatim in HEAD)
} as const;

type TabId = 'specs' | 'blueprint' | 'delivery';

/**
 * Single source of truth for the full technical specifications table, CAD
 * blueprint and delivery/installation guidance (below-the-fold tabs).
 *
 * - Accessible tablist: roles, aria-selected/controls, roving tabindex with
 *   Arrow/Home/End keyboard navigation.
 * - Panel switch animates opacity only (no x-slide => no perceived layout
 *   shift) and respects prefers-reduced-motion via the global CSS block.
 * - Delivery facts render from DELIVERY_CONFIG / SHOWROOM_INFO; the free
 *   Yerevan line hides if the config ever stops granting it.
 */
export default function ProductDossierTabs({ product }: ProductDossierTabsProps) {
  const [dossierTab, setDossierTab] = useState<TabId>('specs');
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const tabListRef = useRef<HTMLDivElement>(null);

  // Keyboard + focus model for the CAD spotlight modal: Escape dismisses, focus
  // moves into the dialog on open and returns to the trigger on close.
  const zoomModalRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!isZoomOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    requestAnimationFrame(() => zoomModalRef.current?.focus({ preventScroll: true }));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsZoomOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [isZoomOpen]);

  const hasBlueprint = !!resolveImageUrl(product.blueprintImage);
  // Only render spec rows that carry real customer data; the internal SKU row
  // (stored under key "code") is surfaced once as a "Kod" chip elsewhere and
  // must not appear in the technical table.
  const specRows = Object.entries(product.specs).filter(
    ([key, value]) =>
      key !== 'code' && typeof value === 'string' && value.trim().length > 0,
  );

  // Delivery window copy is assembled from the real published hours so it
  // stays true if config ever changes (falls back silently if hours removed).
  const dayHours = SHOWROOM_INFO.hours[1] ?? SHOWROOM_INFO.hours[0];
  const deliveryHours = dayHours
    ? `${dayHours.open}-${TEXT.DELIVERY_BODY_TAIL}${dayHours.close}`
    : '';

  const tabs: { id: TabId; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'specs', label: TEXT.TAB_SPECS, Icon: FileCheck2 },
    ...(hasBlueprint ? [{ id: 'blueprint' as TabId, label: TEXT.TAB_BLUEPRINT, Icon: Ruler }] : []),
    { id: 'delivery', label: TEXT.TAB_DELIVERY, Icon: Wrench },
  ];

  const onTabListKeyDown = (e: React.KeyboardEvent) => {
    const idx = tabs.findIndex((t) => t.id === dossierTab);
    let next = -1;
    if (e.key === 'ArrowRight') next = (idx + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (idx - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    if (next < 0) return;
    e.preventDefault();
    setDossierTab(tabs[next].id);
    const btn = tabListRef.current?.querySelector<HTMLButtonElement>(
      `[data-tab-id="${tabs[next].id}"]`
    );
    btn?.focus();
  };

  const tabBase =
    'btn-tactile inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-control px-3.5 py-2 text-xs font-semibold transition-colors duration-hover ease-precision focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2';

  return (
    <div className="overflow-hidden rounded-panel border border-line bg-surface shadow-e1">
      {/* Tab list */}
      <div
        ref={tabListRef}
        role="tablist"
        aria-label={TEXT.TAB_SPECS}
        onKeyDown={onTabListKeyDown}
        className="no-scrollbar flex items-center gap-1 overflow-x-auto border-b border-line bg-canvas p-1.5"
      >
        {tabs.map(({ id, label, Icon }) => {
          const active = dossierTab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              data-tab-id={id}
              id={`pdp-tab-${id}`}
              aria-selected={active}
              aria-controls={`pdp-panel-${id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => setDossierTab(id)}
              className={`${tabBase} ${
 active
 ? 'bg-ink text-white'
 : 'text-body hover:bg-surface hover:text-ink'
 }`}
            >
              <Icon
                className={`h-3.5 w-3.5 ${active ? 'text-white' : 'text-accent'}`}
                aria-hidden="true"
              />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Panels (opacity-only switch, fixed mount => no layout shift) */}
      <div key={dossierTab} className="animate-fade-in p-5 sm:p-6" role="presentation">
        {dossierTab === 'specs' && (
          <div
            role="tabpanel"
            id="pdp-panel-specs"
            aria-labelledby="pdp-tab-specs"
            tabIndex={0}
            className="overflow-hidden rounded-card border border-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            {specRows.length > 0 ? (
              <table className="w-full text-left text-xs">
                <tbody className="divide-y divide-line">
                  {specRows.map(([key, value]) => (
                    <tr key={key} className="transition-colors duration-hover hover:bg-canvas/60">
                      <td className="w-2/5 bg-canvas px-4 py-2.5 font-semibold text-body">
                        {key}
                      </td>
                      <td className="px-4 py-2.5 font-bold text-ink">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              /* EMPTY state: clear message, honest about missing data. */
              <p className="p-4 text-xs text-muted">{TEXT.NO_DATA}</p>
            )}
          </div>
        )}

        {dossierTab === 'blueprint' && hasBlueprint && (
          <div
            role="tabpanel"
            id="pdp-panel-blueprint"
            aria-labelledby="pdp-tab-blueprint"
            tabIndex={0}
          >
            <button
              type="button"
              onClick={() => setIsZoomOpen(true)}
              className="group relative flex min-h-[240px] w-full cursor-zoom-in items-center justify-center overflow-hidden rounded-card bg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              aria-label={TEXT.BLUEPRINT_OPEN}
            >
              <img
                src={resolveImageUrl(product.blueprintImage)!}
                alt={`${displayTitle(product.title)} CAD \u0563\u056e\u0561\u0563\u056b\u0580`}
                className="max-h-[280px] w-auto object-contain transition-transform duration-hover ease-precision group-hover:scale-[1.03]"
                loading="lazy"
              />
              <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-control border border-line/20 bg-ink/70 px-2.5 py-1.5 text-xs font-medium text-on-dark backdrop-blur-sm transition-colors duration-hover group-hover:bg-ink/85">
                <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
                {TEXT.CLICK_TO_ZOOM}
              </span>
            </button>
          </div>
        )}

        {dossierTab === 'delivery' && (
          <div
            role="tabpanel"
            id="pdp-panel-delivery"
            aria-labelledby="pdp-tab-delivery"
            tabIndex={0}
            className="space-y-3 text-xs leading-relaxed text-body"
          >
              {DELIVERY_CONFIG.yerevanFreeAlways && (
              <div className="flex items-start gap-2.5 rounded-card border border-line bg-canvas p-3">
                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <p>
                  <b className="font-semibold text-ink">{TEXT.DELIVERY_HEAD}</b>{' '}
                  {TEXT.DELIVERY_BODY_HEAD}
                  {deliveryHours}
                  {TEXT.DELIVERY_BODY_END}
                </p>
              </div>
            )}
            <div className="flex items-start gap-2.5 rounded-card border border-line bg-canvas p-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <p>
                <b className="font-semibold text-ink">{TEXT.PICKUP_HEAD}</b>{' '}
                {SHOWROOM_INFO.address} {TEXT.PICKUP_TAIL}
              </p>
            </div>
            <div className="flex items-start gap-2.5 rounded-card border border-line bg-canvas p-3">
              <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <p>
                <b className="font-semibold text-ink">{TEXT.INSTALL_HEAD}</b>{' '}
                {TEXT.INSTALL_BODY}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* CAD spotlight modal */}
      {isZoomOpen && hasBlueprint && (
        <div
          className="fixed inset-0 z-overlay flex animate-fade-in items-center justify-center bg-ink/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={TEXT.CAD_GTSAGIR}
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            ref={zoomModalRef}
            tabIndex={-1}
            className="w-full max-w-3xl overflow-hidden rounded-panel border border-line/20 bg-ink shadow-e2 outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line/20 p-4">
              <div>
                <h4 className="text-sm font-semibold text-white">
                  {displayTitle(product.title)}
                </h4>
                <span className="font-mono text-xs font-semibold text-on-dark-muted tabular-nums">
                  {HY.CODE_COLON} {product.code} · {TEXT.CHSAPER_MM}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                aria-label={HY.CLOSE}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-control text-on-dark-muted transition-colors duration-hover hover:bg-surface/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex min-h-[320px] items-center justify-center p-6">
              <img
                src={resolveImageUrl(product.blueprintImage)!}
                alt={`${displayTitle(product.title)} CAD \u0563\u056e\u0561\u0563\u056b\u0580 \u056d\u0578\u0577\u0578\u0580\u0561\u0581\u057e\u0561\u056e`}
                className="max-h-[60dvh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
