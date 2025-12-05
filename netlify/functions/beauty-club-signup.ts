import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

interface BeautyClubSignupData {
  email: string
  phone?: string
  first_name?: string
  consent: boolean
  source: string
}

// Helper to send data to N8N with a 5-second timeout prevention
async function sendWebhookToN8N(signupData: BeautyClubSignupData, couponCode?: string): Promise<boolean> {
  try {
    const WEBHOOK_URL = process.env.N8N_BEAUTY_CLUB_WEBHOOK || 'https://dockerfile-1n82.onrender.com/webhook/beauty-club-signup'
    
    console.log('Sending webhook to N8N...')
    
    // Abort signal to prevent Netlify function timeout (5s limit for webhook)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

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
      }),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      console.warn(`Webhook responded with status ${response.status}`)
      return false
    }
    return true
  } catch (error) {
    console.error('Webhook failed (timeout or network error):', error)
    // Return false but don't crash the signup flow
    return false
  }
}

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) }
  }

  // Support both SUPABASE_URL and VITE_SUPABASE_URL environment variables
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  console.log('Environment check:', { 
    hasUrl: !!supabaseUrl, 
    hasServiceKey: !!serviceKey,
    urlValue: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'missing'
  })
  
  if (!supabaseUrl || !serviceKey) {
    console.error('Missing Supabase environment variables:', { 
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      VITE_SUPABASE_URL: !!process.env.VITE_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    })
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ 
        error: 'Server Configuration Error', 
        message: 'Supabase environment variables are not properly configured',
        details: {
          supabase_url_configured: !!supabaseUrl,
          service_key_configured: !!serviceKey
        }
      }) 
    }
  }
  
  const supabase = createClient(supabaseUrl, serviceKey)

  try {
    const data: BeautyClubSignupData = JSON.parse(event.body || '{}')
    const { email, phone, first_name } = data

    if (!email) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email is required' }) }
    }

    const cleanEmail = email.toLowerCase().trim()
    const cleanPhone = phone ? phone.replace(/\s+/g, '').trim() : null

    console.log('Checking for existing user:', { email: cleanEmail, phone: cleanPhone })

    // 1. Check for existing user
    let query = supabase.from('contacts').select('id, email, phone')
    if (cleanPhone) {
      query = query.or(`email.eq.${cleanEmail},phone.eq.${cleanPhone}`)
    } else {
      query = query.eq('email', cleanEmail)
    }
    
    const { data: existing, error: existingError } = await query
    
    if (existingError) {
      console.error('Error checking existing user:', existingError)
      return { 
        statusCode: 500, 
        headers, 
        body: JSON.stringify({ 
          error: 'DATABASE_ERROR', 
          message: 'Failed to check existing user',
          details: existingError.message
        }) 
      }
    }

    if (existing && existing.length > 0) {
      return {
        statusCode: 200, // Return 200 for existing users to show "Already Registered" message nicely
        headers,
        body: JSON.stringify({
          existing_user: true,
          message: 'You are already a member of the Beauty Club.'
        })
      }
    }

    console.log('Creating new contact:', { email: cleanEmail, phone: cleanPhone, name: first_name || 'Beauty Club Member' })

    // 2. Create Contact
    const { data: contactData, error: insertError } = await supabase
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
      .select()

    if (insertError) {
      console.error('Contact insert error:', insertError)
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'DB_INSERT_FAILED', details: insertError.message }) }
    }

    // 3. Create Coupon (R100 Fixed, R500 Min Spend)
    // Use a more readable coupon code format with date
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    // Get MMDD format
    const date = new Date();
    const mmdd = String(date.getMonth() + 1).padStart(2, '0') + String(date.getDate()).padStart(2, '0');
    const couponCode = `WELCOME-R100-${mmdd}-${randomSuffix}`;
    
    console.log('Creating coupon:', { code: couponCode, locked_email: cleanEmail })
    
    const { data: couponData, error: couponError } = await supabase
      .from('coupons')
      .insert({
        code: couponCode,
        discount_type: 'fixed',        // Fixed Amount
        discount_value: 100,           // R100
        percent: 0,                    // 0%
        status: 'active',
        usage_limit: 1,
        min_order_cents: 50000,        // R500.00 in cents (CORRECTED COLUMN NAME)
        description: 'Beauty Club Welcome - R100 Off',
        locked_email: cleanEmail
      })
      .select()

    if (couponError) {
      console.error('Coupon creation failed:', couponError)
      // Continue anyway so we don't block the user signup flow
    }

    // 4. Trigger Webhook (Non-blocking / Safe)
    try {
      await sendWebhookToN8N(data, couponCode)
    } catch (webhookError) {
      console.warn('Webhook failed but continuing:', webhookError)
      // Don't block signup if webhook fails
    }

    console.log('Beauty Club signup completed successfully:', {
      email: cleanEmail,
      couponCode,
      contactCreated: !!contactData,
      couponCreated: !!couponData
    })

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Welcome to the Beauty Club!',
        coupon_code: couponCode
      })
    }

  } catch (err: any) {
    console.error('Fatal Error:', err)
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'FATAL_ERROR', message: err.message }) }
  }
}
