/**
 * ONE-TIME fix — remove after use.
 * GET /.netlify/functions/fix-gel-paint-once?secret=blom-fix-2026
 */
import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  if (event.queryStringParameters?.secret !== 'blom-fix-2026') {
    return { statusCode: 403, body: 'Forbidden' };
  }

  const SUPABASE_URL = process.env.SUPABASE_URL!;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const h = {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };

  // Fetch ALL products, filter in JS — avoids all URL encoding issues
  const allRes = await fetch(
    `${SUPABASE_URL}/rest/v1/products?select=id,name,slug,stock,is_active,featured_image&limit=500`,
    { headers: h }
  );
  const allProducts: any[] = allRes.ok ? await allRes.json() : [];

  // Find gel paint by slug (we know it from the URL)
  const gelPaint = allProducts.filter((p: any) => {
    const slug = String(p.slug ?? '').toLowerCase();
    const name = String(p.name ?? '').toLowerCase();
    return slug.includes('gel-paint') || slug.includes('gel_paint') ||
           name.includes('gel paint') || name.includes('gelpaint');
  });

  if (gelPaint.length === 0) {
    // Not found — return a sample of all slugs so we can spot it manually
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Gel paint product not found in first 500 products',
        total_fetched: allProducts.length,
        all_slugs: allProducts.map((p: any) => p.slug),
      }, null, 2),
    };
  }

  const withImage    = gelPaint.filter((p: any) => p.featured_image && String(p.featured_image).trim() !== '');
  const withoutImage = gelPaint.filter((p: any) => !p.featured_image || String(p.featured_image).trim() === '');

  const steps: any[] = [];

  // Delete the imageless duplicate (clean up children first)
  for (const p of withoutImage) {
    const id = p.id;
    const imgDel = await fetch(`${SUPABASE_URL}/rest/v1/product_images?product_id=eq.${id}`, { method: 'DELETE', headers: h });
    steps.push({ action: 'delete_product_images', id, status: imgDel.status });

    const varDel = await fetch(`${SUPABASE_URL}/rest/v1/product_variants?product_id=eq.${id}`, { method: 'DELETE', headers: h });
    steps.push({ action: 'delete_variants', id, status: varDel.status });

    const del = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, { method: 'DELETE', headers: h });
    steps.push({ action: 'DELETE product', id, name: p.name, slug: p.slug, status: del.status });
  }

  // Mark the one with image as out of stock
  for (const p of withImage) {
    const id = p.id;
    const patch = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
      method: 'PATCH',
      headers: h,
      body: JSON.stringify({ stock: 0 }),
    });
    steps.push({ action: 'set stock=0', id, name: p.name, slug: p.slug, status: patch.status });
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gelPaint, withImage, withoutImage, steps }, null, 2),
  };
};
