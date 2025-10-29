import type { Handler } from '@netlify/functions'

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' }
    }

    const {
      items = [],
      buyer = {},
      fulfillment = {},
      client_order_ref
    } = JSON.parse(event.body || '{}')

    if (!items.length) {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'No items' }) }
    }

    const SUPABASE_URL = process.env.SUPABASE_URL
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!SUPABASE_URL || !SERVICE_KEY) {
      return { statusCode: 500, body: 'Missing Supabase config' }
    }

    // Calculate total
    const amount = items.reduce((sum: number, it: any) => sum + Number(it.price) * Number(it.qty), 0).toFixed(2)
    const m_payment_id = `BL-${Date.now().toString(16).toUpperCase()}`

    // Insert order
    const orderPayload = [{
      status: 'pending',
      total: Number(amount),
      m_payment_id,
      client_order_ref: client_order_ref || null,
      user_id: buyer.user_id || null,
      buyer_name: buyer.name || null,
      buyer_email: buyer.email || null,
      buyer_phone: buyer.phone || null,
      fulfillment_method: fulfillment.method || null,
      delivery_address: fulfillment.delivery_address || null,
      collection_location: fulfillment.collection_location || null
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

    // Insert order items
    const itemsPayload = items.map((it: any) => ({
      order_id: order.id,
      product_id: it.product_id || null,
      product_name: it.product_name || null,
      sku: it.sku || null,
      quantity: it.qty,
      unit_price: Number(it.price),
      line_total: Number((Number(it.price) * Number(it.qty)).toFixed(2))
    }))

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
        amount
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
