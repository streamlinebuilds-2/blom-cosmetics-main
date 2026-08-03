import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const allowedOrigins = new Set([
  'https://blom-academy.vercel.app',
  'https://www.blom-academy.vercel.app'
])

export const handler: Handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || ''
  const headers = {
    'Access-Control-Allow-Origin': allowedOrigins.has(origin)
      ? origin
      : 'https://blom-academy.vercel.app',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
    'Vary': 'Origin'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const academyUrl = process.env.ACADEMY_SUPABASE_URL
  const academyServiceKey = process.env.ACADEMY_SUPABASE_SERVICE_KEY
  const authHeader = event.headers.authorization || event.headers.Authorization || ''
  const accessToken = authHeader.replace(/^Bearer\s+/i, '').trim()

  if (!academyUrl || !academyServiceKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Academy service is not configured' }) }
  }

  if (!accessToken) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'You must be logged in' }) }
  }

  let token = ''
  try {
    token = String(JSON.parse(event.body || '{}').token || '').trim()
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request body' }) }
  }

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid invite token' }) }
  }

  const academy = createClient(academyUrl, academyServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const { data: authData, error: authError } = await academy.auth.getUser(accessToken)
  const user = authData?.user
  const userEmail = String(user?.email || '').trim().toLowerCase()

  if (authError || !user?.id || !userEmail) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Your Academy session is invalid. Please log in again.' }) }
  }

  const { data: invite, error: inviteError } = await academy
    .from('course_invites')
    .select('id, course_id, email, expires_at, redeemed_at')
    .eq('token', token)
    .maybeSingle()

  if (inviteError || !invite) {
    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Invite not found' }) }
  }

  if (String(invite.email || '').trim().toLowerCase() !== userEmail) {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({
        error: 'This invite belongs to a different email address. Sign in with the email used to purchase the course.'
      })
    }
  }

  if (invite.redeemed_at) {
    return { statusCode: 409, headers, body: JSON.stringify({ error: 'Invite already redeemed' }) }
  }

  if (new Date(invite.expires_at).getTime() < Date.now()) {
    return { statusCode: 410, headers, body: JSON.stringify({ error: 'Invite expired' }) }
  }

  const { error: enrollmentError } = await academy
    .from('enrollments')
    .upsert(
      { user_id: user.id, course_id: invite.course_id },
      { onConflict: 'user_id,course_id', ignoreDuplicates: true }
    )

  if (enrollmentError) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Could not grant course access' }) }
  }

  const { data: redeemed, error: redeemError } = await academy
    .from('course_invites')
    .update({ redeemed_at: new Date().toISOString(), redeemed_user_id: user.id })
    .eq('id', invite.id)
    .is('redeemed_at', null)
    .select('course_id')
    .maybeSingle()

  if (redeemError || !redeemed) {
    return { statusCode: 409, headers, body: JSON.stringify({ error: 'Invite was already redeemed' }) }
  }

  const { data: course } = await academy
    .from('courses')
    .select('slug')
    .eq('id', invite.course_id)
    .maybeSingle()

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      course_id: invite.course_id,
      course_slug: course?.slug || null
    })
  }
}
