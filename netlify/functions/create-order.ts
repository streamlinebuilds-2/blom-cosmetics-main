import type { Handler } from '@netlify/functions'

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' }
    }

    const body = JSON.parse(event.body || '{}')
    
    // New canonical payload
    // {
    //   buyer: { email, name, phone },
    //   shipping: { method, address },
    //   items: [ { product_id, name, unit_price, quantity } ],
    //   totals: { subtotal_cents, shipping_cents, tax_cents },
    //   coupon: { code } | null
    // }
    
    // Support both formats: new (CheckoutPage) and legacy (admin)
    let items = body.items || []
    let buyer: any = body.buyer || {}
    let fulfillment: any = body.fulfillment || {}
    const client_order_ref = body.client_order_ref || null
    const coupon = body.coupon || null
    
    // Map CheckoutPage format to expected format
    if (body.customerEmail || body.customerName) {
      buyer = {
        name: body.customerName || `${body.shippingInfo?.firstName || ''} ${body.shippingInfo?.lastName || ''}`.trim(),
        email: body.customerEmail || body.shippingInfo?.email || '',
        phone: body.customerPhone || body.shippingInfo?.phone || '',
        user_id: body.customerId || null
      }
    }
    
    if (body.shipping || body.deliveryAddress || body.shippingMethod) {
      // Preferred new shape
      if (body.shipping) {
        fulfillment = {
          method: body.shipping.method,
          delivery_address: body.shipping.address || null,
          collection_location: body.shipping.method === 'store-pickup' ? 'BLOM HQ, Randfontein' : null
        }
      }
      
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
    
    // Map cart items format if needed (legacy cart shape)
    if (items.length > 0 && items[0].quantity !== undefined && items[0].unit_price === undefined) {
      items = items.map((it: any) => ({
        product_id: it.productId || it.id,
        quantity: it.quantity,
        unit_price: it.unit_price ?? it.price,
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

    // Totals in cents (strict)
    let subtotal_cents = Number(body.totals?.subtotal_cents)
    let shipping_cents = Number(body.totals?.shipping_cents || 0)
    let tax_cents = Number(body.totals?.tax_cents || 0)

    if (!Number.isFinite(subtotal_cents)) {
      // Derive from items if not provided
      subtotal_cents = items.reduce((sum: number, it: any) => sum + Math.round(Number(it.unit_price) * 100) * Number(it.quantity || 1), 0)
    }

    // Validate/compute discount via RPC if coupon present
    let discount_cents = 0
    if (coupon?.code) {
      try {
        const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/redeem_coupon`, {
          method: 'POST',
          headers: {
            apikey: SERVICE_KEY,
            Authorization: `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            p_code: String(coupon.code).toUpperCase(),
            p_email: buyer.email || body.customerEmail || '',
            p_product_subtotal_cents: subtotal_cents
          })
        })
        if (!rpcRes.ok) {
          const txt = await rpcRes.text()
          return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'COUPON_INVALID', message: txt }) }
        }
        const rpcData = await rpcRes.json()
        const row = Array.isArray(rpcData) ? rpcData[0] : rpcData
        if (!row?.valid) {
          return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'COUPON_INVALID', message: row?.message || 'Coupon invalid' }) }
        }
        discount_cents = Number(row.discount_cents) || 0
      } catch (e: any) {
        return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'COUPON_INVALID', message: e?.message || 'Coupon invalid' }) }
      }
    }

    const total_cents = Math.max(0, subtotal_cents + shipping_cents + tax_cents - discount_cents)
    const amountStr = (total_cents / 100).toFixed(2)
    const m_payment_id = `BL-${Date.now().toString(16).toUpperCase()}`
    const order_number = `BL-${Date.now().toString(36).toUpperCase()}`

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

    // Use RPC to bypass check constraints and BEFORE INSERT triggers
    const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/api_create_order`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        p_order_number: order_number,
        p_m_payment_id: m_payment_id,
        p_buyer_email: buyer.email || '',
        p_buyer_name: buyer.name || '',
        p_buyer_phone: buyer.phone || '',
        p_channel: 'website',
        p_items: items.map((it: any) => ({
          product_id: it.product_id,
          product_name: it.product_name || it.name,
          sku: it.sku || null,
          quantity: it.quantity,
          unit_price: it.unit_price
        })),
        p_subtotal_cents: subtotal_cents,
        p_shipping_cents: shipping_cents,
        p_discount_cents: discount_cents,
        p_tax_cents: tax_cents,
        p_fulfillment_method: fulfillment.method === 'store-pickup' ? 'collection' : 'delivery',
        p_delivery_address: deliveryAddressJson,
        p_collection_location: fulfillment.collection_location || (fulfillment.method === 'store-pickup' ? 'BLOM HQ, Randfontein' : null)
      })
    })

    if (!rpcRes.ok) {
      const err = await rpcRes.text()
      console.error('Order creation RPC error:', err)
      return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'ORDER_CREATE_FAILED', message: err }) }
    }

    const rpcData = await rpcRes.json()
    const orderRow = Array.isArray(rpcData) ? rpcData[0] : rpcData
    
    if (!orderRow || !orderRow.order_id) {
      return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'ORDER_CREATE_FAILED', message: 'RPC returned empty' }) }
    }

    const order = { id: orderRow.order_id }

    // Items are already inserted by the RPC, so we skip the separate order_items insert

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: order.id,
        order_number,
        m_payment_id,
        merchant_payment_id: m_payment_id,
        amount: amountStr,
        total_cents,
        discount_cents
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
