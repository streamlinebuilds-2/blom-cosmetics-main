import type { Handler } from '@netlify/functions'
import crypto from 'crypto'

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const PF_PASSPHRASE = process.env.PAYFAST_PASSPHRASE || process.env.PF_PASSPHRASE || ''
const SITE = process.env.SITE_URL || process.env.SITE_BASE_URL || 'https://blom-cosmetics.co.za'
const N8N_WEBHOOK_URL = 'https://dockerfile-1n82.onrender.com/webhook/notify-order'

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' }
    }

    // 1. Parse PayFast Data
    const params = new URLSearchParams(event.body || '')
    const data: Record<string, any> = {}
    params.forEach((v, k) => { data[k] = v })

    console.log('=== PAYFAST ITN RECEIVED ===')
    console.log('Order:', data.m_payment_id)
    console.log('Status:', data.payment_status)
    
    if (!SUPABASE_URL || !SERVICE_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Server config missing' }) }
    }

    // 2. Handle Failed Payments
    if (data.payment_status !== 'COMPLETE') {
      if (data.m_payment_id) {
         await fetch(`${SUPABASE_URL}/rest/v1/orders?m_payment_id=eq.${encodeURIComponent(data.m_payment_id)}`, {
          method: 'PATCH',
          headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'cancelled', payment_status: 'failed' })
        });
      }
      return { statusCode: 200, body: 'Payment failed recorded' };
    }

    // 3. Fetch Order Details
    const m_payment_id = data.m_payment_id
    if (!m_payment_id) return { statusCode: 400, body: 'No m_payment_id' }

    const ordRes = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?m_payment_id=eq.${encodeURIComponent(m_payment_id)}&select=*`,
      { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
    )
    const orders = await ordRes.json()
    const order = orders?.[0]

    if (!order) {
      console.error('Order not found:', m_payment_id)
      return { statusCode: 404, body: 'Order not found' }
    }

    const upsertCoursePurchasesForOrder = async () => {
      const itemsRes = await fetch(
        `${SUPABASE_URL}/rest/v1/order_items?order_id=eq.${encodeURIComponent(order.id)}&select=*`,
        { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
      )
      if (!itemsRes.ok) {
        console.error('Failed to load order_items:', await itemsRes.text())
        return
      }

      const orderItems = await itemsRes.json()
      const courseItems = (Array.isArray(orderItems) ? orderItems : []).filter((it: any) =>
        typeof it?.sku === 'string' && it.sku.startsWith('COURSE:')
      )

      if (courseItems.length === 0) return

      for (const it of courseItems) {
        const sku = String(it.sku || '')
        const course_slug = sku.replace(/^COURSE:/, '').trim()
        if (!course_slug) continue

        const productName = String(it.product_name || '')
        const dateMatch = productName.match(/\(([^)]+)\)\s*$/)
        const selected_date = dateMatch ? dateMatch[1].trim() : null

        const withoutDate = selected_date ? productName.replace(/\s*\([^)]+\)\s*$/, '').trim() : productName.trim()
        const payment_kind = /\bdeposit\b/i.test(withoutDate) ? 'deposit' : 'full'

        let selected_package: string | null = null
        const dashIdx = withoutDate.indexOf(' - ')
        if (dashIdx >= 0) {
          selected_package = withoutDate.slice(dashIdx + 3).replace(/\bdeposit\b/i, '').replace(/\bpackage\b/i, '').trim() || null
        }

        const unitPriceRands = Number(it.unit_price ?? 0)
        const qty = Number(it.quantity ?? 1) || 1
        const amount_paid_cents = Number.isFinite(unitPriceRands) ? Math.round(unitPriceRands * 100) * qty : null

        let course_title: string | null = null
        let course_type: string | null = null
        let details: any = null

        const courseRes = await fetch(
          `${SUPABASE_URL}/rest/v1/courses?slug=eq.${encodeURIComponent(course_slug)}&select=title,course_type,deposit_amount,available_dates,packages,key_details`,
          { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
        )
        if (courseRes.ok) {
          const rows = await courseRes.json()
          const row = rows?.[0]
          if (row) {
            course_title = row.title ?? null
            course_type = row.course_type ?? null
            details = {
              deposit_amount: row.deposit_amount ?? null,
              available_dates: row.available_dates ?? null,
              packages: row.packages ?? null,
              key_details: row.key_details ?? null
            }
          }
        } else {
          console.warn('Failed to load course row for receipt details:', await courseRes.text())
        }

        const upsertPayload = {
          order_id: String(order.id),
          course_slug,
          buyer_email: String(order.buyer_email || ''),
          buyer_name: order.buyer_name ?? null,
          buyer_phone: order.buyer_phone ?? null,
          invited_at: new Date().toISOString(),
          invitation_status: 'pending',
          academy_user_id: null,
          course_title,
          course_type,
          selected_package,
          selected_date,
          amount_paid_cents,
          payment_kind,
          details
        }

        const upsertRes = await fetch(
          `${SUPABASE_URL}/rest/v1/course_purchases?on_conflict=order_id,course_slug`,
          {
            method: 'POST',
            headers: {
              apikey: SERVICE_KEY,
              Authorization: `Bearer ${SERVICE_KEY}`,
              'Content-Type': 'application/json',
              Prefer: 'resolution=merge-duplicates'
            },
            body: JSON.stringify(upsertPayload)
          }
        )

        if (!upsertRes.ok) {
          console.error('Failed to upsert course_purchases:', await upsertRes.text())
        }
      }
    }

    // 4. Update Status to PAID (if not already)
    if (order.status !== 'paid') {
      console.log(`Processing Payment for ${order.id}...`)

      // A) Mark as Paid in DB
      await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${order.id}`, {
        method: 'PATCH',
        headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'paid',
          payment_status: 'paid',
          paid_at: new Date().toISOString()
        })
      })

      // B) INCREMENT COUPON USAGE (New Feature)
      if (order.coupon_code) {
        try {
          console.log(`Incrementing usage for coupon: ${order.coupon_code}`);
          await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_coupon_usage`, {
            method: 'POST',
            headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ p_code: order.coupon_code })
          });
        } catch (couponErr) {
          console.error('Failed to increment coupon usage:', couponErr);
        }
      }

      // C) GENERATE INVOICE
      try {
        console.log('Generating Invoice PDF...')
        const invoiceUrl = `${SITE.replace(/\/$/, '')}/.netlify/functions/invoice-pdf?m_payment_id=${encodeURIComponent(m_payment_id)}`
        const invRes = await fetch(invoiceUrl)
        if (invRes.ok) console.log('✅ Invoice generated successfully')
        else console.error('❌ Invoice generation failed:', await invRes.text())
      } catch (e) { console.error('Invoice trigger error:', e) }

      // C.5) Create/Update Course Purchase Records (for admin enrollments)
      try {
        await upsertCoursePurchasesForOrder()
        console.log('✅ Course purchases updated')
      } catch (e) {
        console.error('Course purchase upsert error:', e)
      }

      // D) Trigger Stock Deduction
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/rpc/process_order_stock_deduction`, {
          method: 'POST',
          headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ p_order_id: order.id })
        });
        console.log('✅ Stock deducted')
      } catch (e) { console.error('Stock error:', e) }

      // E) Send Notification to N8N
      try {
        await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: order.id,
            order_number: order.order_number,
            customer_name: order.buyer_name || `${data.name_first} ${data.name_last}`,
            customer_email: order.buyer_email || data.email_address,
            customer_phone: order.buyer_phone,
            total_amount: data.amount,
            payment_status: 'PAID'
          })
        });
        console.log('✅ Notification sent')
      } catch (e) { console.error('Notification error:', e) }
    }

    return { statusCode: 200, body: 'Success' }

  } catch (e: any) {
    console.error('ITN Error:', e)
    return { statusCode: 500, body: e.message }
  }
}
