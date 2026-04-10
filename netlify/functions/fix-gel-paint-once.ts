/**
 * ONE-TIME fix — remove after use.
 * GET /.netlify/functions/fix-gel-paint-once?secret=blom-fix-2026
 *
 * 1. Hard-deletes the Gel Paint Set that has NO image (the blank one in All Products)
 * 2. Sets stock = 0 on the one WITH an image (Bundle Deals → shows Out of Stock)
 */
import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  if (event.queryStringParameters?.secret !== 'blom-fix-2026') {
    return { statusCode: 403, body: 'Forbidden' };
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return { statusCode: 500, body: 'Missing env vars' };
  }

  const h = {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };

  // 1. Find ALL products with "gel paint" in the name (catches both regardless of slug)
  const findRes = await fetch(
    `${SUPABASE_URL}/rest/v1/products?name=ilike.*gel+paint*&select=id,name,slug,stock,is_active,featured_image`,
    { headers: h }
  );
  const allProducts = findRes.ok ? await findRes.json() : [];

  const withImage    = allProducts.filter((p: any) => p.featured_image && p.featured_image.trim() !== '');
  const withoutImage = allProducts.filter((p: any) => !p.featured_image || p.featured_image.trim() === '');

  const log: any = { found: allProducts, toDelete: withoutImage, toMarkOOS: withImage, steps: [] };

  // 2. Hard-delete the imageless one(s) — remove children first to avoid FK errors
  for (const p of withoutImage) {
    const id = p.id;

    const imgDel = await fetch(`${SUPABASE_URL}/rest/v1/product_images?product_id=eq.${id}`, { method: 'DELETE', headers: h });
    log.steps.push({ action: 'delete_product_images', id, status: imgDel.status });

    const varDel = await fetch(`${SUPABASE_URL}/rest/v1/product_variants?product_id=eq.${id}`, { method: 'DELETE', headers: h });
    log.steps.push({ action: 'delete_product_variants', id, status: varDel.status });

    const prodDel = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, { method: 'DELETE', headers: h });
    log.steps.push({ action: 'delete_product', id, name: p.name, slug: p.slug, status: prodDel.status });
  }

  // 3. Set stock = 0 on the one WITH an image (stays visible, shows Sold Out)
  for (const p of withImage) {
    const id = p.id;
    const oos = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
      method: 'PATCH',
      headers: h,
      body: JSON.stringify({ stock: 0 }),
    });
    log.steps.push({ action: 'set_out_of_stock', id, name: p.name, slug: p.slug, status: oos.status });
  }

  log.done = true;
  log.next = 'Delete netlify/functions/fix-gel-paint-once.ts from the repo now.';

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(log, null, 2),
  };
};
