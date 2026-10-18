/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * AUTH UI STATE — deliberately the smallest store in the app.
 *
 * It is plain Zustand with NO `persist`: nothing here survives a reload, and
 * nothing sensitive is ever written to `localStorage`/`sessionStorage`. The only
 * customer data it holds is the non-sensitive snapshot (`id`, `fullName`, masked
 * phone) that the server already inlined into the document. Identity comes from
 * the `httpOnly` cookie, so a reload always re-reads the truth from the server —
 * this store can never keep a logged-out tab looking logged in.
 *
 * Passwords exist only inside the form inputs and the request body; they are
 * never assigned to a field of this store.
 */
import { create } from 'zustand';
import type { AuthMode, SessionSnapshot, User } from '@/types/api';
import {
  AccountApiError,
  getMe,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
} from '@/services/api';
import { validateLogin, validateRegister, type FieldErrors } from '@/lib/auth/schema';
import { maskPhone } from '@/lib/utils';
import { readInjectedSnapshot, sanitizeNextPath } from '@/lib/auth/session';
import { AUTH_HY } from '@/lib/copy/authHy';

export type AuthStatus = 'idle' | 'loading' | 'error';

/** The one transient notice the modal owns outside the form fields. */
export type AuthNotice = 'reset_unavailable' | null;

export interface RawLoginInput {
  phone: string;
  password: string;
}

export interface RawRegisterInput extends RawLoginInput {
  fullName: string;
  acceptTerms: boolean;
}

/**
 * Project a full `User` down to what may live in the client store: the raw phone
 * stays in the response of the call that needs it (checkout prefill) and never
 * becomes global state.
 */
function snapshotFor(user: User): SessionSnapshot {
  return { id: user.id, fullName: user.fullName, maskedPhone: maskPhone(user.phone) };
}

function failureOf(error: unknown): { message: string; fields: FieldErrors } {
  if (error instanceof AccountApiError) {
    return { message: error.message, fields: error.fields };
  }
  return { message: AUTH_HY.ERR_UNKNOWN, fields: {} };
}

interface AuthStore {
  isAuthModalOpen: boolean;
  mode: AuthMode;
  status: AuthStatus;
  error: string | null;
  fieldErrors: FieldErrors;
  notice: AuthNotice;
  user: SessionSnapshot | null;
  hydrated: boolean;
  /** Where to return after a successful login. Always a validated local path. */
  next: string | null;

  hydrate: () => void;
  openAuthModal: (mode: AuthMode, next?: string | null) => void;
  closeAuthModal: () => void;
  setMode: (mode: AuthMode) => void;
  clearFeedback: () => void;
  showResetUnavailable: () => void;
  login: (input: RawLoginInput) => Promise<boolean>;
  register: (input: RawRegisterInput) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

export const useAuth = create<AuthStore>((set, get) => ({
  isAuthModalOpen: false,
  mode: 'login',
  status: 'idle',
  error: null,
  fieldErrors: {},
  notice: null,
  user: null,
  hydrated: false,
  next: null,

  /**
   * Reads the server-inlined snapshot. Called before the first render, which is
   * what keeps the header from flashing the logged-out state and from hydrating
   * a session the server never confirmed.
   */
  hydrate: () => {
    if (get().hydrated) return;
    set({ user: readInjectedSnapshot(), hydrated: true });
  },

  openAuthModal: (mode, next) => {
    set({
      isAuthModalOpen: true,
      mode,
      // Re-validated here: a `?next=` from a URL is attacker-controlled text.
      next: sanitizeNextPath(next ?? null),
      status: 'idle',
      error: null,
      fieldErrors: {},
      notice: null,
    });
  },

  closeAuthModal: () => {
    set({
      isAuthModalOpen: false,
      status: 'idle',
      error: null,
      fieldErrors: {},
      notice: null,
      next: null,
    });
  },

  setMode: (mode) => {
    if (get().mode === mode) return;
    set({ mode, status: 'idle', error: null, fieldErrors: {}, notice: null });
  },

  clearFeedback: () => set({ status: 'idle', error: null, fieldErrors: {}, notice: null }),

  showResetUnavailable: () => set({ notice: 'reset_unavailable', error: null }),

  login: async ({ phone, password }) => {
    // The same schema the server applies, run first, so an obviously incomplete
    // form never leaves the browser.
    const checked = validateLogin({ phone, password });
    if (!checked.ok) {
      set({ status: 'error', error: null, fieldErrors: checked.errors });
      return false;
    }

    set({ status: 'loading', error: null, fieldErrors: {}, notice: null });
    try {
      const user = await apiLogin(checked.value);
      set({
        user: snapshotFor(user),
        status: 'idle',
        error: null,
        fieldErrors: {},
        isAuthModalOpen: false,
        notice: null,
      });
      return true;
    } catch (error) {
      const { message, fields } = failureOf(error);
      set({ status: 'error', error: message, fieldErrors: fields });
      return false;
    }
  },

  register: async ({ fullName, phone, password, acceptTerms }) => {
    const checked = validateRegister({ fullName, phone, password, acceptTerms });
    if (!checked.ok) {
      set({ status: 'error', error: null, fieldErrors: checked.errors });
      return false;
    }

    set({ status: 'loading', error: null, fieldErrors: {}, notice: null });
    try {
      // Registration signs the customer in: the server mints the session in the
      // same response, so there is no second round trip and no reload needed.
      const user = await apiRegister(checked.value);
      set({
        user: snapshotFor(user),
        status: 'idle',
        error: null,
        fieldErrors: {},
        isAuthModalOpen: false,
        notice: null,
      });
      return true;
    } catch (error) {
      const { message, fields } = failureOf(error);
      set({ status: 'error', error: message, fieldErrors: fields });
      return false;
    }
  },

  /**
   * Signs out without touching the cart: an abandoned basket is the customer's,
   * not the session's, and losing it on logout is the fastest way to teach
   * people never to create an account.
   */
  logout: async () => {
    try {
      await apiLogout();
    } catch {
      // A failed round trip must not leave the UI claiming an account is open.
    }
    set({
      user: null,
      isAuthModalOpen: false,
      mode: 'login',
      status: 'idle',
      error: null,
      fieldErrors: {},
      notice: null,
      next: null,
    });
  },

  /**
   * The SPA equivalent of `router.refresh()`: re-reads identity through the
   * cookie. Used as a safety net when the document snapshot is missing (a cached
   * HTML response, a session started in another tab). A network blip never signs
   * anyone out — the existing snapshot stays.
   */
  refreshMe: async () => {
    try {
      const user = await getMe();
      set({ user: user ? snapshotFor(user) : null, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },
}));

/** Non-hook accessor for imperative call sites (route guards, event handlers). */
export const authStore = useAuth.getState;
