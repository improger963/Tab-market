/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * `server-only` throws outside React Server environments by design. Node
 * contract tests legitimately act as the server runtime, so vitest aliases
 * the guard to this empty stub (see vitest.config.ts). Application code must
 * never import this file.
 */
export {};
