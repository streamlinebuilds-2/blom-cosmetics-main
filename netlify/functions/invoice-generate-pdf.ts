// No Chromium. Pure Node PDF.
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import fetch from "node-fetch"

const SB_URL = process.env.SUPABASE_URL!
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const SITE = (process.env.SITE_BASE_URL || process.env.SITE_URL || "https://blom-cosmetics.co.za").replace(/\/+$/, '')
const BUCKET = "invoices" // must exist
const LOGO_URL = "https://yvmnedjybrpvlupygusf.supabase.co/storage/v1/object/public/assets/blom_logo.png"

const PROVINCES: Record<string, string> = { WC: 'Western Cape', GP: 'Gauteng', KZN: 'KwaZulu-Natal', EC: 'Eastern Cape', FS: 'Free State', LP: 'Limpopo', MP: 'Mpumalanga', NC: 'Northern Cape', NW: 'North West' }
const COUNTRY = (c?: string) => (c === 'ZA' ? 'South Africa' : c || '')
const money = (n: any) => "R " + Number(n || 0).toFixed(2)

const sb = (path: string, init?: any) =>
  fetch(`${SB_URL}${path}`, { ...init, headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, ...(init?.headers || {}) } })

export const handler = async (event: any) => {
  try {
    const id = event.queryStringParameters?.m_payment_id
    if (!id) return { statusCode: 400, body: "m_payment_id required" }

    // 1) Fetch order + items
    const oRes = await sb(`/rest/v1/orders?m_payment_id=eq.${encodeURIComponent(id)}&select=id,order_number,buyer_name,buyer_email,buyer_phone,fulfillment_method,delivery_address,collection_location,total,status,created_at,invoice_url`)
    const [order] = (await oRes.json()) as any[]
    if (!order) return { statusCode: 404, body: "ORDER_NOT_FOUND" }

    const iRes = await sb(`/rest/v1/order_items?order_id=eq.${order.id}&select=product_name,sku,quantity,unit_price,line_total,created_at`)
    const items = (await iRes.json()) as any[]

    const orderNumber = order.order_number || id

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

    // Logo (best-effort)
    try {
      const logoBuf = await (await fetch(LOGO_URL)).arrayBuffer()
      // try PNG first, fallback to JPG
      const logoImg = await pdf.embedPng(logoBuf).catch(async () => pdf.embedJpg(logoBuf))
      const logoW = 120
      const logoH = (logoImg.height / logoImg.width) * logoW
      page.drawImage(logoImg, { x: left, y: y - logoH, width: logoW, height: logoH })
    } catch {}

    // Header (RECEIPT)
    text("RECEIPT", right - 150, y, 20, true)
    y -= 8
    text(`Order #: ${orderNumber}`, right - 150, (y -= 16), 10, false, rgb(0.35, 0.38, 0.45))
    text(`Date: ${new Date(order.created_at).toLocaleString()}`, right - 150, (y -= 14), 10, false, rgb(0.35, 0.38, 0.45))

    y -= 22
    line(left, y, right, y)
    y -= 16

    // Customer / Fulfillment (method stacked above address)
    text("Customer", left, y, 12, true)
    text("Fulfillment", right - 200, y, 12, true)
    y -= 14
    text(order.buyer_name || "-", left, y)
    text(String(order.fulfillment_method || '-').toUpperCase(), right - 200, y)
    y -= 14
    text(order.buyer_email || "-", left, y, 10, false, rgb(0.28, 0.33, 0.40))
    const a = order.delivery_address || {}
    const lines = [
      a.line1,
      [a.city, a.postal_code].filter(Boolean).join(' '),
      [PROVINCES[a.province as string] ?? a.province, COUNTRY(a.country)].filter(Boolean).join(', ')
    ].filter(Boolean)
    let yAddr = y
    for (const ln of lines) {
      text(String(ln), right - 200, yAddr, 9, false, rgb(0.4, 0.45, 0.52))
      yAddr -= 11
    }
    y -= 12
    y = Math.min(y, yAddr - 8)

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
    const filename = `${orderNumber}.pdf`
    const upload = await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${encodeURIComponent(filename)}`, {
      method: "POST",
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
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

    const publicUrl = `${SB_URL}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(filename)}`

    // 4) Persist invoice_url and order_number
    await sb(`/rest/v1/orders?id=eq.${order.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice_url: publicUrl, order_number: orderNumber })
    })

    return { statusCode: 200, body: JSON.stringify({ url: publicUrl }) }
  } catch (e: any) {
    console.error(e)
    return { statusCode: 500, body: e?.message || "Error" }
  }
}


