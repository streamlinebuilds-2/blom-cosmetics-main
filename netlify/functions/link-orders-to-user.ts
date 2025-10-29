import type { Handler } from '@netlify/functions'

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' }
    }

    const { user_id, email } = JSON.parse(event.body || '{}')

    if (!user_id || !email) {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'user_id and email required' }) }
    }

    const SUPABASE_URL = process.env.SUPABASE_URL
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!SUPABASE_URL || !SERVICE_KEY) {
      return { statusCode: 500, body: 'Missing Supabase config' }
    }

    // Find orders with no user_id but matching buyer_email
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?user_id=is.null&buyer_email=eq.${encodeURIComponent(email)}`,
      {
        method: 'PATCH',
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify({ user_id })
      }
    )

    if (!res.ok) {
      const err = await res.text()
      console.error('Link orders error:', err)
      return { statusCode: 400, body: err }
    }

    const data = await res.json()
    const linked = Array.isArray(data) ? data.length : 0

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ linked })
    }
  } catch (e: any) {
    console.error('Link orders error:', e)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: e.message || 'Server error' })
    }
  }
}
