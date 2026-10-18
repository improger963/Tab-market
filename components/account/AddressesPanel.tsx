/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

/**
 * `/account/addresses` — the saved delivery addresses that make checkout faster.
 *
 * Add, edit, delete and "set default" all write through the cookie-authenticated
 * endpoints and update the loaded list from the server's own response, so the
 * screen never shows a state the backend does not have. Deleting promotes
 * nothing client-side: the response carries the surviving rows as the server sees
 * them.
 *
 * A non-Yerevan city always shows the regional delivery terms. Nothing here ever
 * claims free delivery outside Yerevan — the cost comes from the single
 * `DELIVERY_CONFIG` source of truth.
 */
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { MapPin, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { AccountApiError, deleteAddress, listAddresses, updateAddress } from '@/services/api';
import type { UserAddress } from '@/types/api';
import { AUTH_HY, hy } from '@/lib/copy/authHy';
import { DELIVERY_CONFIG } from '@/lib/config';
import { formatAMD, formatArPhone } from '@/lib/utils';
import { useAccountResource } from '@/lib/auth/useAccountResource';
import {
  addressAreaLine,
  addressDetailLine,
  isYerevanCity,
  sortAddresses,
} from '@/lib/address';
import { useToast } from '@/store/useToast';
import AddressForm from '@/components/account/AddressForm';
import ConfirmDialog from '@/components/account/ConfirmDialog';
import { AccountEmptyState, AccountPanelError } from '@/components/account/AccountFeedback';
import { AddressesSkeleton } from '@/components/account/AccountSkeleton';

function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  busy,
}: {
  address: UserAddress;
  onEdit: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onDelete: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onSetDefault: () => void;
  busy: boolean;
}) {
  const area = addressAreaLine(address);
  const detail = addressDetailLine(address);
  const regional = !isYerevanCity(address.city);

  return (
    <article className="rounded-panel border border-line bg-surface shadow-e1 p-4 sm:p-5 space-y-3">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
          <MapPin className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
          <span>{address.label?.trim() || AUTH_HY.LABEL_OTHER}</span>
        </h3>
        {address.isDefault && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent-hover">
            <Star className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{AUTH_HY.DEFAULT_ADDRESS}</span>
          </span>
        )}
      </header>

      <address className="space-y-1 text-sm not-italic leading-relaxed text-body">
        <p className="font-semibold text-ink">{area}</p>
        <p>
          {address.street}, {AUTH_HY.FIELD_BUILDING} {address.building}
        </p>
        {detail && <p className="text-muted">{detail}</p>}
        {(address.recipientName || address.recipientPhone) && (
          <p className="pt-1 text-xs text-muted">
            {address.recipientName && (
              <span>
                {AUTH_HY.FIELD_RECIPIENT}: {address.recipientName}
              </span>
            )}
            {address.recipientPhone && (
              <span className="tabular-nums">
                {address.recipientName ? ' · ' : ''}
                {AUTH_HY.FIELD_RECIPIENT_PHONE}: {formatArPhone(address.recipientPhone)}
              </span>
            )}
          </p>
        )}
        {address.comment && <p className="pt-1 text-xs text-muted">{address.comment}</p>}
      </address>

      {regional && (
        <p className="rounded-control border border-line bg-canvas px-3 py-2 text-xs leading-relaxed text-body">
          {hy('REGIONAL_TERMS', { cost: formatAMD(DELIVERY_CONFIG.regionalCost) })}
        </p>
      )}

      <footer className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
        <button
          type="button"
          onClick={onEdit}
          disabled={busy}
          className="btn-tactile inline-flex min-h-[44px] items-center gap-2 rounded-control border border-line bg-surface px-3.5 text-xs font-semibold text-body transition-colors duration-hover hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
          <span>{AUTH_HY.EDIT_ADDRESS}</span>
        </button>

        {!address.isDefault && (
          <button
            type="button"
            onClick={onSetDefault}
            disabled={busy}
            className="btn-tactile inline-flex min-h-[44px] items-center gap-2 rounded-control px-3.5 text-xs font-semibold text-accent transition-colors duration-hover hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Star className="h-4 w-4" aria-hidden="true" />
            <span>{AUTH_HY.SET_DEFAULT}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          className="btn-tactile ml-auto inline-flex min-h-[44px] items-center gap-2 rounded-control px-3.5 text-xs font-semibold text-danger transition-colors duration-hover hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          <span>{AUTH_HY.DELETE_ADDRESS}</span>
        </button>
      </footer>
    </article>
  );
}

export default function AddressesPanel() {
  const { status, data, error, reload, setData } = useAccountResource(listAddresses);

  const [editing, setEditing] = useState<{ id: string | null } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<UserAddress | null>(null);
  const [busy, setBusy] = useState(false);

  // Focus is handed back to the control that opened a form or a dialog; losing
  // it to the top of the page is what makes a keyboard pass feel broken.
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const addresses = useMemo(() => sortAddresses(data ?? []), [data]);

  const openForm = (event: React.MouseEvent<HTMLButtonElement>, id: string | null) => {
    returnFocusRef.current = event.currentTarget;
    setEditing({ id });
  };

  const closeForm = useCallback(() => {
    setEditing(null);
    returnFocusRef.current?.focus();
    returnFocusRef.current = null;
  }, []);

  function handleSaved(address: UserAddress) {
    const list = data ?? [];
    const known = list.some((row) => row.id === address.id);
    const merged = known
      ? list.map((row) => (row.id === address.id ? address : row))
      : [...list, address];
    // The server keeps exactly ONE default and demotes the others in the same
    // write, so the local list mirrors that rule instead of trusting the flags it
    // already had — otherwise a new default and the old one both wear the badge
    // until the next reload.
    const next = address.isDefault
      ? merged.map((row) => (row.id === address.id ? row : { ...row, isDefault: false }))
      : merged;
    setData(next);
    closeForm();
  }

  async function handleSetDefault(address: UserAddress) {
    if (busy) return;
    setBusy(true);
    try {
      const saved = await updateAddress(address.id, { isDefault: true });
      // Only the server's row is trusted for the new default; every other row
      // loses the flag locally, so no second round trip is needed.
      setData(
        (data ?? []).map((row) => (row.id === saved.id ? saved : { ...row, isDefault: false }))
      );
    } catch (cause) {
      useToast.getState().showToast(
        cause instanceof AccountApiError ? cause.message : AUTH_HY.ERR_UNKNOWN
      );
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete || busy) return;
    setBusy(true);
    try {
      const remaining = await deleteAddress(pendingDelete.id);
      setData(remaining);
      useToast.getState().showToast(AUTH_HY.ADDRESS_DELETED_TOAST);
      setPendingDelete(null);
      returnFocusRef.current?.focus();
      returnFocusRef.current = null;
    } catch (cause) {
      useToast.getState().showToast(
        cause instanceof AccountApiError ? cause.message : AUTH_HY.ERR_UNKNOWN
      );
    } finally {
      setBusy(false);
    }
  }

  if (status === 'loading') return <AddressesSkeleton />;

  if (status === 'error') {
    return <AccountPanelError message={error ?? AUTH_HY.ACCOUNT_LOAD_ERROR} onRetry={reload} />;
  }

  const editingAddress = editing?.id ? addresses.find((row) => row.id === editing.id) ?? null : null;

  return (
    <div className="space-y-4">
      {editing && (
        <AddressForm
          // Remount per target: a draft for one address must never leak into the
          // form for another one.
          key={editing.id ?? 'new'}
          initial={editingAddress}
          // Only a first address is offered as the default: pre-ticking it every
          // time would quietly steal the flag from the one on file.
          suggestDefault={addresses.length === 0}
          onCancel={closeForm}
          onSaved={handleSaved}
        />
      )}

      {addresses.length === 0 && !editing ? (
        <AccountEmptyState
          icon={<MapPin className="h-7 w-7" aria-hidden="true" />}
          title={AUTH_HY.NO_ADDRESSES}
          hint={AUTH_HY.NO_ADDRESSES_HINT}
        />
      ) : (
        addresses.map((address) => (
          <AddressCard
            key={address.id}
            address={address}
            busy={busy}
            onEdit={(event) => openForm(event, address.id)}
            onDelete={(event) => {
              returnFocusRef.current = event.currentTarget;
              setPendingDelete(address);
            }}
            onSetDefault={() => void handleSetDefault(address)}
          />
        ))
      )}

      <div className="pt-1">
        <button
          type="button"
          onClick={(event) => openForm(event, null)}
          disabled={busy || editing !== null}
          className="btn-tactile inline-flex min-h-[48px] items-center gap-2 rounded-control border border-line bg-surface px-5 text-sm font-semibold text-ink transition-colors duration-hover hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>{AUTH_HY.ADD_ADDRESS}</span>
        </button>
      </div>

      {pendingDelete && (
        <ConfirmDialog
          title={AUTH_HY.DELETE_ADDRESS_TITLE}
          body={AUTH_HY.DELETE_ADDRESS_BODY}
          confirmLabel={AUTH_HY.DELETE_ADDRESS}
          busy={busy}
          onConfirm={() => void confirmDelete()}
          onCancel={() => {
            setPendingDelete(null);
            returnFocusRef.current?.focus();
            returnFocusRef.current = null;
          }}
        />
      )}
    </div>
  );
}
