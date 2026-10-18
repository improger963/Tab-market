/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * ACCOUNT INPUT CONTRACT — the ONE place field rules are defined.
 *
 * The mock API server imports this module directly, and so do the browser
 * forms, which is what keeps client- and server-side validation from ever
 * drifting apart. It is deliberately free of Node and DOM APIs.
 *
 * Length limits double as `maxLength` on the inputs, so a field can never be
 * "valid in the browser, rejected on the server". Messages come from
 * `lib/copy/authHy` (codepoint-verified Armenian) and are already localized —
 * the server returns the same strings, because the backend owns the copy the
 * customer sees.
 */
// Relative on purpose: the mock API server reaches this module through
// `vite.config.ts`, whose bundle is resolved by plain Node, where the `@/`
// alias does not exist. The browser keeps using the alias.
import { AUTH_HY } from '../copy/authHy.ts';

export type FieldErrors = Record<string, string>;

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: FieldErrors };

// --- Limits (single source of truth for schema + inputs) -------------------
export const LIMITS = {
  fullNameMin: 2,
  fullNameMax: 100,
  passwordMin: 8,
  passwordMax: 72, // scrypt keylen ceiling we are willing to hash
  emailMax: 120,
  labelMax: 24,
  regionMax: 40,
  cityMax: 40,
  streetMax: 80,
  buildingMax: 20,
  entranceMax: 20,
  floorMax: 8,
  apartmentMax: 10,
  intercomMax: 24,
  recipientNameMax: 100,
  commentMax: 240,
  addressesPerUser: 20,
} as const;

/**
 * Strips control characters and collapses internal whitespace, then trims.
 * Control bytes in a name or address line break rendering and log output, and
 * they are never intentional.
 */
export function sanitizeText(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f\u00ad]/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

/**
 * Canonicalizes any Armenian number the customer may have typed (`095…`,
 * `+374 95…`, `(95) 53-04-35`, `00 374 …`, spaces/dashes/parens) to E.164
 * `+374XXXXXXXX`.
 *
 * The branches are anchored on the digit COUNT, not on prefixes alone: a
 * prefix-only rule eats the leading zeros of a national number (`00000001` is
 * a valid subscriber number, not an international dialing prefix).
 *
 * Only the length rule is enforced, deliberately: an operator-prefix allowlist
 * would reject landlines and the dev-only `+37400000001` test account, and the
 * shop serves both. Laravel can tighten this without changing the UI.
 */
export function toE164(raw: string): string | null {
  const d = (raw ?? '').replace(/\D/g, '');
  let national: string;
  if (d.length === 8) national = d; // already national, no prefix
  else if (d.length === 9 && d.startsWith('0')) national = d.slice(1); // 0XX XXX XXX
  else if (d.length === 11 && d.startsWith('374')) national = d.slice(3); // +374XXXXXXXX
  else if (d.length === 13 && d.startsWith('00374')) national = d.slice(5); // 00 374 ...
  else return null;
  if (national.length !== 8) return null;
  return `+374${national}`;
}

/** True when the value carries a complete Armenian number in any accepted form. */
export function isCompletePhone(raw: string): boolean {
  return toE164(raw) !== null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value) && value.length <= LIMITS.emailMax;
}

// --- Per-field checks ------------------------------------------------------
function checkFullName(raw: string, errors: FieldErrors): string | null {
  const value = sanitizeText(raw ?? '');
  if (!value) {
    errors.fullName = AUTH_HY.ERR_FULL_NAME_REQUIRED;
    return null;
  }
  if (value.length < LIMITS.fullNameMin) {
    errors.fullName = AUTH_HY.ERR_FULL_NAME_SHORT;
    return null;
  }
  if (value.length > LIMITS.fullNameMax) {
    errors.fullName = AUTH_HY.ERR_FULL_NAME_LONG;
    return null;
  }
  return value;
}

function checkPhone(raw: string, errors: FieldErrors): string | null {
  const value = (raw ?? '').trim();
  if (!value) {
    errors.phone = AUTH_HY.ERR_PHONE_REQUIRED;
    return null;
  }
  const e164 = toE164(value);
  if (!e164) {
    errors.phone = AUTH_HY.ERR_PHONE_INVALID;
    return null;
  }
  return e164;
}

