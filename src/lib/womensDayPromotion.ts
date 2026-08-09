export const WOMENS_DAY_PROMOTION_CODE = 'WOMENSDAY2026';
export const WOMENS_DAY_PROMOTION_NAME = 'Women\'s Day Promotion';
export const WOMENS_DAY_START_ISO = '2026-08-09T00:00:00+02:00';
export const WOMENS_DAY_END_ISO = '2026-08-11T00:00:00+02:00';
export const WOMENS_DAY_DISCOUNT_PERCENT = 15;
export const WOMENS_DAY_REQUIRED_UNITS = 5;

export const WOMENS_DAY_EXCLUDED_PRODUCT_IDS = new Set([
  '12f1a1d2-4313-4464-9d0e-0c39497a69f9',
  'd83c7a4b-eb94-467b-aece-9c7e3f0c7095',
]);

const EXCLUDED_SLUGS = new Set(['250ml-nail-liquid', '500ml-nail-liquid']);
const ELIGIBLE_CATEGORIES = new Set([
  'acrylic-system',
  'gel-system',
  'prep-finishing',
  'tools-accessories',
  'tools',
  'tools & essentials',
  'accessories',
  'bundle-deals',
]);

export type WomensDayPromotionLine = {
  productId?: string | null;
  slug?: string | null;
  category?: string | null;
  subcategory?: string | null;
  unitPriceCents: number;
  quantity: number;
};

export type WomensDayPromotionResult = {
  isLive: boolean;
  eligibleUnits: number;
  unitsNeeded: number;
  selectedSubtotalCents: number;
  discountCents: number;
  applied: boolean;
};

export type DiscountChoice = {
  source: 'none' | 'coupon' | 'womens_day';
  discountCents: number;
  code: string | null;
};

type PromotionCartItem = {
  id?: string;
  productId?: string;
  price: number;
  quantity: number;
};

type PromotionCatalogItem = {
  id?: string;
  slug?: string;
  category?: string;
  subcategory?: string;
};

const normalize = (value: unknown): string =>
  String(value || '').trim().toLowerCase().replace(/\.+$/, '');

export function womensDayPromotionIsLive(now: Date | number = new Date()): boolean {
  const timestamp = typeof now === 'number' ? now : now.getTime();
  return timestamp >= Date.parse(WOMENS_DAY_START_ISO) && timestamp < Date.parse(WOMENS_DAY_END_ISO);
}

export function isWomensDayEligibleProduct(line: WomensDayPromotionLine): boolean {
  const productId = normalize(line.productId);
  const slug = normalize(line.slug);
  const category = normalize(line.category);
  const subcategory = normalize(line.subcategory);

  if (!ELIGIBLE_CATEGORIES.has(category)) return false;
  if (WOMENS_DAY_EXCLUDED_PRODUCT_IDS.has(productId) || EXCLUDED_SLUGS.has(slug)) return false;
  if (category === 'acrylic-system' && subcategory === 'liquids') return false;
  return true;
}

export function calculateWomensDayPromotion(
  lines: WomensDayPromotionLine[],
  now: Date | number = new Date(),
): WomensDayPromotionResult {
  const isLive = womensDayPromotionIsLive(now);
  const eligible = lines
    .filter(isWomensDayEligibleProduct)
    .map((line) => ({
      unitPriceCents: Math.max(0, Math.round(Number(line.unitPriceCents) || 0)),
      quantity: Math.max(0, Math.floor(Number(line.quantity) || 0)),
    }))
    .filter((line) => line.quantity > 0);

  const eligibleUnits = eligible.reduce((sum, line) => sum + line.quantity, 0);
  const applied = isLive && eligibleUnits >= WOMENS_DAY_REQUIRED_UNITS;
  let remaining = applied ? WOMENS_DAY_REQUIRED_UNITS : 0;
  let selectedSubtotalCents = 0;

  eligible.sort((a, b) => a.unitPriceCents - b.unitPriceCents);
  for (const line of eligible) {
    if (remaining <= 0) break;
    const selectedQuantity = Math.min(remaining, line.quantity);
    selectedSubtotalCents += selectedQuantity * line.unitPriceCents;
    remaining -= selectedQuantity;
  }

  return {
    isLive,
    eligibleUnits,
    unitsNeeded: isLive ? Math.max(0, WOMENS_DAY_REQUIRED_UNITS - eligibleUnits) : 0,
    selectedSubtotalCents,
    discountCents: applied
      ? Math.round(selectedSubtotalCents * (WOMENS_DAY_DISCOUNT_PERCENT / 100))
      : 0,
    applied,
  };
}

export function chooseBestDiscount(
  promotionDiscountCents: number,
  couponDiscountCents: number,
  couponCode?: string | null,
): DiscountChoice {
  const promotion = Math.max(0, Math.round(promotionDiscountCents || 0));
  const coupon = Math.max(0, Math.round(couponDiscountCents || 0));

  if (promotion > 0 && promotion >= coupon) {
    return { source: 'womens_day', discountCents: promotion, code: WOMENS_DAY_PROMOTION_CODE };
  }
  if (coupon > 0) {
    return { source: 'coupon', discountCents: coupon, code: couponCode || null };
  }
  return { source: 'none', discountCents: 0, code: null };
}

export function calculateWomensDayPromotionForCart(
  cartItems: PromotionCartItem[],
  catalog: PromotionCatalogItem[],
  now: Date | number = new Date(),
): WomensDayPromotionResult {
  const byKey = new Map<string, PromotionCatalogItem>();
  for (const product of catalog) {
    if (product.id) byKey.set(product.id, product);
    if (product.slug) byKey.set(product.slug, product);
  }

  return calculateWomensDayPromotion(
    cartItems.map((item) => {
      const product = byKey.get(item.productId || '') || byKey.get(item.id || '');
      return {
        productId: product?.id || item.productId || item.id,
        slug: product?.slug,
        category: product?.category,
        subcategory: product?.subcategory,
        unitPriceCents: Math.round(Number(item.price || 0) * 100),
        quantity: item.quantity,
      };
    }),
    now,
  );
}
