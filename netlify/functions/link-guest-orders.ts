import fetch from 'node-fetch'

const SB_URL = process.env.SUPABASE_URL!
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const handler = async (event: any) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' }
    }

    const authHeader = (event.headers?.authorization || (event.headers as any)?.Authorization) as string | undefined
    if (!authHeader) {
      return { statusCode: 401, body: 'Unauthorized' }
    }

    // Get the logged-in Supabase user
    const uRes = await fetch(`${SB_URL}/auth/v1/user`, {
      headers: { apikey: SB_KEY, Authorization: authHeader }
    })
    if (!uRes.ok) return { statusCode: 401, body: 'Invalid auth' }
    const user = await uRes.json()

    const { email } = JSON.parse(event.body || '{}') as { email?: string }
    const targetEmail = (email || user?.email || '').toLowerCase()
    if (!targetEmail) return { statusCode: 400, body: 'email required' }

    // Link guest orders to this user by email where user_id is null
    const res = await fetch(
      `${SB_URL}/rest/v1/orders?and=(user_id.is.null,buyer_email.eq.${encodeURIComponent(targetEmail)})`,
      {
        method: 'PATCH',
        headers: {
          apikey: SB_KEY,
          Authorization: `Bearer ${SB_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify({ user_id: user.id })
      }
    )

    if (!res.ok) return { statusCode: 500, body: await res.text() }
    const linked = await res.json()
    return { statusCode: 200, body: JSON.stringify({ linked: Array.isArray(linked) ? linked.length : 0 }) }
  } catch (e: any) {
    console.error(e)
    return { statusCode: 500, body: e?.message || 'Error' }
  }
}


