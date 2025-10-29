import type { Handler } from '@netlify/functions'
import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SITE = process.env.SITE_BASE_URL || process.env.SITE_URL || ''

function money(n: any) {
  return 'R ' + Number(n || 0).toFixed(2)
}

export const handler: Handler = async (event) => {
  try {
    const m_payment_id = event.queryStringParameters?.m_payment_id
    if (!m_payment_id) {
      return { statusCode: 400, body: 'm_payment_id required' }
    }

    if (!SUPABASE_URL || !SERVICE_KEY) {
      return { statusCode: 500, body: 'Missing Supabase config' }
    }

    // 1) Load order + items
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

    // 2) Build HTML
    const rows = items
      .map(
        (it: any) => `
      <tr>
        <td>${it.product_name || it.sku || '-'}</td>
        <td>${it.quantity}</td>
        <td>${money(it.unit_price)}</td>
        <td>${money(it.line_total)}</td>
      </tr>`
      )
      .join('')

    const html = `<!doctype html><html><head><meta charset="utf-8">
      <title>Invoice ${m_payment_id}</title>
      <style>
        body{font-family:Inter,Arial,Helvetica,sans-serif;margin:32px;color:#0f172a}
        h1{margin:0 0 4px;font-size:22px}
        .sub{color:#475569;margin-bottom:16px}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0 16px}
        table{width:100%;border-collapse:collapse;margin-top:8px;font-size:13px}
        th,td{border:1px solid #e2e8f0;padding:8px;text-align:left}
        thead th{background:#f8fafc}
        tfoot td{font-weight:600}
        .muted{color:#64748b}
      </style></head><body>
      <h1>Invoice</h1>
      <div class="sub muted">Invoice #: ${m_payment_id} • ${new Date(order.created_at).toLocaleString()}</div>
      <div class="grid">
        <div>
          <div><strong>Customer</strong></div>
          <div>${order.buyer_name || '-'}</div>
          <div>${order.buyer_email || '-'}</div>
          <div>${order.buyer_phone || ''}</div>
        </div>
        <div>
          <div><strong>Fulfillment</strong></div>
          <div>${order.fulfillment_method || '-'}</div>
          ${order.collection_location ? `<div>${order.collection_location}</div>` : ''}
          ${order.delivery_address ? `<pre class="muted">${JSON.stringify(order.delivery_address, null, 2)}</pre>` : ''}
        </div>
      </div>
      <table>
        <thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr><td colspan="3">Total</td><td>${money(order.total)}</td></tr></tfoot>
      </table>
      <div class="muted" style="margin-top:16px">${SITE ? SITE.replace(/^https?:\/\//, '') : 'BLOM Cosmetics'}</div>
    </body></html>`

    // 3) Launch Chrome & render PDF
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless
    })

    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' }
    })
    await browser.close()

    // 4) Upload to Supabase Storage
    const filename = `${m_payment_id}.pdf`
    const upRes = await fetch(`${SUPABASE_URL}/storage/v1/object/invoices/${encodeURIComponent(filename)}`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/pdf',
        'x-upsert': 'true'
      },
      body: pdf
    })

    if (!upRes.ok) {
      const tx = await upRes.text()
      console.error('Upload failed:', tx)
      return { statusCode: 500, body: 'UPLOAD_FAILED' }
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/invoices/${encodeURIComponent(filename)}`

    // 5) Save invoice_url on order if empty
    if (!order.invoice_url) {
      await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${order.id}`, {
        method: 'PATCH',
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ invoice_url: publicUrl })
      }).catch((err: any) => console.warn('Failed to update invoice_url:', err?.message))
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: publicUrl })
    }
  } catch (e: any) {
    console.error('Invoice PDF error:', e)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: e.message || 'Server error' })
    }
  }
}
