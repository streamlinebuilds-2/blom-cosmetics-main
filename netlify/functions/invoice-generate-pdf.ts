import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import fetch from "node-fetch"

const SB_URL = process.env.SUPABASE_URL!
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const BUCKET = "invoices" // must exist
const LOGO_URL = "https://yvmnedjybrpvlupygusf.supabase.co/storage/v1/object/public/assets/blom_logo.png"

const money = (n: any) => "R " + Number(n || 0).toFixed(2)

const sb = (path: string, init?: any) =>
  fetch(`${SB_URL}${path}`, { ...init, headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, ...(init?.headers || {}) } })

export const handler = async (event: any) => {
  try {
    const id = event.queryStringParameters?.m_payment_id
    if (!id) return { statusCode: 400, body: "m_payment_id required" }

    // 1. Fetch order with ALL financial fields
    const oRes = await sb(`/rest/v1/orders?m_payment_id=eq.${encodeURIComponent(id)}&select=*`)
    const [order] = (await oRes.json()) as any[]
    if (!order) return { statusCode: 404, body: "ORDER_NOT_FOUND" }

    const iRes = await sb(`/rest/v1/order_items?order_id=eq.${order.id}&select=*`)
    const items = (await iRes.json()) as any[]

    // 2. Setup PDF
    const pdf = await PDFDocument.create()
    const page = pdf.addPage([595.28, 841.89]) // A4
    const font = await pdf.embedFont(StandardFonts.Helvetica)
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
    const { width } = page.getSize()

    let y = 750;
    const left = 50;
    const right = width - 50;

    const text = (t: string, x: number, yy: number, s = 10, b = false, c = rgb(0,0,0)) =>
      page.drawText(String(t), { x, y: yy, size: s, font: b ? bold : font, color: c })

    const rightText = (t: string, x: number, yy: number, s = 10, b = false, c = rgb(0,0,0)) => {
        const w = (b ? bold : font).widthOfTextAtSize(String(t), s)
        page.drawText(String(t), { x: x - w, y: yy, size: s, font: b ? bold : font, color: c })
    }
    const line = (yPos: number) => page.drawLine({ start: { x: left, y: yPos }, end: { x: right, y: yPos }, thickness: 1, color: rgb(0.8,0.8,0.8) })

    // Logo
    try {
      const logoBuf = await (await fetch(LOGO_URL)).arrayBuffer()
      const img = await pdf.embedPng(logoBuf).catch(async () => pdf.embedJpg(logoBuf))
      const dims = img.scale(0.25) // Adjust scale as needed
      page.drawImage(img, { x: left, y: y, width: dims.width, height: dims.height })
      y -= 20
    } catch {}

    // Header
    rightText("INVOICE / RECEIPT", right, y + 10, 16, true)
    rightText(`Order #: ${order.order_number}`, right, y - 10, 10)
    rightText(`Date: ${new Date(order.created_at).toLocaleDateString()}`, right, y - 22, 10)

    // Payment Status Badge
    const statusColor = order.payment_status === 'paid' ? rgb(0, 0.6, 0) : rgb(0.8, 0.4, 0);
    const statusText = order.payment_status === 'paid' ? "PAID" : "PAYMENT DUE";
    rightText(statusText, right, y - 40, 12, true, statusColor)

    y -= 80

    // Addresses
    text("Billed To:", left, y, 10, true)
    text(order.buyer_name || "Guest", left, y - 15)
    text(order.buyer_email || "", left, y - 27)
    text(order.buyer_phone || "", left, y - 39)

    if (order.fulfillment_method === 'delivery') {
       text("Ship To:", left + 200, y, 10, true)
       const addr = order.delivery_address || {}
       text(addr.street_address || "", left + 200, y - 15)
       text(`${addr.city || ''} ${addr.code || ''}`, left + 200, y - 27)
       text(addr.country || "", left + 200, y - 39)
    } else {
       text("Collection From:", left + 200, y, 10, true)
       text("BLOM Cosmetics HQ", left + 200, y - 15)
    }

    y -= 70

    // Items Table Header
    line(y + 12)
    text("Item", left, y, 10, true)
    rightText("Qty", right - 150, y, 10, true)
    rightText("Price", right - 80, y, 10, true)
    rightText("Total", right, y, 10, true)
    y -= 8
    line(y)
    y -= 20

    // Items Rows
    for (const it of items) {
      // Fix: Ensure unit_price is number
      const price = Number(it.unit_price) || 0;
      const qty = Number(it.quantity) || 1;
      const total = price * qty;

      text(it.product_name || "Item", left, y)
      rightText(String(qty), right - 150, y)
      rightText(money(price), right - 80, y)
      rightText(money(total), right, y)
      y -= 20
    }

    line(y + 10)
    y -= 10

    // Totals Block
    const subtotal = (order.subtotal_cents || 0) / 100
    const shipping = (order.shipping_cents || 0) / 100
    const discount = (order.discount_cents || 0) / 100
    const total = (order.total_cents || 0) / 100

    rightText("Subtotal:", right - 80, y, 10)
    rightText(money(subtotal), right, y, 10)
    y -= 15

    if (shipping > 0) {
      rightText("Shipping:", right - 80, y, 10)
      rightText(money(shipping), right, y, 10)
      y -= 15
    }

    if (discount > 0) {
      rightText("Discount:", right - 80, y, 10)
      rightText("-" + money(discount), right, y, 10)
      y -= 15
    }

    y -= 5
    line(y + 12)
    rightText("Total:", right - 80, y, 12, true)
    rightText(money(total), right, y, 12, true)

    // 3. Save & Upload
    const pdfBytes = await pdf.save()
    const filename = `${order.order_number}.pdf`

    // Upload to Supabase Storage
    await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${encodeURIComponent(filename)}`, {
      method: "POST",
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
        "Content-Type": "application/pdf",
        "x-upsert": "true"
      },
      body: Buffer.from(pdfBytes)
    })

    const publicUrl = `${SB_URL}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(filename)}`

    // Update order with URL
    await sb(`/rest/v1/orders?id=eq.${order.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice_url: publicUrl })
    })

    return { statusCode: 200, body: JSON.stringify({ url: publicUrl }) }

  } catch (e: any) {
    console.error(e)
    return { statusCode: 500, body: e.message }
  }
}
