/**
 * Single source of truth for standard door-to-door delivery pricing.
 *
 * Imported by the storefront (cart, checkout, banners, product pages) AND by
 * the Netlify functions that price orders server-side and render invoices, so
 * the quoted price, the charged price and the invoiced price can never drift.
 *
 * Furniture, collection and Uber same-day orders are priced separately and do
 * not use these values — see create-order.ts.
 */

/** Flat door-to-door delivery fee, in rand. */
export const SHIPPING_FLAT_RATE = 150;

/** Cart subtotal (in rand) at or above which delivery is free. */
export const FREE_SHIPPING_THRESHOLD = 2800;

/** Same values in cents, for the order/invoice pipeline. */
export const SHIPPING_FLAT_RATE_CENTS = SHIPPING_FLAT_RATE * 100;
export const FREE_SHIPPING_THRESHOLD_CENTS = FREE_SHIPPING_THRESHOLD * 100;

/** Display strings for banners and marketing copy, e.g. "R150" / "R2800". */
export const SHIPPING_FLAT_RATE_LABEL = `R${SHIPPING_FLAT_RATE}`;
export const FREE_SHIPPING_THRESHOLD_LABEL = `R${FREE_SHIPPING_THRESHOLD}`;

/** Standard delivery charge in rand for a given cart subtotal in rand. */
export function standardShippingFor(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
}

/** Standard delivery charge in cents for a given cart subtotal in cents. */
export function standardShippingCentsFor(subtotalCents: number): number {
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_FLAT_RATE_CENTS;
}

/** Rand still needed to unlock free delivery (0 once qualified). */
export function amountToFreeShipping(subtotal: number): number {
  return Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
}

/** Whether a cart subtotal in rand qualifies for free delivery. */
export function qualifiesForFreeShipping(subtotal: number): boolean {
  return subtotal >= FREE_SHIPPING_THRESHOLD;
}
