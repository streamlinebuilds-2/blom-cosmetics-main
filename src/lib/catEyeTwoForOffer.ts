export const CAT_EYE_TWO_FOR_OFFER_CODE = 'CATEYE2FOR340';
export const CAT_EYE_TWO_FOR_OFFER_NAME = 'Cat Eye 2-for-R340';
export const CAT_EYE_REQUIRED_UNITS = 2;
export const CAT_EYE_BUNDLE_PRICE_CENTS = 34000;

// Filled in once the 5 Nude Cat Eye Collection gel products exist in the DB
// (CE001 Pink, CE002 Rainbow Purple, CE003 Pink Effect, CE004 Brown, CE005 Nude
// Brown). Product id is the only stable identifier here — SKU is regenerated
// randomly on every admin product save, so it must never be used for eligibility.
export const CAT_EYE_ELIGIBLE_PRODUCT_IDS = new Set<string>([
  'd8af6cbc-19ea-4098-83a7-f90a5c7fe77c', // CE001 Pink Cat Eye Gel
  '7f6974ea-c8c1-4b0a-b81d-78e701c2136c', // CE002 Rainbow Purple Cat Eye Gel
  'a864df5d-a902-4383-87c1-f1f891ec7942', // CE003 Pink Effect Cat Eye Gel
  'b37ed56c-712b-48aa-b883-b7b3aff13712', // CE004 Brown Cat Eye Gel
  '4a24b4ac-8601-44b4-90e4-af2a4cf38b3a', // CE005 Nude Brown Cat Eye Gel
]);

// Belt-and-braces fallback matcher by slug, in case a product id lookup ever
// misses (mirrors the double-check pattern in womensDayPromotion.ts).
export const CAT_EYE_ELIGIBLE_SLUGS = new Set<string>([
  'pink-cat-eye-gel',
  'rainbow-purple-cat-eye-gel',
  'pink-effect-cat-eye-gel',
  'brown-cat-eye-gel',
  'nude-brown-cat-eye-gel',
]);

export type CatEyeOfferLine = {
  productId?: string | null;
  slug?: string | null;
  unitPriceCents: number;
  quantity: number;
};

export type CatEyeOfferResult = {
  eligibleUnits: number;
  selectedSubtotalCents: number;
  discountCents: number;
  applied: boolean;
};

const normalize = (value: unknown): string => String(value || '').trim().toLowerCase();

export function isCatEyeEligibleProduct(line: CatEyeOfferLine): boolean {
  return (
    CAT_EYE_ELIGIBLE_PRODUCT_IDS.has(normalize(line.productId)) ||
    CAT_EYE_ELIGIBLE_SLUGS.has(normalize(line.slug))
  );
}

export function calculateCatEyeTwoForOffer(lines: CatEyeOfferLine[]): CatEyeOfferResult {
  const eligible = lines
    .filter(isCatEyeEligibleProduct)
    .map((line) => ({
      unitPriceCents: Math.max(0, Math.round(Number(line.unitPriceCents) || 0)),
      quantity: Math.max(0, Math.floor(Number(line.quantity) || 0)),
    }))
    .filter((line) => line.quantity > 0);

  const eligibleUnits = eligible.reduce((sum, line) => sum + line.quantity, 0);
  const applied = eligibleUnits >= CAT_EYE_REQUIRED_UNITS;
  let remaining = applied ? CAT_EYE_REQUIRED_UNITS : 0;
  let selectedSubtotalCents = 0;

  // Discount the priciest eligible units first — most generous to the
  // customer if a future shade ever launches at a different price than the
  // current flat R180 (today this ordering has no visible effect).
  eligible.sort((a, b) => b.unitPriceCents - a.unitPriceCents);
  for (const line of eligible) {
    if (remaining <= 0) break;
    const selectedQuantity = Math.min(remaining, line.quantity);
    selectedSubtotalCents += selectedQuantity * line.unitPriceCents;
    remaining -= selectedQuantity;
  }

  return {
    eligibleUnits,
    selectedSubtotalCents,
    discountCents: applied ? Math.max(0, selectedSubtotalCents - CAT_EYE_BUNDLE_PRICE_CENTS) : 0,
    applied,
  };
}
