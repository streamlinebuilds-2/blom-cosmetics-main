import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ---------- Types ----------

export interface EnrollInput {
  orderId: string
  courseSlug: string
  buyerEmail: string
  buyerName: string
  buyerPhone: string
}

export interface EnrollResult {
  success: boolean
  token?: string
  inviteUrl?: string
  error?: string
  fallbackSaved?: boolean
}

// ---------- Lazy singleton clients ----------

let _academy: SupabaseClient | null = null
function academyClient(): SupabaseClient {
  if (!_academy) {
    _academy = createClient(
      process.env.ACADEMY_SUPABASE_URL!,
      process.env.ACADEMY_SUPABASE_SERVICE_KEY!
    )
  }
  return _academy
}

let _store: SupabaseClient | null = null
function storeClient(): SupabaseClient {
  if (!_store) {
    _store = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _store
}

// ---------- Main function ----------

export async function enrollCourse(input: EnrollInput): Promise<EnrollResult> {
  const { orderId, courseSlug, buyerEmail, buyerName, buyerPhone } = input
  const academy = academyClient()
  const store = storeClient()

  // Step 1: Call Academy RPC to create invite
  const { data: rpcData, error: rpcError } = await academy.rpc('create_course_invite', {
    p_course_id: courseSlug,
    p_email: buyerEmail,
    p_expires_in_days: 30
  })

  if (rpcError || !rpcData?.success) {
    console.error('Academy RPC create_course_invite failed:', rpcError?.message || rpcData)

    // Fallback: upsert into Academy pending_enrollments
    const { error: fallbackErr } = await academy
      .from('pending_enrollments')
      .upsert(
        { email: buyerEmail, course_slug: courseSlug },
        { onConflict: 'email,course_slug' }
      )

    if (fallbackErr) {
      console.error('pending_enrollments upsert also failed:', fallbackErr.message)
    }

    // Mark as failed in Store
    await store
      .from('course_purchases')
      .update({ invitation_status: 'failed' })
      .eq('order_id', orderId)
      .eq('course_slug', courseSlug)

    return {
      success: false,
      error: rpcError?.message || 'RPC returned failure',
      fallbackSaved: !fallbackErr
    }
  }

  // Step 2: RPC succeeded — update Store DB
  const academyBase = (process.env.ACADEMY_URL || 'https://blom-academy.vercel.app').replace(/\/+$/, '')
  const inviteUrl =
    rpcData.invite_url ||
    `${academyBase}/accept-invite?invite=${encodeURIComponent(rpcData.token)}`

  await store
    .from('course_purchases')
    .update({
      invitation_status: 'sent',
      invited_at: new Date().toISOString()
    })
    .eq('order_id', orderId)
    .eq('course_slug', courseSlug)

  // Step 3: Best-effort n8n email notification (5s timeout, swallow errors)
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5_000)
    await fetch(
      `${process.env.N8N_BASE || 'https://dockerfile-1n82.onrender.com'}/webhook/course-invite`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: buyerEmail,
          name: buyerName,
          phone: buyerPhone,
          course_slug: courseSlug,
          invite_url: inviteUrl,
          expires_at: rpcData.expires_at
        }),
        signal: controller.signal
      }
    ).finally(() => clearTimeout(timeout))
  } catch {
    console.warn('n8n email notification failed (best-effort, invite already created)')
  }

  return { success: true, token: rpcData.token, inviteUrl }
}
