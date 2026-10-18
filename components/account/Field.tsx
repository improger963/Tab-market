/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

/**
 * The account forms' shared field, styled exactly like the auth modal's inputs so
 * a customer moving between sign-in and `/account` sees one system.
 *
 * The error line is a reserved slot (`empty:hidden`): it collapses without
 * changing the row height when empty, so a validation message never pushes the
 * fields below it down the page.
 */
import React from 'react';
import { cn } from '@/lib/utils';
import type { FieldErrors } from '@/lib/auth/schema';
import { AUTH_HY } from '@/lib/copy/authHy';

export const accountInputClass =
  'w-full h-12 rounded-control bg-canvas border border-line text-base md:text-sm font-medium text-ink placeholder:text-faint transition-colors duration-hover focus:bg-surface focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-60';

export function AccountFieldError({ id, message }: { id: string; message?: string }) {
  return (
    <div aria-live="polite" className="empty:hidden">
      {message ? (
        <p id={id} className="mt-1.5 text-xs font-semibold text-danger leading-relaxed">
          {message}
        </p>
      ) : null}
    </div>
  );
}

interface AccountFieldProps {
  id: string;
  /** Visible label. Never decorative: it is also the accessible name. */
  label: string;
  value: string;
  onChange: (value: string) => void;
  errors: FieldErrors;
  disabled?: boolean;
  readOnly?: boolean;
  type?: 'text' | 'email' | 'tel';
  inputMode?: 'text' | 'email' | 'tel' | 'numeric';
  autoComplete?: string;
  name?: string;
  placeholder?: string;
  /** Mirrors the schema limit so an over-long value can never be typed. */
  maxLength: number;
  required?: boolean;
  /** Static helper line (e.g. why a field is read-only). */
  hint?: React.ReactNode;
  className?: string;
}

export function AccountField({
  id,
  label,
  value,
  onChange,
  errors,
  disabled = false,
  readOnly = false,
  type = 'text',
  inputMode,
  autoComplete,
  name,
  placeholder,
  maxLength,
  required = false,
  hint,
  className,
}: AccountFieldProps) {
  const message = errors[name ?? id] ?? errors[id];
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = `${id}-error`;

  return (
    <div className={cn('min-w-0', className)}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-bold text-body">
        {label}
        {required && (
          <span className="text-danger" aria-hidden="true">
            {' '}
            *
          </span>
        )}
        {!required && (
          <span className="ml-1 font-medium text-faint">{AUTH_HY.OPTIONAL_SUFFIX}</span>
        )}
      </label>

      <input
        id={id}
        name={name ?? id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        aria-required={required || undefined}
        aria-invalid={message ? true : undefined}
        aria-describedby={cn(hintId, message && errorId) || undefined}
        disabled={disabled}
        readOnly={readOnly}
        className={cn(accountInputClass, message ? 'border-danger' : 'border-line')}
      />

      {hint && (
        <p id={hintId} className="mt-1.5 text-xs leading-relaxed text-muted">
          {hint}
        </p>
      )}
      <AccountFieldError id={errorId} message={message} />
    </div>
  );
}

/** The primary dark button used by every account form (same pair as the modal). */
export function AccountSubmit({
  busy,
  busyLabel,
  label,
  disabled = false,
}: {
  busy: boolean;
  busyLabel: string;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled || busy}
      className={cn(
        'btn-tactile inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-control bg-ink px-6 text-sm font-semibold text-white transition-colors duration-hover hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 sm:w-auto',
        (disabled || busy) && 'cursor-not-allowed opacity-60 hover:bg-ink'
      )}
    >
      <span>{busy ? busyLabel : label}</span>
    </button>
  );
}
