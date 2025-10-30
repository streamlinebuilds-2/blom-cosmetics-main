// No Chromium. Pure Node PDF.
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import fetch from "node-fetch"

const SUPABASE_URL = process.env.SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const SITE = (process.env.SITE_BASE_URL || process.env.SITE_URL || "https://blom-cosmetics.co.za").replace(/\/+$/, '')
const BUCKET = "invoices" // must exist

const money = (n: any) => "R " + Number(n || 0).toFixed(2)

async function sbGet(path: string) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const handler = async (event: any) => {
  try {
    const id = event.queryStringParameters?.m_payment_id
    if (!id) return { statusCode: 400, body: "m_payment_id required" }

    // 1) Fetch order + items
    const [order] = await sbGet(`/rest/v1/orders?m_payment_id=eq.${encodeURIComponent(id)}&select=id,buyer_name,buyer_email,buyer_phone,fulfillment_method,delivery_address,collection_location,total,status,created_at,invoice_url`)
    if (!order) return { statusCode: 404, body: "ORDER_NOT_FOUND" }

    const items = await sbGet(`/rest/v1/order_items?order_id=eq.${order.id}&select=product_name,sku,quantity,unit_price,line_total,created_at`)

    // 2) Build PDF in-memory
    const pdf = await PDFDocument.create()
    const page = pdf.addPage([595.28, 841.89]) // A4
    const { width } = page.getSize()
    const font = await pdf.embedFont(StandardFonts.Helvetica)
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold)

    let y = 800,
      left = 40,
      right = width - 40

    const text = (t: string, x: number, yy: number, s = 12, b = false, c = rgb(0.1, 0.1, 0.15)) =>
      page.drawText(String(t), { x, y: yy, size: s, font: b ? bold : font, color: c })
    const line = (x1: number, y1: number, x2: number, y2: number) =>
      page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness: 1, color: rgb(0.9, 0.92, 0.95) })

    // Header
    text("INVOICE", left, y, 20, true)
    y -= 8
    text(`Invoice #: ${id}`, left, (y -= 16), 10, false, rgb(0.35, 0.38, 0.45))
    text(`Date: ${new Date(order.created_at).toLocaleString()}`, left, (y -= 14), 10, false, rgb(0.35, 0.38, 0.45))
    text(SITE.replace(/^https?:\/\//, ''), right - 200, y + 14, 10, false, rgb(0.35, 0.38, 0.45))

    y -= 22
    line(left, y, right, y)
    y -= 16

    // Customer / Fulfillment
    text("Customer", left, y, 12, true)
    text("Fulfillment", right - 200, y, 12, true)
    y -= 14
    text(order.buyer_name || "-", left, y)
    text(order.fulfillment_method || "-", right - 200, y)
    y -= 14
    text(order.buyer_email || "-", left, y)
    if (order.collection_location) text(String(order.collection_location), right - 200, y)
    y -= 14
    text(order.buyer_phone || "", left, y)
    y -= 16

    if (order.delivery_address) {
      const addr = JSON.stringify(order.delivery_address, null, 2)
      const lines = addr.split("\n")
      lines.forEach((ln: string) => {
        text(ln, left, y, 9, false, rgb(0.4, 0.45, 0.52))
        y -= 11
      })
      y -= 8
    }

    line(left, y, right, y)
    y -= 18

    // Table header
    text("Item", left, y, 12, true)
    text("Qty", right - 200, y, 12, true)
    text("Unit", right - 140, y, 12, true)
    text("Total", right - 70, y, 12, true)
    y -= 10
    line(left, y, right, y)
    y -= 12

    // Rows
    for (const it of items) {
      const name = it.product_name || it.sku || "-"
      text(name, left, y)
      text(String(it.quantity), right - 200, y)
      text(money(it.unit_price), right - 140, y)
      text(money(it.line_total), right - 70, y)
      y -= 16
      if (y < 120) {
        line(left, y + 8, right, y + 8)
        text("Continued…", left, y, 10, false, rgb(0.5, 0.5, 0.55))
        y = 800
      }
    }

    y -= 6
    line(left, y, right, y)
    y -= 16
    text("Total", right - 140, y, 12, true)
    text(money(order.total), right - 70, y, 12, true)

    const bytes = await pdf.save() // Uint8Array

    // 3) Upload (UPSERT) to Supabase Storage
    const filename = `${id}.pdf`
    const upload = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodeURIComponent(filename)}`, {
      method: "POST",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/pdf",
        "x-upsert": "true"
      },
      body: Buffer.from(bytes)
    })
    if (!upload.ok) {
      const tx = await upload.text()
      console.error("UPLOAD_FAILED", tx)
      return { statusCode: 500, body: "UPLOAD_FAILED" }
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(filename)}`

    // 4) Save invoice_url once
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
    return { statusCode: 500, body: e?.message || "Error" }
  }
}


