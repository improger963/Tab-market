/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Pure Armenian ↔ Latin translit normalization engine shared by the header
 * spotlight (and any later search surface). Kept free of React/UI imports so
 * it is unit-smoke-testable in Node (scripts/_smoke_search.ts).
 *
 * Typing "corak"/"tsorak"/"vorak" matches "ծորակ", "ganzer" matches "GANZER",
 * exact SKU "5932" matches instantly, and Armenian glyphs match Latin brands.
 */

import { Product } from '@/types';

/* Canonical Armenian glyph → Latin approximation pairs (used for both directions). */
const ARM_LATIN_PAIRS: [string, string][] = [
  ['ա', 'a'], ['բ', 'p'], ['գ', 'g'], ['դ', 't'], ['ե', 'ye'], ['զ', 'z'],
  ['է', 'e'], ['ը', 'e'], ['թ', 'd'], ['ժ', 'zh'], ['ի', 'i'], ['լ', 'l'],
  ['խ', 'kh'], ['ծ', 'ts'], ['կ', 'k'], ['հ', 'h'], ['ձ', 'dz'], ['ղ', 'gh'],
  ['ճ', 'ch'], ['մ', 'm'], ['յ', 'y'], ['ն', 'n'], ['շ', 'sh'], ['ո', 'o'],
  ['չ', 'ch'], ['պ', 'b'], ['ջ', 'j'], ['ր', 'r'], ['ռ', 'rr'], ['ս', 's'], ['վ', 'v'],
  ['տ', 't'], ['ց', 'ts'], ['ւ', 'w'], ['փ', 'p'], ['ք', 'k'], ['օ', 'o'],
  ['ֆ', 'f'],
];

// Digraph-first ordered Latin → Armenian map ('ev' and 'ou' must beat single letters)
const ARM_DIGRAPHS: [string, string][] = ([
  ['ev', 'էվ'],
  ['ou', 'ու'],
  // Eastern-Armenian 'vo' romanization maps straight to the single glyph so
  // "vorak" reaches the faucet haystacks instead of a two-letter spelling.
  // The raw Latin token stays in the variant set, so search never breaks.
  ['vo', 'ո'],
  ...ARM_LATIN_PAIRS.map(([arm, latin]) => [latin, arm] as [string, string]),
  // Forward-only correction: customers type "corak" for the Armenian faucet
  // word, but 'c' has no canonical pair. Map it to 'ծ' so the greedy
  // translit reaches the correct glyph instead of a literal 'c'.
  ['c', 'ծ'],
] as [string, string][])
  // Longest latin key first so digraphs ('ts', 'ch', 'sh', 'rr', …) always beat
  // their single-letter prefixes ('t', 'c', 's', 'r', …) in the greedy pass.
  .sort((a, b) => b[0].length - a[0].length);

const ARM_SINGLE: Record<string, string> = Object.fromEntries(ARM_DIGRAPHS);

