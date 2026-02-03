import type { Handler } from '@netlify/functions'

export const config = {
  schedule: '@hourly'
}

export const handler: Handler = async () => {
  const SUPABASE_URL = process.env.SUPABASE_URL
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  const SITE_URL = (process.env.URL || process.env.SITE_URL || process.env.SITE_BASE_URL || 'https://blom-cosmetics.co.za').replace(/\/+$/, '')

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return { statusCode: 500, body: 'Server config missing' }
  }

  const headers = {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`
  }

  const ordersRes = await fetch(
    `${SUPABASE_URL}/rest/v1/orders?status=eq.paid&invoice_url=is.null&select=id,m_payment_id,merchant_payment_id&limit=50`,
    { headers }
  )

  if (!ordersRes.ok) {
    return { statusCode: 500, body: await ordersRes.text() }
  }

  const orders = (await ordersRes.json()) as Array<{ id: string; m_payment_id?: string | null; merchant_payment_id?: string | null }>

  let attempted = 0
  let succeeded = 0
  let failed = 0

  for (const o of orders) {
    attempted += 1
    const mPaymentId = o.m_payment_id || o.merchant_payment_id
    try {
      const invRes = await fetch(`${SITE_URL}/.netlify/functions/invoice-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mPaymentId ? { m_payment_id: mPaymentId } : { order_id: o.id })
      })
      if (!invRes.ok) {
        failed += 1
        console.error('Backfill invoice failed', { orderId: o.id, mPaymentId, status: invRes.status, body: await invRes.text() })
      } else {
        succeeded += 1
      }
    } catch (e) {
      failed += 1
      console.error('Backfill invoice error', { orderId: o.id, mPaymentId, error: String(e) })
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ attempted, succeeded, failed })
  }
}
