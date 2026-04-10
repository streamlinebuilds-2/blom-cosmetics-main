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

  // Step 1: fetch only id,name,slug — we know these columns exist
  const allRes = await fetch(
    `${SUPABASE_URL}/rest/v1/products?select=id,name,slug&limit=500`,
    { headers: h }
  );
  const allRaw = await allRes.text();
  const allProducts: any[] = allRes.ok ? JSON.parse(allRaw) : [];

  // Step 2: find gel paint products
  const gelPaint = allProducts.filter((p: any) => {
    const slug = String(p.slug ?? '').toLowerCase();
    const name = String(p.name ?? '').toLowerCase();
    return slug.includes('gel-paint') || slug.includes('gel_paint') ||
           name.includes('gel paint') || name.includes('gelpaint');
  });

  if (gelPaint.length === 0) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fetch_status: allRes.status,
        total_fetched: allProducts.length,
        all_slugs: allProducts.map((p: any) => p.slug),
        raw_sample: allRaw.slice(0, 500),
      }, null, 2),
    };
  }

  // Step 3: for each gel paint product, fetch ALL columns so we know the schema
  const details: any[] = [];
  for (const p of gelPaint) {
    const dr = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${p.id}&select=*`, { headers: h });
    const d = dr.ok ? await dr.json() : await dr.text();
    details.push(d);
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gelPaint, full_details: details }, null, 2),
  };
};