const ARMENIAN_TO_LATIN: Record<string, string[]> = {
  ...ARM_LATIN_PAIRS.reduce<Record<string, string[]>>((acc, [arm, latin]) => {
    acc[arm] = acc[arm] ? [...new Set([...acc[arm], latin])] : [latin];
    return acc;
  }, {}),
  // Extra accepted spellings for common typos / alternate translit conventions
  'ա': ['a', 'ah'],
  'բ': ['p', 'b'],
  'գ': ['g', 'k', 'c'],
  'դ': ['t', 'd'],
  'ե': ['ye', 'e', 'yev'],
  'զ': ['z', 'dz'],
  'է': ['e', 'eh'],
  'ը': ['e', 'y', 'u'],
  'թ': ['t', 'd', 'th'],
  'խ': ['kh', 'x'],
  'ծ': ['ts', 'c', 'dz', 'j'],
  'կ': ['k', 'g', 'c', 'q'],
  'ձ': ['dz', 't', 'd'],
  'ղ': ['gh', 'g', 'w'],
  'ճ': ['ch', 'j', 'ts'],
  'շ': ['sh', 's', 'ch'],
  'ո': ['o', 'vo', 'u'],
  'չ': ['ch', 'c', 'ts'],
  'ջ': ['j', 'ch', 'dz'],
  'ռ': ['r', 'rr'],
  'վ': ['v', 'w'],
  'տ': ['t', 'd'],
  'ց': ['ts', 'c', 'j', 's'],
  'ւ': ['w', 'u', 'v', 'ww'],
  'փ': ['p', 'b'],
  'ք': ['k', 'q', 'x', 'c'],
  'օ': ['o', 'oh'],
  'ֆ': ['f', 'ph'],
  'ի': ['i', 'ih', 'ee'],
  'լ': ['l', 'll'],
  'հ': ['h', 'hh'],
  'մ': ['m', 'mm'],
  'յ': ['y', 'i'],
  'ն': ['n', 'nn'],
  'ս': ['s', 'ss'],
};

/** Converts a single Latin translit token into Armenian glyphs (digraph-first greedy pass). */
export function translitTokenToArmenian(token: string): string {
  let out = '';
  let i = 0;
  while (i < token.length) {
    let matched = false;
    for (const [latin, arm] of ARM_DIGRAPHS) {
      if (token.startsWith(latin, i)) {
        out += arm;
        i += latin.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      const ch = token[i];
      out += ARM_SINGLE[ch] ?? ch;
      i += 1;
    }
  }
  return out;
}

/** Expands a raw query into Latin + Armenian translit token variants. */
export function getQueryVariants(rawQuery: string): string[] {
  const q = rawQuery.toLowerCase().trim();
  if (!q) return [];
  const tokens = q.split(/\s+/);
  const variants = new Set<string>(tokens);
  const latinReversed = new Set<string>(tokens);

  for (const token of tokens) {
    if (/^[a-z'"]+$/.test(token)) {
      const arm = translitTokenToArmenian(token);
      variants.add(arm);
      // Typo tolerance: single trailing/leading apostrophe or doubled letters
      variants.add(token.replace(/['"]/g, ''));
    }
    // Armenian glyphs → latin approximations so "ծորակ" also matches "GANZER"-style latin haystacks
    for (const char of token) {
      const latinOpts = ARMENIAN_TO_LATIN[char];
      if (latinOpts) latinOpts.forEach((l) => latinReversed.add(l));
    }
  }

  return [...variants, ...latinReversed];
}

export function buildHaystack(p: Product): string {
  return `${p.title} ${p.brand} ${p.code} ${p.categoryName} ${p.slug} ${Object.values(p.specs).join(' ')}`.toLowerCase();
}

/** Relevance score for one product against a raw query; 0 means "no match". */
export function scoreMatch(p: Product, rawQuery: string, variants: string[]): number {
  const q = rawQuery.toLowerCase().trim();
  const haystack = buildHaystack(p);
  const code = p.code.toLowerCase();
  const brand = p.brand.toLowerCase();
  const title = p.title.toLowerCase();

  // Exact SKU wins instantly
  if (code === q) return 100;
  if (code.startsWith(q)) return 90;
  // Exact translit brand match
  if (brand === q || variants.includes(brand)) return 80;
  if (title.startsWith(q)) return 70;

  // Any variant token present in the haystack
  if (variants.some((v) => v.length >= 2 && haystack.includes(v))) return 60;
  // Armenian → Latin reverse tolerance (Armenian query vs latin brand/spec text)
  if (/[\u0530-\u058F]/.test(q)) {
    const armNorm = [...q].map((c) => (ARMENIAN_TO_LATIN[c] ? `[${ARMENIAN_TO_LATIN[c].join('')}]` : c)).join('');
    if (new RegExp(armNorm.replace(/\s+/g, '.*'), 'i').test(haystack)) return 50;
  }
  return 0;
}
