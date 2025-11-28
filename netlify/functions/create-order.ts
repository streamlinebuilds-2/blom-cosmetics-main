import type { Handler } from '@netlify/functions'

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' }
    }

    const body = JSON.parse(event.body || '{}')

    // DEBUG: Log what frontend is sending
    console.log("📦 Received orderData:", JSON.stringify(body, null, 2));
    console.log("📦 Items array:", JSON.stringify(body.items, null, 2));

    // --- 1. Extract & Normalize Payloads ---
    let items = body.items || []
    let buyer: any = body.buyer || {}
    let fulfillment: any = body.fulfillment || {}
    const coupon = body.coupon || null

    const SUPABASE_URL = process.env.SUPABASE_URL
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!SUPABASE_URL || !SERVICE_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error' }) }
    }

    // 1a. Normalize Buyer
    if (body.customerEmail || body.customerName || body.shippingInfo) {
      buyer = {
        name: body.customerName || `${body.shippingInfo?.firstName || ''} ${body.shippingInfo?.lastName || ''}`.trim() || buyer.name,
        email: body.customerEmail || body.shippingInfo?.email || buyer.email || '',
        phone: body.customerPhone || body.shippingInfo?.phone || buyer.phone || '',
        user_id: body.customerId || buyer.user_id || null
      }
    }

    // 1b. Normalize Fulfillment (The Digital Fix)
    if (body.shipping) {
      const method = body.shipping.method;
      // Treat 'digital' as 'collection' to bypass address validation
      const isNoShipping = method === 'store-pickup' || method === 'digital' || method === 'collection';

      fulfillment = {
        method: isNoShipping ? 'collection' : 'delivery',
        delivery_address: body.shipping.address || null,
        collection_location: method === 'store-pickup' ? 'BLOM HQ, Randfontein' : (method === 'digital' ? 'Online Access' : null)
      }
    }
    // Fallback for legacy payloads
    else if (body.shippingMethod || body.deliveryAddress) {
      const method = body.shippingMethod || 'door-to-door';
      const isPickup = method === 'store-pickup' || method === 'collection';

      fulfillment = {
        method: isPickup ? 'collection' : 'delivery',
        delivery_address: !isPickup ? (body.deliveryAddress || {}) : null,
        collection_location: isPickup ? 'BLOM HQ, Randfontein' : null
      }
    }

    if (!items.length) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No items' }) }
    }

    // --- 2. CRITICAL FIX: Validate and Create Missing Products ---
    console.log('🔧 Processing items with product validation...');
    
    // Get current products for lookup
    const productsRes = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,name,sku,price`, {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`
      }
    });

    const existingProducts = productsRes.ok ? await productsRes.json() : [];
    const productMap = new Map();
    existingProducts.forEach((p: any) => {
      productMap.set(p.name.toLowerCase(), p.id);
    });

    // 2a. Normalize Items and Fix Missing Product IDs
    const normalizedItems = [];
    const missingProducts = new Set();

    for (let it of items) {
      // Determine the correct name (Product Name + Variant Name)
      let finalName = it.product_name || it.name || 'Unknown Product';
      if (it.variant && it.variant.title) {
        finalName = `${finalName} - ${it.variant.title}`;
      } else if (it.selectedVariant) {
         finalName = `${finalName} - ${it.selectedVariant}`;
      }

      // Check if product_id exists and is valid
      let productId = it.product_id || it.productId || it.id;
      
      if (!productId) {
        // Try to find by name
        const foundProductId = productMap.get(finalName.toLowerCase());
        if (foundProductId) {
          productId = foundProductId;
        } else {
          // Mark as missing product - we'll create it
          missingProducts.add(finalName);
        }
      }

      normalizedItems.push({
        product_id: productId,
        quantity: Number(it.quantity || 1),
        unit_price: Number(it.unit_price ?? it.price ?? 0),
        product_name: finalName,
        sku: it.sku || null
      });
    }

    // 2b. Create missing products
    if (missingProducts.size > 0) {
      console.log('🚨 Creating missing products:', Array.from(missingProducts));
      
      for (const productName of missingProducts) {
        const item = normalizedItems.find(item => item.product_name === productName);
        if (!item) continue;

        try {
          const createProductRes = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
            method: 'POST',
            headers: {
              apikey: SERVICE_KEY,
              Authorization: `Bearer ${SERVICE_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: productName,
              slug: productName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              sku: item.sku || `SKU-${Date.now()}`,
              price: item.unit_price,
              is_active: true,
              stock_on_hand: 100,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          });

          if (createProductRes.ok) {
            const newProduct = await createProductRes.json();
            const productId = Array.isArray(newProduct) ? newProduct[0]?.id : newProduct?.id;
            
            if (productId) {
              // Update the item with the new product ID
              const itemIndex = normalizedItems.findIndex(item => item.product_name === productName);
              if (itemIndex >= 0) {
                normalizedItems[itemIndex].product_id = productId;
              }
              console.log('✅ Created product:', productName, productId);
            }
          } else {
            console.error('❌ Failed to create product:', productName, await createProductRes.text());
          }
        } catch (error) {
          console.error('❌ Error creating product:', productName, error);
        }
      }
    }

    // 2c. Final validation - ensure all items have product_id
    const itemsWithoutProductId = normalizedItems.filter(item => !item.product_id);
    if (itemsWithoutProductId.length > 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'PRODUCT_VALIDATION_FAILED',
          message: 'Some items could not be mapped to products',
          missingProducts: itemsWithoutProductId.map(item => item.product_name)
        })
      }
    }

    console.log('✅ All items have valid product IDs');

    // --- 3. Calculate Totals ---
    let subtotal_cents = Number(body.totals?.subtotal_cents)
    let shipping_cents = Number(body.totals?.shipping_cents || 0)
    let tax_cents = Number(body.totals?.tax_cents || 0)

    if (!Number.isFinite(subtotal_cents)) {
      subtotal_cents = normalizedItems.reduce((sum: number, it: any) => sum + Math.round(Number(it.unit_price) * 100) * Number(it.quantity || 1), 0)
    }

    // --- 4. Apply Coupon (RPC) with Cart Item Validation ---
    let discount_cents = 0
    let applied_coupon_id: string | null = null
    let validation_token: string | null = null
    if (coupon?.code) {
      try {
        // Convert cart items to the expected format for coupon validation
        const cartItemsForValidation = normalizedItems.map((item: any) => ({
          product_id: String(item.product_id || ''),
          quantity: Number(item.quantity || 1),
          unit_price_cents: Math.round(Number(item.unit_price || 0) * 100)
        }))

        console.log('🔍 Validating coupon with items:', JSON.stringify({
          code: coupon.code,
          email: buyer.email,
          subtotal_cents: subtotal_cents,
          cart_items: cartItemsForValidation
        }, null, 2))

        // Use validation token from frontend or generate one
        const token = coupon.validation_token || `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/redeem_coupon`, {
          method: 'POST',
          headers: {
            apikey: SERVICE_KEY,
            Authorization: `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            p_code: String(coupon.code).toUpperCase(),
            p_email: buyer.email || '',
            p_order_total_cents: subtotal_cents,
            p_cart_items: cartItemsForValidation,
            p_validation_token: token
          })
        })

        if (rpcRes.ok) {
          const rpcData = await rpcRes.json()
          const row = Array.isArray(rpcData) ? rpcData[0] : rpcData
          console.log('✅ Coupon validation result:', JSON.stringify(row, null, 2))
          
          if (row?.valid) {
            discount_cents = Number(row.discount_cents) || 0
            applied_coupon_id = row.coupon_id || null
            validation_token = row.validation_token || token
            
            console.log('✅ Coupon validated successfully:', {
              discount_cents,
              applied_coupon_id,
              validation_token
            })
          } else {
            console.log('❌ Coupon validation failed:', row?.message || 'Unknown error')
            return {
              statusCode: 400,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                error: 'COUPON_INVALID',
                message: row?.message || 'Invalid coupon code'
              })
            }
          }
        } else {
          const errorText = await rpcRes.text()
          console.error('❌ Coupon RPC error:', rpcRes.status, errorText)
          return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              error: 'COUPON_VALIDATION_ERROR',
              message: 'Unable to validate coupon at this time'
            })
          }
        }
      } catch (e) {
        console.error('❌ Coupon validation exception:', e)
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: 'COUPON_ERROR',
            message: 'Coupon validation failed'
          })
        }
      }
    }

    const total_cents = Math.max(0, subtotal_cents + shipping_cents + tax_cents - discount_cents)
    const amountStr = (total_cents / 100).toFixed(2)
    const m_payment_id = `BL-${Date.now().toString(16).toUpperCase()}`
    const order_number = `BL-${Date.now().toString(36).toUpperCase()}`

    // --- 5. Construct Delivery Address (Robust Mapping) ---
    let deliveryAddressJson: any = null
    // Only process address if method is explicitly delivery
    if (fulfillment.method === 'delivery') {
      const rawAddr = fulfillment.delivery_address || {}
      deliveryAddressJson = {
        street_address: rawAddr.street_address || rawAddr.streetAddress || rawAddr.address || rawAddr.street || '',
        local_area: rawAddr.local_area || rawAddr.localArea || rawAddr.suburb || '',
        city: rawAddr.city || rawAddr.town || '',
        zone: rawAddr.zone || rawAddr.province || rawAddr.state || '',
        code: rawAddr.code || rawAddr.postalCode || rawAddr.zipCode || rawAddr.zip || '',
        country: rawAddr.country || 'ZA',
        lat: rawAddr.lat || null,
        lng: rawAddr.lng || null
      }
    }

    // --- 6. Save Order to Supabase ---
    const rpcPayload = {
      p_order_number: order_number,
      p_m_payment_id: m_payment_id,
      p_buyer_email: buyer.email || '',
      p_buyer_name: buyer.name || '',
      p_buyer_phone: buyer.phone || '',
      p_channel: 'website',
      p_items: normalizedItems.map((it: any) => ({
        product_id: it.product_id,
        product_name: it.product_name || it.name || 'Unknown Product', // Uses the fixed name with variant
        sku: it.sku || null,
        quantity: it.quantity || it.qty || 1,
        unit_price: it.unit_price || (it.unit_price_cents ? it.unit_price_cents / 100 : 0)
      })),
      p_subtotal_cents: subtotal_cents,
      p_shipping_cents: shipping_cents,
      p_discount_cents: discount_cents,
      p_tax_cents: tax_cents,
      p_fulfillment_method: fulfillment.method,
      p_delivery_address: deliveryAddressJson,
      p_collection_location: fulfillment.collection_location
    }

    const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/api_create_order`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(rpcPayload)
    })

    if (!rpcRes.ok) {
      const err = await rpcRes.text()
      console.error('DB Error:', err)
      return { statusCode: 400, body: JSON.stringify({ error: 'ORDER_CREATE_FAILED', details: err }) }
    }

    const rpcData = await rpcRes.json()
    const orderRow = Array.isArray(rpcData) ? rpcData[0] : rpcData
    const orderId = orderRow?.order_id

    // If we have a validation token and order was created successfully, mark validation as completed
    if (validation_token && orderId) {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/rpc/mark_coupon_validation_completed`, {
          method: 'POST',
          headers: {
            apikey: SERVICE_KEY,
            Authorization: `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            p_validation_token: validation_token,
            p_order_id: orderId
          })
        })
        console.log('✅ Coupon validation marked as completed:', validation_token)
      } catch (markError) {
        console.error('⚠️ Failed to mark validation as completed:', markError)
        // Don't fail the order if this fails - just log it
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: orderId,
        order_number,
        m_payment_id,
        merchant_payment_id: m_payment_id,
        amount: amountStr,
        total_cents,
        discount_cents,
        validation_token: validation_token // Return for frontend reference
      })
    }

  } catch (e: any) {
    console.error('Create order fatal error:', e)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: e.message || 'Server error' })
    }
  }
}
