import type { Handler } from '@netlify/functions'
import { enrollCourse } from './_lib/enroll-helper'

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': 'https://blom-cosmetics.co.za',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const authHeader = event.headers.authorization || event.headers.Authorization || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')

  if (!serviceKey || token !== serviceKey) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized' })
    }
  }

  try {
    const { order_id, course_slug, buyer_email, buyer_name, buyer_phone } =
      JSON.parse(event.body || '{}')

    if (!order_id || !course_slug || !buyer_email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields: order_id, course_slug, buyer_email' })
      }
    }

    console.log('Enrolling in course:', { order_id, course_slug, buyer_email })

    const result = await enrollCourse({
      orderId: order_id,
      courseSlug: course_slug,
      buyerEmail: buyer_email,
      buyerName: buyer_name || '',
      buyerPhone: buyer_phone || ''
    })

    return {
      statusCode: result.success ? 200 : 502,
      headers,
      body: JSON.stringify(result)
    }
  } catch (error: any) {
    console.error('Course enrollment error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Failed to enroll in course' })
    }
  }
}
