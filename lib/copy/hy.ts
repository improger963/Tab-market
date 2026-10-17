/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Customer-facing Armenian copy — SINGLE SOURCE OF TRUTH.
 *
 * Every value below is byte-identical to wording already shipped in this
 * codebase (harvested from git HEAD), or composed from HEAD word forms using
 * the repository's own morphology. Strings are stored as \u codepoint escapes
 * on purpose: hand-typed Armenian literals through edit pipelines have
 * repeatedly produced homoglyph corruption (Hebrew/Cyrillic/Latin look-alikes
 * and dropped letters). Never replace the escapes with typed text; verify with
 * `node scripts/_spellcheck.mjs` after any change.
 *
 * Style rules enforced here: sentence case for Armenian, no uppercase-only
 * labels, the product code label is "Kod" (Armenian letters, not Latin).
 */
export const HY = {
  // --- Brand / showcase copy (generated) ---
  // Provenance in comments is a file:line pointer into the shipped UI, so the
  // wording can always be re-verified against the bytes it was harvested from.
  BRANDS: '\u0532\u0580\u0565\u0576\u0564\u0576\u0565\u0580', // git HEAD components/catalog/FilterSidebar.tsx:453
  BRAND_NOT_FOUND: '\u0532\u0580\u0565\u0576\u0564\u0568 \u0579\u056B \u0563\u057F\u0576\u057E\u0565\u056C', // git HEAD components/brand/BrandPageClient.tsx:46
  BRAND_ABSENT: '\u0540\u0576\u0561\u0580\u0561\u057E\u0578\u0580 \u0567 \u0562\u0580\u0565\u0576\u0564\u056B \u0570\u0561\u057D\u0581\u0565\u0576 \u057D\u056D\u0561\u056C \u0567 \u0574\u0578\u0582\u057F\u0584\u0561\u0563\u0580\u057E\u0565\u056C \u056F\u0561\u0574 \u0561\u0575\u0576 \u0564\u0565\u057C\u0587\u057D \u0579\u056B \u0576\u0565\u0580\u056F\u0561\u0575\u0561\u0581\u057E\u0578\u0582\u0574 \u0544\u0565\u056C\u0584\u0578\u0582\u0574\u0578\u057E\u056B 40/1 \u057D\u0580\u0561\u0570\u0578\u0582\u0574:', // git HEAD components/brand/BrandPageClient.tsx:49+50
  BACK_TO_CATALOG: '\u054E\u0565\u0580\u0561\u0564\u0561\u057C\u0576\u0561\u056C \u053F\u0561\u057F\u0561\u056C\u0578\u0563', // git HEAD components/brand/BrandPageClient.tsx:57
  HOME: '\u0533\u056C\u056D\u0561\u057E\u0578\u0580', // git HEAD components/brand/BrandPageClient.tsx:79
  ASSORTMENT: '\u054F\u0565\u057D\u0561\u056F\u0561\u0576\u056B', // git HEAD components/brand/BrandPageClient.tsx:150
  APRANQ: '\u0561\u057A\u0580\u0561\u0576\u0584', // git HEAD components/brand/BrandPageClient.tsx:150
  VIEW_CATALOG_SHORT: '\u0534\u056B\u057F\u0565\u056C \u056F\u0561\u057F\u0561\u056C\u0578\u0563\u0568', // git HEAD components/home/BrandsCarousel.tsx:174
  BIG_DISCOUNTS: '\u0544\u0565\u056E \u0536\u0565\u0572\u0579\u0565\u0580', // git HEAD components/home/TabbedProductShowcase.tsx:94
  DISCOUNTS: '\u0536\u0565\u0572\u0579\u0565\u0580', // git HEAD components/home/TabbedProductShowcase.tsx:94
  AND: '\u0587', // git HEAD components/brand/BrandPageClient.tsx:114
  // --- end generated copy ---
  // --- Generic actions -------------------------------------------------------
  ADD: '\u0531\u057e\u0565\u056c\u0561\u0581\u0576\u0565\u056c', // Avelacnel
  ADDED: '\u0531\u057e\u0565\u056c\u0561\u0581\u057e\u0565\u0581', // Avelats'vets
  ADDING: '\u0531\u057e\u0565\u056c\u0561\u0581\u0578\u0582\u0574 \u0567\u2026', // Avelats'um e... (composed)
  REMOVE: '\u0540\u0565\u057c\u0561\u0581\u0576\u0565\u056c', // Heracnel
  COMPARE: '\u0540\u0561\u0574\u0565\u0574\u0561\u057f\u0565\u056c', // Hamematel
  ASK: '\u0540\u0561\u0580\u0581\u0576\u0565\u056c', // Harcnel
  COPY_CODE: '\u054a\u0561\u057f\u0573\u0565\u0576\u0565\u056c \u053f\u0578\u0564', // Patcenel Kod

  // --- Product card ----------------------------------------------------------
  CODE: '\u056f\u0578\u0564', // kod
  CODE_COLON: '\u053f\u0578\u0564:', // Kod:
  // "By code" - the second word of HEAD's search helper ("Kod Kodov voronum@",
  // HeroBanner). Names the catalogue's default ordering, which is the price
  // list's own SKU order; popularity would need sales data the sheet lacks.
  BY_CODE: '\u053f\u0578\u0564\u0578\u057E', // Kodov
  IN_STOCK: '\u054d\u0580\u0561\u0570\u0578\u0582\u0574 \u056f\u0561', // Srakhum ka
  PRICE_ON_REQUEST: '\u0533\u056b\u0576\u0568\u055d \u0568\u057d\u057f \u0570\u0561\u0580\u0581\u0574\u0561\u0576', // Gine: yst harcman
  // "Likvidatsia" - the price list's own section name for its clearance lot
  // (the category column value in products.xlsx). It is data, not marketing
  // wording, so the badge quotes it verbatim instead of inventing a label.
  CLEARANCE: '\u053C\u056B\u056F\u057E\u056B\u0564\u0561\u0581\u056B\u0561',

  // --- Navigation / sections -------------------------------------------------
  CATALOG: '\u053f\u0561\u057f\u0561\u056c\u0578\u0563', // Katalog
  VIEW_CATALOG: '\u0534\u056b\u057f\u0565\u056c \u0531\u0574\u0562\u0578\u0572\u057b \u054f\u0565\u057d\u0561\u056f\u0561\u0576\u056b\u0576', // Ditel Ambogh Tesakanin
  CART: '\u0536\u0561\u0574\u0562\u0575\u0578\u0582\u0572', // Zanbuygh-form used across app
  SHOWROOM: '\u054d\u0580\u0561\u0570\u0568', // Srakhe
  OUR_SHOWROOM: '\u0544\u0565\u0580 \u054d\u0580\u0561\u0570\u0568', // Mer Srakhe

  // --- Showroom status (Hero) ------------------------------------------------
  OPEN: '\u0532\u0561\u0581 \u0567', // Bac' e
  CLOSED: '\u0583\u0561\u056d \u0567', // Pak' e
  CALL: '\u0536\u0561\u0576\u0563\u0561\u0570\u0561\u0580\u0565\u056c', // Zangaharel
  FREE_DELIVERY_YEREVAN: '\u0531\u0576\u057e\u0573\u0561\u0580 \u0531\u057c\u0561\u0584\u0578\u0582\u0574 \u0535\u0580\u0587\u0561\u0576\u0578\u0582\u0574', // Anvar ach'akoum Yerevanoum

  // --- Category sections -----------------------------------------------------
  ALL: '\u0532\u0578\u056c\u0578\u0580\u0568', // Bolor@ (HEAD CategoryStories L69)
  MAIN_CATEGORIES: '\u0540\u056b\u0574\u0576\u0561\u056f\u0561\u0576 \u0532\u0561\u056a\u056b\u0576\u0576\u0565\u0580', // Himnakan Bashinner (HEAD CategoryGrid L16)
  FAST_SEARCH: '\u0531\u0580\u0561\u0563 \u0578\u0580\u0578\u0576\u0578\u0582\u0574', // Arag voronum (HEAD CategoryStories L59, second word sentence-cased via canonical 0548->0578 pair)

  // --- PDP buy box (byte-verbatim from HEAD ProductDetailView unless noted) --
  ADD_TO_CART: '\u0531\u057e\u0565\u056c\u0561\u0581\u0576\u0565\u056c \u0536\u0561\u0574\u0562\u0575\u0578\u0582\u0572', // Avelacnel Zanbuygh (L248)
  QUICK_ORDER: '\u0531\u0580\u0561\u0563 \u057a\u0561\u057f\u057e\u0565\u0580 1 \u0584\u056c\u056b\u0584\u0578\u057e', // HEAD L259, sentence-cased via canonical 054a->057a / 0554->0584 pairs
  ASK_SPECIALIST: '\u0540\u0561\u0580\u0581\u0576\u0565\u056c \u0574\u0561\u057d\u0576\u0561\u0563\u0565\u057f\u056b\u0576 WhatsApp-\u0578\u057e', // L270
  COPIED: '\u054a\u0561\u057f\u0573\u0565\u0576\u057e\u0561\u056e \u0567', // L150
  REVIEWS: '\u056f\u0561\u0580\u056e\u056b\u0584', // kargtsik (L119)
  FAVORITE: '\u054d\u056b\u0580\u057e\u0561\u056e', // sirvats' (L170)
  FAVORITE_ACTIVE: '\u054d\u056b\u0580\u057e\u0561\u056e \u0567', // sirvats' e (L170)
  FAVORITE_ADDED: '\u0531\u057e\u0565\u056c\u0561\u0581\u057e\u0565\u0581 \u057d\u056b\u0580\u057e\u0561\u056e\u0576\u0565\u0580\u056b \u0581\u0561\u0576\u056f\u0578\u0582\u0574', // L76
  FAVORITE_REMOVED: '\u0540\u0565\u057c\u0561\u0581\u057e\u0565\u0581 \u057d\u056b\u0580\u057e\u0561\u056e\u0576\u0565\u0580\u056b \u0581\u0561\u0576\u056f\u056b\u0581', // L78
  IN_STOCK_SHOWROOM: '\u0531\u057c\u056f\u0561 \u0567 \u057d\u0580\u0561\u0570\u0578\u0582\u0574', // L180
  BACK_ORDER: '\u054d\u057a\u0561\u057d\u0574\u0561\u0576 \u057a\u0561\u057f\u057e\u0565\u0580', // L188
  ASK_ON_WHATSAPP: '\u0540\u0561\u0580\u0581\u0576\u0565\u056c WhatsApp-\u0578\u057e', // L189
  HAT: '\u0570\u0561\u057f', // hat (units, L182)
  // "Similar products" - byte-verbatim HEAD phrase (src/App.tsx L194, the PDP
  // cross-sell heading), sentence-cased with the canonical 0531->0561 pair. Used
  // wherever suggestions come from real catalogue data; "frequently bought
  // together" needs order telemetry this store does not have.
  SIMILAR_PRODUCTS: '\u0546\u0574\u0561\u0576\u0561\u057F\u056B\u057A \u0561\u057A\u0580\u0561\u0576\u0584\u0576\u0565\u0580',
  QTY_DECREASE: '\u0546\u057e\u0561\u0566\u0565\u0581\u0576\u0565\u056c \u0584\u0561\u0576\u0561\u056f\u0568', // L220
  QTY_INCREASE: '\u0531\u057e\u0565\u056c\u0561\u0581\u0576\u0565\u056c \u0584\u0561\u0576\u0561\u056f\u0568', // L233
  // Highlight chip labels. HEAD bytes used where intact; the cartridge and
  // warranty labels were corrupted in HEAD (U+0556+Latin b, U+0566+b) and are
  // recomposed from the verified spec keys (L87/L88) + the definite-article +
  // colon suffix verified intact at L92.
  CHIP_CORPUS: '\u053f\u0578\u0580\u057a\u0578\u0582\u057d\u0568\u055d', // Korpus@: (L92)
  CHIP_CARTRIDGE: '\u0554\u0561\u0580\u057f\u0580\u056b\u057b\u0568\u055d', // Kartridge@: (L87 key + L92 suffix)
  CHIP_DELIVERY: '\u0531\u057c\u0561\u0584\u0578\u0582\u0574\u0568\u055d', // Achakoum@: (L94)
  CHIP_WARRANTY: '\u0535\u0580\u0561\u0577\u056d\u056b\u0584\u0568\u055d', // Erashkhik@: (L88 key + L92 suffix)
  // WhatsApp inquiry template (PDP). Split around the product title.
  WA_INTERESTED: '\u0532\u0561\u0580\u0587 \u0571\u0565\u0566, \u056b\u0576\u0571 \u0570\u0565\u057f\u0561\u0584\u0580\u0584\u0580\u0578\u0582\u0574 \u0567', // L100 head
  WA_INQUIRY_TAIL: '\u053d\u0576\u0564\u0580\u0578\u0582\u0574 \u0565\u0574 \u0561\u057d\u0565\u0584\u055d \u0561\u057c\u056f\u0561\u055e \u0567 \u0544\u0565\u056c\u0584\u0578\u0582\u0574\u0578\u057e\u056b 40/1 \u057d\u0580\u0561\u0570\u0578\u0582\u0574:', // L100 tail

  // --- Overlays ---------------------------------------------------------------
  CLOSE: '\u0553\u0561\u056f\u0565\u056c', // Pakel (HEAD ProductDossierTabs L191)
} as const;
