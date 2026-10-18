/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Phone, Send } from 'lucide-react';
import {
  LIMITS,
  CONTACT_TOPICS,
  validateContact,
  type ContactTopic,
  type FieldErrors,
} from '@/lib/auth/schema';
import { createContactMessage, AccountApiError, type ContactMessagePayload } from '@/services/api';
import { accountInputClass, AccountFieldError } from '@/components/account/Field';
import { AUTH_HY } from '@/lib/copy/authHy';
import { HY } from '@/lib/copy/hy';
import { PAGES_HY } from '@/lib/copy/pagesHy';
import { business } from '@/config/site';
import { cn, formatArPhone } from '@/lib/utils';

/** Select option labels, sentence case, keyed by the shared schema values.
 *  There is deliberately NO wholesale/B2B option — the form is for customers. */
const TOPIC_LABELS: Record<ContactTopic, string> = {
  consultation: PAGES_HY.TOPIC_CONSULT,
  product: PAGES_HY.TOPIC_PRODUCT,
  delivery: PAGES_HY.TOPIC_DELIVERY,
  other: PAGES_HY.TOPIC_OTHER,
};

/** Focus order for "move focus to the first invalid field". */
const FIELD_ORDER = ['fullName', 'phone', 'topic', 'message', 'consent'] as const;
type FieldId = (typeof FIELD_ORDER)[number];

/**
 * "I agree," — the verified opening clause of AUTH_HY.CONSENT, reused so the
 * consent line stays byte-true. The Privacy page does not exist yet in this
 * project, so the link term is rendered as plain text, NOT as a fake href
 * (reported as a missing page).
 */
const CONSENT_AGREE = AUTH_HY.CONSENT.slice(0, AUTH_HY.CONSENT.indexOf(',') + 1);

type SubmitStatus = 'idle' | 'pending' | 'success' | 'error';

