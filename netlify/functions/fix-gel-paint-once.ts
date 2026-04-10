/**
 * ONE-TIME fix function — remove after use.
 * Hit: /.netlify/functions/fix-gel-paint-once?secret=blom-fix-2026
 *
 * Does two things:
 * 1. Deactivates the imageless duplicate Gel Paint Set (hides it everywhere)
 * 2. Sets stock = 0 on the real Gel Paint Set (keeps it visible, shows Out of Stock)
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

  const headers = {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };

  // 1. Find all gel paint products so we can log what we're touching
  const findRes = await fetch(
    `${SUPABASE_URL}/rest/v1/products?name=ilike.*gel+paint*&select=id,name,slug,stock,is_active,featured_image`,
    { headers }
  );
  const allProducts = findRes.ok ? await findRes.json() : [];

  // 2. Deactivate the one(s) with no image
  const deactivateRes = await fetch(
    `${SUPABASE_URL}/rest/v1/products?name=ilike.*gel+paint*&or=(featured_image.is.null,featured_image.eq.)`,
    {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ is_active: false }),
    }
  );

  // 3. Set stock = 0 on the one with an image (mark as out of stock)
  const stockRes = await fetch(
    `${SUPABASE_URL}/rest/v1/products?name=ilike.*gel+paint*&featured_image=not.is.null`,
    {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ stock: 0 }),
    }
  );

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      found: allProducts,
      deactivated_no_image: deactivateRes.status,
      set_out_of_stock: stockRes.status,
      message: 'Done. Delete netlify/functions/fix-gel-paint-once.ts now.',
    }),
  };
};
