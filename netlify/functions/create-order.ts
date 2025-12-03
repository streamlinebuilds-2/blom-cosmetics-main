import type { Handler } from '@netlify/functions'

export const handler: Handler = async (event) => {
  try {
    // 1. Basic Setup
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' }
    }

    const body = JSON.parse(event.body || '{}')
    const items = body.items || []
    
    // UUID Validator
    const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    const SUPABASE_URL = process.env.SUPABASE_URL
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!SUPABASE_URL || !SERVICE_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error' }) }
    }

    // --- 2. Load Product Dictionary (For lookup) ---
    const productsRes = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,name,slug,sku,price`, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }
    });
    const dbProducts = productsRes.ok ? await productsRes.json() : [];
    
    // Build lookup maps
    const idMap = new Map();
    dbProducts.forEach((p: any) => {
      idMap.set(p.id.toLowerCase(), p.id); // UUID
      if (p.name) idMap.set(p.name.toLowerCase().trim(), p.id); // Name
      if (p.slug) idMap.set(p.slug.toLowerCase().trim(), p.id); // Slug
    });

    // --- 3. Normalize Items (The Crash Fix) ---
    const validItems: Array<{
      resolved_id: string | null;
      product_name: string;
      quantity: number;
      unit_price: number;
      original_sku?: string;
    }> = [];
    const missingProducts = new Map<string, { name: string; sku: string; price: number }>();

    for (const it of items) {
      // Construct full name (Product + Variant)
      let finalName = it.product_name || it.name || 'Unknown Product';
      if (it.variant && it.variant.title && it.variant.title !== 'Default Title') {
        finalName = `${finalName} - ${it.variant.title}`;
      }

      // RESOLVE ID: Check input ID, then Name, then Slug
      let rawId = it.product_id || it.productId || it.id;
      let resolvedId = null;

      // A. Is the raw ID a valid UUID that exists?
      if (rawId && isUUID(rawId) && idMap.has(String(rawId).toLowerCase())) {
        resolvedId = idMap.get(String(rawId).toLowerCase());
      }
      // B. Try Name Match
      if (!resolvedId && idMap.has(finalName.toLowerCase().trim())) {
        resolvedId = idMap.get(finalName.toLowerCase().trim());
      }

      // C. Handle Missing
      if (!resolvedId) {
        console.log(`⚠️ Product not found: "${finalName}" - Will Auto-Create`);
        missingProducts.set(finalName, { 
          name: finalName, 
          sku: it.sku || `SKU-${Date.now()}-${Math.floor(Math.random()*1000)}`,
          price: it.unit_price ?? it.price ?? 0
        });
      }

      validItems.push({
        resolved_id: resolvedId, // might be null temporarily
        product_name: finalName,
        quantity: Number(it.quantity || 1),
        unit_price: Number(it.unit_price ?? it.price ?? 0),
        original_sku: it.sku
      });
    }

    // --- 4. Create Missing Products ---
    if (missingProducts.size > 0) {
      for (const [name, data] of missingProducts) {
        try {
          const createRes = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
            method: 'POST',
            headers: {
              apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
              'Content-Type': 'application/json', 'Prefer': 'return=representation'
            },
            body: JSON.stringify({
              name: data.name,
              slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              sku: data.sku,
              price: data.price,
              is_active: true,
              stock_on_hand: 100
            })
          });
          
          if (createRes.ok) {
            const newProd = await createRes.json();
            const newId = newProd[0]?.id;
            if (newId) {
              // Backfill the new ID into our validItems list
              validItems.forEach(v => { if (v.product_name === name) v.resolved_id = newId; });
            }
          }
        } catch (e) { console.error(`Failed to create ${name}`, e); }
      }
    }

    // --- 5. Create Order (RPC) ---
    // Normalize Buyer
    let buyer = body.buyer || {};
    if (body.shippingInfo) {
      buyer = {
        name: `${body.shippingInfo.firstName} ${body.shippingInfo.lastName}`,
        email: body.shippingInfo.email,
        phone: body.shippingInfo.phone
      };
    }

    // Prepare RPC Payload
    const rpcPayload = {
      p_order_number: `BL-${Date.now().toString(36).toUpperCase()}`,
      p_m_payment_id: `BL-${Date.now().toString(16).toUpperCase()}`,
      p_buyer_email: buyer.email,
      p_buyer_name: buyer.name,
      p_buyer_phone: buyer.phone,
      p_channel: 'website',
      // CRITICAL: Only send clean data to Postgres
      p_items: validItems.filter(i => i.resolved_id).map(it => ({
        product_id: it.resolved_id, 
        product_name: it.product_name,
        quantity: it.quantity,
        unit_price: it.unit_price,
        sku: it.original_sku
      })),
      p_subtotal_cents: Number(body.totals?.subtotal_cents || 0),
      p_shipping_cents: Number(body.totals?.shipping_cents || 0),
      p_discount_cents: Number(body.totals?.discount_cents || (body.coupon ? body.coupon.discount_cents : 0) || 0),
      p_tax_cents: 0,
      p_fulfillment_method: body.fulfillment?.method || (body.shippingMethod === 'store-pickup' ? 'collection' : 'delivery'),
      p_delivery_address: body.fulfillment?.method === 'delivery' ? body.shipping?.address : null,
      p_collection_location: body.fulfillment?.collection_location
    };

    const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/api_create_order`, {
      method: 'POST',
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(rpcPayload)
    });

    if (!rpcRes.ok) {
      const err = await rpcRes.text();
      throw new Error(`Database Error: ${err}`);
    }

    const orderData = await rpcRes.json();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Array.isArray(orderData) ? orderData[0] : orderData)
    };

  } catch (e: any) {
    console.error('Fatal Error:', e);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
}
