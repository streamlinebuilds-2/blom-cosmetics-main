import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

interface BeautyClubSignupData {
  email: string
  phone?: string
  first_name?: string
  consent: boolean
  source: string
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

    // 2. CHECK: Does this user already exist?
    // We perform a manual check to prevent "Unique Constraint" crashes
    let query = supabase.from('contacts').select('id, email').eq('email', cleanEmail)
    if (cleanPhone) {
       query = supabase.from('contacts').select('id, email').or(`email.eq.${cleanEmail},phone.eq.${cleanPhone}`)
    }
    
    const { data: existing } = await query;

    // 3. IF EXISTS: Do NOT try to create (Prevent 500 Error)
    if (existing && existing.length > 0) {
      console.log(`ℹ️ User already exists: ${cleanEmail}`);
      
      // Just try to get/create their coupon and return success
      const { data: couponData } = await supabase.rpc('create_beauty_club_welcome_coupon', { p_email: cleanEmail });
      const code = couponData && couponData[0] ? couponData[0].code : null;

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'Welcome back! You are already a member.',
          coupon_code: code,
          existing_user: true
        })
      }
    }

    // 4. CREATE NEW CONTACT
    // We use 'upsert' (update if exists) as a final safety net against race conditions
    const { error: insertError } = await supabase
      .from('contacts')
      .upsert({
        email: cleanEmail,
        phone: cleanPhone,
        name: first_name || 'Beauty Club Member',
        first_name: first_name || '',
        status: 'active',
        source: source || 'beauty_club_signup',
        subscribed: true,
        message: 'Beauty Club Signup'
      }, { onConflict: 'email' }) 

    if (insertError) {
      console.error('❌ Contact Insert Failed:', insertError);
      // RETURN THE REAL ERROR so we can debug
      return { 
        statusCode: 500, 
        body: JSON.stringify({ 
            error: 'DB_INSERT_FAILED', 
            message: insertError.message, 
            details: insertError 
        }) 
      };
    }

    // 5. GENERATE COUPON
    const { data: couponData, error: couponError } = await supabase
      .rpc('create_beauty_club_welcome_coupon', { p_email: cleanEmail })

    if (couponError) {
        console.error('⚠️ Coupon Generation Failed:', couponError);
        // Don't crash signup if coupon fails, just log it
    }

    const couponCode = couponData && couponData[0] ? couponData[0].code : null

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Welcome to the Beauty Club!',
        coupon_code: couponCode,
        existing_user: false
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
