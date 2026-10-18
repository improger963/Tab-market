/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * SERVER-ONLY ACCOUNT STORE for the mock API.
 *
 * Nothing in here is importable from the browser: the file lives under
 * `server/`, is never referenced by a client module, and holds password hashes
 * and session rows. It persists to `server/data/db.json` (gitignored) purely so
 * that a developer's registered account survives a restart; every failure to
 * touch the disk degrades to memory-only instead of taking the process down.
 *
 * Replacing this with Laravel's Eloquent models is a swap of this file alone:
 * the route handlers are the only consumer.
 */
import { randomBytes, randomUUID, scrypt, timingSafeEqual } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { Buffer } from 'node:buffer';
import type { OrderStatus, UserAddress, UserOrderSummary } from '../types/api.ts';
import { ORDER_STATUS } from '../types/api.ts';
import { SESSION_TTL_MS } from '../lib/auth/session.ts';

/** `N*r*128` bytes plus slack; below Node's default it would be rejected outright. */
const SCRYPT_MAXMEM = 64 * 1024 * 1024;

export interface StoredUser {
  id: string;
  fullName: string;
  /** Canonical E.164. Never displayed unmasked outside `/me`. */
  phone: string;
  email?: string;
  /** `scrypt$N$r$p$salt$hash` — never serialized into any response. */
  passwordHash: string;
  createdAt: string;
}

export interface StoredSession {
  token: string;
  userId: string;
  createdAt: string;
  /** Sliding expiry; refreshed on every authenticated request. */
  expiresAt: number;
}

export interface StoredAddress extends UserAddress {
  userId: string;
}

export interface StoredOrder extends UserOrderSummary {
  userId: string;
}

interface DbShape {
  users: StoredUser[];
  sessions: StoredSession[];
  addresses: StoredAddress[];
  orders: StoredOrder[];
}

const DB_PATH = fileURLToPath(new URL('./data/db.json', import.meta.url));

const emptyDb = (): DbShape => ({ users: [], sessions: [], addresses: [], orders: [] });

function loadFromDisk(): DbShape | null {
  try {
    if (!existsSync(DB_PATH)) return null;
    const parsed: unknown = JSON.parse(readFileSync(DB_PATH, 'utf8'));
    if (typeof parsed !== 'object' || parsed === null) return null;
    const db = parsed as Partial<DbShape>;
    // Shape-checked field by field: a truncated or hand-edited file must not
    // take the server down or silently authenticate anyone.
    return {
      users: Array.isArray(db.users) ? db.users : [],
      sessions: Array.isArray(db.sessions) ? db.sessions : [],
      addresses: Array.isArray(db.addresses) ? db.addresses : [],
      orders: Array.isArray(db.orders) ? db.orders : [],
    };
  } catch {
    return null;
  }
}

let db: DbShape = loadFromDisk() ?? emptyDb();
let saveQueued = false;

/** Debounced, atomic (tmp + rename) write. Best-effort by design. */
function scheduleSave(): void {
  if (saveQueued) return;
  saveQueued = true;
  process.nextTick(() => {
    saveQueued = false;
    try {
      mkdirSync(new URL('./data/', import.meta.url), { recursive: true });
      const tmp = `${DB_PATH}.${process.pid}.tmp`;
      writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf8');
      renameSync(tmp, DB_PATH);
    } catch (error) {
      // Memory stays authoritative for this process; a mock losing its file is
      // never a reason to fail a customer request.
      process.stderr.write(`[store] persistence unavailable: ${(error as Error).message}\n`);
    }
  });
}

// --- Passwords -------------------------------------------------------------
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, keylen: 32 } as const;

/**
 * Callback form on purpose: `promisify(scrypt)` loses the overload that takes
 * options, and this project type-checks against browser lib types only.
 */
function deriveKey(
  password: string,
  salt: Buffer,
  keylen: number,
  params: { N: number; r: number; p: number },
): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(
      password.normalize('NFKC'),
      salt,
      keylen,
      { ...params, maxmem: SCRYPT_MAXMEM },
      (error, derivedKey) => {
        if (error) reject(error);
        else resolve(Buffer.from(derivedKey));
      },
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await deriveKey(password, salt, SCRYPT_PARAMS.keylen, SCRYPT_PARAMS);
  return `scrypt$${SCRYPT_PARAMS.N}$${SCRYPT_PARAMS.r}$${SCRYPT_PARAMS.p}$${salt.toString('base64')}$${derived.toString('base64')}`;
}

