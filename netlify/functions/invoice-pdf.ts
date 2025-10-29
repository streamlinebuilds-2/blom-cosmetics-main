import type { Handler } from '@netlify/functions'

export const handler: Handler = async (event) => {
  try {
    const m_payment_id = (event.queryStringParameters || {}).m_payment_id
    if (!m_payment_id) {
      return { statusCode: 400, body: 'm_payment_id required' }
    }

    const SUPABASE_URL = process.env.SUPABASE_URL
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!SUPABASE_URL || !SERVICE_KEY) {
      return { statusCode: 500, body: 'Missing Supabase config' }
    }

    // Fetch order
    const ordRes = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?m_payment_id=eq.${encodeURIComponent(m_payment_id)}&select=id,buyer_name,buyer_email,buyer_phone,fulfillment_method,delivery_address,collection_location,total,status,created_at,invoice_url`,
      {
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`
        }
      }
    )

    if (!ordRes.ok) {
      return { statusCode: 400, body: await ordRes.text() }
    }

    const orders = await ordRes.json()
    const order = orders[0]

    if (!order) {
      return { statusCode: 404, body: 'ORDER_NOT_FOUND' }
    }

    // Fetch order items
    const itemsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/order_items?order_id=eq.${order.id}&select=product_name,sku,quantity,unit_price,line_total`,
      {
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`
        }
      }
    )

    if (!itemsRes.ok) {
      return { statusCode: 400, body: await itemsRes.text() }
    }

    const items = await itemsRes.json()

    // Build HTML invoice
    const rows = items.map((it: any) => `
      <tr>
        <td>${it.product_name || it.sku || '-'}</td>
        <td>${it.quantity}</td>
        <td>R ${Number(it.unit_price).toFixed(2)}</td>
        <td>R ${Number(it.line_total).toFixed(2)}</td>
      </tr>`).join('')

    const html = `<!doctype html><html><head><meta charset="utf-8">
      <title>Invoice ${m_payment_id}</title>
      <style>
        body{font-family:Arial,Helvetica,sans-serif;margin:24px}
        h1{margin:0 0 8px}
        table{width:100%;border-collapse:collapse;margin-top:16px}
        th,td{border:1px solid #e5e7eb;padding:8px;text-align:left}
        tfoot td{font-weight:bold}
        .meta{margin-top:8px;color:#374151}
      </style></head><body>
      <h1>Invoice</h1>
      <div class="meta">Invoice #: ${m_payment_id}</div>
      <div class="meta">Date: ${new Date(order.created_at).toLocaleString()}</div>
      <div class="meta">Customer: ${order.buyer_name || '-'} &lt;${order.buyer_email || '-'}&gt; ${order.buyer_phone || ''}</div>
      <div class="meta">Fulfillment: ${order.fulfillment_method || '-'} ${order.collection_location ? `(${order.collection_location})` : ''}</div>
      ${order.delivery_address ? `<pre>${JSON.stringify(order.delivery_address, null, 2)}</pre>` : ''}
      <table>
        <thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr><td colspan="3">Total</td><td>R ${Number(order.total).toFixed(2)}</td></tr></tfoot>
      </table>
    </body></html>`

    // Store invoice URL if not already stored
    const invoiceUrl = `${process.env.SITE_BASE_URL || process.env.URL || 'https://blom-cosmetics.co.za'}/.netlify/functions/invoice-pdf?m_payment_id=${encodeURIComponent(m_payment_id)}`

    if (!order.invoice_url) {
      await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${order.id}`, {
        method: 'PATCH',
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify({ invoice_url: invoiceUrl })
      }).catch((err: any) => console.warn('Failed to store invoice URL:', err?.message))
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: html
    }
  } catch (e: any) {
    console.error('Invoice error:', e)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: e.message || 'Server error' })
    }
  }
}
