import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import fetch from "node-fetch"

const SUPABASE_URL = process.env.SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const SITE = process.env.SITE_BASE_URL || process.env.SITE_URL || "https://blom-cosmetics.co.za"
const BUCKET = "invoices" // make sure this bucket exists and is public

function money(n: any) {
  return "R " + Number(n || 0).toFixed(2)
}

async function fetchJson(url: string) {
  const res = await fetch(url, { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const handler = async (event: any) => {
  try {
    const m_payment_id = event.queryStringParameters?.m_payment_id
    if (!m_payment_id) return { statusCode: 400, body: "m_payment_id required" }

    // 1) Load order + items
    const [order] = await fetchJson(
      `${SUPABASE_URL}/rest/v1/orders?m_payment_id=eq.${encodeURIComponent(m_payment_id)}&select=id,buyer_name,buyer_email,buyer_phone,fulfillment_method,delivery_address,collection_location,total,status,created_at,invoice_url`
    )
    if (!order) return { statusCode: 404, body: "ORDER_NOT_FOUND" }

    const items = await fetchJson(
      `${SUPABASE_URL}/rest/v1/order_items?order_id=eq.${order.id}&select=product_name,sku,quantity,unit_price,line_total,created_at`
    )

    // 2) Build a clean PDF (no Chromium)
    const pdf = await PDFDocument.create()
    const page = pdf.addPage([595.28, 841.89]) // A4 (pt)
    const { width } = page.getSize()
    const font = await pdf.embedFont(StandardFonts.Helvetica)
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold)

    let y = 800
    const left = 40
    const right = width - 40

    const drawText = (text: string, x: number, yPos: number, size = 12, bold = false, color = rgb(0.1, 0.1, 0.15)) => {
      page.drawText(String(text), { x, y: yPos, size, font: bold ? fontBold : font, color })
    }
    const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
      page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness: 1, color: rgb(0.9, 0.92, 0.95) })
    }

    // Header
    drawText("INVOICE", left, y, 20, true)
    y -= 8
    drawText(`Invoice #: ${m_payment_id}`, left, (y -= 16), 10, false, rgb(0.35, 0.38, 0.45))
    drawText(`Date: ${new Date(order.created_at).toLocaleString()}`, left, (y -= 14), 10, false, rgb(0.35, 0.38, 0.45))
    drawText(SITE.replace(/^https?:\/\//, "") || "BLOM Cosmetics", right - 200, y + 14, 10, false, rgb(0.35, 0.38, 0.45))

    y -= 22
    drawLine(left, y, right, y)
    y -= 16

    // Customer / Fulfillment
    drawText("Customer", left, y, 12, true)
    drawText("Fulfillment", right - 200, y, 12, true)
    y -= 14

    drawText(order.buyer_name || "-", left, y)
    drawText(order.fulfillment_method || "-", right - 200, y)
    y -= 14

    drawText(order.buyer_email || "-", left, y)
    if (order.collection_location) drawText(String(order.collection_location), right - 200, y)
    y -= 14

    drawText(order.buyer_phone || "", left, y)
    y -= 16

    if (order.delivery_address) {
      const addr = JSON.stringify(order.delivery_address, null, 2)
      drawText(addr, left, y, 9, false, rgb(0.4, 0.45, 0.52))
      y -= Math.min(100, (addr.split("\n").length + 1) * 11) // avoid overflow
    }

    y -= 6
    drawLine(left, y, right, y)
    y -= 18

    // Table headers
    drawText("Item", left, y, 12, true)
    drawText("Qty", right - 200, y, 12, true)
    drawText("Unit", right - 140, y, 12, true)
    drawText("Total", right - 70, y, 12, true)
    y -= 10
    drawLine(left, y, right, y)
    y -= 12

    // Rows
    items.forEach((it: any) => {
      const name = it.product_name || it.sku || "-"
      drawText(name, left, y)
      drawText(String(it.quantity), right - 200, y)
      drawText(money(it.unit_price), right - 140, y)
      drawText(money(it.line_total), right - 70, y)
      y -= 16
      if (y < 120) {
        // new page indicator if needed
        drawLine(left, y + 8, right, y + 8)
        page.drawText(`Continued…`, { x: left, y, size: 10, font, color: rgb(0.5, 0.5, 0.55) })
        y = 800
      }
    })

    y -= 6
    drawLine(left, y, right, y)
    y -= 16
    drawText("Total", right - 140, y, 12, true)
    drawText(money(order.total), right - 70, y, 12, true)

    // Footer
    y -= 24
    drawText("Thank you for your purchase!", left, y, 10, false, rgb(0.35, 0.38, 0.45))

    const pdfBytes = await pdf.save() // Uint8Array

    // 3) Upload to Supabase Storage
    const filename = `${m_payment_id}.pdf`
    const upRes = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodeURIComponent(filename)}`, {
      method: "POST",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/pdf",
        "x-upsert": "true"
      },
      body: Buffer.from(pdfBytes)
    })

    if (!upRes.ok) {
      const tx = await upRes.text()
      console.error("Upload failed:", tx)
      return { statusCode: 500, body: "UPLOAD_FAILED" }
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(filename)}`

    // 4) Save invoice_url on order if empty
    if (!order.invoice_url) {
      await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${order.id}`, {
        method: "PATCH",
        headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ invoice_url: publicUrl })
      })
    }

    return { statusCode: 200, body: JSON.stringify({ url: publicUrl }) }
  } catch (e: any) {
    console.error(e)
    return { statusCode: 500, body: e?.message ?? "Error" }
  }
}

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
