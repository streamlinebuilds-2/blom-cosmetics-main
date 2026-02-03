import type { Handler } from '@netlify/functions'
import crypto from 'crypto'

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const PF_PASSPHRASE = process.env.PAYFAST_PASSPHRASE || process.env.PF_PASSPHRASE || ''
const SITE = process.env.SITE_URL || process.env.SITE_BASE_URL || 'https://blom-cosmetics.co.za'
const N8N_WEBHOOK_URL = 'https://dockerfile-1n82.onrender.com/webhook/notify-order'

const encodeVal = (v: any) => encodeURIComponent(String(v)).replace(/%20/g, '+')

function signITN(fields: Record<string, any>, passphrase?: string): string {
  const keys = Object.keys(fields).filter((k) => fields[k] !== undefined && fields[k] !== null && fields[k] !== '')
  keys.sort()
  const base = keys.map((k) => `${k}=${encodeVal(fields[k])}`).join('&')
  const withPP = passphrase ? `${base}&passphrase=${encodeVal(passphrase)}` : base
  return crypto.createHash('md5').update(withPP).digest('hex')
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
    if (!passphrase) {
      console.error('PAYFAST_PASSPHRASE missing; refusing ITN')
      return { statusCode: 500, body: 'PAYFAST_PASSPHRASE_MISSING' }
    }

    const receivedSignature = String(data.signature || '').trim().toLowerCase()
    const { signature: _sig, ...fieldsToVerify } = data
    const expectedSignature = signITN(fieldsToVerify, passphrase).toLowerCase()

    if (!receivedSignature || receivedSignature !== expectedSignature) {
      console.error('Invalid PayFast ITN signature', { receivedSignature, expectedSignature })
      return { statusCode: 400, body: 'INVALID_SIGNATURE' }
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

    return { statusCode: 200, body: 'Success' }

  } catch (e: any) {
    console.error('ITN Error:', e)
    return { statusCode: 500, body: e.message }
  }
}
