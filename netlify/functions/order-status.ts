import type { Handler } from '@netlify/functions'

function getWebhookUrl(): string {
  const direct = process.env.N8N_ORDER_STATUS_WEBHOOK
  const base = process.env.N8N_BASE
  if (direct) return direct
  if (base) return `${base.replace(/\/$/, '')}/webhook/order-status-update`
  throw new Error('Missing N8N webhook env (N8N_ORDER_STATUS_WEBHOOK or N8N_BASE)')
}

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' }
    }

    const body = event.body || '{}'
    let json: any
    try {
      json = JSON.parse(body)
    } catch {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'INVALID_JSON' }) }
    }

    const { m_payment_id, status } = json || {}
    if (!m_payment_id || !status) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'INVALID_PAYLOAD', message: 'm_payment_id and status are required' })
      }
    }

    const url = getWebhookUrl()
    const fwd = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    })

    if (!fwd.ok) {
      const text = await fwd.text().catch(() => '')
      console.error('n8n forward failed:', fwd.status, text)
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'N8N_FORWARD_FAILED', status: fwd.status })
      }
    }

    console.log('Order status forwarded:', { m_payment_id, status, buyer_email: json?.buyer_email, site_url: json?.site_url })
    return { statusCode: 200, body: '' }
  } catch (e: any) {
    console.error('order-status error:', e?.message)
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'SERVER_ERROR', message: e?.message || 'Server error' }) }
  }
}


