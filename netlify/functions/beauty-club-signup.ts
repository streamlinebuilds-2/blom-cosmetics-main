import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

interface BeautyClubSignupData {
  email: string
  phone?: string
  first_name?: string
  consent: boolean
  source: string
}

interface ContactRecord {
  id: string
  email: string
  phone?: string
  user_id?: string
  full_name?: string
  name: string
}

async function checkExistingUser(supabase: any, email: string, phone?: string): Promise<ContactRecord | null> {
  try {
    console.log('Checking for existing user:', email, phone)
    
    // First try to find by email
    let query = supabase
      .from('contacts')
      .select('*')
      .eq('email', email.toLowerCase())
    
    const { data: emailMatches, error: emailError } = await query.single()
    
    if (!emailError && emailMatches) {
      console.log('Found existing user by email:', emailMatches.id)
      return emailMatches
    }
    
    // If phone is provided, try to find by phone
    if (phone) {
      const { data: phoneMatches, error: phoneError } = await supabase
        .from('contacts')
        .select('*')
        .eq('phone', phone.trim())
        .single()
      
      if (!phoneError && phoneMatches) {
        console.log('Found existing user by phone:', phoneMatches.id)
        return phoneMatches
      }
    }
    
    console.log('No existing user found')
    return null
  } catch (error) {
    console.error('Error checking existing user:', error)
    return null
  }
}

async function addWelcomeCouponToUser(supabase: any, userContact: ContactRecord): Promise<{hasCoupon: boolean, coupon?: any}> {
  try {
    console.log('Checking welcome coupon for existing user:', userContact.email)
    
    // Get the welcome coupon for this user
    const { data: welcomeCoupons, error: couponError } = await supabase
      .rpc('get_user_welcome_coupon', { p_user_email: userContact.email })
    
    if (couponError) {
      console.error('Error getting welcome coupon:', couponError)
      return { hasCoupon: false }
    }
    
    if (!welcomeCoupons || welcomeCoupons.length === 0) {
      console.log('No welcome coupon found for:', userContact.email)
      return { hasCoupon: false }
    }
    
    // The RPC returns a TABLE, so data should be an array
    const coupon = Array.isArray(welcomeCoupons) ? welcomeCoupons[0] : welcomeCoupons
    console.log('Found existing welcome coupon for user:', userContact.email, coupon.code)
    
    return { 
      hasCoupon: true, 
      coupon: coupon 
    }
  } catch (error) {
    console.error('Error checking welcome coupon for user:', error)
    return { hasCoupon: false }
  }
}

async function createNewBeautyClubSignup(supabase: any, signupData: BeautyClubSignupData): Promise<{success: boolean, couponCode?: string}> {
  try {
    console.log('Creating new Beauty Club signup for:', signupData.email)
    
    // Create contact record first
    const { error: contactError } = await supabase
      .from('contacts')
      .insert({
        email: signupData.email.toLowerCase(),
        phone: signupData.phone?.trim() || null,
        full_name: signupData.first_name || '',
        name: signupData.first_name || 'Beauty Club Member',
        message: 'Beauty Club Signup',
        status: 'active',
        source: signupData.source || 'beauty_club_signup',
        subscribed: true
      })
    
    if (contactError) {
      console.error('Error creating contact:', contactError)
      return { success: false }
    }
    
    console.log('Contact created successfully for:', signupData.email)
    
    // Create welcome coupon for new Beauty Club member
    try {
      const { data: couponData, error: couponError } = await supabase
        .rpc('create_beauty_club_welcome_coupon', { p_email: signupData.email.toLowerCase() })
      
      if (couponError) {
        console.warn('Warning: Could not create welcome coupon:', couponError)
        // Don't fail the signup if coupon creation fails
        return { success: true }
      }
      
      const coupon = Array.isArray(couponData) ? couponData[0] : couponData
      console.log('Welcome coupon created for new Beauty Club member:', coupon?.code)
      
      return { 
        success: true, 
        couponCode: coupon?.code 
      }
    } catch (couponErr) {
      console.warn('Warning: Coupon creation failed but signup succeeded:', couponErr)
      return { success: true }
    }
  } catch (error) {
    console.error('Error creating Beauty Club signup:', error)
    return { success: false }
  }
}

async function sendWebhookToN8N(signupData: BeautyClubSignupData): Promise<boolean> {
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
  try {
    if (event.httpMethod !== 'POST') {
      return { 
        statusCode: 405, 
        body: JSON.stringify({ error: 'METHOD_NOT_ALLOWED', message: 'Only POST method allowed' }) 
      }
    }

    // Parse request body
    const body = event.body || '{}'
    let signupData: BeautyClubSignupData
    try {
      signupData = JSON.parse(body)
    } catch {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: 'INVALID_JSON', message: 'Invalid JSON in request body' }) 
      }
    }

    // Validate required fields
    const { email, phone, first_name, consent, source } = signupData
    if (!email || !consent) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'MISSING_FIELDS', 
          message: 'Email and consent are required' 
        })
      }
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !serviceKey) {
      console.error('Missing Supabase configuration')
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'CONFIGURATION_ERROR', 
          message: 'Server configuration error' 
        })
      }
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    // STRICT CHECK: Block any duplicate email or phone
    const existingUser = await checkExistingUser(supabase, email, phone)
    
    if (existingUser) {
      // 🛑 BLOCK THE SIGNUP - Do not allow duplicates
      console.log(`Signup blocked: Duplicate detected for ${email} or ${phone}`)
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'ALREADY_REGISTERED',
          message: 'This email or phone number is already a member of the Beauty Club.'
        })
      }
    }

    // Create new Beauty Club signup
    const signupResult = await createNewBeautyClubSignup(supabase, signupData)
    
    if (!signupResult.success) {
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'SIGNUP_FAILED', 
          message: 'Failed to create Beauty Club signup' 
        })
      }
    }

    // Send webhook to N8N for processing
    const webhookSuccess = await sendWebhookToN8N(signupData)
    
    if (!webhookSuccess) {
      console.warn('Webhook failed but signup was successful')
      // Don't fail the request if webhook fails
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: signupResult.couponCode 
          ? `Welcome to the BLOM Beauty Club! Your exclusive discount code: ${signupResult.couponCode}`
          : 'Welcome to the BLOM Beauty Club! Check your email for your exclusive discount.',
        existing_user: false,
        webhook_sent: webhookSuccess,
        coupon_code: signupResult.couponCode || null
      })
    }

  } catch (error: any) {
    console.error('Beauty Club signup handler error:', error)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'SERVER_ERROR', 
        message: error.message || 'Internal server error' 
      })
    }
  }
}