import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
// UPDATED URL: Using the notify-order endpoint you requested
const N8N_WEBHOOK_URL = 'https://dockerfile-1n82.onrender.com/webhook/notify-order'
const N8N_COURSE_PURCHASE_WEBHOOK_URL = process.env.N8N_COURSE_PURCHASE_WEBHOOK_URL || 'https://dockerfile-1n82.onrender.com/webhook/purchase-success'
const N8N_COURSE_PURCHASE_WEBHOOK_TOKEN = process.env.N8N_COURSE_PURCHASE_WEBHOOK_TOKEN || ''
const N8N_COURSE_PURCHASE_WEBHOOK_SIGNING_SECRET = process.env.N8N_COURSE_PURCHASE_WEBHOOK_SIGNING_SECRET || ''

const supabase = createClient(SUPABASE_URL!, SERVICE_KEY!)

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function splitName(fullName: string) {
  const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean)
  const first = parts[0] || ''
  const last = parts.slice(1).join(' ')
  return { first_name: first, last_name: last }
}

async function postJsonWithRetry(url: string, payload: unknown) {
  const body = JSON.stringify(payload)
  const signatureSecret = N8N_COURSE_PURCHASE_WEBHOOK_SIGNING_SECRET.trim()
  const signature = signatureSecret
    ? await import('crypto').then((m) => m.createHmac('sha256', signatureSecret).update(body).digest('hex'))
    : ''

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (N8N_COURSE_PURCHASE_WEBHOOK_TOKEN.trim()) {
    headers.Authorization = `Bearer ${N8N_COURSE_PURCHASE_WEBHOOK_TOKEN.trim()}`
  }
  if (signature) {
    headers['X-Webhook-Signature'] = signature
  }

  const delaysMs = [0, 500, 1500, 3500, 7000]
  let lastStatus: number | null = null
  let lastBody = ''

  for (let attempt = 0; attempt < delaysMs.length; attempt++) {
    if (delaysMs[attempt] > 0) await sleep(delaysMs[attempt])
    try {
      const res = await fetch(url, { method: 'POST', headers, body })
      lastStatus = res.status
      lastBody = await res.text()
      if (res.status === 200 || res.status === 202) return { ok: true as const, status: res.status, body: lastBody }
    } catch (e: any) {
      lastStatus = null
      lastBody = String(e?.message || e)
    }
  }

  return { ok: false as const, status: lastStatus, body: lastBody }
}

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
        const alreadySent = coursePurchases.some((cp: any) => String(cp?.invitation_status || '').toLowerCase() === 'sent')

        if (!alreadySent) {
          const { data: items } = await supabase
            .from('order_items')
            .select('sku,quantity,unit_price')
            .eq('order_id', order.id)

          const line_items = (Array.isArray(items) ? items : [])
            .map((it: any) => ({
              sku: String(it?.sku || ''),
              quantity: Number(it?.quantity || 0),
              unit_price: Number(it?.unit_price || 0),
              currency: 'ZAR'
            }))
            .filter((it: any) => it.sku && Number.isFinite(it.quantity) && it.quantity > 0 && Number.isFinite(it.unit_price) && it.unit_price > 0)

          const buyerEmail = String(order.buyer_email || coursePurchases?.[0]?.buyer_email || '').trim()
          const buyerName = String(order.buyer_name || coursePurchases?.[0]?.buyer_name || '').trim()
          const buyerPhone = String(order.buyer_phone || coursePurchases?.[0]?.buyer_phone || '').trim()
          const { first_name, last_name } = splitName(buyerName)

          if (buyerEmail && line_items.length > 0 && !line_items.some((it: any) => !it.sku)) {
            const env = process.env.CONTEXT === 'production' ? 'production' : 'staging'
            const paidAt = String(order.paid_at || new Date().toISOString())

            const payload = {
              event: 'course_purchase_paid',
              order_id: String(order.id),
              provider: 'payfast',
              paid_at: paidAt,
              email: buyerEmail,
              customer: {
                first_name,
                last_name,
                phone: buyerPhone
              },
              line_items,
              total: {
                amount: Number(order.total || 0),
                currency: 'ZAR'
              },
              meta: {
                site: 'blom-academy',
                env
              }
            }

            const courseRes = await postJsonWithRetry(N8N_COURSE_PURCHASE_WEBHOOK_URL, payload)

            if (courseRes.ok) {
              await supabase
                .from('course_purchases')
                .update({ invitation_status: 'sent', invited_at: paidAt })
                .eq('order_id', order.id)
            } else {
              await supabase
                .from('course_purchases')
                .update({ invitation_status: 'failed' })
                .eq('order_id', order.id)
              console.error('Course purchase webhook failed', { status: courseRes.status, body: courseRes.body })
            }
          } else if (coursePurchases.length > 0) {
            await supabase
              .from('course_purchases')
              .update({ invitation_status: 'failed' })
              .eq('order_id', order.id)
          }
        }
      }
    } catch (e) {
      console.error('Course webhook fallback error:', e)
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
