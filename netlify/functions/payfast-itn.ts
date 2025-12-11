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

      // B) GENERATE INVOICE (Crucial Step Added)
      try {
        console.log('Generating Invoice PDF...')
        // Call the invoice generator internally
        const invoiceUrl = `${SITE.replace(/\/$/, '')}/.netlify/functions/invoice-generate-pdf?m_payment_id=${encodeURIComponent(m_payment_id)}`
        // We use a fetch here to trigger the function
        const invRes = await fetch(invoiceUrl)
        if (invRes.ok) console.log('✅ Invoice generated successfully')
        else console.error('❌ Invoice generation failed:', await invRes.text())
      } catch (e) {
        console.error('Invoice trigger error:', e)
      }

      // C) Trigger Stock Deduction
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/rpc/process_order_stock_deduction`, {
          method: 'POST',
          headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ p_order_id: order.id })
        });
        console.log('✅ Stock deducted')
      } catch (e) { console.error('Stock error:', e) }

      // D) Send Notification to N8N (Email/WhatsApp)
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
