/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  /** 1-based page currently displayed. */
  page: number;
  /** Items per page; only used to render the "from–to" range. */
  pageSize: number;
  /** Total items across all pages for the active filters. */
  total: number;
  onChange: (page: number) => void;
  /** Extra classes for the wrapper (grid layouts differ per view). */
  className?: string;
}

/**
 * Page window: always show the first and last page, the current page's
 * neighbours, and an ellipsis where pages are skipped. Digits are
 * language-neutral, so no product copy is invented for the controls.
 */
function pageWindow(current: number, last: number): (number | '…')[] {
  if (last <= 1) return [];
  const wanted = new Set<number>([1, last, current - 1, current, current + 2]);
  const pages = [...wanted]
    .filter((n) => n >= 1 && n <= last)
    .sort((a, b) => a - b);

  const out: (number | '…')[] = [];
  let previous = 0;
  for (const n of pages) {
    if (previous && n - previous > 1) out.push('…');
    out.push(n);
    previous = n;
  }
  return out;
}

export default function Pagination({
  page,
  pageSize,
  total,
  onChange,
  className = '',
}: PaginationProps) {
  const last = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const pageNumbers = pageWindow(page, last);

  const base =
    'min-h-[44px] min-w-[44px] px-3 rounded-control text-xs font-bold tabular-nums transition-colors duration-hover ease-precision cursor-pointer inline-flex items-center justify-center gap-1.5 btn-tactile';

  return (
    <nav
      aria-label={`${from}–${to} / ${total}`}
      className={`flex flex-wrap items-center justify-center gap-2 ${className}`}
    >
      <span className="mr-1 text-xs font-semibold text-muted tabular-nums">
        {from}–{to} / {total}
      </span>

      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        aria-label={String(Math.max(1, page - 1))}
        className={`${base} border border-line bg-canvas text-body hover:bg-white hover:border-line-strong disabled:cursor-not-allowed disabled:opacity-40`}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>

      {pageNumbers.map((entry, index) =>
        entry === '…' ? (
          <span
            key={`gap-${index}`}
            aria-hidden="true"
            className="px-1 text-xs font-bold text-muted"
          >
            …
          </span>
        ) : (
          <button
            key={entry}
            type="button"
            onClick={() => onChange(entry)}
            aria-current={entry === page ? 'page' : undefined}
            className={`${base} ${
 entry === page
 ? 'bg-ink text-white shadow-e1'
 : 'border border-line bg-canvas text-body hover:bg-white hover:border-line-strong'
 }`}
          >
            {entry}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onChange(Math.min(last, page + 1))}
        disabled={page >= last}
        aria-label={String(Math.min(last, page + 1))}
        className={`${base} border border-line bg-canvas text-body hover:bg-white hover:border-line-strong disabled:cursor-not-allowed disabled:opacity-40`}
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
