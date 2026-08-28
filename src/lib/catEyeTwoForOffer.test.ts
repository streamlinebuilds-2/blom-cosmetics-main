import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CAT_EYE_BUNDLE_PRICE_CENTS,
  CAT_EYE_ELIGIBLE_PRODUCT_IDS,
  calculateCatEyeTwoForOffer,
} from './catEyeTwoForOffer';

// Eligibility is tested against real slugs (the fallback matcher) so this
// suite still passes before CAT_EYE_ELIGIBLE_PRODUCT_IDS is filled in with
// real product ids at launch time.
const gel = (unitPriceCents: number, quantity = 1, overrides = {}) => ({
  productId: 'not-a-real-id',
  slug: 'pink-cat-eye-gel',
  unitPriceCents,
  quantity,
  ...overrides,
});

test('no discount below 2 eligible units', () => {
  assert.equal(calculateCatEyeTwoForOffer([]).discountCents, 0);
  assert.equal(calculateCatEyeTwoForOffer([gel(18000, 1)]).discountCents, 0);
});

test('2 eligible units at R180 each drop to the R340 combined price', () => {
  const result = calculateCatEyeTwoForOffer([gel(18000, 2)]);
  assert.equal(result.applied, true);
  assert.equal(result.eligibleUnits, 2);
  assert.equal(result.selectedSubtotalCents, 36000);
  assert.equal(result.discountCents, 36000 - CAT_EYE_BUNDLE_PRICE_CENTS);
  assert.equal(result.discountCents, 2000);
});

test('only the first 2 units are discounted — extra units stay full price', () => {
  assert.equal(calculateCatEyeTwoForOffer([gel(18000, 3)]).discountCents, 2000);
  assert.equal(calculateCatEyeTwoForOffer([gel(18000, 4)]).discountCents, 2000);
  assert.equal(calculateCatEyeTwoForOffer([gel(18000, 10)]).discountCents, 2000);
});

test('discount applies across different shades, not just one line', () => {
  const cart = [
    gel(18000, 1, { slug: 'pink-cat-eye-gel' }),
    gel(18000, 1, { slug: 'brown-cat-eye-gel' }),
  ];
  const result = calculateCatEyeTwoForOffer(cart);
  assert.equal(result.eligibleUnits, 2);
  assert.equal(result.discountCents, 2000);
});

test('non-eligible products (e.g. the Cat Eye Top Coat) are ignored', () => {
  const cart = [
    gel(18000, 2),
    gel(19500, 5, { slug: 'cat-eye-top-coat', productId: 'top-coat-id' }),
  ];
  const result = calculateCatEyeTwoForOffer(cart);
  assert.equal(result.eligibleUnits, 2);
  assert.equal(result.discountCents, 2000);
});

test('the priciest eligible units are discounted first', () => {
  const cart = [
    gel(18000, 1, { slug: 'pink-cat-eye-gel' }),
    gel(20000, 1, { slug: 'brown-cat-eye-gel' }),
    gel(15000, 1, { slug: 'rainbow-purple-cat-eye-gel' }),
  ];
  const result = calculateCatEyeTwoForOffer(cart);
  // Should pick the 20000 + 18000 units (the two most expensive), not 15000.
  assert.equal(result.selectedSubtotalCents, 38000);
  assert.equal(result.discountCents, 38000 - CAT_EYE_BUNDLE_PRICE_CENTS);
});

test('eligibility matches by product id when populated, in addition to slug', () => {
  CAT_EYE_ELIGIBLE_PRODUCT_IDS.add('real-product-id');
  try {
    const result = calculateCatEyeTwoForOffer([
      gel(18000, 2, { productId: 'real-product-id', slug: 'not-in-slug-list' }),
    ]);
    assert.equal(result.eligibleUnits, 2);
  } finally {
    CAT_EYE_ELIGIBLE_PRODUCT_IDS.delete('real-product-id');
  }
});
