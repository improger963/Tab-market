/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

/**
 * Minimal accessible confirmation for destructive account actions (address
 * removal). Same visual sheet as the auth modal at a smaller size: focus starts
 * on the SAFE control (cancel), and Esc or a backdrop click dismisses it.
 * Restoring focus to the button that opened the dialog is the caller's job —
 * only the caller knows which row was being acted on.
 *
 * There is no confirm-on-Esc-then-double-tap dance: the default focused action
 * is "cancel", so an accidental Enter does nothing irreversible.
 */
import React, { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import { AUTH_HY } from '@/lib/copy/authHy';

export interface ConfirmDialogProps {
  title: string;
  body: string;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  body,
  confirmLabel,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const titleId = 'confirm-title';
  const bodyId = 'confirm-body';

  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      if (!busy) onCancel();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [busy, onCancel]);

  // Scroll lock without the layout jump the modal pattern already compensates
  // for elsewhere in the app.
  useEffect(() => {
    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-sheet flex items-end justify-center p-0 md:items-center md:p-6"
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-ink/70 backdrop-blur-sm animate-fade-in"
        onClick={() => !busy && onCancel()}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        className="relative w-full max-w-full md:max-w-sm rounded-t-panel md:rounded-panel border border-line bg-surface shadow-e2 p-5 sm:p-6 animate-sheet-in md:animate-fade-in pb-[max(1.25rem,env(safe-area-inset-bottom))] md:pb-6"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning/10 text-warning">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 space-y-1.5">
            <h2 id={titleId} className="text-base font-bold text-ink">
              {title}
            </h2>
            <p id={bodyId} className="text-sm leading-relaxed text-body">
              {body}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="btn-tactile inline-flex min-h-[48px] items-center justify-center rounded-control border border-line bg-surface px-5 text-sm font-semibold text-body transition-colors duration-hover hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {AUTH_HY.CANCEL}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="btn-tactile inline-flex min-h-[48px] items-center justify-center gap-2 rounded-control bg-danger px-5 text-sm font-semibold text-white transition-opacity duration-hover hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>{confirmLabel}</span>
            {busy && (
              <span className="text-xs font-medium opacity-90">{AUTH_HY.LOADING}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
