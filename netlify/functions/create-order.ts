import type { Handler } from '@netlify/functions'

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }

    const body = JSON.parse(event.body || '{}')
    const items = body.items || []
    const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    const SUPABASE_URL = process.env.SUPABASE_URL
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!SUPABASE_URL || !SERVICE_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error' }) }
    }

    // 1. Load Product Dictionary
    const productsRes = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,name,slug,sku,price`, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }
    });
    const dbProducts = productsRes.ok ? await productsRes.json() : [];
    
    const idMap = new Map();
    dbProducts.forEach((p: any) => {
      idMap.set(p.id.toLowerCase(), p.id);
      if (p.name) idMap.set(p.name.toLowerCase().trim(), p.id);
    });

    // 2. Process Items
    const validItems: Array<any> = [];
    
    for (const it of items) {
      let baseName = (it.product_name || it.name || 'Unknown Product').trim();
      let variantName = it.variant?.title && it.variant.title !== 'Default Title' ? it.variant.title.trim() : '';
      
      // Clean base name if it already contains the variant
      if (variantName && baseName.endsWith(` - ${variantName}`)) {
        baseName = baseName.replace(` - ${variantName}`, '');
      }

      // Resolve ID
      let resolvedId = null;
      let resolvedProduct = null;
      let rawId = it.product_id || it.productId || it.id;

      if (rawId && isUUID(rawId) && idMap.has(String(rawId).toLowerCase())) {
        resolvedId = idMap.get(String(rawId).toLowerCase());
        resolvedProduct = dbProducts.find((p: any) => p.id === resolvedId);
      }

      // If ID not found, try Name matching
      if (!resolvedId) {
        if (idMap.has(baseName.toLowerCase())) {
          resolvedId = idMap.get(baseName.toLowerCase());
          resolvedProduct = dbProducts.find((p: any) => p.id === resolvedId);
        }
      }

      validItems.push({
        resolved_id: resolvedId,
        resolved_product: resolvedProduct,
        base_name: baseName,
        variant_name: variantName, // Store variant separately
        quantity: Number(it.quantity || 1),
        unit_price: Number(it.unit_price ?? it.price ?? 0),
        original_sku: it.sku
      });
    }

    // 3. Create Order via RPC
    const rpcPayload = {
      p_order_number: `BL-${Date.now().toString(36).toUpperCase()}`,
      p_m_payment_id: `BL-${Date.now().toString(16).toUpperCase()}`, // Unique ID for PayFast
      p_buyer_email: body.shippingInfo?.email || body.buyer?.email,
      p_buyer_name: body.shippingInfo ? `${body.shippingInfo.firstName} ${body.shippingInfo.lastName}` : body.buyer?.name,
      p_buyer_phone: body.shippingInfo?.phone || body.buyer?.phone,
      p_channel: 'website',
      
      // 4. CONSTRUCT ITEM NAMES CORRECTLY
      p_items: validItems.map(it => {
        // Start with the Real DB Name if we found it, otherwise use what the frontend sent
        let finalDisplayName = it.resolved_product ? it.resolved_product.name : it.base_name;
        
        // Append Variant Name if it exists
        if (it.variant_name) {
            finalDisplayName = `${finalDisplayName} - ${it.variant_name}`;
        }

        return {
          product_id: it.resolved_id, 
          product_name: finalDisplayName, // e.g. "Cuticle Oil - Peach"
          quantity: it.quantity,
          unit_price: it.unit_price,
          sku: it.original_sku
        };
      }),
      
      p_subtotal_cents: Number(body.totals?.subtotal_cents || 0),
      p_shipping_cents: Number(body.totals?.shipping_cents || 0),
      p_discount_cents: Number(body.totals?.discount_cents || 0),
      p_tax_cents: 0,
      p_fulfillment_method: body.fulfillment?.method || 'delivery',
      p_delivery_address: (body.fulfillment?.method === 'delivery' ? body.shipping?.address : null) || null,
      p_collection_location: body.fulfillment?.collection_location || null,
      p_coupon_code: body.coupon?.code || null
    };

    const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/api_create_order`, {
      method: 'POST',
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(rpcPayload)
    });

    if (!rpcRes.ok) throw new Error(`Database Error: ${await rpcRes.text()}`);

    const orderData = await rpcRes.json();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Array.isArray(orderData) ? orderData[0] : orderData)
    };

  } catch (e: any) {
    console.error('Order Creation Error:', e);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
}
