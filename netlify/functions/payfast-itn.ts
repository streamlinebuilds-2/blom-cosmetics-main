import type { Handler } from '@netlify/functions'
import crypto from 'crypto'

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const PF_PASSPHRASE = process.env.PAYFAST_PASSPHRASE || process.env.PF_PASSPHRASE || ''
const SITE = process.env.SITE_URL || process.env.SITE_BASE_URL || 'https://blom-cosmetics.co.za'
// Define your n8n webhook URL here
const N8N_WEBHOOK_URL = 'https://dockerfile-1n82.onrender.com/webhook/notify-order'

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

    console.log('=== PAYFAST ITN DEBUG START ===')
    console.log('ITN received for order:', data.m_payment_id)
    console.log('Payment status:', data.payment_status)
    
    if (!SUPABASE_URL || !SERVICE_KEY) {
      console.error('Missing Supabase config')
      return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Missing Supabase config' }) }
    }

    // --- Check Payment Status ---
    const paymentStatus = data.payment_status;
    if (paymentStatus !== 'COMPLETE') {
      console.warn(`Payment status is ${paymentStatus}, marking order as cancelled/failed.`);
      if (data.m_payment_id) {
         await fetch(`${SUPABASE_URL}/rest/v1/orders?m_payment_id=eq.${encodeURIComponent(data.m_payment_id)}`, {
          method: 'PATCH',
          headers: {
            apikey: SERVICE_KEY,
            Authorization: `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'cancelled', payment_status: 'failed' })
        });
      }
      return { statusCode: 200, body: 'Payment failed/cancelled recorded' };
    }

    // Validate amount matches order
    const m_payment_id = data.m_payment_id
    if (!m_payment_id) {
      console.error('No m_payment_id in ITN')
      return { statusCode: 400, body: 'No m_payment_id' }
    }

    // Fetch Order Details for Verification & Payload
    const ordRes = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?m_payment_id=eq.${encodeURIComponent(m_payment_id)}&select=*`,
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

    // Validate amount
    const expectedCents = order.total_cents !== null && order.total_cents !== undefined 
      ? Number(order.total_cents) 
      : Math.round(Number(order.total) * 100)
    const receivedCents = Math.round(Number(data.amount) * 100)

    if (expectedCents !== receivedCents) {
      console.error(`Amount mismatch: expected ${expectedCents}, got ${receivedCents}`)
      return { statusCode: 400, body: 'Amount mismatch' }
    }

    // --- Mark order as paid ---
    console.log('=== ORDER PROCESSING START ===')
    
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

      // --- TRIGGER N8N WEBHOOK ---
      try {
        const n8nPayload = {
          order_id: order.id,
          order_number: order.order_number,
          customer_name: order.buyer_name || order.customer_name || `${data.name_first} ${data.name_last}`,
          customer_email: order.buyer_email || order.customer_email || data.email_address,
          customer_phone: order.buyer_phone || order.customer_phone,
          total_amount: data.amount,
          payment_status: 'PAID',
          payment_method: 'PayFast',
          timestamp: new Date().toISOString()
        };

        console.log(`📡 Sending payload to n8n: ${N8N_WEBHOOK_URL}`)
        const webhookRes = await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(n8nPayload)
        });

        if (webhookRes.ok) {
          console.log('✅ N8N Webhook triggered successfully');
        } else {
          console.error('❌ N8N Webhook failed:', await webhookRes.text());
        }
      } catch (webhookErr) {
        console.error('Error calling n8n webhook:', webhookErr);
      }

      // --- Trigger Stock Deduction ---
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/rpc/process_order_stock_deduction`, {
          method: 'POST',
          headers: {
            apikey: SERVICE_KEY,
            Authorization: `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ p_order_id: order.id })
        });
        console.log('Stock deduction triggered');
      } catch (stockErr) {
        console.error('Stock deduction trigger failed:', stockErr);
      }
      
    } // End if status !== paid

    console.log('=== ORDER PROCESSING COMPLETE ===')

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