/**
 * Login only checks that a password was typed at all — applying the registration
 * rules here would tell an attacker which accounts exist and how they were
 * created. Format rules belong to `validateRegister`.
 */
function checkLoginPassword(raw: string, errors: FieldErrors): string | null {
  const value = raw ?? '';
  if (!value) {
    errors.password = AUTH_HY.ERR_PASSWORD_REQUIRED;
    return null;
  }
  if (value.length > LIMITS.passwordMax) {
    errors.password = AUTH_HY.ERR_PASSWORD_LONG;
    return null;
  }
  return value;
}

function checkNewPassword(raw: string, errors: FieldErrors): string | null {
  const value = checkLoginPassword(raw, errors);
  if (value === null) return null;
  if (value.length < LIMITS.passwordMin) {
    errors.password = AUTH_HY.ERR_PASSWORD_SHORT;
    return null;
  }
  return value;
}

function checkEmail(raw: string | undefined, errors: FieldErrors): string | undefined {
  const value = sanitizeText(raw ?? '');
  if (!value) return undefined;
  if (!isValidEmail(value)) {
    errors.email = value.length > LIMITS.emailMax
      ? AUTH_HY.ERR_EMAIL_LONG
      : AUTH_HY.ERR_EMAIL_INVALID;
    return undefined;
  }
  return value;
}

// --- Form-level validators -------------------------------------------------
export interface LoginInput {
  phone: string;
  password: string;
}

export function validateLogin(input: LoginInput): ValidationResult<LoginInput> {
  const errors: FieldErrors = {};
  const phone = checkPhone(input.phone ?? '', errors);
  const password = checkLoginPassword(input.password ?? '', errors);
  if (Object.keys(errors).length > 0 || phone === null || password === null) {
    return { ok: false, errors };
  }
  return { ok: true, value: { phone, password } };
}

export interface RegisterInput {
  fullName: string;
  phone: string;
  password: string;
  acceptTerms: boolean;
}

export function validateRegister(input: RegisterInput): ValidationResult<RegisterInput> {
  const errors: FieldErrors = {};
  const fullName = checkFullName(input.fullName ?? '', errors);
  const phone = checkPhone(input.phone ?? '', errors);
  const password = checkNewPassword(input.password ?? '', errors);
  if (input.acceptTerms !== true) {
    errors.acceptTerms = AUTH_HY.ERR_CONSENT;
  }
  if (
    Object.keys(errors).length > 0 ||
    fullName === null ||
    phone === null ||
    password === null
  ) {
    return { ok: false, errors };
  }
  return { ok: true, value: { fullName, phone, password, acceptTerms: true } };
}

export interface ProfileInput {
  /**
   * PATCH semantics: an ABSENT key means "leave it alone", a key that is present
   * but blank is the form saying "this line must not be empty" and still fails.
   * The profile panel always sends both, so the distinction only matters to an
   * API client that wants to change the email alone.
   */
  fullName?: string;
  email?: string;
}

/**
 * `PATCH /me` accepts name and email only — phone is read until a verified
 * change flow exists, so it is not even looked at here.
 */
export function validateProfile(input: ProfileInput): ValidationResult<ProfileInput> {
  const errors: FieldErrors = {};
  const fullName =
    input.fullName === undefined ? undefined : checkFullName(input.fullName, errors);
  const email = checkEmail(input.email, errors);
  if (Object.keys(errors).length > 0 || fullName === null) {
    return { ok: false, errors };
  }
  // Only the keys that were sent come back, so `updateUser` never overwrites a
  // line the customer did not touch. An empty body is a legitimate no-op PATCH.
  return {
    ok: true,
    value: {
      ...(fullName !== undefined ? { fullName } : {}),
      ...(email ? { email } : {}),
    },
  };
}

export interface AddressFormInput {
  label?: string;
  region: string;
  city: string;
  street: string;
  building: string;
  entrance?: string;
  floor?: string;
  apartment?: string;
  intercom?: string;
  recipientName?: string;
  recipientPhone?: string;
  comment?: string;
  isDefault: boolean;
}

