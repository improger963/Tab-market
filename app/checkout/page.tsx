/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronRight, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/store/useCart';
import { AccountApiError, attachOrder, createAddress, generateOrderId, recordClientOrder } from '@/services/api';
import { formatArPhone, normalizeArPhone } from '@/lib/utils';
import {
  addressMatchesCheckoutFields,
  addressToCheckoutFields,
  checkoutFieldsToAddressInput,
} from '@/lib/address';
import { useCheckoutAccount } from '@/lib/auth/useCheckoutAccount';
import { AUTH_HY } from '@/lib/copy/authHy';
import { ORDER_STATUS, type UserOrderItem } from '@/types/api';
import { useAuth } from '@/store/useAuth';
import { useToast } from '@/store/useToast';
import CheckoutForm, {
  CheckoutAccountUi,
  CheckoutFormData,
} from '@/components/checkout/CheckoutForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import OrderSuccess from '@/components/checkout/OrderSuccess';
import RecentlyViewed from '@/components/product/RecentlyViewed';

export default function CheckoutPage() {
  const { items, totalPrice, getFinalTotal } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    phone: '',
    email: '',
    deliveryMethod: 'yerevan',
    addressStreet: '',
    addressApartment: '',
    paymentMethod: 'card',
    orderNotes: '',
  });

  // --- OPTIONAL ACCOUNT LAYER -------------------------------------------------
  // Never a gate. A guest fires no account request and sees one suggestion line;
  // a signed-in customer just gets the same fields filled in for them.
  const account = useCheckoutAccount();
  // Prefill is a one-shot: a late response must never overwrite what the
  // customer is busy typing.
  const prefillDoneRef = useRef(false);

  useEffect(() => {
    const profile = account.me;
    if (!profile || prefillDoneRef.current) return;
    prefillDoneRef.current = true;

    const saved = account.defaultAddress
      ? addressToCheckoutFields(account.defaultAddress)
      : null;

    // Only untouched fields receive a value, and this runs after the first paint
    // — nothing is rendered twice from different data, so there is no hydration
    // mismatch and the inputs keep their reserved heights.
    setFormData((prev) => ({
      ...prev,
      fullName: prev.fullName || profile.fullName,
      phone: prev.phone || formatArPhone(profile.phone),
      email: prev.email || profile.email || '',
      addressStreet: prev.addressStreet || saved?.addressStreet || '',
      addressApartment: prev.addressApartment || saved?.addressApartment || '',
    }));
  }, [account.me, account.defaultAddress]);

  const handleSelectAddress = (id: string | null) => {
    account.selectAddress(id);
    // Picking "other address" keeps the text: clearing it would throw away work.
    if (!id) return;
    const chosen = account.addresses.find((row) => row.id === id);
    if (!chosen) return;
    setFormData((prev) => ({ ...prev, ...addressToCheckoutFields(chosen) }));
  };

  const accountUi: CheckoutAccountUi | null = account.authed
    ? {
        addresses: account.addresses,
        loading: !account.loaded,
        selectedAddressId: account.selectedAddressId,
        onSelectAddress: handleSelectAddress,
        saveAddress: account.saveAddress,
        onToggleSaveAddress: account.setSaveAddress,
        saveNote: account.saveNote,
      }
    : null;

  const openAuthModal = () => useAuth.getState().openAuthModal('login');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccessNumber, setOrderSuccessNumber] = useState<string | null>(null);
  // Idempotency token: guards against double-submit (including same-tick re-entry).
  const submitTokenRef = useRef<string | null>(null);

  const subtotal = useMemo(() => {
    return isMounted ? totalPrice() : 0;
  }, [isMounted, totalPrice, items]);

  // Free delivery in Yerevan or pickup (0 AMD)
  const shippingCost = 0;

  /**
   * «Save this address for next time» — opt-in, and it creates a NEW address.
   * It never patches the address that was picked: an edit made here belongs to
   * this order, not to the profile, until the customer explicitly asks.
   */
  const saveAddressFromCheckout = async () => {
    const chosen = account.addresses.find((row) => row.id === account.selectedAddressId);
    // Already on file, verbatim: saving it again would only create a duplicate.
    if (chosen && addressMatchesCheckoutFields(chosen, formData)) return;
    try {
      await createAddress(
        checkoutFieldsToAddressInput(formData.addressStreet, formData.addressApartment)
      );
      useToast.getState().showToast(AUTH_HY.ADDRESS_SAVED_TOAST);
    } catch (cause) {
      // An optional save may fail without touching the order. The wording is the
      // server's own localized reason, rendered under the checkbox.
      account.setSaveNote(
        cause instanceof AccountApiError ? cause.message : AUTH_HY.ERR_UNKNOWN
      );
    }
  };

  /**
   * Both account writes happen before the confirmation screen and neither can
   * undo a purchase: if the order is not filed under the account, or the address
   * is not saved, the customer still gets the exact same success view a guest
   * gets, with the same working order number.
   */
  const finishOrder = async (
    number: string,
    orderItems: UserOrderItem[],
    orderTotal: number,
    customer: { fullName: string; phone: string },
    delivery: { method: string },
    payment: { method: string }
  ) => {
    // File the order in the local ledger first (guest or signed-in): with no
    // backend on this host this is what keeps /track-order and the account
    // order list working for the number the customer just received.
    recordClientOrder({
      number,
      status: ORDER_STATUS.RECEIVED,
      total: orderTotal,
      items: orderItems,
      customerName: customer.fullName,
      phone: customer.phone,
      paymentMethod: payment.method,
      deliveryMethod: delivery.method,
    });

    if (useAuth.getState().user) {
      try {
        await attachOrder({
          number,
          status: ORDER_STATUS.RECEIVED,
          total: orderTotal,
          items: orderItems,
        });
      } catch {
        // Nothing is logged: the payload carries titles and totals.
      }
      if (account.saveAddress) await saveAddressFromCheckout();
    }

    setOrderSuccessNumber(number);
    setIsSubmitting(false);
    // Success view replaces the form: snap to its top instantly. A smooth
    // animated scroll reads as a violent jump from the middle of the form.
    window.scrollTo(0, 0);
  };

  const handleSubmit = () => {
    if (isSubmitting || submitTokenRef.current) return; // prevent double-submit

    if (!formData.fullName.trim()) {
      alert('Խնդրում ենք լրացնել Ձեր անունը և ազգանունը:');
      return;
    }
    const normalizedPhone = normalizeArPhone(formData.phone);
    if (!normalizedPhone) {
      alert('Խնդրում ենք լրացնել հեռախոսահամարը ճիշտ ձևաչափով՝ +374 (XX) XX-XX-XX:');
      return;
    }
    if (formData.deliveryMethod === 'yerevan' && !formData.addressStreet.trim()) {
      alert('Խնդրում ենք լրացնել Երևանի առաքման հասցեն (փողոց, շենք):');
      return;
    }

    // Order number is owned by the API layer, generated once per submission.
    const orderId = generateOrderId();
    submitTokenRef.current = orderId;

    // Snapshotted now: the confirmation screen empties the cart, and an order
    // filed under the account must list the lines as they were at purchase.
    const orderItems: UserOrderItem[] = items.map((item) => ({
      productId: String(item.product.id),
      title: item.product.title,
      image: item.product.images[0] ?? null,
      quantity: item.quantity,
    }));
    const orderTotal = getFinalTotal(shippingCost);

    // Canonical values for the local ledger: the phone is stored in the same
    // E.164 display form the session user uses, and the form's delivery token
    // is mapped onto the API's `DeliveryMethod` enum.
    const ledgerCustomer = { fullName: formData.fullName.trim(), phone: normalizedPhone };
    const ledgerDelivery = {
      method: formData.deliveryMethod === 'yerevan' ? 'yerevan_delivery' : 'showroom_pickup',
    };
    const ledgerPayment = { method: formData.paymentMethod };

    setIsSubmitting(true);
    setTimeout(() => {
      void finishOrder(orderId, orderItems, orderTotal, ledgerCustomer, ledgerDelivery, ledgerPayment);
    }, 900);
  };

  if (orderSuccessNumber) {
    return (
      <div className="container-lux py-10">
        <OrderSuccess orderData={formData} orderNumber={orderSuccessNumber} />
      </div>
    );
  }

  if (isMounted && items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-panel bg-canvas text-faint flex items-center justify-center mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-ink tracking-tight">
            Ձեր զամբյուղը դատարկ է
          </h1>
          <p className="text-xs sm:text-sm text-muted max-w-sm mx-auto leading-relaxed">
            Պատվեր ձևակերպելու համար ավելացրեք ապրանքներ tab.am կատալոգից կամ օգտագործեք Կոդով որոնումը:
          </p>
        </div>
        <Link
          href="/catalog"
          className="min-h-[48px] inline-flex items-center gap-2 px-8 py-3 rounded-panel bg-ink hover:bg-accent text-white font-bold text-xs transition-all shadow-e1 active:scale-98"
        >
          <span>Անցնել Կատալոգ</span>
          <ArrowRight className="w-4 h-4 text-accent" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-lux py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted">
        <Link href="/" className="hover:text-accent transition-colors">
          Գլխավոր
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-muted" />
        <Link href="/catalog" className="hover:text-accent transition-colors">
          Կատալոգ
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-muted" />
        <span className="text-ink font-bold">Պատվերի Ձևակերպում (1-Step Checkout)</span>
      </nav>

      <div>
        <h1 className="text-2xl sm:text-4xl font-bold text-ink tracking-tight">
          Պատվերի Ձևակերպում
        </h1>
        <p className="text-xs sm:text-sm text-muted mt-1">
          Ապրանքները ապահով ամրագրվում են Մելքումովի 40/1 սրահի պահեստում (Անվճար առաքում Երևանում):
        </p>
      </div>

      {/* 2-Column Checkout Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7">
          <CheckoutForm
            data={formData}
            onChange={setFormData}
            shippingCost={shippingCost}
            account={accountUi}
            onOpenAuth={account.authed ? null : openAuthModal}
          />
        </div>

        <div className="lg:col-span-5 lg:sticky lg:top-[calc(var(--topbar-h)+var(--header-h)+1rem)]">
          <OrderSummary
            shippingCost={shippingCost}
            deliveryMethod={formData.deliveryMethod}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />
        </div>
      </div>

      <RecentlyViewed />
    </div>
  );
}
