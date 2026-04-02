import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import { enrollCourse } from './_lib/enroll-helper'

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const N8N_WEBHOOK_URL = 'https://dockerfile-1n82.onrender.com/webhook/notify-order'

const supabase = createClient(SUPABASE_URL!, SERVICE_KEY!)

export const handler: Handler = async (event) => {
  // 1. CORS Headers (Allow your site to call this)
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    const body = JSON.parse(event.body || '{}')
    const { order_id } = body

    if (!order_id) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing order_id' }) }
    }

    console.log(`🚀 Backup Trigger: Checking order ${order_id}`)

    // 2. Get Current Status
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .or(`id.eq.${order_id},order_number.eq.${order_id},m_payment_id.eq.${order_id}`)
      .single()

    if (fetchError || !order) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Order not found' }) }
    }

    // 3. If already paid, just return success (idempotent)
    const currentStatus = String(order.status || '').toLowerCase()
    const currentPaymentStatus = String(order.payment_status || '').toLowerCase()
    const isPaid = currentStatus === 'paid' || currentPaymentStatus === 'paid' || currentPaymentStatus === 'complete'

    if (!isPaid) {
      return {
        statusCode: 202,
        headers,
        body: JSON.stringify({ success: false, message: 'Order not confirmed paid yet' })
      }
    }

    try {
      const amountCents = typeof order.total_cents === 'number'
        ? order.total_cents
        : Math.round(Number(order.total || 0) * 100);

      const { data: cps } = await supabase
        .from('course_purchases')
        .select('id')
        .eq('order_id', order.id)
        .limit(1);

      if (cps && cps.length > 0 && Number.isFinite(amountCents) && amountCents > 0) {
        await supabase
          .from('course_purchases')
          .update({ amount_paid_cents: amountCents })
          .eq('order_id', order.id);
      }
    } catch (e) {
      console.error('Course purchase update error:', e)
    }

    // 4. TRIGGER N8N WORKFLOW
    // Constructing the specific payload you asked for: Amount, Name, Email, Phone, Order ID
    const n8nPayload = {
      order_id: order.id,
      order_number: order.order_number,
      amount: order.total,
      name: order.buyer_name || order.customer_name || 'Customer',
      email: order.buyer_email || order.customer_email || 'No Email',
      phone: order.buyer_phone || order.customer_phone || '',
      status: 'paid',
      source: 'website_success_page'
    }

    console.log(`📡 Sending Alert to n8n: ${N8N_WEBHOOK_URL}`)
    const n8nRes = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(n8nPayload)
    })

    if (!n8nRes.ok) {
      console.error('N8N Error:', await n8nRes.text())
    } else {
      console.log('✅ N8N Alert Sent!')
    }

    try {
      const { data: cps } = await supabase
        .from('course_purchases')
        .select('course_slug,invitation_status,buyer_email,buyer_name,buyer_phone')
        .eq('order_id', order.id)

      const coursePurchases = Array.isArray(cps) ? cps : []
      const isCourse = order.order_kind === 'course' || coursePurchases.length > 0

      if (isCourse) {
        for (const cp of coursePurchases) {
          const status = String(cp?.invitation_status || '').toLowerCase()
          if (status === 'sent' || status === 'redeemed') continue

          const buyerEmail = String(order.buyer_email || cp.buyer_email || '').trim()
          const buyerName = String(order.buyer_name || cp.buyer_name || '').trim()
          const buyerPhone = String(order.buyer_phone || cp.buyer_phone || '').trim()
          const courseSlug = String(cp.course_slug || '')

          if (!buyerEmail || !courseSlug) continue

          try {
            const result = await enrollCourse({
              orderId: order.id,
              courseSlug,
              buyerEmail,
              buyerName,
              buyerPhone
            })

            if (result.success) {
              console.log('✅ Course enrollment successful:', courseSlug, result.inviteUrl)
            } else {
              console.error('Course enrollment failed:', courseSlug, result.error)
            }
          } catch (e) {
            console.error('Course enrollment error:', courseSlug, e)
          }
        }
      }
    } catch (e) {
      console.error('Course enrollment error:', e)
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Order confirmed and alert sent' })
    }

  } catch (error: any) {
    console.error('Backup Trigger Error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    }
  }
}
