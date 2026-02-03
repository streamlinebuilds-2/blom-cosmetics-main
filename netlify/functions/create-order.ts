import type { Handler } from '@netlify/functions'
import crypto from 'crypto'

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }

    const body = JSON.parse(event.body || '{}')
    const items = body.items || []
    const orderKind = body.order_kind === 'course' ? 'course' : 'product'
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

    // --- FIX 1 & 2: Normalize Fulfillment Method ---
    // The checkout sends 'shipping.method' as 'store-pickup' or 'door-to-door'
    // We need to map this to 'collection' or 'delivery' for the DB
    const rawMethod = body.shipping?.method || body.fulfillment?.method || 'delivery';
    const fulfillmentMethod = (rawMethod === 'store-pickup' || rawMethod === 'collection') ? 'collection' : 'delivery';
    
    // Select the correct address object
    // If delivery, use shipping address. If collection, it is null.
    const deliveryAddress = fulfillmentMethod === 'delivery' ? (body.shipping?.address || body.fulfillment?.address || body.delivery_address) : null;
    const collectionLocation = fulfillmentMethod === 'collection' ? 'BLOM HQ' : null;

    const hasFurniture = validItems.some((it) => {
      const name = String(it.resolved_product?.name || it.base_name || '').toLowerCase()
      return ['table', 'station', 'desk', 'dresser', 'bed', 'chair', 'rack'].some((k) => name.includes(k))
    })

    const nowBase36 = Date.now().toString(36).toUpperCase()
    const entropy = crypto.randomBytes(3).toString('hex').toUpperCase()
    const canonicalPaymentId = String(body.m_payment_id || body.merchant_payment_id || body.payment_id || `BL-${nowBase36}-${entropy}`)

    const subtotalCents = validItems.reduce((sum: number, it: any) => {
      const qty = Number(it.quantity || 0)
      const unitPriceCents = Math.round(Number(it.unit_price || 0))
      return sum + Math.max(0, qty) * Math.max(0, unitPriceCents)
    }, 0)

    let shippingCents = 0
    if (fulfillmentMethod === 'collection') {
      shippingCents = hasFurniture ? 500 * 100 : 0
    } else if (hasFurniture) {
      shippingCents = 0
    } else {
      shippingCents = subtotalCents >= 2000 * 100 ? 0 : 120 * 100
    }

    const rawDiscountCents = Math.round(Number(body.totals?.discount_cents ?? body.discount_cents ?? 0))
    const discountCents = Math.max(0, Math.min(rawDiscountCents, subtotalCents + shippingCents))

    // 3. Create Order via RPC
    const rpcPayload = {
      p_order_number: `BL-${nowBase36}-${entropy}`,
      p_m_payment_id: canonicalPaymentId,
      p_buyer_email: body.shippingInfo?.email || body.buyer?.email,
      p_buyer_name: body.shippingInfo ? `${body.shippingInfo.firstName} ${body.shippingInfo.lastName}` : body.buyer?.name,
      p_buyer_phone: body.shippingInfo?.phone || body.buyer?.phone,
      p_channel: 'website',
      
      // 4. CONSTRUCT ITEM NAMES & PRICES CORRECTLY
      p_items: validItems.map(it => {
        // Start with the Real DB Name if we found it, otherwise use what the frontend sent
        let finalDisplayName = it.resolved_product ? it.resolved_product.name : it.base_name;
        
        // Append Variant Name if it exists
        if (it.variant_name) {
            finalDisplayName = `${finalDisplayName} - ${it.variant_name}`;
        }

        // --- FIX 3: Price Scaling ---
        // Checkout sends cents (e.g., 59000). Invoice expects Rands (e.g., 590.00).
        // We divide by 100 to convert Cents -> Rands for the unit price column.
        const unitPriceRands = it.unit_price / 100;

        return {
          product_id: it.resolved_id, 
          product_name: finalDisplayName,
          quantity: it.quantity,
          unit_price: unitPriceRands, // Store as Rands (e.g. 590.00)
          sku: it.original_sku
        };
      }),
      
      p_subtotal_cents: subtotalCents,
      p_shipping_cents: shippingCents,
      p_discount_cents: discountCents,
      p_tax_cents: 0,
      p_fulfillment_method: fulfillmentMethod,
      p_delivery_address: deliveryAddress,
      p_collection_location: collectionLocation,
      p_coupon_code: body.coupon?.code || null,
      p_order_kind: orderKind
    };

    let rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/api_create_order`, {
      method: 'POST',
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(rpcPayload)
    });

    if (!rpcRes.ok) {
      const errText = await rpcRes.text();
      if (errText.includes('p_order_kind') || errText.includes('api_create_order')) {
        const { p_order_kind, ...fallbackPayload } = rpcPayload;
        rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/api_create_order`, {
          method: 'POST',
          headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(fallbackPayload)
        });
        if (!rpcRes.ok) throw new Error(`Database Error: ${await rpcRes.text()}`);
      } else {
        throw new Error(`Database Error: ${errText}`);
      }
    }

    const orderData = await rpcRes.json();
    const order = Array.isArray(orderData) ? orderData[0] : orderData;

    if (orderKind === 'course' && body.course_booking?.course_slug) {
      const booking = body.course_booking;
      const basePayload: any = {
        order_id: String(order.order_id),
        course_slug: String(booking.course_slug),
        buyer_email: String(booking.buyer_email || body.buyer?.email || ''),
        buyer_name: booking.buyer_name || body.buyer?.name || null,
        buyer_phone: booking.buyer_phone || body.buyer?.phone || null,
        course_title: booking.course_title || null,
        course_type: booking.course_type || null,
        selected_package: booking.selected_package || null,
        selected_date: booking.selected_date || null,
        amount_paid_cents: typeof booking.amount_paid_cents === 'number' ? booking.amount_paid_cents : null,
        payment_kind: booking.payment_kind || null,
        details: booking.details || null
      };

      const bookingPayload: any = {
        ...basePayload,
        amount_owed_cents: typeof booking.amount_owed_cents === 'number' ? booking.amount_owed_cents : null,
        balance_order_id: booking.balance_order_id || null
      };

      const insertBooking = async (payload: any) => {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/course_purchases?on_conflict=order_id,course_slug`, {
          method: 'POST',
          headers: {
            apikey: SERVICE_KEY,
            Authorization: `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'resolution=merge-duplicates'
          },
          body: JSON.stringify(payload)
        });
        if (!r.ok) throw new Error(await r.text());
      };

      try {
        await insertBooking(bookingPayload);
      } catch (e: any) {
        const msg = String(e?.message || e);
        if (msg.includes('amount_owed_cents') || msg.includes('balance_order_id')) {
          await insertBooking(basePayload);
        } else {
          throw e;
        }
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...order,
        m_payment_id: order?.m_payment_id ?? order?.merchant_payment_id ?? canonicalPaymentId,
        merchant_payment_id: order?.merchant_payment_id ?? order?.m_payment_id ?? canonicalPaymentId
      })
    };

  } catch (e: any) {
    console.error('Order Creation Error:', e);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
}
