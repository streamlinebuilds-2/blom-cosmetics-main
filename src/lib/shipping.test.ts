import assert from 'node:assert/strict';
import test from 'node:test';
import {
  SHIPPING_FLAT_RATE,
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FLAT_RATE_CENTS,
  FREE_SHIPPING_THRESHOLD_CENTS,
  SHIPPING_FLAT_RATE_LABEL,
  FREE_SHIPPING_THRESHOLD_LABEL,
  standardShippingFor,
  standardShippingCentsFor,
  amountToFreeShipping,
  qualifiesForFreeShipping,
} from './shipping';

test('published delivery pricing', () => {
  assert.equal(SHIPPING_FLAT_RATE, 150);
  assert.equal(FREE_SHIPPING_THRESHOLD, 2800);
  assert.equal(SHIPPING_FLAT_RATE_CENTS, 15000);
  assert.equal(FREE_SHIPPING_THRESHOLD_CENTS, 280000);
  assert.equal(SHIPPING_FLAT_RATE_LABEL, 'R150');
  assert.equal(FREE_SHIPPING_THRESHOLD_LABEL, 'R2800');
});

test('charges the flat rate below the threshold', () => {
  assert.equal(standardShippingFor(0), 150);
  assert.equal(standardShippingFor(1), 150);
  assert.equal(standardShippingFor(2799.99), 150);
});

test('delivery is free at and above the threshold', () => {
  assert.equal(standardShippingFor(2800), 0);
  assert.equal(standardShippingFor(2800.01), 0);
  assert.equal(standardShippingFor(10000), 0);
});

test('the cents helper agrees with the rand helper at the boundary', () => {
  assert.equal(standardShippingCentsFor(279999), 15000);
  assert.equal(standardShippingCentsFor(280000), 0);
  assert.equal(standardShippingCentsFor(280001), 0);

  for (const subtotal of [0, 499.5, 2799.99, 2800, 5000]) {
    assert.equal(
      standardShippingCentsFor(Math.round(subtotal * 100)),
      standardShippingFor(subtotal) * 100,
      `client and server disagree at R${subtotal}`
    );
  }
});

test('progress-to-free-delivery copy never goes negative', () => {
  assert.equal(amountToFreeShipping(0), 2800);
  assert.equal(amountToFreeShipping(1000), 1800);
  assert.equal(amountToFreeShipping(2800), 0);
  assert.equal(amountToFreeShipping(9999), 0);
});

test('the free-delivery badge matches the charged price', () => {
  for (const subtotal of [0, 2799.99, 2800, 4000]) {
    assert.equal(
      qualifiesForFreeShipping(subtotal),
      standardShippingFor(subtotal) === 0,
      `badge and price disagree at R${subtotal}`
    );
  }
});