/**
 * Recomputes from the stored salt and compares in constant time. A malformed
 * row fails closed — it never authenticates.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [, n, r, p, saltB64, hashB64] = parts as [
    'scrypt',
    string,
    string,
    string,
    string,
    string,
  ];
  const salt = Buffer.from(saltB64, 'base64');
  const expected = Buffer.from(hashB64, 'base64');
  if (salt.length === 0 || expected.length === 0) return false;
  let derived: Buffer;
  try {
    derived = await deriveKey(password, salt, expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
    });
  } catch {
    return false;
  }
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

// --- Users -----------------------------------------------------------------
export function findUserByPhone(phone: string): StoredUser | undefined {
  return db.users.find((u) => u.phone === phone);
}

export function findUserById(id: string): StoredUser | undefined {
  return db.users.find((u) => u.id === id);
}

export async function createUser(input: {
  fullName: string;
  phone: string;
  password: string;
  email?: string;
}): Promise<StoredUser> {
  const user: StoredUser = {
    id: randomUUID(),
    fullName: input.fullName,
    phone: input.phone,
    ...(input.email ? { email: input.email } : {}),
    passwordHash: await hashPassword(input.password),
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  scheduleSave();
  return user;
}

export function updateUser(
  id: string,
  patch: { fullName?: string; email?: string },
): StoredUser | undefined {
  const user = findUserById(id);
  if (!user) return undefined;
  if (patch.fullName !== undefined) user.fullName = patch.fullName;
  if (patch.email !== undefined) {
    if (patch.email === '') delete user.email;
    else user.email = patch.email;
  }
  scheduleSave();
  return user;
}

// --- Sessions ------------------------------------------------------------
/** Opaque, unpredictable id. Carries no information and is not a JWT. */
function mintSessionToken(): string {
  return randomBytes(32).toString('hex');
}

export function createSession(userId: string): StoredSession {
  const session: StoredSession = {
    token: mintSessionToken(),
    userId,
    createdAt: new Date().toISOString(),
    expiresAt: Date.now() + SESSION_TTL_MS,
  };
  // Expired rows are dropped on write, so the table cannot grow forever in a
  // long-lived dev process.
  db.sessions = db.sessions.filter((s) => s.expiresAt > Date.now());
  db.sessions.push(session);
  scheduleSave();
  return session;
}

/** Returns the live session and slides its expiry. Expired rows are pruned. */
export function resolveSession(token: string): { session: StoredSession; user: StoredUser } | null {
  const session = db.sessions.find((s) => s.token === token);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    db.sessions = db.sessions.filter((s) => s.token !== token);
    scheduleSave();
    return null;
  }
  session.expiresAt = Date.now() + SESSION_TTL_MS;
  scheduleSave();
  const user = findUserById(session.userId);
  return user ? { session, user } : null;
}

export function destroySession(token: string): void {
  db.sessions = db.sessions.filter((s) => s.token !== token);
  scheduleSave();
}

/** Signs the user out everywhere (available for the Laravel swap's UI). */
export function destroyAllSessionsForUser(userId: string): void {
  db.sessions = db.sessions.filter((s) => s.userId !== userId);
  scheduleSave();
}

// --- Addresses -----------------------------------------------------------
export function listAddresses(userId: string): UserAddress[] {
  return db.addresses
    .filter((a) => a.userId === userId)
    .map(({ userId: _userId, ...address }) => address);
}

export function findAddress(userId: string, id: string): StoredAddress | undefined {
  return db.addresses.find((a) => a.userId === userId && a.id === id);
}

function clearOtherDefaults(userId: string, keepId: string): void {
  for (const address of db.addresses) {
    if (address.userId === userId && address.id !== keepId) address.isDefault = false;
  }
}

export function countAddresses(userId: string): number {
  return db.addresses.filter((a) => a.userId === userId).length;
}

export function createAddress(
  userId: string,
  input: Omit<UserAddress, 'id'>,
): UserAddress {
  const address: StoredAddress = { ...input, userId, id: randomUUID() };
  // First saved address is always the default; an explicit default wins the tie.
  const isFirst = countAddresses(userId) === 0;
  if (isFirst) address.isDefault = true;
  db.addresses.push(address);
  if (address.isDefault) clearOtherDefaults(userId, address.id);
  scheduleSave();
  const { userId: _userId, ...rest } = address;
  return rest;
}

/**
 * Replaces the editable lines of a stored address. Optional lines the payload
 * does not carry are deleted, so clearing a field in the form really clears it —
 * `Object.assign` alone could never do that.
 */
