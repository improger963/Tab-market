/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, Eye, EyeOff, Loader2, X } from 'lucide-react';
import { useAuth } from '@/store/useAuth';
import { AUTH_HY } from '@/lib/copy/authHy';
import { LIMITS, passwordStrength, toE164 } from '@/lib/auth/schema';
import { getDevDemoCredentials, requestPasswordReset } from '@/services/api';
import { pushRoute, useSearchParams } from '@/lib/next-compat/navigation';
import { cn, formatArPhone, maskPhone } from '@/lib/utils';

/**
 * AUTH MODAL — the whole account entry point in one dialog.
 *
 * It is optional by construction: «Շարունակել առանց հաշվի» is always on screen,
 * because a guest buys exactly as well as a member. Structurally it is a modal
 * dialog on desktop and a bottom sheet on mobile, with a real focus trap,
 * `aria-modal`, and focus handed back to the trigger on close.
 *
 * Nothing sensitive is kept here: the password lives in the input's state and in
 * the request body, and disappears when the dialog unmounts.
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type FieldErrors = Record<string, string>;

interface AuthModalProps {
  /** Reserved for future embedding; the modal owns its own open state. */
  className?: string;
}

export default function AuthModal({ className }: AuthModalProps) {
  const {
    isAuthModalOpen,
    mode,
    status,
    error,
    fieldErrors,
    notice,
    next,
    openAuthModal,
    closeAuthModal,
    setMode,
    clearFeedback,
    showResetUnavailable,
    login,
    register,
  } = useAuth();

  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  // The element that opened the dialog — focus must return to it, not to the top
  // of the page, or a keyboard user loses their place entirely.
  const triggerRef = useRef<HTMLElement | null>(null);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [devCredentials, setDevCredentials] = useState<{ phone: string; password: string } | null>(null);

  const params = useSearchParams();
  const authParam = params.get('auth');
  const nextParam = params.get('next');

  const isLoading = status === 'loading';
  const isLogin = mode === 'login';

  /** `?auth=login|register` opens the dialog, so links and the guard share one path. */
  useEffect(() => {
    if (isAuthModalOpen) return;
    if (authParam === 'login' || authParam === 'register') {
      openAuthModal(authParam, nextParam);
    }
  }, [authParam, nextParam, isAuthModalOpen, openAuthModal]);

  /** Close the dialog with the URL left clean, so a refresh cannot reopen it. */
  useEffect(() => {
    if (isAuthModalOpen) return;
    if (authParam === 'login' || authParam === 'register' || nextParam) {
      const rest = new URLSearchParams(window.location.search);
      rest.delete('auth');
      rest.delete('next');
      const query = rest.toString();
      pushRoute(query ? `${window.location.pathname}?${query}` : window.location.pathname, {
        replace: true,
        scroll: false,
      });
    }
  }, [isAuthModalOpen, authParam, nextParam]);

  /** Dev-only quick-login source; the credentials are never in the bundle. */
  useEffect(() => {
    if (!import.meta.env.DEV || !isAuthModalOpen || devCredentials) return;
    let active = true;
    getDevDemoCredentials()
      .then((value) => {
        if (active) setDevCredentials(value);
      })
      .catch(() => {
        if (active) setDevCredentials(null);
      });
    return () => {
      active = false;
    };
  }, [isAuthModalOpen, devCredentials]);

  /* Scroll lock + focus management for the lifetime of the dialog. */
  useEffect(() => {
    if (!isAuthModalOpen) return;

    triggerRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    // Compensate for the scrollbar the lock removes: no layout jump on close.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    closeBtnRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeAuthModal();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const nodes = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (nodes.length === 0) return;
      const first = nodes[0] as HTMLElement;
      const last = nodes[nodes.length - 1] as HTMLElement;
      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey && (active === first || !panelRef.current.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '';
      window.removeEventListener('keydown', handleKeyDown, true);
      // Hand focus back before the dialog unmounts the focused element.
      const trigger = triggerRef.current;
      if (trigger && trigger.isConnected) trigger.focus();
      triggerRef.current = null;
    };
  }, [isAuthModalOpen, closeAuthModal]);

  // A closed dialog never keeps typed credentials around.
  useEffect(() => {
    if (isAuthModalOpen) return;
    setPassword('');
    setReveal(false);
  }, [isAuthModalOpen]);

  const finish = useCallback(
    (ok: boolean) => {
      if (!ok) return;
      const target = next;
      closeAuthModal();
      if (target) pushRoute(target, { replace: true, scroll: true });
    },
    [closeAuthModal, next]
  );

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isLoading) return;
    finish(await login({ phone, password }));
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isLoading) return;
    finish(await register({ fullName, phone, password, acceptTerms }));
  };

  const handleForgot = () => {
    clearFeedback();
    showResetUnavailable();
    // Contract-first: the mock answers 501 and Laravel will answer 202 once SMS
    // OTP exists. The UI already handles both, so that launch is a backend
    // change only — and an incomplete number is never sent to the server.
    const e164 = toE164(phone);
    if (e164) void requestPasswordReset(e164).catch(() => undefined);
  };

  const handleDevQuickLogin = async () => {
    if (!devCredentials || isLoading) return;
    // The credentials are typed into the request by this handler only — they are
    // never written into the store, so nothing survives the tab.
    finish(await login({ phone: devCredentials.phone, password: devCredentials.password }));
  };

  const tabOnKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const forward = event.key === 'ArrowRight' || event.key === 'End';
    const back = event.key === 'ArrowLeft' || event.key === 'Home';
    if (!forward && !back) return;
    event.preventDefault();
    const target = isLogin ? 'register' : 'login';
    setMode(target);
    // Roving tabindex: the newly selected tab takes focus, as the pattern expects.
    requestAnimationFrame(() => document.getElementById(`auth-tab-${target}`)?.focus());
  };

  const strength = !isLogin && password ? passwordStrength(password) : 0;
  const strengthLabel =
    strength <= 1 ? AUTH_HY.STRENGTH_WEAK : strength === 2 ? AUTH_HY.STRENGTH_FAIR : AUTH_HY.STRENGTH_GOOD;

  return (
    <div
      className={cn(
        isAuthModalOpen ? 'fixed inset-0 z-sheet flex items-end justify-center md:items-center md:p-6' : 'hidden',
        className
      )}
      aria-hidden={isAuthModalOpen ? undefined : true}
    >
      {/* Backdrop */}
      <button
        type="button"
        tabIndex={isAuthModalOpen ? 0 : -1}
        aria-label={AUTH_HY.MODAL_CLOSE}
        onClick={closeAuthModal}
        className="absolute inset-0 bg-ink/70 backdrop-blur-sm animate-fade-in cursor-default"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-dialog-title"
        aria-describedby="auth-dialog-subtitle"
        tabIndex={-1}
        className={
          // Mobile: bottom sheet. Desktop: centred panel. One radius scale,
          // `dvh` so the sheet never hides behind a phone's browser chrome.
          'relative w-full max-w-full md:max-w-md ' +
          'max-h-[85dvh] md:max-h-[85dvh] overflow-y-auto overscroll-contain ' +
          'bg-surface border border-line shadow-e2 ' +
          'rounded-t-panel md:rounded-panel ' +
          'animate-sheet-in md:animate-fade-in ' +
          // Safe-area padding keeps the primary action above the home indicator.
          'pt-5 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 md:pb-6'
        }
      >
        {/* Header + close */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="auth-dialog-title" className="text-lg font-bold text-ink tracking-tight">
              {isLogin ? AUTH_HY.MODAL_LOGIN_TITLE : AUTH_HY.MODAL_REGISTER_TITLE}
            </h2>
            <p id="auth-dialog-subtitle" className="text-xs text-muted mt-1 leading-relaxed">
              {isLogin ? AUTH_HY.MODAL_LOGIN_SUB : AUTH_HY.MODAL_REGISTER_SUB}
            </p>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={closeAuthModal}
            aria-label={AUTH_HY.MODAL_CLOSE}
            className="shrink-0 min-h-[44px] min-w-[44px] -mt-1 -me-2 flex items-center justify-center rounded-control text-muted hover:text-ink hover:bg-canvas transition-colors duration-hover cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Tabs */}
        <div role="tablist" aria-label={AUTH_HY.MODAL_ARIA_LABEL} className="mt-4 grid grid-cols-2 gap-1 rounded-control bg-canvas border border-line p-1">
          {(['login', 'register'] as const).map((value) => {
            const selected = mode === value;
            return (
              <button
                key={value}
                id={`auth-tab-${value}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="auth-dialog-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setMode(value)}
                onKeyDown={tabOnKeyDown}
                className={cn(
                  'min-h-[44px] rounded-card text-sm font-bold transition-colors duration-hover cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  selected ? 'bg-surface text-ink shadow-e1' : 'text-muted hover:text-ink'
                )}
              >
                {value === 'login' ? AUTH_HY.LOGIN_TAB : AUTH_HY.REGISTER_TAB}
              </button>
            );
          })}
        </div>

        <div
          id="auth-dialog-panel"
          role="tabpanel"
          aria-labelledby={`auth-tab-${mode}`}
          className="pt-4"
        >
          {notice === 'reset_unavailable' ? (
            <div className="space-y-4">
              <div className="rounded-control border border-line bg-canvas p-4 space-y-2">
                <h3 className="text-sm font-bold text-ink">{AUTH_HY.RESET_UNAVAILABLE_TITLE}</h3>
                <p className="text-xs text-body leading-relaxed">{AUTH_HY.RESET_UNAVAILABLE_BODY}</p>
              </div>
              <button
                type="button"
                onClick={clearFeedback}
                className="btn-tactile min-h-[44px] inline-flex items-center gap-2 px-4 rounded-control border border-line bg-surface hover:bg-canvas text-sm font-semibold text-ink cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                <span>{AUTH_HY.BACK}</span>
              </button>
            </div>
          ) : isLogin ? (
            <form onSubmit={handleLogin} noValidate className="space-y-4">
              <PhoneField value={phone} onChange={setPhone} errors={fieldErrors} disabled={isLoading} />
              <PasswordField
                value={password}
                onChange={setPassword}
                errors={fieldErrors}
                disabled={isLoading}
                reveal={reveal}
                onToggle={() => setReveal((previous) => !previous)}
                autoComplete="current-password"
                label={AUTH_HY.FIELD_PASSWORD}
              />

              {/* One generic sentence for every credential failure: the message
                  never says which half was wrong. */}
              <div aria-live="polite" className="empty:hidden">
                {error ? (
                  <p className="rounded-control border border-danger/30 bg-danger/5 px-3 py-2.5 text-xs font-semibold text-danger">
                    {error}
                  </p>
                ) : null}
              </div>

              <PrimaryButton type="submit" loading={isLoading} loadingText={AUTH_HY.LOADING}>
                {AUTH_HY.SWITCH_TO_LOGIN}
              </PrimaryButton>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleForgot}
                  className="min-h-[44px] inline-flex items-center rounded text-xs font-semibold text-accent hover:text-accent-hover transition-colors duration-hover cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {AUTH_HY.FORGOT_PASSWORD}
                </button>
                <span className="text-xs text-muted">
                  {AUTH_HY.NO_ACCOUNT_YET}{' '}
                  <TabLink onClick={() => setMode('register')}>{AUTH_HY.SWITCH_TO_REGISTER}</TabLink>
                </span>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} noValidate className="space-y-4">
              <TextField
                id="auth-full-name"
                label={AUTH_HY.FIELD_FULL_NAME}
                value={fullName}
                onChange={setFullName}
                errors={fieldErrors}
                disabled={isLoading}
                name="name"
                autoComplete="name"
                maxLength={LIMITS.fullNameMax}
                placeholder={AUTH_HY.NAME_PLACEHOLDER}
              />
              <PhoneField value={phone} onChange={setPhone} errors={fieldErrors} disabled={isLoading} />
              <PasswordField
                value={password}
                onChange={setPassword}
                errors={fieldErrors}
                disabled={isLoading}
                reveal={reveal}
                onToggle={() => setReveal((previous) => !previous)}
                autoComplete="new-password"
                label={AUTH_HY.FIELD_PASSWORD}
                describedBy="auth-password-strength"
              />

              {/* Strength is a hint, never a gate: the only hard rule is length. */}
              <p id="auth-password-strength" className="flex items-center gap-2 text-xs text-muted">
                <span aria-hidden="true" className="inline-flex gap-1">
                  {[1, 2, 3].map((step) => (
                    <span
                      key={step}
                      className={cn(
                        'h-1.5 w-6 rounded-full bg-line transition-colors duration-hover',
                        strength >= step && (strength <= 1 ? 'bg-danger' : strength === 2 ? 'bg-warning' : 'bg-success')
                      )}
                    />
                  ))}
                </span>
                <span>
                  {AUTH_HY.PASSWORD_HINT}
                  {password ? ` ${strengthLabel}` : ''}
                </span>
              </p>

              <ConsentField checked={acceptTerms} onChange={setAcceptTerms} errors={fieldErrors} disabled={isLoading} />

              <div aria-live="polite" className="empty:hidden">
                {error ? (
                  <p className="rounded-control border border-danger/30 bg-danger/5 px-3 py-2.5 text-xs font-semibold text-danger">
                    {error}
                  </p>
                ) : null}
              </div>

              <PrimaryButton type="submit" loading={isLoading} loadingText={AUTH_HY.SAVING}>
                {AUTH_HY.SWITCH_TO_REGISTER}
              </PrimaryButton>

              <p className="text-xs text-muted pt-1">
                {AUTH_HY.HAS_ACCOUNT}{' '}
                <TabLink onClick={() => setMode('login')}>{AUTH_HY.SWITCH_TO_LOGIN}</TabLink>
              </p>
            </form>
          )}

          {/* Account is a convenience: a guest path is always offered. */}
          <button
            type="button"
            onClick={closeAuthModal}
            className="mt-4 w-full min-h-[44px] rounded-control border border-line bg-canvas hover:bg-surface text-xs font-bold text-body hover:text-ink transition-colors duration-hover cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {AUTH_HY.GUEST_CONTINUE}
          </button>

          {import.meta.env.DEV && devCredentials ? (
            <div className="mt-4 rounded-control border border-dashed border-line-strong bg-canvas p-3">
              <p className="text-[11px] text-muted mb-2">
                {AUTH_HY.DEV_QUICK_LOGIN} · {maskPhone(devCredentials.phone)}
              </p>
              <button
                type="button"
                onClick={handleDevQuickLogin}
                disabled={isLoading}
                className="btn-tactile min-h-[44px] w-full rounded-control bg-line-strong/40 hover:bg-accent/10 text-xs font-bold text-ink transition-colors duration-hover cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {AUTH_HY.DEV_QUICK_LOGIN}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// --- Shared field pieces ----------------------------------------------------

function FieldError({ id, message }: { id: string; message?: string }) {
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

const inputClass =
  'w-full h-12 rounded-control bg-canvas border border-line text-base md:text-sm font-medium text-ink placeholder:text-faint transition-colors duration-hover focus:bg-surface focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-60';

interface BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  errors: FieldErrors;
  disabled: boolean;
}

function PhoneField({ value, onChange, errors, disabled }: BaseFieldProps) {
  const message = errors.phone;
  return (
    <div>
      <label htmlFor="auth-phone" className="block text-xs font-bold text-body mb-1.5">
        {AUTH_HY.FIELD_PHONE} <span className="text-danger">*</span>
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted pointer-events-none tabular-nums">
          +374
        </span>
        <input
          id="auth-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          disabled={disabled}
          value={value}
          // Every keystroke is re-grouped into `+374 (XX) XX-XX-XX`, and a pasted
          // `095…`, `+374 95…` or `(095) 53-04-35` collapses to the same shape.
          onChange={(event) => onChange(formatArPhone(event.target.value))}
          placeholder={AUTH_HY.PHONE_PLACEHOLDER}
          aria-invalid={message ? true : undefined}
          aria-describedby={message ? 'auth-phone-error' : undefined}
          className={cn(inputClass, 'pl-14 pr-3 font-mono tabular-nums', message ? 'border-danger' : '')}
        />
      </div>
      <FieldError id="auth-phone-error" message={message} />
    </div>
  );
}

function PasswordField({
  value,
  onChange,
  errors,
  disabled,
  reveal,
  onToggle,
  autoComplete,
  label,
  describedBy,
}: BaseFieldProps & {
  reveal: boolean;
  onToggle: () => void;
  autoComplete: 'current-password' | 'new-password';
  label: string;
  describedBy?: string;
}) {
  const message = errors.password;
  return (
    <div>
      <label htmlFor="auth-password" className="block text-xs font-bold text-body mb-1.5">
        {label} <span className="text-danger">*</span>
      </label>
      <div className="relative">
        <input
          id="auth-password"
          name={autoComplete === 'new-password' ? 'new-password' : 'current-password'}
          type={reveal ? 'text' : 'password'}
          autoComplete={autoComplete}
          required
          disabled={disabled}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={LIMITS.passwordMax}
          // The value is never masked into the DOM by us beyond the native
          // `type`; no strength or copy of it is kept after the dialog closes.
          aria-invalid={message ? true : undefined}
          aria-describedby={message ? 'auth-password-error' : describedBy}
          className={cn(inputClass, 'pl-3.5 pr-12', message ? 'border-danger' : '')}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={reveal}
          aria-label={reveal ? AUTH_HY.PASSWORD_HIDE : AUTH_HY.PASSWORD_REVEAL}
          className="absolute right-0 top-0 min-h-[48px] min-w-[44px] h-12 flex items-center justify-center rounded-control text-muted hover:text-ink transition-colors duration-hover cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {reveal ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
        </button>
      </div>
      <FieldError id="auth-password-error" message={message} />
    </div>
  );
}

interface TextFieldProps extends BaseFieldProps {
  id: string;
  label: string;
  name: string;
  autoComplete: string;
  maxLength: number;
  placeholder: string;
}

function TextField({
  id,
  label,
  name,
  autoComplete,
  maxLength,
  placeholder,
  value,
  onChange,
  errors,
  disabled,
}: TextFieldProps) {
  const message = errors.fullName ?? errors[name];
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-body mb-1.5">
        {label} <span className="text-danger">*</span>
      </label>
      <input
        id={id}
        name={name}
        type="text"
        autoComplete={autoComplete}
        required
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-invalid={message ? true : undefined}
        aria-describedby={message ? `${id}-error` : undefined}
        className={cn(inputClass, 'px-3.5', message ? 'border-danger' : '')}
      />
      <FieldError id={`${id}-error`} message={message} />
    </div>
  );
}

function ConsentField({
  checked,
  onChange,
  errors,
  disabled,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  errors: FieldErrors;
  disabled: boolean;
}) {
  const message = errors.acceptTerms;
  return (
    <div>
      {/* The shop has no Privacy/Terms pages yet, so the consent sentence states
          the purpose plainly instead of linking to a page that does not exist. */}
      <label
        htmlFor="auth-consent"
        className="flex items-start gap-3 min-h-[44px] cursor-pointer text-xs leading-relaxed text-body"
      >
        <input
          id="auth-consent"
          name="acceptTerms"
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          aria-invalid={message ? true : undefined}
          aria-describedby={message ? 'auth-consent-error' : undefined}
          className="mt-0.5 w-5 h-5 shrink-0 rounded-card border border-line-strong accent-accent cursor-pointer"
        />
        <span>{AUTH_HY.CONSENT}</span>
      </label>
      <FieldError id="auth-consent-error" message={message} />
    </div>
  );
}

function PrimaryButton({
  children,
  type,
  loading,
  loadingText,
}: {
  children: React.ReactNode;
  type: 'submit';
  loading: boolean;
  loadingText: string;
}) {
  return (
    <button
      type={type}
      disabled={loading}
      className="btn-tactile min-h-[48px] w-full inline-flex items-center justify-center gap-2 rounded-control bg-ink hover:bg-accent disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors duration-hover cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : null}
      <span>{loading ? loadingText : children}</span>
    </button>
  );
}

function TabLink({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-[44px] inline-flex items-center rounded text-xs font-bold text-accent hover:text-accent-hover transition-colors duration-hover cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {children}
    </button>
  );
}
