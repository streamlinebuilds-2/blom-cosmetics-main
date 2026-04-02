import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import { enrollCourse } from './_lib/enroll-helper'

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  // Auth: require service_role key as Bearer token
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  const authHeader = event.headers.authorization || event.headers.Authorization || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')

  if (!SERVICE_KEY || token !== SERVICE_KEY) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) }
  }

  const store = createClient(process.env.SUPABASE_URL!, SERVICE_KEY)

  // Fetch failed course purchases
  const { data: failed, error: fetchErr } = await store
    .from('course_purchases')
    .select('order_id,course_slug,buyer_email,buyer_name,buyer_phone')
    .eq('invitation_status', 'failed')
    .limit(50)

  if (fetchErr) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to query course_purchases', details: fetchErr.message })
    }
  }

  const toRetry = failed || []
  const results = []

  for (const row of toRetry) {
    const result = await enrollCourse({
      orderId: row.order_id,
      courseSlug: row.course_slug,
      buyerEmail: row.buyer_email,
      buyerName: row.buyer_name || '',
      buyerPhone: row.buyer_phone || ''
    })

    results.push({
      order_id: row.order_id,
      course_slug: row.course_slug,
      success: result.success,
      inviteUrl: result.inviteUrl,
      error: result.error
    })
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      processed: results.length,
      succeeded: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      details: results
    })
  }
}