/** Optional short line: trimmed, length-capped, never required. */
function optionalLine(
  raw: string | undefined,
  max: number,
  field: string,
  errors: FieldErrors,
): string | undefined {
  const value = sanitizeText(raw ?? '');
  if (!value) return undefined;
  if (value.length > max) {
    errors[field] = AUTH_HY.ERR_FIELD_LONG.replace('{max}', String(max));
    return undefined;
  }
  return value;
}

function requiredLine(
  raw: string | undefined,
  max: number,
  field: string,
  missing: string,
  errors: FieldErrors,
): string | null {
  const value = sanitizeText(raw ?? '');
  if (!value) {
    errors[field] = missing;
    return null;
  }
  if (value.length > max) {
    errors[field] = AUTH_HY.ERR_FIELD_LONG.replace('{max}', String(max));
    return null;
  }
  return value;
}

/**
 * A `PATCH` sends a subset and a `POST` sends the whole form, so the input is
 * partial on purpose. An omitted key keeps whatever the row already had (the
 * caller merges first); a key present but empty clears it, because the value
 * returned below carries only non-empty optional lines.
 */
export function validateAddress(input: Partial<AddressFormInput>): ValidationResult<AddressFormInput> {
  const errors: FieldErrors = {};

  const region = requiredLine(input.region, LIMITS.regionMax, 'region', AUTH_HY.ERR_REGION_REQUIRED, errors);
  const city = requiredLine(input.city, LIMITS.cityMax, 'city', AUTH_HY.ERR_CITY_REQUIRED, errors);
  const street = requiredLine(input.street, LIMITS.streetMax, 'street', AUTH_HY.ERR_STREET_REQUIRED, errors);
  const building = requiredLine(input.building, LIMITS.buildingMax, 'building', AUTH_HY.ERR_BUILDING_REQUIRED, errors);

  const label = optionalLine(input.label, LIMITS.labelMax, 'label', errors);
  const entrance = optionalLine(input.entrance, LIMITS.entranceMax, 'entrance', errors);
  const floor = optionalLine(input.floor, LIMITS.floorMax, 'floor', errors);
  const apartment = optionalLine(input.apartment, LIMITS.apartmentMax, 'apartment', errors);
  const intercom = optionalLine(input.intercom, LIMITS.intercomMax, 'intercom', errors);
  const recipientName = optionalLine(input.recipientName, LIMITS.recipientNameMax, 'recipientName', errors);
  const comment = optionalLine(input.comment, LIMITS.commentMax, 'comment', errors);

  let recipientPhone: string | undefined;
  const rawRecipient = (input.recipientPhone ?? '').trim();
  if (rawRecipient) {
    const parsed = toE164(rawRecipient);
    if (!parsed) errors.recipientPhone = AUTH_HY.ERR_PHONE_INVALID;
    else recipientPhone = parsed;
  }

  const valid =
    Object.keys(errors).length === 0 &&
    region !== null &&
    city !== null &&
    street !== null &&
    building !== null;

  if (!valid) return { ok: false, errors };

  return {
    ok: true,
    value: {
      region: region as string,
      city: city as string,
      street: street as string,
      building: building as string,
      isDefault: input.isDefault === true,
      ...(label ? { label } : {}),
      ...(entrance ? { entrance } : {}),
      ...(floor ? { floor } : {}),
      ...(apartment ? { apartment } : {}),
      ...(intercom ? { intercom } : {}),
      ...(recipientName ? { recipientName } : {}),
      ...(recipientPhone ? { recipientPhone } : {}),
      ...(comment ? { comment } : {}),
    },
  };
}

/**
 * 0-3 heuristic for the register form's hint only. It never blocks a submit —
 * blocking belongs to the length rule, and a strength meter that refuses input
 * trains customers to append junk characters.
 */
export function passwordStrength(password: string): 0 | 1 | 2 | 3 {
  if (!password) return 0;
  let score = 0;
  if (password.length >= LIMITS.passwordMin) score += 1;
  if (password.length >= 12) score += 1;
  if (/[^a-zA-Z\u0530-\u058F0-9]/.test(password)) score += 1;
  if (/[0-9]/.test(password) && /[a-zA-Z\u0530-\u058F]/.test(password)) score += 1;
  if (score <= 1) return 1;
  if (score === 2) return 2;
  return 3;
}
