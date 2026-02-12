import type { Handler } from '@netlify/functions'
import crypto from 'crypto'

const PF_ENV = String(process.env.PAYFAST_ENV || 'live').toLowerCase()
const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const PF_PASSPHRASE =
  (PF_ENV === 'sandbox' ? process.env.PAYFAST_SANDBOX_PASSPHRASE : process.env.PAYFAST_PASSPHRASE) ||
  process.env.PF_PASSPHRASE ||
  ''
const SITE = process.env.SITE_URL || process.env.SITE_BASE_URL || 'https://blom-cosmetics.co.za'
const PF_BASE = PF_ENV === 'sandbox' ? 'https://sandbox.payfast.co.za' : 'https://www.payfast.co.za'
const N8N_WEBHOOK_URL = 'https://dockerfile-1n82.onrender.com/webhook/notify-order'
const N8N_COURSE_PURCHASE_WEBHOOK_URL = process.env.N8N_COURSE_PURCHASE_WEBHOOK_URL || 'https://dockerfile-1n82.onrender.com/webhook/purchase-success'
const N8N_COURSE_PURCHASE_WEBHOOK_TOKEN = process.env.N8N_COURSE_PURCHASE_WEBHOOK_TOKEN || ''
const N8N_COURSE_PURCHASE_WEBHOOK_SIGNING_SECRET = process.env.N8N_COURSE_PURCHASE_WEBHOOK_SIGNING_SECRET || ''

function encPF(v: unknown) {
  return encodeURIComponent(String(v ?? '').trim())
    .replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase())
    .replace(/%20/g, '+')
    .replace(/%[0-9a-f]{2}/g, m => m.toUpperCase())
}

