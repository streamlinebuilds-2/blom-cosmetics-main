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
      client_order_ref,
      coupon_code = null
    } = JSON.parse(event.body || '{}')

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

    // Calculate total
    const amount = items.reduce((sum: number, it: any) => sum + Number(it.price) * Number(it.qty), 0).toFixed(2)
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

    // Insert order
    const orderPayload = [{
      status: 'pending',
      total: Number(amount),
      m_payment_id,
      client_order_ref: client_order_ref || null,
      user_id: authUserId || buyer.user_id || null,
      buyer_name: buyer.name || null,
      buyer_email: buyer.email || null,
      buyer_phone: buyer.phone || null,
      fulfillment_method: fulfillment.method || null,
      delivery_address: fulfillment.delivery_address || null,
      collection_location: fulfillment.collection_location || null,
      coupon_code: coupon_code || null
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
