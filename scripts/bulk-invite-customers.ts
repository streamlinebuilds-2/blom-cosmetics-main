import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const ACADEMY_SUPABASE_URL = process.env.ACADEMY_SUPABASE_URL!
const ACADEMY_SUPABASE_SERVICE_KEY = process.env.ACADEMY_SUPABASE_SERVICE_KEY!
const ACADEMY_URL = process.env.ACADEMY_URL || 'https://blom-academy.vercel.app'
const N8N_BASE = process.env.N8N_BASE || 'https://dockerfile-1n82.onrender.com'

const store = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const academy = createClient(ACADEMY_SUPABASE_URL, ACADEMY_SUPABASE_SERVICE_KEY)

interface Customer {
  name: string
  email: string
  phone: string
  courseSlug: string
}

const customersToInvite: Customer[] = [
  {
    name: 'Danell',
    email: 'danell.nellie.vdmerwe@gmail.com',
    phone: '+270765001305',
    courseSlug: 'blom-flower-watercolor-workshop'
  },
  {
    name: 'Charne',
    email: 'charne.meyer23@icloud.com',
    phone: '+270761933689',
    courseSlug: 'blom-flower-watercolor-workshop'
  }
]

async function createInvite(customer: Customer) {
  console.log(`\n--- Processing ${customer.name} (${customer.email}) ---`)
  
  // Step 1: Create invite in Academy DB via RPC
  console.log('Creating invite in Academy...')
  const { data: rpcData, error: rpcError } = await academy.rpc('create_course_invite', {
    p_course_id: customer.courseSlug,
    p_email: customer.email,
    p_expires_in_days: 30
  })

  if (rpcError || !rpcData?.success) {
    console.error('❌ Academy RPC failed:', rpcError?.message || rpcData)
    throw new Error(`Failed to create invite for ${customer.email}`)
  }

  console.log('✅ Invite created in Academy')
  
  const token = rpcData.token
  const inviteUrl = rpcData.invite_url || `${ACADEMY_URL}/accept-invite?invite=${encodeURIComponent(token)}`
  const expiresAt = rpcData.expires_at

  // Step 2: Find the order in store and update invitation_status
  console.log('Updating store course_purchases...')
  const { data: purchases, error: fetchError } = await store
    .from('course_purchases')
    .select('order_id, course_slug')
    .eq('buyer_email', customer.email)
    .eq('course_slug', customer.courseSlug)
    .in('invitation_status', ['pending', 'failed'])
    .limit(1)

  if (fetchError) {
    console.error('❌ Failed to fetch purchase:', fetchError)
  } else if (purchases && purchases.length > 0) {
    const orderId = purchases[0].order_id
    await store
      .from('course_purchases')
      .update({ 
        invitation_status: 'sent', 
        invited_at: new Date().toISOString() 
      })
      .eq('order_id', orderId)
      .eq('course_slug', customer.courseSlug)
    console.log('✅ Updated store invitation_status to sent')
  } else {
    console.log('⚠️ No pending/failed purchase found in store (may already be invited)')
  }

  // Step 3: Trigger n8n webhook for email + WhatsApp
  console.log('Triggering n8n webhook...')
  const webhookPayload = {
    to: customer.email,
    name: customer.name,
    phone: customer.phone,
    course_slug: customer.courseSlug,
    invite_url: inviteUrl,
    expires_at: expiresAt
  }

  console.log('Payload:', JSON.stringify(webhookPayload, null, 2))

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)
    
    const response = await fetch(`${N8N_BASE}/webhook/course-invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookPayload),
      signal: controller.signal
    }).finally(() => clearTimeout(timeout))

    if (response.ok) {
      console.log('✅ n8n webhook triggered successfully')
    } else {
      console.log('⚠️ n8n webhook returned:', response.status, response.statusText)
    }
  } catch (e: any) {
    console.log('⚠️ n8n webhook failed (best-effort):', e.message)
  }

  return { token, inviteUrl, expiresAt }
}

async function main() {
  console.log('Starting bulk invite process for customers who bought but were not invited...')
  console.log('Course: Flower Nail Art Workshop (blom-flower-watercolor-workshop)')
  
  const results = []
  
  for (const customer of customersToInvite) {
    try {
      const result = await createInvite(customer)
      results.push({ ...customer, ...result, success: true })
    } catch (e: any) {
      console.error('❌ Failed:', e.message)
      results.push({ ...customer, success: false, error: e.message })
    }
  }

  console.log('\n=== SUMMARY ===')
  console.log(`Total: ${results.length}`)
  console.log(`Succeeded: ${results.filter(r => r.success).length}`)
  console.log(`Failed: ${results.filter(r => !r.success).length}`)

  for (const r of results) {
    if (r.success) {
      console.log(`✅ ${r.name}: ${r.inviteUrl}`)
    } else {
      console.log(`❌ ${r.name}: ${r.error}`)
    }
  }
}

main().catch(console.error)