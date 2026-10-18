/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

/**
 * The saved-address form, used for both creating and editing.
 *
 * Field rules are the SAME `validateAddress` the mock API (and later Laravel)
 * runs, and every input carries the matching `maxLength`, so a form the browser
 * accepts is a form the server accepts. Optional lines are always sent, empty
 * included: a `PATCH` that omits a key means "keep it", while a key sent as `""`
 * means "the customer cleared this line" — omitting them would make an entrance,
 * floor or intercom impossible to remove once typed.
 *
 * The phone field accepts any of the forms a customer has on paper and is
 * canonicalized by the shared schema; it is never stored in a browser store.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Truck } from 'lucide-react';
import { AccountApiError, createAddress, updateAddress } from '@/services/api';
import type { AddressInput, UserAddress } from '@/types/api';
import { AUTH_HY, hy } from '@/lib/copy/authHy';
import { LIMITS, validateAddress, type FieldErrors } from '@/lib/auth/schema';
import { isYerevanCity } from '@/lib/address';
import { DELIVERY_CONFIG } from '@/lib/config';
import { cn, formatAMD, formatArPhone } from '@/lib/utils';
import { useToast } from '@/store/useToast';
import { AccountField, AccountSubmit, accountInputClass } from '@/components/account/Field';

interface AddressDraft {
  label: string;
  region: string;
  city: string;
  street: string;
  building: string;
  entrance: string;
  floor: string;
  apartment: string;
  intercom: string;
  recipientName: string;
  recipientPhone: string;
  comment: string;
  isDefault: boolean;
}

const EMPTY_DRAFT: AddressDraft = {
  label: '',
  region: '',
  city: AUTH_HY.CITY_YEREVAN,
  street: '',
  building: '',
  entrance: '',
  floor: '',
  apartment: '',
  intercom: '',
  recipientName: '',
  recipientPhone: '',
  comment: '',
  isDefault: false,
};

function draftFrom(address: UserAddress): AddressDraft {
  return {
    label: address.label ?? '',
    region: address.region,
    city: address.city,
    street: address.street,
    building: address.building,
    entrance: address.entrance ?? '',
    floor: address.floor ?? '',
    apartment: address.apartment ?? '',
    intercom: address.intercom ?? '',
    recipientName: address.recipientName ?? '',
    recipientPhone: address.recipientPhone ? formatArPhone(address.recipientPhone) : '',
    comment: address.comment ?? '',
    isDefault: address.isDefault,
  };
}

const GRID = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3';

export default function AddressForm({
  initial,
  suggestDefault,
  onCancel,
  onSaved,
}: {
  initial: UserAddress | null;
  /** Only the very first address is pre-ticked as the default. */
  suggestDefault: boolean;
  onCancel: () => void;
  onSaved: (address: UserAddress, mode: 'create' | 'update') => void;
}) {
  const [draft, setDraft] = useState<AddressDraft>(() =>
    initial ? draftFrom(initial) : { ...EMPTY_DRAFT, isDefault: suggestDefault }
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof AddressDraft>(key: K) => (value: AddressDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  // The form opens from a row button or an empty state, so focus would otherwise
  // be dropped on the floor: it lands on the first field, and the browser
  // brings the form into view.
  useEffect(() => {
    document.getElementById('address-label')?.focus();
  }, []);

  // The delivery notice follows the city as it is typed, so the cost is known
  // before the customer saves — and it never claims free delivery.
  const regionalNotice = useMemo(
    () =>
      draft.city.trim() !== '' && !isYerevanCity(draft.city)
        ? hy('REGIONAL_TERMS', { cost: formatAMD(DELIVERY_CONFIG.regionalCost) })
        : null,
    [draft.city]
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const checked = validateAddress({ ...draft });
    if (!checked.ok) {
      setErrors(checked.errors);
      return;
    }
    setErrors({});
    setFormError(null);

    // Every line is sent, cleared ones included (see the file header).
    const payload: AddressInput = {
      label: draft.label.trim(),
      region: draft.region.trim(),
      city: draft.city.trim(),
      street: draft.street.trim(),
      building: draft.building.trim(),
      entrance: draft.entrance.trim(),
      floor: draft.floor.trim(),
      apartment: draft.apartment.trim(),
      intercom: draft.intercom.trim(),
      recipientName: draft.recipientName.trim(),
      // The schema validated the number, so this is either empty or E.164.
      recipientPhone: draft.recipientPhone.trim(),
      comment: draft.comment.trim(),
      isDefault: draft.isDefault,
    };

    try {
      const saved = initial
        ? await updateAddress(initial.id, payload)
        : await createAddress(payload);
      useToast.getState().showToast(AUTH_HY.ADDRESS_SAVED_TOAST);
      onSaved(saved, initial ? 'update' : 'create');
    } catch (cause) {
      if (cause instanceof AccountApiError) {
        setErrors(cause.fields);
        setFormError(cause.message);
      } else {
        setFormError(AUTH_HY.ERR_UNKNOWN);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-panel border border-line bg-surface shadow-e1 p-5 sm:p-6 space-y-6"
    >
      <h3 className="text-base font-bold text-ink">
        {initial ? AUTH_HY.EDIT_ADDRESS : AUTH_HY.NEW_ADDRESS}
      </h3>

      <div className={GRID}>
        <AccountField
          id="address-label"
          name="label"
          label={AUTH_HY.FIELD_LABEL}
          value={draft.label}
          onChange={set('label')}
          errors={errors}
          disabled={saving}
          maxLength={LIMITS.labelMax}
          placeholder={`${AUTH_HY.LABEL_HOME}, ${AUTH_HY.LABEL_WORK}`}
        />
        <AccountField
          id="address-region"
          name="region"
          label={AUTH_HY.FIELD_REGION}
          value={draft.region}
          onChange={set('region')}
          errors={errors}
          disabled={saving}
          required
          maxLength={LIMITS.regionMax}
          autoComplete="address-level1"
        />
        <AccountField
          id="address-city"
          name="city"
          label={AUTH_HY.FIELD_CITY}
          value={draft.city}
          onChange={set('city')}
          errors={errors}
          disabled={saving}
          required
          maxLength={LIMITS.cityMax}
          autoComplete="address-level2"
        />
      </div>

      <div className={GRID}>
        <AccountField
          id="address-street"
          name="street"
          label={AUTH_HY.FIELD_STREET}
          value={draft.street}
          onChange={set('street')}
          errors={errors}
          disabled={saving}
          required
          maxLength={LIMITS.streetMax}
          autoComplete="address-line1"
          className="sm:col-span-2"
        />
        <AccountField
          id="address-building"
          name="building"
          label={AUTH_HY.FIELD_BUILDING}
          value={draft.building}
          onChange={set('building')}
          errors={errors}
          disabled={saving}
          required
          maxLength={LIMITS.buildingMax}
          autoComplete="address-line2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AccountField
          id="address-entrance"
          name="entrance"
          label={AUTH_HY.FIELD_ENTRANCE}
          value={draft.entrance}
          onChange={set('entrance')}
          errors={errors}
          disabled={saving}
          maxLength={LIMITS.entranceMax}
        />
        <AccountField
          id="address-floor"
          name="floor"
          label={AUTH_HY.FIELD_FLOOR}
          value={draft.floor}
          onChange={set('floor')}
          errors={errors}
          disabled={saving}
          maxLength={LIMITS.floorMax}
          inputMode="numeric"
        />
        <AccountField
          id="address-apartment"
          name="apartment"
          label={AUTH_HY.FIELD_APARTMENT}
          value={draft.apartment}
          onChange={set('apartment')}
          errors={errors}
          disabled={saving}
          maxLength={LIMITS.apartmentMax}
          inputMode="numeric"
        />
        <AccountField
          id="address-intercom"
          name="intercom"
          label={AUTH_HY.FIELD_INTERCOM}
          value={draft.intercom}
          onChange={set('intercom')}
          errors={errors}
          disabled={saving}
          maxLength={LIMITS.intercomMax}
        />
      </div>

      <div className={GRID}>
        <AccountField
          id="address-recipient-name"
          name="recipientName"
          label={AUTH_HY.FIELD_RECIPIENT}
          value={draft.recipientName}
          onChange={set('recipientName')}
          errors={errors}
          disabled={saving}
          maxLength={LIMITS.recipientNameMax}
          autoComplete="name"
        />
        <AccountField
          id="address-recipient-phone"
          name="recipientPhone"
          label={AUTH_HY.FIELD_RECIPIENT_PHONE}
          value={draft.recipientPhone}
          onChange={(value) => set('recipientPhone')(formatArPhone(value))}
          errors={errors}
          disabled={saving}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={20}
          placeholder={AUTH_HY.PHONE_PLACEHOLDER}
        />
      </div>

      <div>
        <label htmlFor="address-comment" className="mb-1.5 block text-xs font-bold text-body">
          {AUTH_HY.FIELD_COMMENT}
          <span className="ml-1 font-medium text-faint">{AUTH_HY.OPTIONAL_SUFFIX}</span>
        </label>
        <textarea
          id="address-comment"
          name="comment"
          rows={3}
          value={draft.comment}
          maxLength={LIMITS.commentMax}
          disabled={saving}
          onChange={(event) => set('comment')(event.target.value)}
          aria-invalid={errors.comment ? true : undefined}
          aria-describedby={errors.comment ? 'address-comment-error' : undefined}
          className={cn(
            accountInputClass,
            'h-auto min-h-[92px] resize-y py-3 leading-relaxed',
            errors.comment ? 'border-danger' : 'border-line'
          )}
        />
        <div aria-live="polite" className="empty:hidden">
          {errors.comment ? (
            <p
              id="address-comment-error"
              className="mt-1.5 text-xs font-semibold leading-relaxed text-danger"
            >
              {errors.comment}
            </p>
          ) : null}
        </div>
      </div>

      {regionalNotice && (
        <p className="flex items-start gap-2.5 rounded-control border border-line bg-canvas px-3.5 py-3 text-xs leading-relaxed text-body">
          <Truck className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
          <span>{regionalNotice}</span>
        </p>
      )}

      <label className="flex min-h-[44px] cursor-pointer items-start gap-3 text-sm text-body">
        <input
          type="checkbox"
          name="isDefault"
          checked={draft.isDefault}
          disabled={saving}
          onChange={(event) => set('isDefault')(event.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 accent-accent"
        />
        <span>{AUTH_HY.DEFAULT_THIS}</span>
      </label>

      <div aria-live="polite" className="empty:hidden">
        {formError ? (
          <p className="rounded-control border border-danger/25 bg-danger/10 px-3.5 py-2.5 text-xs font-semibold text-danger">
            {formError}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="btn-tactile inline-flex min-h-[48px] items-center justify-center rounded-control border border-line bg-surface px-5 text-sm font-semibold text-body transition-colors duration-hover hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          {AUTH_HY.CANCEL}
        </button>
        <AccountSubmit
          busy={saving}
          busyLabel={AUTH_HY.SAVING}
          label={AUTH_HY.SAVE}
        />
      </div>
    </form>
  );
}
