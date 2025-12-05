import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

interface BeautyClubSignupData {
  email: string
  phone?: string
  first_name?: string
  consent: boolean
  source: string
}

// Helper to send data to N8N automation
async function sendWebhookToN8N(signupData: BeautyClubSignupData, couponCode?: string): Promise<boolean> {
  try {
    // Use environment variable or fallback
    const WEBHOOK_URL = process.env.N8N_BEAUTY_CLUB_WEBHOOK || 'https://dockerfile-1n82.onrender.com/webhook/beauty-club-signup'
    
    console.log('Sending webhook to N8N:', WEBHOOK_URL)
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'BLOM-Cosmetics-BeautyClub/1.0'
      },
      body: JSON.stringify({
        ...signupData,
        coupon_code: couponCode || null,
        timestamp: new Date().toISOString(),
        source: signupData.source || 'popup',
        discount_value: 'R100',
        min_spend: 'R500'
      })
    })
    
    if (!response.ok) {
      console.error('Webhook request failed:', response.status)
      return false
    }
    return true
  } catch (error) {
    console.error('Error sending webhook to N8N:', error)
    return false
  }
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) }
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server Config Error' }) }
  }
  const supabase = createClient(supabaseUrl, serviceKey)

  try {
    const data: BeautyClubSignupData = JSON.parse(event.body || '{}')
    const { email, phone, first_name } = data

    if (!email) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email is required' }) }
    }

    const cleanEmail = email.toLowerCase().trim()
    const cleanPhone = phone ? phone.replace(/\s+/g, '').trim() : null

    // 1. Check for existing user
    let query = supabase.from('contacts').select('id, email, phone')
    if (cleanPhone) {
      query = query.or(`email.eq.${cleanEmail},phone.eq.${cleanPhone}`)
    } else {
      query = query.eq('email', cleanEmail)
    }
    
    const { data: existing } = await query

    if (existing && existing.length > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'ALREADY_REGISTERED',
          message: 'This email or phone number is already a member of the Beauty Club.'
        })
      }
    }

    // 2. Create Contact
    const { error: insertError } = await supabase
      .from('contacts')
      .insert({
        email: cleanEmail,
        phone: cleanPhone,
        name: first_name || 'Beauty Club Member',
        status: 'new',
        source: 'account_creation',
        subscribed: true,
        message: 'Beauty Club Signup'
      })

    if (insertError) {
      return { statusCode: 500, body: JSON.stringify({ error: 'DB_INSERT_FAILED', message: insertError.message }) }
    }

    // 3. Create Coupon (R100 Fixed, R500 Min Spend)
    // We insert directly to bypass any old DB functions
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const couponCode = `WELCOME-R100-${randomSuffix}`;
    
    const { error: couponError } = await supabase
      .from('coupons')
      .insert({
        code: couponCode,
        discount_type: 'fixed_amount', // FORCE FIXED
        discount_value: 100,           // R100
        percent: 0,                    // 0%
        status: 'active',
        usage_limit: 1,
        min_order_value: 50000,        // R500.00 in cents
        description: 'Beauty Club Welcome - R100 Off',
        locked_email: cleanEmail
      })

    if (couponError) {
      console.error('Coupon creation failed:', couponError)
      // Continue anyway so we don't block the user signup flow
    }

    // 4. Trigger Webhook
    await sendWebhookToN8N(data, couponCode)

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Welcome to the Beauty Club!',
        coupon_code: couponCode
      })
    }

  } catch (err: any) {
    console.error('Fatal Error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: 'FATAL_ERROR', message: err.message }) }
  }
}
