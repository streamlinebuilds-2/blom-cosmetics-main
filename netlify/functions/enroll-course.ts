import type { Handler } from '@netlify/functions'
import { enrollCourse } from './_lib/enroll-helper'

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers }
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
