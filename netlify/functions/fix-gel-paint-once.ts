/**
 * ONE-TIME fix — remove after use.
 * GET /.netlify/functions/fix-gel-paint-once?secret=blom-fix-2026
 *
 * 1. Hard-deletes the Gel Paint Set product that has NO image
 * 2. Sets stock = 0 on the one WITH an image (keeps it visible, shows Out of Stock)
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

  // 1. Find all gel paint products
  const findRes = await fetch(
    `${SUPABASE_URL}/rest/v1/products?slug=eq.blom-gel-paint-set-12-colours&select=id,name,slug,stock,is_active,featured_image`,
    { headers: h }
  );
  const allProducts = findRes.ok ? await findRes.json() : [];

  // Split into: has image vs no image
  const withImage    = allProducts.filter((p: any) => p.featured_image && p.featured_image.trim() !== '');
  const withoutImage = allProducts.filter((p: any) => !p.featured_image || p.featured_image.trim() === '');

  const log: any = { found: allProducts, withImage, withoutImage, steps: [] };

  // 2. Hard-delete the imageless one(s) — clean up children first
  for (const p of withoutImage) {
    const id = p.id;

    // Delete product_images rows
    const imgDel = await fetch(`${SUPABASE_URL}/rest/v1/product_images?product_id=eq.${id}`, { method: 'DELETE', headers: h });
    log.steps.push({ action: 'delete_product_images', id, status: imgDel.status });

    // Delete product_variants rows
    const varDel = await fetch(`${SUPABASE_URL}/rest/v1/product_variants?product_id=eq.${id}`, { method: 'DELETE', headers: h });
    log.steps.push({ action: 'delete_product_variants', id, status: varDel.status });

    // Delete the product itself
    const prodDel = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, { method: 'DELETE', headers: h });
    const prodDelText = await prodDel.text();
    log.steps.push({ action: 'delete_product', id, status: prodDel.status, body: prodDelText });
  }

  // 3. Mark the one WITH an image as out of stock (stock = 0, still visible)
  for (const p of withImage) {
    const id = p.id;
    const oos = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
      method: 'PATCH',
      headers: h,
      body: JSON.stringify({ stock: 0 }),
    });
    log.steps.push({ action: 'set_out_of_stock', id, status: oos.status });
  }

  log.message = 'Done. Now delete netlify/functions/fix-gel-paint-once.ts from the repo.';

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(log, null, 2),
  };
};
