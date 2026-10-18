/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { AUTH_HY } from '@/lib/copy/authHy';

/**
 * The error state every `/account` panel shares. `role="alert"` announces it,
 * and the retry is a real action (re-runs the load) rather than a page reload,
 * so a network blip never costs the customer their place in the account.
 */
export function AccountPanelError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-panel border border-danger/20 bg-danger/10 p-5 space-y-3"
    >
      <div className="flex items-start gap-2.5">
        <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-sm font-semibold text-danger leading-relaxed">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="btn-tactile inline-flex min-h-[44px] items-center gap-2 rounded-control border border-danger/25 bg-surface px-4 py-2 text-xs font-bold text-danger transition-colors duration-hover hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <RotateCcw className="w-4 h-4" aria-hidden="true" />
        <span>{AUTH_HY.RETRY}</span>
      </button>
    </div>
  );
}

/**
 * Neutral "nothing here yet" block: title, one explanatory line, an optional
 * next step. Never an error colour — an empty account is a normal state.
 */
export function AccountEmptyState({
  icon,
  title,
  hint,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-panel border border-line bg-surface p-8 text-center space-y-3">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-canvas text-faint">
        {icon}
      </div>
      <h3 className="text-base font-bold text-ink">{title}</h3>
      {hint && <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted">{hint}</p>}
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}
