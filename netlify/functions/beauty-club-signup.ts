import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

interface BeautyClubSignupData {
  email: string
  phone?: string
  first_name?: string
  consent: boolean
  source: string
}

async function sendWebhookToN8N(signupData: BeautyClubSignupData, couponCode?: string): Promise<boolean> {
  try {
    const WEBHOOK_URL = 'https://dockerfile-1n82.onrender.com/webhook/beauty-club-signup'
    
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
        source: signupData.source || 'popup'
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Webhook request failed:', response.status, errorText)
      return false
    }
    
    console.log('Webhook sent successfully to N8N')
    return true
  } catch (error) {
    console.error('Error sending webhook to N8N:', error)
    return false
  }
}

export const handler: Handler = async (event) => {
  // 1. Basic Setup
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
    const { email, phone, first_name, source } = data

    if (!email) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email is required' }) }
    }

    const cleanEmail = email.toLowerCase().trim()
    const cleanPhone = phone ? phone.replace(/\s+/g, '').trim() : null

    // 2. STRICT CHECK: Is this Email OR Phone already in 'contacts'?
    let query = supabase.from('contacts').select('id, email, phone')
    
    if (cleanPhone) {
      query = query.or(`email.eq.${cleanEmail},phone.eq.${cleanPhone}`)
    } else {
      query = query.eq('email', cleanEmail)
    }
    
    const { data: existing, error: checkError } = await query

    if (checkError) {
      console.error('Error checking existing user:', checkError)
    }

    // 🛑 STRICT BLOCK: Reject if email or phone already exists
    if (existing && existing.length > 0) {
      console.log(`Signup blocked: Duplicate detected for ${cleanEmail} or ${cleanPhone}`)
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'ALREADY_REGISTERED',
          message: 'This email or phone number is already a member of the Beauty Club.'
        })
      }
    }

    // 3. Create New Contact (If we passed the check)
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
      console.error('❌ Contact creation failed:', insertError)
      return { 
        statusCode: 500, 
        body: JSON.stringify({ 
          error: 'DB_INSERT_FAILED', 
          message: insertError.message
        }) 
      }
    }

    // 4. Generate the Coupon Manually (Fixed Amount R100)
    // We generate a unique code and insert it directly to avoid using the old RPC
    // which likely defaults to 'percentage'.
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const couponCode = `WELCOME-R100-${randomSuffix}`;
    
    const { data: couponData, error: couponError } = await supabase
      .from('coupons')
      .insert({
        code: couponCode,
        discount_type: 'fixed_amount',
        discount_value: 100, // R100
        status: 'active',
        usage_limit: 1, // Single use
        expires_at: null, // Or set an expiration if needed
        min_order_value: 0
      })
      .select()
      .single();

    if (couponError) {
      console.error('⚠️ Coupon Generation Failed:', couponError)
      // Fallback: If direct insert fails, we might still want to proceed, 
      // but the user won't get a code in the webhook.
    } else {
        console.log('✅ Created R100 coupon:', couponCode);
    }

    // 5. Send webhook to N8N
    const webhookSuccess = await sendWebhookToN8N(data, couponCode)
    
    if (!webhookSuccess) {
      console.warn('Webhook failed but signup was successful')
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Welcome to the Beauty Club!',
        coupon_code: couponCode,
        webhook_sent: webhookSuccess
      })
    }

  } catch (err: any) {
    console.error('🔥 Fatal Signup Error:', err)
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: 'FATAL_ERROR', message: err.message }) 
    }
  }
}
