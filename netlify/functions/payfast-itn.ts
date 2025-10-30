import type { Handler } from '@netlify/functions'
import crypto from 'crypto'

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const PF_PASSPHRASE = process.env.PAYFAST_PASSPHRASE || process.env.PF_PASSPHRASE || ''
const SITE = process.env.SITE_BASE_URL || process.env.SITE_URL || 'https://blom-cosmetics.co.za'

function validateSignature(params: Record<string, any>, passphrase?: string): boolean {
  // PayFast signature validation: specific fields in specific order
  const signatureFields = [
    'merchant_id',
    'merchant_key',
    'return_url',
    'cancel_url',
    'notify_url',
    'name_first',
    'name_last',
    'email_address',
    'm_payment_id',
    'amount',
    'item_name',
    'custom_str1'
  ]

  const parts: string[] = []
  for (const key of signatureFields) {
    const val = params[key]
    if (val !== undefined && val !== null && val !== '') {
      parts.push(`${key}=${encodeURIComponent(String(val)).replace(/%20/g, '+')}`)
    }
  }

  let baseString = parts.join('&')
  if (passphrase) {
    baseString += `&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`
  }

  const computedSignature = crypto.createHash('md5').update(baseString).digest('hex')
  return computedSignature === params.signature
}

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' }
    }

    // Parse ITN data (form-encoded)
    const params = new URLSearchParams(event.body || '')
    const data: Record<string, any> = {}
    params.forEach((v, k) => {
      data[k] = v
    })

    console.log('ITN received:', data.m_payment_id, 'Amount:', data.amount)

    if (!SUPABASE_URL || !SERVICE_KEY) {
      console.error('Missing Supabase config')
      return { statusCode: 500, body: 'Config error' }
    }

    // 1) Validate signature
    if (!validateSignature(data, PF_PASSPHRASE)) {
      console.error('Invalid ITN signature')
      return { statusCode: 400, body: 'Invalid signature' }
    }

    // 2) Validate amount matches order
    const m_payment_id = data.m_payment_id
    if (!m_payment_id) {
      console.error('No m_payment_id in ITN')
      return { statusCode: 400, body: 'No m_payment_id' }
    }

    const ordRes = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?m_payment_id=eq.${encodeURIComponent(m_payment_id)}&select=id,total,status`,
      {
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`
        }
      }
    )

    if (!ordRes.ok) {
      console.error('Order fetch failed:', await ordRes.text())
      return { statusCode: 400, body: 'Order not found' }
    }

    const orders = await ordRes.json()
    const order = orders[0]

    if (!order) {
      console.error('Order not found:', m_payment_id)
      return { statusCode: 400, body: 'Order not found' }
    }

    // Validate amount (convert to cents for comparison)
    const expectedCents = Math.round(Number(order.total) * 100)
    const receivedCents = Math.round(Number(data.amount) * 100)

    if (expectedCents !== receivedCents) {
      console.error(`Amount mismatch: expected ${expectedCents}, got ${receivedCents}`)
      return { statusCode: 400, body: 'Amount mismatch' }
    }

    // 3) Mark order as paid (idempotent - only if not already paid)
    if (order.status !== 'paid') {
      const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${order.id}`, {
        method: 'PATCH',
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'paid',
          payment_status: 'paid',
          paid_at: new Date().toISOString()
        })
      })

      if (!updateRes.ok) {
        console.error('Order update failed:', await updateRes.text())
        return { statusCode: 500, body: 'Update failed' }
      }

      console.log('Order marked as paid:', order.id)
    }

    // 4) Insert payment record (non-blocking, for admin tracking)
    ;(async () => {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/payments`, {
          method: 'POST',
          headers: {
            apikey: SERVICE_KEY,
            Authorization: `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            order_id: order.id,
            provider: 'payfast',
            amount_cents: receivedCents,
            status: 'completed',
            provider_txn_id: data.pnr || null,
            raw: data
          })
        })
        console.log('Payment record created')
      } catch (e: any) {
        console.warn('Payment record insert failed:', e?.message)
      }
    })()

    // 5) Generate invoice (non-blocking)
    ;(async () => {
      try {
        const base = SITE
        await fetch(`${base}/.netlify/functions/invoice-generate-pdf?m_payment_id=${encodeURIComponent(m_payment_id)}`)
        console.log('Invoice generated')
      } catch (e: any) {
        console.warn('Invoice gen failed:', e?.message)
      }
    })()

    // 6) Forward to n8n (non-blocking fan-out)
    ;(async () => {
      try {
        await fetch('https://dockerfile-1n82.onrender.com/webhook/payfast-itn', {
          method: 'POST',
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(data).toString()
        })
        console.log('Forwarded to n8n')
      } catch (e: any) {
        console.warn('n8n forward failed:', e?.message)
      }
    })()

    // Return 200 immediately to PayFast (acknowledgement)
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain' },
      body: ''
    }
  } catch (e: any) {
    console.error('ITN handler error:', e)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: e.message || 'Server error' })
    }
  }
}