function signITN(fields: Record<string, any>, passphrase?: string): string {
  const keys = Object.keys(fields).filter((k) => fields[k] !== undefined && fields[k] !== null && fields[k] !== '')
  keys.sort()
  const base = keys.map((k) => `${k}=${encPF(fields[k])}`).join('&')
  const withPP = passphrase ? `${base}&passphrase=${encPF(passphrase)}` : base
  return crypto.createHash('md5').update(withPP).digest('hex')
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function validateWithPayFast(rawBody: string) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)
  try {
    const res = await fetch(`${PF_BASE}/eng/query/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: rawBody,
      signal: controller.signal
    })
    const text = (await res.text()).trim()
    return { ok: res.ok && text === 'VALID', status: res.status, text }
  } catch (e: any) {
    return { ok: false, status: null as number | null, text: String(e?.message || e) }
  } finally {
    clearTimeout(timeout)
  }
}

async function postJsonWithRetry(url: string, payload: unknown, extraHeaders: Record<string, string> = {}) {
  const body = JSON.stringify(payload)
  const signatureSecret = N8N_COURSE_PURCHASE_WEBHOOK_SIGNING_SECRET.trim()
  const signature = signatureSecret
    ? crypto.createHmac('sha256', signatureSecret).update(body).digest('hex')
    : ''

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders
  }

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

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body,
        signal: controller.signal
      })
      lastStatus = res.status
      lastBody = await res.text()

      if (res.status === 200 || res.status === 202) {
        return { ok: true as const, status: res.status, body: lastBody }
      }
    } catch (e: any) {
      lastStatus = null
      lastBody = String(e?.message || e)
    } finally {
      clearTimeout(timeout)
    }
  }

  return { ok: false as const, status: lastStatus, body: lastBody }
}

function splitName(fullName: string) {
  const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean)
  const first = parts[0] || ''
  const last = parts.slice(1).join(' ')
  return { first_name: first, last_name: last }
}

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

    const passphrase = PF_PASSPHRASE.trim()
    const receivedSignature = String(data.signature || '').trim().toLowerCase()
    const { signature: _sig, ...fieldsToVerify } = data
    const expectedWithPassphrase = passphrase ? signITN(fieldsToVerify, passphrase).toLowerCase() : ''
    const expectedWithoutPassphrase = signITN(fieldsToVerify).toLowerCase()

    const signatureOk =
      !!receivedSignature &&
      (receivedSignature === expectedWithoutPassphrase || (expectedWithPassphrase && receivedSignature === expectedWithPassphrase))

    if (!signatureOk) {
      const rawBody = event.body || ''
      const pfValidate = rawBody ? await validateWithPayFast(rawBody) : { ok: false, status: null, text: 'EMPTY_BODY' }

      if (!pfValidate.ok) {
        console.error('Invalid PayFast ITN signature', {
          receivedSignature,
          expectedWithPassphrase,
          expectedWithoutPassphrase,
          payfastValidateStatus: pfValidate.status,
          payfastValidateText: pfValidate.text
        })
        return { statusCode: 400, body: 'INVALID_SIGNATURE' }
      }
    }

    // 2. Handle Failed Payments
    if (data.payment_status !== 'COMPLETE') {
      if (data.m_payment_id) {
         const orParam = encodeURIComponent(`(m_payment_id.eq.${data.m_payment_id},merchant_payment_id.eq.${data.m_payment_id},id.eq.${data.m_payment_id})`)
         await fetch(`${SUPABASE_URL}/rest/v1/orders?or=${orParam}`, {
          method: 'PATCH',
          headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'cancelled', payment_status: 'failed' })
        });
      }
      return { statusCode: 200, body: 'Payment failed recorded' };
    }

    // 3. Fetch Order Details
    const m_payment_id = data.m_payment_id || data.custom_str1
    if (!m_payment_id) return { statusCode: 400, body: 'No m_payment_id' }

    const orParam = encodeURIComponent(`(m_payment_id.eq.${m_payment_id},merchant_payment_id.eq.${m_payment_id},id.eq.${m_payment_id})`)
    const ordRes = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?or=${orParam}&select=*`,
      { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
    )
    const orders = await ordRes.json()
    const order = orders?.[0]

    if (!order) {
      console.error('Order not found:', m_payment_id)
      return { statusCode: 404, body: 'Order not found' }
    }

    const coursePurchasesRes = await fetch(
      `${SUPABASE_URL}/rest/v1/course_purchases?order_id=eq.${encodeURIComponent(order.id)}&select=course_slug,invitation_status,buyer_email,buyer_name,buyer_phone`,
      { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
    )
    const coursePurchases = coursePurchasesRes.ok ? await coursePurchasesRes.json() : []
    const isCourse = order.order_kind === 'course' || (Array.isArray(coursePurchases) && coursePurchases.length > 0)

    // 4. Update Status to PAID (if not already)
    const paidAt = order.paid_at || new Date().toISOString()
    if (order.status !== 'paid') {
      console.log(`Processing Payment for ${order.id}...`)

      // A) Mark as Paid in DB
      await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${order.id}`, {
        method: 'PATCH',
        headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'paid',
          payment_status: 'paid',
          paid_at: paidAt
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
        const baseUrl = (process.env.URL || process.env.SITE_URL || process.env.SITE_BASE_URL || SITE).replace(/\/$/, '')
        const invRes = await fetch(`${baseUrl}/.netlify/functions/invoice-pdf`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ m_payment_id })
        })
        if (invRes.ok) console.log('✅ Invoice generated successfully')
        else console.error('❌ Invoice generation failed:', await invRes.text())
      } catch (e) { console.error('Invoice trigger error:', e) }

      try {
        const amountCents = Math.round(Number(data.amount || 0) * 100);
        let isCourse = order.order_kind === 'course';

        if (!isCourse) {
          const cpRes = await fetch(
            `${SUPABASE_URL}/rest/v1/course_purchases?order_id=eq.${encodeURIComponent(order.id)}&select=id&limit=1`,
            { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
          );
          if (cpRes.ok) {
            const cps = await cpRes.json();
            isCourse = Array.isArray(cps) && cps.length > 0;
          }
        }

        if (isCourse && Number.isFinite(amountCents) && amountCents > 0) {
          await fetch(`${SUPABASE_URL}/rest/v1/course_purchases?order_id=eq.${encodeURIComponent(order.id)}`, {
            method: 'PATCH',
            headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount_paid_cents: amountCents
            })
          });
        }
      } catch (e) {
        console.error('Course purchase update error:', e)
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

    if (isCourse) {
      const hasSent = Array.isArray(coursePurchases) && coursePurchases.some((cp: any) => String(cp?.invitation_status || '').toLowerCase() === 'sent')

      if (!hasSent) {
        const itemsRes = await fetch(
          `${SUPABASE_URL}/rest/v1/order_items?order_id=eq.${encodeURIComponent(order.id)}&select=sku,quantity,unit_price`,
          { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
        )
        const orderItems = itemsRes.ok ? await itemsRes.json() : []

        const line_items = (Array.isArray(orderItems) ? orderItems : [])
          .map((it: any) => ({
            sku: String(it?.sku || ''),
            quantity: Number(it?.quantity || 0),
            unit_price: Number(it?.unit_price || 0),
            currency: 'ZAR'
          }))
          .filter((it: any) => it.sku && Number.isFinite(it.quantity) && it.quantity > 0 && Number.isFinite(it.unit_price) && it.unit_price > 0)

        const buyerEmail = String(order.buyer_email || coursePurchases?.[0]?.buyer_email || data.email_address || '').trim()
        const buyerName = String(order.buyer_name || coursePurchases?.[0]?.buyer_name || `${data.name_first || ''} ${data.name_last || ''}`.trim()).trim()
        const buyerPhone = String(order.buyer_phone || coursePurchases?.[0]?.buyer_phone || '').trim()
        const { first_name, last_name } = splitName(buyerName)

        const totalAmount = Number(data.amount || order.total || 0)

        if (!buyerEmail || line_items.length === 0 || line_items.some((it: any) => !it.sku)) {
          if (Array.isArray(coursePurchases) && coursePurchases.length > 0) {
            await fetch(`${SUPABASE_URL}/rest/v1/course_purchases?order_id=eq.${encodeURIComponent(order.id)}`, {
              method: 'PATCH',
              headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ invitation_status: 'failed' })
            })
          }
          return { statusCode: 500, body: 'COURSE_WEBHOOK_PAYLOAD_INVALID' }
        }

        const env = process.env.CONTEXT === 'production' ? 'production' : 'staging'
        const payload = {
          event: 'course_purchase_paid',
          order_id: String(order.id),
          provider: 'payfast',
          paid_at: String(paidAt),
          email: buyerEmail,
          customer: {
            first_name,
            last_name,
            phone: buyerPhone
          },
          line_items,
          total: {
            amount: totalAmount,
            currency: 'ZAR'
          },
          meta: {
            site: 'blom-academy',
            env
          }
        }

        const n8nRes = await postJsonWithRetry(N8N_COURSE_PURCHASE_WEBHOOK_URL, payload)

        if (!n8nRes.ok) {
          if (Array.isArray(coursePurchases) && coursePurchases.length > 0) {
            await fetch(`${SUPABASE_URL}/rest/v1/course_purchases?order_id=eq.${encodeURIComponent(order.id)}`, {
              method: 'PATCH',
              headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ invitation_status: 'failed' })
            })
          }
          console.error('Course purchase webhook failed', { status: n8nRes.status, body: n8nRes.body })
          return { statusCode: 500, body: 'COURSE_WEBHOOK_FAILED' }
        }

        if (Array.isArray(coursePurchases) && coursePurchases.length > 0) {
          await fetch(`${SUPABASE_URL}/rest/v1/course_purchases?order_id=eq.${encodeURIComponent(order.id)}`, {
            method: 'PATCH',
            headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ invitation_status: 'sent', invited_at: paidAt })
          })
        }
      }
    }

    return { statusCode: 200, body: 'Success' }

  } catch (e: any) {
    console.error('ITN Error:', e)
    return { statusCode: 500, body: e.message }
  }
}
