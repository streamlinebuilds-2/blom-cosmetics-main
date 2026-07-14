// Avané's 30th Birthday Launch — 5-Glitter Bundle, 30% off (24h flash sale).
// Single source of truth for the promo window + assets. The Netlify reconciler
// (netlify/functions/birthday-bundle-reconcile.ts) mirrors LAUNCH_ISO / EXPIRY_ISO
// so the DB price flips at the exact same instant the on-page surfaces do.
//
// SAST (UTC+2): live from midnight 15 July, 30% valid until midnight 16 July.

export const LAUNCH_ISO = '2026-07-15T00:00:00+02:00';
export const EXPIRY_ISO = '2026-07-16T00:00:00+02:00';

export const BIRTHDAY_BUNDLE_SLUG = '30th-birthday-glitter-bundle';
export const BIRTHDAY_BUNDLE_URL = `/products/${BIRTHDAY_BUNDLE_SLUG}`;

// Cloudinary (new account: hmvetruz).
export const BIRTHDAY_LANDSCAPE =
  'https://res.cloudinary.com/hmvetruz/image/upload/f_auto,q_auto/v1784048473/birthday-launch-hero-desktop.jpg';
export const BIRTHDAY_PORTRAIT =
  'https://res.cloudinary.com/hmvetruz/image/upload/f_auto,q_auto/v1784048491/birthday-launch-popup-portrait.png';

// Hero: landscape poster on desktop, portrait (reel) on mobile.
export const BIRTHDAY_HERO_DESKTOP = BIRTHDAY_LANDSCAPE;
export const BIRTHDAY_HERO_MOBILE = BIRTHDAY_PORTRAIT;

// Popup: portrait suits the tall desktop media column; landscape banner on mobile.
export const BIRTHDAY_POPUP_IMAGE_DESKTOP = BIRTHDAY_PORTRAIT;
export const BIRTHDAY_POPUP_IMAGE_MOBILE = BIRTHDAY_LANDSCAPE;

/** True while the promo is live: LAUNCH <= now < EXPIRY. */
export function promoIsLive(now: Date = new Date()): boolean {
  const t = now.getTime();
  return t >= new Date(LAUNCH_ISO).getTime() && t < new Date(EXPIRY_ISO).getTime();
}
