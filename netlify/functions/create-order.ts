import type { Handler } from '@netlify/functions'

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' }
    }

    const body = JSON.parse(event.body || '{}')

    // Extract data
    const items = body.items || []
    const shippingInfo = body.shippingInfo || {}
    const deliveryAddress = body.deliveryAddress || {}
    const shippingMethod = body.shippingMethod || 'delivery'
    const total = body.total || 0
    const subtotal = body.subtotal || 0
    const shipping = body.shipping || 0
    const discount = body.discount || 0
    const customerId = body.customerId || null

    // Generate IDs
    const orderId = `BL-${Date.now().toString(36).toUpperCase()}`
    const m_payment_id = `${Date.now()}`

    // Calculate cents
    const subtotal_cents = Math.round(subtotal * 100)
    const shipping_cents = Math.round(shipping * 100)
    const discount_cents = Math.round(discount * 100)
    const total_cents = Math.round(total * 100)

    const SUPABASE_URL = process.env.SUPABASE_URL
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!SUPABASE_URL || !SERVICE_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error' }) }
    }

    // Create order
    const orderPayload = {
      id: orderId,
      order_number: orderId,
      merchant_payment_id: m_payment_id,
      buyer_name: `${shippingInfo.firstName || ''} ${shippingInfo.lastName || ''}`.trim(),
      buyer_email: shippingInfo.email || '',
      buyer_phone: shippingInfo.phone || '',
      customer_name: `${shippingInfo.firstName || ''} ${shippingInfo.lastName || ''}`.trim(),
      customer_email: shippingInfo.email || '',
      customer_phone: shippingInfo.phone || '',
      user_id: customerId,
      status: 'pending_payment',  // ✅ Changed from 'placed'
      payment_status: 'unpaid',
      subtotal_cents,
      shipping_cents,
      discount_cents,
      total_cents,
      currency: 'ZAR',
      delivery_method: shippingMethod,
      fulfillment_method: shippingMethod === 'collection' ? 'collection' : 'delivery',
      shipping_address: shippingMethod === 'delivery' ? deliveryAddress : null,
      delivery_address: shippingMethod === 'delivery' ? deliveryAddress : null,
      collection_location: shippingMethod === 'collection' ? 'BLOM HQ, Randfontein' : null,
      placed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      channel: 'website'
    }

    const orderRes = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(orderPayload)
    })

    if (!orderRes.ok) {
      const err = await orderRes.text()
      console.error('Order creation failed:', err)
      return { statusCode: 400, body: JSON.stringify({ error: 'Failed to create order', details: err }) }
    }

    // Create order items
    if (items.length > 0) {
      const itemsPayload = items.map((item: any) => {
        const unitPriceCents = item.unit_price_cents || Math.round((item.price || 0) * 100)
        const qty = item.quantity || item.qty || 1

        // Build product name with variant
        let fullName = item.name || item.product_name || 'Product'
        if (item.variant && typeof item.variant === 'object' && item.variant.title) {
          fullName = `${fullName} - ${item.variant.title}`
        } else if (item.variant && typeof item.variant === 'string') {
          fullName = `${fullName} - ${item.variant}`
        }

        return {
          order_id: orderId,
          sku: item.sku || null,
          name: fullName,  // ✅ Includes variant in name
          variant: item.variant?.title || item.variant || null,  // ✅ Store variant separately too
          qty: qty,
          unit_price_cents: unitPriceCents,
          line_total_cents: unitPriceCents * qty,
          product_id: item.product_id || item.id || null
        }
      })

      const itemsRes = await fetch(`${SUPABASE_URL}/rest/v1/order_items`, {
        method: 'POST',
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemsPayload)
      })

      if (!itemsRes.ok) {
        console.error('Order items creation failed:', await itemsRes.text())
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: orderId,
        order_number: orderId,
        m_payment_id,
        merchant_payment_id: m_payment_id,
        amount: (total_cents / 100).toFixed(2),
        total_cents
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
