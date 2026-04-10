/**
 * ONE-TIME diagnostic — remove after use.
 * GET /.netlify/functions/fix-gel-paint-once?secret=blom-fix-2026
 */
import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  if (event.queryStringParameters?.secret !== 'blom-fix-2026') {
    return { statusCode: 403, body: 'Forbidden' };
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const h = {
    apikey: SERVICE_KEY ?? '',
    Authorization: `Bearer ${SERVICE_KEY ?? ''}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };

  // Try common table names to find where products live
  const tableChecks: Record<string, any> = {};
  for (const tbl of ['products', 'product', 'store_products', 'items', 'catalogue']) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${tbl}?limit=3&select=id,name`, { headers: h });
    tableChecks[tbl] = { status: r.status, sample: r.ok ? await r.json() : await r.text() };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      supabase_url: SUPABASE_URL ?? 'MISSING',
      service_key_present: !!SERVICE_KEY,
      table_checks: tableChecks,
    }, null, 2),
  };
};
