/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

/**
 * `/account/profile` — the two fields a customer may change (name, email) and
 * the one field they may not (phone).
 *
 * The save is optimistic: the row repaints from what was typed, the request runs,
 * and a rejection puts the previous server value back and shows the field
 * message. Nothing here is written to a browser store — the phone in particular
 * lives only in this component's state for as long as the screen is open. The
 * header's name updates through `refreshMe()`, which re-reads `/me` over the
 * cookie, so no reload is needed.
 *
 * Phone masking boundary: the menu and the inlined snapshot carry the masked
 * number; this screen shows the full one, because it is the owner's own private
 * profile fetched with their session, and the "changing it needs verification"
 * note is only useful next to the number they would be changing.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Lock } from 'lucide-react';
import { getMe, updateProfile, AccountApiError } from '@/services/api';
import type { User } from '@/types/api';
import { AUTH_HY } from '@/lib/copy/authHy';
import { LIMITS, sanitizeText, validateProfile, type FieldErrors } from '@/lib/auth/schema';
import { formatArPhone, formatDateDDMMYYYY } from '@/lib/utils';
import { useAccountResource } from '@/lib/auth/useAccountResource';
import { useAuth } from '@/store/useAuth';
import { useToast } from '@/store/useToast';
import { AccountField, AccountSubmit } from '@/components/account/Field';
import { AccountPanelError } from '@/components/account/AccountFeedback';
import { ProfileSkeleton } from '@/components/account/AccountSkeleton';

export default function ProfilePanel() {
  const { status, data: user, error, reload, setData } = useAccountResource(getMe);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Seed the inputs from the server once per identity. Deliberately keyed on the
  // user id and not the object: an optimistic write or a rollback must not throw
  // away what the customer is typing.
  const userId = user?.id ?? null;
  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName);
    setEmail(user.email ?? '');
    setFieldErrors({});
    setFormError(null);
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const unchanged = useMemo(
    () => !!user && fullName === user.fullName && email === (user.email ?? ''),
    [user, fullName, email]
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || saving) return;

    const checked = validateProfile({ fullName, email });
    if (!checked.ok) {
      setFieldErrors(checked.errors);
      return;
    }

    setFieldErrors({});
    setFormError(null);

    // This panel always submits the name, so the validated value is always there.
    // `validateProfile` makes it optional only for API clients that patch one
    // field at a time; the fallback keeps that optionality from leaking here.
    const nextName = checked.value.fullName ?? user.fullName;

    // Local projection of the save, so the screen reflects the change at once.
    const trimmedEmail = sanitizeText(email);
    const optimistic: User = { ...user, fullName: nextName };
    if (trimmedEmail) optimistic.email = trimmedEmail;
    else delete optimistic.email;

    const previous = user;
    setData(optimistic);
    setSaving(true);

    try {
      const saved = await updateProfile({
        fullName: nextName,
        // Sent even when empty: an empty string is the customer clearing the
        // line, which the transport must not silently drop.
        email: trimmedEmail,
      });
      setData(saved);
      // Keeps the header greeting truthful without a page reload.
      void useAuth.getState().refreshMe();
      useToast.getState().showToast(AUTH_HY.SAVE_TOAST);
    } catch (cause) {
      setData(previous);
      setFullName(previous.fullName);
      setEmail(previous.email ?? '');
      if (cause instanceof AccountApiError) {
        setFieldErrors(cause.fields);
        setFormError(cause.message);
      } else {
        setFormError(AUTH_HY.ERR_UNKNOWN);
      }
    } finally {
      setSaving(false);
    }
  }

  if (status === 'loading') return <ProfileSkeleton />;

  if (status === 'error' || !user) {
    return (
      <AccountPanelError message={error ?? AUTH_HY.ACCOUNT_LOAD_ERROR} onRetry={reload} />
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-panel border border-line bg-surface shadow-e1 p-5 sm:p-6 space-y-6"
    >
      {/* The section title comes from the shell (it is also the tab label), so
          this card only carries the account-age line. */}
      <p className="text-xs text-muted">
        <span>{AUTH_HY.PROFILE_SINCE}</span>{' '}
        <time dateTime={user.createdAt} className="tabular-nums">
          {formatDateDDMMYYYY(user.createdAt)}
        </time>
      </p>

      <div className="space-y-5">
        <AccountField
          id="profile-full-name"
          name="fullName"
          label={AUTH_HY.FIELD_FULL_NAME}
          value={fullName}
          onChange={setFullName}
          errors={fieldErrors}
          disabled={saving}
          required
          maxLength={LIMITS.fullNameMax}
          autoComplete="name"
          placeholder={AUTH_HY.NAME_PLACEHOLDER}
        />

        <AccountField
          id="profile-phone"
          name="phone"
          label={AUTH_HY.FIELD_PHONE}
          // The dial code is re-attached for display: `formatArPhone` groups the
          // 8 national digits only, and a profile screen should show the number
          // exactly as it would be dialed from abroad.
          value={`+374 ${formatArPhone(user.phone)}`}
          onChange={() => undefined}
          errors={fieldErrors}
          readOnly
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={20}
          hint={
            <>
              <span className="font-semibold text-body">{AUTH_HY.PROFILE_READONLY}.</span>{' '}
              {AUTH_HY.PROFILE_PHONE_NOTE}
            </>
          }
        />

        <AccountField
          id="profile-email"
          name="email"
          label={AUTH_HY.FIELD_EMAIL}
          value={email}
          onChange={setEmail}
          errors={fieldErrors}
          disabled={saving}
          type="email"
          inputMode="email"
          autoComplete="email"
          maxLength={LIMITS.emailMax}
          placeholder={AUTH_HY.EMAIL_PLACEHOLDER}
        />
      </div>

      <div
        aria-live="polite"
        className="empty:hidden"
      >
        {formError ? (
          <p className="mb-3 rounded-control border border-danger/25 bg-danger/10 px-3.5 py-2.5 text-xs font-semibold text-danger">
            {formError}
          </p>
        ) : null}
      </div>

      {!unchanged && !saving && (
        <p className="flex items-center gap-1.5 text-xs font-semibold text-warning">
          <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{AUTH_HY.UNSAVED_NOTE}</span>
        </p>
      )}

      <div className="flex items-center justify-end gap-3 border-t border-line pt-5">
        <AccountSubmit
          busy={saving}
          busyLabel={AUTH_HY.SAVING}
          label={AUTH_HY.SAVE}
          disabled={unchanged}
        />
      </div>
    </form>
  );
}
