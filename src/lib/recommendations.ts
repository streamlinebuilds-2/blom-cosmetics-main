// Cart "Recommended for you" logic.
//
// Recommendations are derived from the live product catalog
// (/content/products/index.json — the same source ShopPage falls back to)
// instead of a hardcoded list. This means:
//  - discontinued products (e.g. the old Watermelon cuticle oil) can never
//    appear here, because they are not in the catalog, and
//  - suggestions are tailored to what's already in the cart (same category
//    first) and rotate so the customer doesn't always see the same items.

import { CartItem } from './cart';

export interface CatalogProduct {
  slug: string;
  title: string;
  price: number;
  thumbnail?: string;
  images?: string[];
  category?: string;
  status?: string;
  stockStatus?: string;
  rating?: number;
  reviews?: number;
}

export interface RecommendedProduct {
  slug: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

let catalogCache: CatalogProduct[] | null = null;
let catalogPromise: Promise<CatalogProduct[]> | null = null;

// Load (and cache) the catalog. Mirrors ShopPage's fallback fetch.
export async function loadCatalog(): Promise<CatalogProduct[]> {
  if (catalogCache) return catalogCache;
  if (!catalogPromise) {
    catalogPromise = fetch('/content/products/index.json', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: unknown) => {
        catalogCache = Array.isArray(data) ? (data as CatalogProduct[]) : [];
        return catalogCache;
      })
      .catch(() => {
        catalogCache = [];
        return catalogCache;
      });
  }
  return catalogPromise;
}

const isAvailable = (p: CatalogProduct): boolean =>
  (p.status || 'active') === 'active' &&
  p.stockStatus === 'In Stock' &&
  typeof p.price === 'number' &&
  p.price >= 0;

const byPopularity = (a: CatalogProduct, b: CatalogProduct): number =>
  (b.rating || 0) - (a.rating || 0) || (b.reviews || 0) - (a.reviews || 0);

// Rotate an array by n places so repeat visits surface different items.
const rotate = <T>(arr: T[], n: number): T[] => {
  if (arr.length === 0) return arr;
  const offset = ((n % arr.length) + arr.length) % arr.length;
  return arr.slice(offset).concat(arr.slice(0, offset));
};

const toRecommended = (p: CatalogProduct): RecommendedProduct => ({
  slug: p.slug,
  name: p.title,
  price: p.price,
  image: p.thumbnail || (p.images && p.images[0]) || '',
  category: p.category || '',
});

/**
 * Build "Recommended for you" suggestions for the current cart.
 *
 * Products that share a category with something already in the cart are
 * prioritised, then the rest of the catalog fills any remaining slots.
 * Anything already in the cart is excluded, and a seed-based rotation keeps
 * the list from being identical every time.
 */
export function buildRecommendations(
  catalog: CatalogProduct[],
  cartItems: CartItem[],
  limit = 3,
  seed = 0
): RecommendedProduct[] {
  const inCart = new Set(cartItems.map((i) => i.productId));
  const bySlug = new Map(catalog.map((p) => [p.slug, p]));

  // Categories represented in the cart (mapped from each item's slug).
  const cartCategories = new Set(
    cartItems
      .map((i) => bySlug.get(i.productId)?.category)
      .filter((c): c is string => Boolean(c))
  );

  const available = catalog.filter((p) => isAvailable(p) && !inCart.has(p.slug));

  const sameCategory = available
    .filter((p) => p.category && cartCategories.has(p.category))
    .sort(byPopularity);
  const otherCategory = available
    .filter((p) => !p.category || !cartCategories.has(p.category))
    .sort(byPopularity);

  const ordered = [
    ...rotate(sameCategory, seed),
    ...rotate(otherCategory, seed),
  ];

  return ordered.slice(0, limit).map(toRecommended);
}
