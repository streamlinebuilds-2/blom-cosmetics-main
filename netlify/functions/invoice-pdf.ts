import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import fetch from "node-fetch"

const SUPABASE_URL = process.env.SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const SITE = process.env.SITE_BASE_URL || process.env.SITE_URL || "https://blom-cosmetics.co.za"
const BUCKET = "invoices" // make sure this bucket exists and is public
const LOGO_URL = "https://yvmnedjybrpvlupygusf.supabase.co/storage/v1/object/public/assets/blom_logo.png"

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
    // Accept m_payment_id from body, query, or header — any of these
    const contentType = event.headers['content-type'] || '';
    let body: any = {};

    if (event.httpMethod === 'GET') {
      body = {};
    } else if (contentType.includes('application/json')) {
      body = event.body ? JSON.parse(event.body) : {};
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      body = Object.fromEntries(new URLSearchParams(event.body || ''));
    } else {
      // try parse anyway
      try {
        body = event.body ? JSON.parse(event.body) : {};
      } catch {
        body = {};
      }
    }

    const q = event.queryStringParameters || {};
    const m_payment_id =
      body.m_payment_id ||
      q.m_payment_id ||
      event.headers['x-m-payment-id'];

    if (!m_payment_id) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'm_payment_id is required' }),
      };
    }

    const site_url = body.site_url || q.site_url || SITE;

    // 1) Load order + items (ADDED: subtotal_cents, shipping_cents, discount_cents)
    const [order] = await fetchJson(
      `${SUPABASE_URL}/rest/v1/orders?m_payment_id=eq.${encodeURIComponent(m_payment_id)}&select=id,buyer_name,buyer_email,buyer_phone,fulfillment_method,delivery_address,collection_location,total,subtotal_cents,shipping_cents,discount_cents,status,created_at,invoice_url`
    )
    if (!order) return { statusCode: 404, body: "ORDER_NOT_FOUND" }

    const items = await fetchJson(
      `${SUPABASE_URL}/rest/v1/order_items?order_id=eq.${order.id}&select=product_name,sku,quantity,unit_price,line_total,created_at,variant_title`
    ) as any[]

    // C - Fix: Compute total from items if order.total is missing/zero
    const computedTotal = items.reduce((s: number, it: any) => s + (Number(it.quantity || 0) * Number(it.unit_price || 0)), 0)
    order.total = Number(order.total) > 0 ? Number(order.total) : computedTotal

    // Also fix line_total if missing for items
    items.forEach((it: any) => {
      if (!it.line_total || Number(it.line_total) === 0) {
        it.line_total = Number(it.quantity || 0) * Number(it.unit_price || 0)
      }
    })

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
    
    const drawRightText = (text: string, x: number, yPos: number, size = 12, bold = false, color = rgb(0.1, 0.1, 0.15)) => {
      const textWidth = (bold ? fontBold : font).widthOfTextAtSize(String(text), size)
      page.drawText(String(text), { x: x - textWidth, y: yPos, size, font: bold ? fontBold : font, color })
    }

    // D - Logo on the right side (best-effort, won't fail if logo missing)
    let logoHeight = 0
    try {
      const logoRes = await fetch(LOGO_URL)
      if (logoRes.ok) {
        const logoBuf = await logoRes.arrayBuffer()
        try {
          const logoImg = await pdf.embedPng(logoBuf)
          const logoW = 140
          logoHeight = (logoImg.height / logoImg.width) * logoW
          const logoX = right - logoW
          const logoY = y - logoHeight
          page.drawImage(logoImg, { x: logoX, y: logoY, width: logoW, height: logoHeight })
        } catch {
          // Try JPG if PNG fails
          const logoImg = await pdf.embedJpg(logoBuf)
          const logoW = 140
          logoHeight = (logoImg.height / logoImg.width) * logoW
          const logoX = right - logoW
          const logoY = y - logoHeight
          page.drawImage(logoImg, { x: logoX, y: logoY, width: logoW, height: logoHeight })
        }
      }
    } catch (e) {
      console.warn('Logo embedding failed:', e)
      // Continue without logo
    }

    // Header - RECEIPT title and details on the LEFT (top left corner)
    drawText("RECEIPT", left, y, 24, true)
    y -= 10
    drawText(`Receipt #: ${m_payment_id}`, left, (y -= 16), 10, false, rgb(0.35, 0.38, 0.45))
    drawText(`Date: ${new Date(order.created_at).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}`, left, (y -= 14), 10, false, rgb(0.35, 0.38, 0.45))
    
    // Adjust y based on logo height to ensure proper spacing
    if (logoHeight > 0) {
      y = Math.min(y, 800 - logoHeight - 15)
    } else {
      y -= 8
    }
    
    y -= 18
    drawLine(left, y, right, y)
    y -= 18

    // Customer / Fulfillment section (cleaner layout)
    drawText("Customer", left, y, 12, true)
    drawText("Fulfillment", right - 200, y, 12, true)
    y -= 16

    // Customer details
    drawText(order.buyer_name || "-", left, y, 11)
    drawText(String(order.fulfillment_method || '-').toUpperCase(), right - 200, y, 11)
    y -= 14

    drawText(order.buyer_email || "-", left, y, 10, false, rgb(0.4, 0.45, 0.52))
    if (order.collection_location) {
      drawText(String(order.collection_location), right - 200, y, 10, false, rgb(0.4, 0.45, 0.52))
    }
    y -= 14

    drawText(order.buyer_phone || "", left, y, 10, false, rgb(0.4, 0.45, 0.52))
    
    // Delivery address on right if provided
    if (order.delivery_address && order.fulfillment_method === 'delivery') {
      const addr = order.delivery_address
      const addrLines = [
        addr.line1 || addr.street_address,
        [addr.city, addr.postal_code || addr.code].filter(Boolean).join(' '),
        [addr.province, addr.country].filter(Boolean).join(', ')
      ].filter(Boolean)
      
      let addrY = y
      addrLines.forEach((line: string) => {
        if (line) {
          drawText(line, right - 200, addrY, 9, false, rgb(0.4, 0.45, 0.52))
          addrY -= 11
        }
      })
      y = Math.min(y, addrY - 4)
    }
    
    y -= 12
    drawLine(left, y, right, y)
    y -= 20

    // Table headers (with better spacing)
    drawText("Item", left, y, 11, true)
    drawRightText("Qty", right - 150, y, 11, true)
    drawRightText("Unit", right - 90, y, 11, true)
    drawRightText("Total", right - 20, y, 11, true)
    y -= 8
    drawLine(left, y, right, y)
    y -= 14

    // Rows (better alignment) - Calculate line_total if missing
    items.forEach((it: any) => {
      const name = it.product_name || it.sku || "-"
      const variant = it.variant_title ? ` • ${it.variant_title}` : ""
      const qty = Number(it.quantity || 0)
      const unit = Number(it.unit_price || 0)
      const lineTotal = it.line_total ? Number(it.line_total) : (qty * unit)

      drawText(name + variant, left, y, 10)
      drawRightText(String(qty), right - 150, y, 10)
      drawRightText(money(unit), right - 90, y, 10)
      drawRightText(money(lineTotal), right - 20, y, 10)
      y -= 16
      if (y < 140) {
        // new page indicator if needed
        drawLine(left, y + 8, right, y + 8)
        page.drawText(`Continued…`, { x: left, y, size: 10, font, color: rgb(0.5, 0.5, 0.55) })
        y = 800
      }
    })

    // Add shipping as a line item if shipping cost exists (enhanced logic for all orders)
    const shippingAmount = order.shipping_cents ? order.shipping_cents / 100 : 0
    const subtotalAmount = order.subtotal_cents ? order.subtotal_cents / 100 : computedTotal
    const freeShippingThreshold = 2000 // R2000 threshold for free shipping
    
    // Check if this qualifies for free shipping (order subtotal >= R2000)
    const isFreeShipping = subtotalAmount >= freeShippingThreshold && shippingAmount === 0
    
    // For orders without shipping_cents field, assume shipping based on total
    const hasShippingInfo = order.shipping_cents !== null && order.shipping_cents !== undefined
    
    if (isFreeShipping) {
      // Show FREE SHIPPING line item
      drawText("FREE SHIPPING - Order over R" + freeShippingThreshold.toFixed(0), left, y, 10, false, rgb(0, 0.6, 0))
      drawRightText("R 0.00", right - 20, y, 10, false, rgb(0, 0.6, 0))
      y -= 16
    } else if (hasShippingInfo && shippingAmount > 0) {
      // Show regular shipping cost (when explicitly stored)
      drawText("Shipping & Handling", left, y, 10)
      drawRightText("1", right - 150, y, 10)
      drawRightText(money(shippingAmount), right - 90, y, 10)
      drawRightText(money(shippingAmount), right - 20, y, 10)
      y -= 16
    } else if (!hasShippingInfo && subtotalAmount < freeShippingThreshold) {
      // Show estimated shipping for old orders without shipping data
      const estimatedShipping = 75 // Standard shipping cost estimate
      drawText("Shipping & Handling (Estimated)", left, y, 10, false, rgb(0.5, 0.5, 0.5))
      drawRightText("1", right - 150, y, 10)
      drawRightText(money(estimatedShipping), right - 90, y, 10)
      drawRightText(money(estimatedShipping), right - 20, y, 10)
      y -= 16
    }

    // Add coupon discount as a line item if discount exists
    if (order.discount_cents && order.discount_cents > 0) {
      const discountAmount = order.discount_cents / 100
      drawText("Coupon Discount", left, y, 10, false, rgb(0.8, 0.2, 0.2))
      drawRightText("-" + money(discountAmount), right - 20, y, 10, false, rgb(0.8, 0.2, 0.2))
      y -= 16
    }

    y -= 8
    drawLine(left, y, right, y)
    y -= 18

    // --- TOTALS BREAKDOWN ---

    // Subtotal (only show if it exists)
    if (order.subtotal_cents) {
      drawRightText("Subtotal", right - 140, y, 10, false, rgb(0.4, 0.4, 0.45))
      drawRightText(money(order.subtotal_cents / 100), right - 20, y, 10)
      y -= 16
    }

    // Total row (More prominent)
    drawLine(right - 250, y + 6, right, y + 6) // Short line above total
    drawText("Total", right - 140, y, 13, true)
    drawRightText(money(order.total), right - 20, y, 13, true)

    // Footer with contact information
    y -= 32
    drawLine(left, y, right, y)
    y -= 16
    
    drawText("Thank you for your purchase!", left, y, 10, false, rgb(0.35, 0.38, 0.45))
    y -= 12
    drawText("Questions? Contact us:", left, y, 9, false, rgb(0.4, 0.45, 0.52))
    y -= 11
    drawText("Email: shopblomcosmetics@gmail.com", left, y, 9, false, rgb(0.4, 0.45, 0.52))
    y -= 11
    drawText("Phone: +27 79 548 3317", left, y, 9, false, rgb(0.4, 0.45, 0.52))
    
    // Website in bottom right
    drawRightText(SITE.replace(/^https?:\/\//, "") || "blom-cosmetics.co.za", right, y - 11, 9, false, rgb(0.4, 0.45, 0.52))

    const pdfBytes = await pdf.save() // Uint8Array

    // 3) Upload to Supabase Storage with version/cache-busting
    const version = q.v || q.version || body.v || Date.now().toString()
    const filename = version ? `${m_payment_id}-v${version}.pdf` : `${m_payment_id}.pdf`
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

    // 4) Save invoice_url on order (always update with latest version)
    await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${order.id}`, {
      method: "PATCH",
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ invoice_url: publicUrl })
    })

    // 5) Return PDF directly (always return PDF, not JSON)
    // Use Content-Disposition: attachment to force download
    const forceDownload = q.download === '1' || body.download === true || event.headers['x-download'] === '1'
    const disposition = forceDownload ? 'attachment' : 'inline'
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${disposition}; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*'
      },
      body: Buffer.from(pdfBytes).toString('base64'),
      isBase64Encoded: true
    }
  } catch (e: any) {
    console.error(e)
    return { statusCode: 500, body: e?.message ?? "Error" }
  }
}
