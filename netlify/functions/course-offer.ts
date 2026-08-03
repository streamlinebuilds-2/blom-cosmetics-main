import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import {
  TRENDY_RING_COURSE_SLUG,
  TRENDY_RING_OFFER_PRICE_CENTS,
  TRENDY_RING_OFFER_PRODUCT_SLUGS
} from './_lib/trendy-ring-offer'

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers }
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const url = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const authHeader = event.headers.authorization || event.headers.Authorization
  const token = authHeader?.replace(/^Bearer\s+/i, '').trim()

  if (!url || !serviceKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server configuration error' }) }
  }
  if (!token) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Please log in to claim this offer' }) }
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const { data: userData, error: userError } = await supabase.auth.getUser(token)
  const user = userData.user
  if (userError || !user?.email) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Your login has expired. Please log in again.' }) }
  }

  const email = user.email.toLowerCase().trim()
  const { data: benefit, error: benefitError } = await supabase
    .from('course_benefits')
    .select('id,coupon_code,status,buyer_email')
    .eq('course_slug', TRENDY_RING_COURSE_SLUG)
    .ilike('buyer_email', email)
    .maybeSingle()

  if (benefitError) {
    console.error('Course offer lookup failed:', benefitError)
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Unable to load your course offer' }) }
  }
  if (!benefit) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'No paid Trendy Ring course purchase was found for this Store account email.' })
    }
  }
  if (!['eligible', 'claimed'].includes(String(benefit.status))) {
    return {
      statusCode: 409,
      headers,
      body: JSON.stringify({
        error: benefit.status === 'redeemed' ? 'This offer has already been redeemed.' : 'This offer is no longer available.',
        status: benefit.status
      })
    }
  }

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id,name,slug,price,price_cents,thumbnail_url,image_url,status,is_active,out_of_stock')
    .in('slug', TRENDY_RING_OFFER_PRODUCT_SLUGS)

  if (productsError || !products || products.length !== 2) {
    console.error('Course offer products unavailable:', productsError)
    return { statusCode: 503, headers, body: JSON.stringify({ error: 'The Petal Paste pair is currently unavailable.' }) }
  }
  if (products.some((product: any) =>
    product.is_active === false ||
    product.out_of_stock === true ||
    !['active', 'published'].includes(String(product.status || 'active').toLowerCase())
  )) {
    return { statusCode: 409, headers, body: JSON.stringify({ error: 'One of the Petal Paste products is currently sold out.' }) }
  }

  await supabase
    .from('course_benefits')
    .update({
      status: 'claimed',
      claimed_user_id: user.id,
      claimed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', benefit.id)
    .eq('status', 'eligible')

  const normalizedProducts = products
    .sort((a: any, b: any) => TRENDY_RING_OFFER_PRODUCT_SLUGS.indexOf(a.slug) - TRENDY_RING_OFFER_PRODUCT_SLUGS.indexOf(b.slug))
    .map((product: any) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price ?? Number(product.price_cents || 0) / 100),
      image: product.thumbnail_url || product.image_url || ''
    }))

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      ok: true,
      course_slug: TRENDY_RING_COURSE_SLUG,
      coupon_code: benefit.coupon_code,
      status: 'claimed',
      offer_price_cents: TRENDY_RING_OFFER_PRICE_CENTS,
      products: normalizedProducts
    })
  }
}