export default function ContactForm() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState<'' | ContactTopic>('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [serverError, setServerError] = useState('');

  const honeypotRef = useRef<HTMLInputElement>(null);
  const fieldRefs = useRef<Partial<Record<FieldId, HTMLElement | null>>>({});
  // Double-submit guard: one in-flight promise per composed payload. A second
  // click (or a re-fire of the same content) reuses it instead of re-posting.
  const inFlightRef = useRef<{ key: string; promise: Promise<{ id: string }> } | null>(null);

  const setFieldRef = (id: FieldId) => (el: HTMLElement | null) => {
    fieldRefs.current[id] = el;
  };

  const focusFirstInvalid = (nextErrors: FieldErrors): void => {
    for (const id of FIELD_ORDER) {
      if (nextErrors[id]) {
        fieldRefs.current[id]?.focus();
        return;
      }
    }
  };

  const resetForm = (): void => {
    setFullName('');
    setPhone('');
    setTopic('');
    setMessage('');
    setConsent(false);
    setErrors({});
    setServerError('');
    if (honeypotRef.current) honeypotRef.current.value = '';
  };

  const sendInquiry = async (value: {
    name: string;
    phone: string;
    topic: ContactTopic;
    message: string;
  }): Promise<void> => {
    setStatus('pending');
    setServerError('');

    const payload: ContactMessagePayload = {
      name: value.name,
      phone: value.phone,
      topic: value.topic,
      message: value.message,
      consent: true,
      // Honeypot: a human never fills it; the server drops the bot silently.
      website: honeypotRef.current?.value ?? '',
    };

    const key = JSON.stringify([value, payload.website]);
    let request =
      inFlightRef.current && inFlightRef.current.key === key
        ? inFlightRef.current.promise
        : undefined;
    if (!request) {
      request = createContactMessage(payload);
      inFlightRef.current = { key, promise: request };
    }

    try {
      await request;
      resetForm();
      setStatus('success');
    } catch (error) {
      const fallback = AUTH_HY.ERR_UNKNOWN;
      if (error instanceof AccountApiError) {
        // Server field errors land in the same shape the client validator uses.
        if (Object.keys(error.fields).length > 0) {
          setErrors(error.fields);
          focusFirstInvalid(error.fields);
        }
        setServerError(error.message || fallback);
      } else {
        setServerError(fallback);
      }
      setStatus('error');
    } finally {
      if (inFlightRef.current?.key === key) inFlightRef.current = null;
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (status === 'pending') return;

    const checked = validateContact({ name: fullName, phone, topic, message, consent });
    if (!checked.ok) {
      setErrors(checked.errors);
      focusFirstInvalid(checked.errors);
      return;
    }
    setErrors({});
    await sendInquiry(checked.value);
  };

  // --- Success replaces the form; the live region announces it -------------
  if (status === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-panel border border-line bg-surface p-6 shadow-e1 flex items-start gap-4"
      >
        <CheckCircle2 className="h-6 w-6 shrink-0 text-success" aria-hidden="true" />
        <div className="space-y-3 min-w-0">
          <p className="text-sm font-semibold leading-relaxed text-ink hyphens-auto">
            {PAGES_HY.SUCCESS_TITLE}
          </p>
          <a
            href={`tel:${business.phones[0].e164}`}
            className="inline-flex min-h-[44px] items-center gap-2 text-sm font-bold text-accent hover:text-accent-hover transition-colors duration-hover rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            <span>
              {HY.CALL} {business.phones[0].display}
            </span>
          </a>
        </div>
      </div>
    );
  }

  const pending = status === 'pending';

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Honeypot: off-screen instead of display:none (bots skip hidden fields),
          unfocusable and unnamed for assistive tech. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-px w-px overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input
          ref={honeypotRef}
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      {status === 'error' && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-control border border-danger/20 bg-danger/10 p-4 text-xs font-bold text-danger"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <div className="space-y-2 min-w-0">
            <p className="hyphens-auto">{serverError}</p>
            {/* Phone fallback: the form is not the only way to reach the shop. */}
            <div className="flex flex-wrap items-center gap-2">
              {business.phones.slice(0, 2).map((p) => (
                <a
                  key={p.e164}
                  href={`tel:${p.e164}`}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-control px-2 text-xs font-bold text-ink hover:text-accent transition-colors duration-hover tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Phone className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                  {p.display}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Name field */}
      <div className="min-w-0">
        <label htmlFor="fullName" className="mb-1.5 block text-xs font-bold text-body">
          {AUTH_HY.FIELD_FULL_NAME}
          <span className="text-danger" aria-hidden="true">
            {' '}
            *
          </span>
        </label>
        <input
          ref={setFieldRef('fullName')}
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          placeholder={AUTH_HY.NAME_PLACEHOLDER}
          value={fullName}
          maxLength={LIMITS.fullNameMax}
          onChange={(e) => setFullName(e.target.value)}
          aria-required="true"
          aria-invalid={errors.fullName ? true : undefined}
          aria-describedby={errors.fullName ? 'fullName-error' : undefined}
          className={cn(accountInputClass, errors.fullName ? 'border-danger' : 'border-line')}
        />
        <AccountFieldError id="fullName-error" message={errors.fullName} />
      </div>

      {/* Phone — existing progressive mask, canonical form on submit */}
      <div className="min-w-0">
        <label htmlFor="phone" className="mb-1.5 block text-xs font-bold text-body">
          {AUTH_HY.FIELD_PHONE}
          <span className="text-danger" aria-hidden="true">
            {' '}
            *
          </span>
        </label>
        <div className="relative">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-0 flex h-12 items-center text-sm font-medium text-muted tabular-nums"
          >
            +374
          </span>
          <input
            ref={setFieldRef('phone')}
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={AUTH_HY.PHONE_PLACEHOLDER}
            value={phone}
            maxLength={16}
            onChange={(e) => setPhone(formatArPhone(e.target.value))}
            aria-required="true"
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
            className={cn(
              accountInputClass,
              'pl-16',
              errors.phone ? 'border-danger' : 'border-line',
            )}
          />
        </div>
        <AccountFieldError id="phone-error" message={errors.phone} />
      </div>

      {/* Topic select */}
      <div className="min-w-0">
        <label htmlFor="topic" className="mb-1.5 block text-xs font-bold text-body">
          {PAGES_HY.FIELD_TOPIC}
          <span className="text-danger" aria-hidden="true">
            {' '}
            *
          </span>
        </label>
        <select
          ref={setFieldRef('topic')}
          id="topic"
          name="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value as '' | ContactTopic)}
          aria-required="true"
          aria-invalid={errors.topic ? true : undefined}
          aria-describedby={errors.topic ? 'topic-error' : undefined}
          className={cn(
            accountInputClass,
            'appearance-none',
            errors.topic ? 'border-danger' : 'border-line',
            topic === '' && 'text-faint',
          )}
        >
          <option value="" disabled>
            {PAGES_HY.SELECT_PLACEHOLDER}
          </option>
          {CONTACT_TOPICS.map((value) => (
            <option key={value} value={value}>
              {TOPIC_LABELS[value]}
            </option>
          ))}
        </select>
        <AccountFieldError id="topic-error" message={errors.topic} />

        {/* Order questions route to the tracker; this form never touches
            order status itself. */}
        {topic === 'delivery' ? (
          <Link
            href="/track-order"
            className="mt-1 inline-flex min-h-[44px] items-center text-xs font-bold text-accent hover:text-accent-hover transition-colors duration-hover rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {PAGES_HY.TRACK_ORDER_LINK}
          </Link>
        ) : null}
      </div>

      {/* Message (10–1000 chars) */}
      <div className="min-w-0">
        <label htmlFor="message" className="mb-1.5 block text-xs font-bold text-body">
          {PAGES_HY.FIELD_MESSAGE}
          <span className="text-danger" aria-hidden="true">
            {' '}
            *
          </span>
        </label>
        <textarea
          ref={setFieldRef('message')}
          id="message"
          name="message"
          rows={5}
          placeholder={PAGES_HY.MESSAGE_HINT}
          value={message}
          minLength={LIMITS.messageMin}
          maxLength={LIMITS.messageMax}
          onChange={(e) => setMessage(e.target.value)}
          aria-required="true"
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={cn('message-counter', errors.message && 'message-error') || undefined}
          className={cn(
            accountInputClass,
            'h-auto py-3 resize-y leading-relaxed',
            errors.message ? 'border-danger' : 'border-line',
          )}
        />
        <p id="message-counter" className="mt-1.5 text-right text-xs text-muted tabular-nums" aria-hidden="true">
          {message.length} / {LIMITS.messageMax}
        </p>
        <AccountFieldError id="message-error" message={errors.message} />
      </div>

      {/* Consent — the Privacy page is missing, so the policy term is text,
          not a fake link (reported). */}
      <div className="min-w-0">
        <label
          htmlFor="consent"
          className="flex min-h-[44px] cursor-pointer items-start gap-3 text-xs leading-relaxed text-body"
        >
          <input
            ref={setFieldRef('consent')}
            id="consent"
            name="consent"
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            aria-required="true"
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? 'consent-error' : undefined}
            className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-line text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <span className="hyphens-auto">
            {CONSENT_AGREE}{' '}
            <span className="font-bold text-ink">{PAGES_HY.PRIVACY_LINK}</span>
          </span>
        </label>
        <AccountFieldError id="consent-error" message={errors.consent} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className={cn(
          'btn-tactile inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-control bg-ink px-6 text-sm font-semibold text-white transition-colors duration-hover hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
          pending && 'cursor-not-allowed opacity-60 hover:bg-ink',
        )}
      >
        <Send className="h-4 w-4 text-white" aria-hidden="true" />
        <span>{pending ? PAGES_HY.SENDING : status === 'error' ? AUTH_HY.RETRY : PAGES_HY.SUBMIT}</span>
      </button>
    </form>
  );
}
