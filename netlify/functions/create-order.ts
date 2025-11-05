import type { Handler } from '@netlify/functions'

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' }
    }

    const body = JSON.parse(event.body || '{}')
    
    // Support both formats: new (CheckoutPage) and legacy (admin)
    let items = body.items || []
    let buyer: any = body.buyer || {}
    let fulfillment: any = body.fulfillment || {}
    const client_order_ref = body.client_order_ref || null
    const coupon_code = body.coupon_code || null
    
    // Map CheckoutPage format to expected format
    if (body.customerEmail || body.customerName) {
      buyer = {
        name: body.customerName || `${body.shippingInfo?.firstName || ''} ${body.shippingInfo?.lastName || ''}`.trim(),
        email: body.customerEmail || body.shippingInfo?.email || '',
        phone: body.customerPhone || body.shippingInfo?.phone || '',
        user_id: body.customerId || null
      }
    }
    
    if (body.deliveryAddress || body.shippingMethod) {
      const method = body.shippingMethod || 'door-to-door'
      const deliveryAddr = body.deliveryAddress || {}
      
      fulfillment = {
        method: method,
        delivery_address: method === 'door-to-door' ? {
          street_address: deliveryAddr.street_address || '',
          local_area: deliveryAddr.local_area || '',
          city: deliveryAddr.city || '',
          zone: deliveryAddr.zone || '',
          code: deliveryAddr.code || '',
          country: deliveryAddr.country || 'ZA'
        } : null,
        collection_location: method === 'store-pickup' ? 'BLOM HQ, Randfontein' : null
      }
    }
    
    // Map cart items format if needed
    if (items.length > 0 && items[0].quantity !== undefined && items[0].qty === undefined) {
      items = items.map((it: any) => ({
        product_id: it.productId || it.id,
        qty: it.quantity,
        price: it.price,
        product_name: it.name,
        sku: it.sku || null
      }))
    }

    if (!items.length) {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'No items' }) }
    }

    const SUPABASE_URL = process.env.SUPABASE_URL
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!SUPABASE_URL || !SERVICE_KEY) {
      return { statusCode: 500, body: 'Missing Supabase config' }
    }

    // Helper: check if string is valid UUID
    const isUUID = (v: any) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(v || ''))

    // Calculate total - use provided total if available, otherwise calculate from items
    let amount: number
    if (body.total !== undefined) {
      amount = Number(body.total)
    } else {
      const subtotal = items.reduce((sum: number, it: any) => sum + Number(it.price) * Number(it.qty || it.quantity || 1), 0)
      const shipping = Number(body.shipping || 0)
      const discount = Number(body.discount || 0)
      amount = subtotal + shipping - discount
    }
    
    const amountStr = amount.toFixed(2)
    const m_payment_id = `BL-${Date.now().toString(16).toUpperCase()}`

    // Resolve authenticated user (if Authorization header present)
    let authUserId: string | null = null
    try {
      const authHeader = (event.headers?.authorization || (event.headers as any)?.Authorization) as string | undefined
      if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
        const uRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
          headers: {
            apikey: SERVICE_KEY,
            Authorization: authHeader
          }
        })
        if (uRes.ok) {
          const u = await uRes.json()
          authUserId = u?.id || null
        }
      }
    } catch {}

    // Build delivery address JSON for admin app
    const deliveryAddr = fulfillment.delivery_address || {}
    const deliveryAddressJson = fulfillment.method === 'door-to-door' && deliveryAddr ? {
      street_address: deliveryAddr.street_address || '',
      local_area: deliveryAddr.local_area || '',
      city: deliveryAddr.city || '',
      zone: deliveryAddr.zone || '',
      code: deliveryAddr.code || '',
      country: deliveryAddr.country || 'ZA',
      lat: deliveryAddr.lat || null,
      lng: deliveryAddr.lng || null
    } : null

    // Insert order with all fields for admin app
    const orderTotal = Number(amount)
    const orderTotalCents = Math.round(orderTotal * 100)
    
    const orderPayload = [{
      status: 'pending',
      payment_status: 'unpaid',  // Will be updated to 'paid' by payfast-itn
      total: orderTotal,
      total_cents: orderTotalCents,  // For admin app
      m_payment_id,
      client_order_ref: client_order_ref || null,
      user_id: authUserId || buyer.user_id || null,
      buyer_name: buyer.name || null,
      buyer_email: buyer.email || null,
      buyer_phone: buyer.phone || null,
      fulfillment_method: fulfillment.method || 'door-to-door',
      delivery_address: deliveryAddressJson,  // JSON object for admin
      collection_location: fulfillment.collection_location || null,
      coupon_code: coupon_code || null,
      // Additional fields for admin app compatibility
      ship_to_street: deliveryAddr.street_address || null,
      ship_to_suburb: deliveryAddr.local_area || null,
      ship_to_city: deliveryAddr.city || null,
      ship_to_zone: deliveryAddr.zone || null,
      ship_to_postal_code: deliveryAddr.code || null,
      ship_to_country: deliveryAddr.country || 'ZA',
      ship_to_lat: deliveryAddr.lat || null,
      ship_to_lng: deliveryAddr.lng || null
    }]

    const orderRes = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify(orderPayload)
    })

    if (!orderRes.ok) {
      const err = await orderRes.text()
      console.error('Order creation error:', err)
      return { statusCode: 400, body: err }
    }

    const orders = await orderRes.json()
    const order = orders[0]

    if (!order) {
      return { statusCode: 500, body: 'Order created but response empty' }
    }

    // 1) Resolve product UUIDs by SKU (only for items without a valid UUID)
    const skus = [...new Set(items.filter((it: any) => !isUUID(it.product_id) && it.sku).map((it: any) => it.sku))]
    let skuMap: Record<string, string> = {}
    if (skus.length) {
      const skuQuery = skus.map((s) => encodeURIComponent(s)).join(',')
      const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,sku&sku=in.(${skuQuery})`, {
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`
        }
      })
      if (res.ok) {
        const rows = await res.json()
        skuMap = Object.fromEntries(rows.map((r: any) => [r.sku, r.id]))
      }
    }

    // 2) Build order items with resolved product UUIDs
    const itemsPayload = items.map((it: any) => {
      const product_uuid = isUUID(it.product_id) ? it.product_id : it.sku && skuMap[it.sku] ? skuMap[it.sku] : null

      const qty = Number(it.qty)
      const unit = Number(it.price)
      return {
        order_id: order.id,
        product_id: product_uuid,
        product_name: it.product_name || null,
        sku: it.sku || null,
        quantity: qty,
        unit_price: unit,
        line_total: Number((qty * unit).toFixed(2))
      }
    })

    const oiRes = await fetch(`${SUPABASE_URL}/rest/v1/order_items`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(itemsPayload)
    })

    if (!oiRes.ok) {
      const err = await oiRes.text()
      console.error('Order items creation error:', err)
      return { statusCode: 400, body: err }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: order.id,
        m_payment_id,
        merchant_payment_id: m_payment_id,  // For CheckoutPage compatibility
        amount: amountStr,
        total_cents: orderTotalCents  // For CheckoutPage PayFast calculation
      })
    }
  } catch (e: any) {
    console.error('Create order error:', e)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: e.message || 'Server error' })
    }
  }
}