export function updateAddress(
  userId: string,
  id: string,
  value: Omit<UserAddress, 'id'>,
): UserAddress | undefined {
  const address = findAddress(userId, id);
  if (!address) return undefined;
  const row = address as unknown as Record<string, unknown>;

  address.region = value.region;
  address.city = value.city;
  address.street = value.street;
  address.building = value.building;
  address.isDefault = value.isDefault === true;

  const optional = ['label', 'entrance', 'floor', 'apartment', 'intercom', 'recipientName', 'recipientPhone', 'comment'] as const;
  for (const key of optional) {
    const next = value[key];
    if (next) row[key] = next;
    else delete row[key];
  }

  if (address.isDefault) clearOtherDefaults(userId, id);
  // Invariant: a customer with at least one address always has exactly one
  // default, so unsetting one without picking another simply keeps the newest.
  const mine = db.addresses.filter((a) => a.userId === userId);
  if (mine.length > 0 && !mine.some((a) => a.isDefault)) {
    (mine[mine.length - 1] as { isDefault: boolean }).isDefault = true;
  }
  scheduleSave();
  const { userId: _userId, ...rest } = address;
  return rest;
}

export function deleteAddress(userId: string, id: string): boolean {
  const before = db.addresses.length;
  db.addresses = db.addresses.filter((a) => !(a.userId === userId && a.id === id));
  if (db.addresses.length === before) return false;
  // Losing the default must not leave the user without one.
  const remaining = db.addresses.filter((a) => a.userId === userId);
  if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
    remaining[0].isDefault = true;
  }
  scheduleSave();
  return true;
}

// --- Orders --------------------------------------------------------------
export function listOrders(userId: string): UserOrderSummary[] {
  return db.orders
    .filter((o) => o.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(({ userId: _userId, ...order }) => order);
}

export function findOrder(userId: string, id: string): UserOrderSummary | undefined {
  const found = db.orders.find((o) => o.userId === userId && (o.id === id || o.number === id));
  if (!found) return undefined;
  const { userId: _userId, ...order } = found;
  return order;
}

/**
 * Attaches an order to the account whose session made it. Guest orders are
 * never adopted retroactively — linking them needs a phone-ownership proof.
 */
export function attachOrder(
  userId: string,
  input: {
    number: string;
    status: OrderStatus;
    total: number;
    items: UserOrderSummary['items'];
  },
): UserOrderSummary {
  const order: StoredOrder = {
    userId,
    id: randomUUID(),
    number: input.number,
    status: input.status,
    total: Math.max(0, Math.round(input.total)),
    items: input.items,
    createdAt: new Date().toISOString(),
  };
  db.orders.push(order);
  scheduleSave();
  const { userId: _userId, ...rest } = order;
  return rest;
}

// --- Dev-only seed -------------------------------------------------------
export const DEV_DEMO_PHONE = '+37400000001';
export const DEV_DEMO_PASSWORD = 'tab-demo-2026';

/**
 * Seeds a fake account so the flows are clickable in development. Refuses to
 * run in production, and refuses to run if anything looks like the shop's real
 * number, so a careless edit can never ship a usable credential.
 */
export async function seedDemoUserIfNeeded(isProduction: boolean): Promise<boolean> {
  if (isProduction) return false;
  if (findUserByPhone(DEV_DEMO_PHONE)) return false;

  const user = await createUser({
    fullName: 'Օրինակ Օգտատեր',
    phone: DEV_DEMO_PHONE,
    password: DEV_DEMO_PASSWORD,
  });

  createAddress(user.id, {
    label: 'Տուն',
    region: 'Երևան',
    city: 'Երևան',
    street: 'Կոմիտասի պողոտա',
    building: '25/3',
    entrance: '2',
    floor: '4',
    apartment: '14',
    isDefault: true,
  });

  db.orders.push(
    {
      userId: user.id,
      id: randomUUID(),
      number: 'TAB-70001',
      status: ORDER_STATUS.READY_FOR_PICKUP,
      total: 48500,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
      items: [
        { productId: '1', title: 'Առաձգական խառնիչ սանտեխնիկայի համար', image: null, quantity: 1 },
        { productId: '2', title: 'Ջրի ֆիլտր նախապատրաստման համար', image: null, quantity: 2 },
      ],
    },
    {
      userId: user.id,
      id: randomUUID(),
      number: 'TAB-69480',
      status: ORDER_STATUS.DELIVERED,
      total: 12900,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
      items: [
        { productId: '3', title: 'Խողովակի միացման օճառանոց', image: null, quantity: 1 },
      ],
    },
  );
  scheduleSave();
  return true;
}
