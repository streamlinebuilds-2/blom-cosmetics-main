import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateWomensDayPromotion,
  chooseBestDiscount,
  WOMENS_DAY_END_ISO,
  WOMENS_DAY_START_ISO,
} from './womensDayPromotion';

const LIVE = new Date('2026-08-10T12:00:00+02:00');
const line = (price: number, quantity = 1, overrides = {}) => ({
  productId: 'eligible-id',
  slug: 'eligible-product',
  category: 'gel-system',
  unitPriceCents: price,
  quantity,
  ...overrides,
});

test('requires five eligible units and discounts the five cheapest units', () => {
  assert.equal(calculateWomensDayPromotion([line(10000, 4)], LIVE).discountCents, 0);
  assert.equal(calculateWomensDayPromotion([line(10000, 5)], LIVE).discountCents, 7500);
  assert.equal(
    calculateWomensDayPromotion([line(30000), line(10000, 3), line(20000, 2)], LIVE).discountCents,
    10500,
  );
});

test('cart order does not affect cheapest-five selection', () => {
  const prices = [40000, 10000, 35000, 15000, 30000, 20000, 25000];
  const result = calculateWomensDayPromotion(prices.map((price) => line(price)), LIVE);
  assert.equal(result.selectedSubtotalCents, 100000);
  assert.equal(result.discountCents, 15000);
  assert.equal(calculateWomensDayPromotion([line(10000, 10)], LIVE).discountCents, 7500);
});

test('nail liquid, furniture, courses, and uncategorized items do not count', () => {
  const valid = line(10000, 4);
  const excluded = [
    line(10000, 1, { productId: '12f1a1d2-4313-4464-9d0e-0c39497a69f9' }),
    line(10000, 1, { slug: '500ml-nail-liquid' }),
    line(10000, 1, { category: 'acrylic-system', subcategory: 'Liquids' }),
    line(10000, 1, { category: 'furniture' }),
    line(10000, 1, { category: 'courses' }),
    line(10000, 1, { category: null }),
  ];
  const result = calculateWomensDayPromotion([valid, ...excluded], LIVE);
  assert.equal(result.eligibleUnits, 4);
  assert.equal(result.discountCents, 0);
});

test('promotion uses a half-open SAST time window', () => {
  const five = [line(10000, 5)];
  assert.equal(calculateWomensDayPromotion(five, Date.parse(WOMENS_DAY_START_ISO) - 1).applied, false);
  assert.equal(calculateWomensDayPromotion(five, Date.parse(WOMENS_DAY_START_ISO)).applied, true);
  assert.equal(calculateWomensDayPromotion(five, Date.parse(WOMENS_DAY_END_ISO) - 1).applied, true);
  assert.equal(calculateWomensDayPromotion(five, Date.parse(WOMENS_DAY_END_ISO)).applied, false);
});

test('larger discount wins and promotion wins ties', () => {
  assert.deepEqual(chooseBestDiscount(15000, 20000, 'SAVE20'), {
    source: 'coupon', discountCents: 20000, code: 'SAVE20',
  });
  assert.equal(chooseBestDiscount(20000, 20000, 'SAVE20').source, 'womens_day');
  assert.equal(chooseBestDiscount(20000, 10000, 'SAVE10').source, 'womens_day');
});
