import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ---------- Types ----------

export interface EnrollInput {
  orderId: string
  courseSlug: string
  buyerEmail: string
  buyerName: string
  buyerPhone: string
  amountCents?: number
}

export interface EnrollResult {
  success: boolean
  token?: string
  inviteUrl?: string
  error?: string
  fallbackSaved?: boolean
}

// ---------- Config ----------
//
// Invites are minted directly in the Academy DB and then handed to the n8n
// workflow, which is the ONE place that actually sends them (email + WhatsApp).
// We deliberately do NOT go through the `course-purchase` edge function any
// more: that hop relied on its own Academy service-key secret and kept failing
// silently after redeploys, leaving buyers with no invite. This path reuses the
// exact same Academy credentials that redeem-invite.ts already uses, so there is
// only one set of secrets to keep correct.

const N8N_COURSE_INVITE_WEBHOOK = 'https://dockerfile-1n82.onrender.com/webhook/course-invite'
const ACADEMY_APP_URL = process.env.ACADEMY_URL || 'https://blom-academy.vercel.app'
const INVITE_EXPIRES_DAYS = 60

// ---------- Lazy singleton clients ----------

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

let _academy: SupabaseClient | null = null
function academyClient(): SupabaseClient {
  if (!_academy) {
    _academy = createClient(
      process.env.ACADEMY_SUPABASE_URL!,
      process.env.ACADEMY_SUPABASE_SERVICE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
  }
  return _academy
}

// ---------- Main function ----------

export async function enrollCourse(input: EnrollInput): Promise<EnrollResult> {
  const { orderId, courseSlug, buyerEmail, buyerName, buyerPhone } = input
  const store = storeClient()
  const email = buyerEmail.toLowerCase().trim()

  // In-person courses (e.g. Professional Acrylic Training) have no online Academy
  // course to enrol into. Skip entirely so they don't churn through retries and
  // land as 'failed' — they're handled as bookings and the customer already gets
  // the order-confirmation notification.
  try {
    const { data: cpRow } = await store
      .from('course_purchases')
      .select('course_type, invitation_status')
      .eq('order_id', orderId)
      .eq('course_slug', courseSlug)
      .limit(1)
      .maybeSingle()

    if (cpRow && String(cpRow.course_type || '').toLowerCase() === 'in-person') {
      console.log('Skipping enrolment for in-person course:', courseSlug)
      return { success: true }
    }
    // Idempotency: if a previous call already sent/redeemed this one, do nothing.
    const status = String(cpRow?.invitation_status || '').toLowerCase()
    if (status === 'sent' || status === 'redeemed') {
      console.log('Enrolment already handled, skipping:', courseSlug, status)
      return { success: true }
    }
  } catch { /* non-fatal: fall through to normal enrolment */ }

  try {
    const academy = academyClient()

    // 1. Resolve the course UUID (create_course_invite needs the id, not the slug)
    const { data: course, error: courseErr } = await academy
      .from('courses')
      .select('id, title')
      .eq('slug', courseSlug)
      .maybeSingle()

    if (courseErr) throw new Error(`Academy course lookup failed: ${courseErr.message}`)
    if (!course?.id) throw new Error(`No Academy course found for slug "${courseSlug}"`)

    const courseTitle = course.title || courseSlug

    // 2. Reuse an existing, still-valid, unredeemed invite if one exists, so a
    //    second webhook (ITN + the browser backup both call this) never mints a
    //    duplicate or emails the buyer twice.
    let token: string | undefined
    let expiresAt: string | undefined

    const { data: existingInvite } = await academy
      .from('course_invites')
      .select('token, expires_at, redeemed_at')
      .ilike('email', email)
      .eq('course_id', course.id)
      .is('redeemed_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existingInvite?.token) {
      token = existingInvite.token
      expiresAt = existingInvite.expires_at
      console.log('Reusing existing valid invite for', email, courseSlug)
    } else {
      // 3. Mint a fresh invite in the Academy DB
      const { data: inviteData, error: inviteErr } = await academy.rpc('create_course_invite', {
        p_course_id: course.id,
        p_email: email,
        p_expires_in_days: INVITE_EXPIRES_DAYS,
      })

      if (inviteErr || !inviteData?.token) {
        throw new Error(`Invite creation failed: ${inviteErr?.message ?? 'no token returned'}`)
      }
      token = inviteData.token
      expiresAt = inviteData.expires_at
    }

    const inviteUrl = `${ACADEMY_APP_URL}/accept-invite?invite=${token}`

    // 4. Hand it to n8n — the one place invites are actually sent (email + WhatsApp)
    const res = await fetch(N8N_COURSE_INVITE_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        name: buyerName || email,
        phone: buyerPhone || '',
        course_slug: courseTitle, // human-readable; n8n shows this in the email
        invite_url: inviteUrl,
        expires_at: expiresAt,
      }),
    })

    if (!res.ok) {
      throw new Error(`n8n course-invite webhook returned HTTP ${res.status}`)
    }

    // 5. Bookkeeping in the Store DB
    await store
      .from('course_purchases')
      .update({ invitation_status: 'sent', invited_at: new Date().toISOString() })
      .eq('order_id', orderId)
      .eq('course_slug', courseSlug)

    console.log('✅ Invite minted + sent to n8n:', email, courseSlug, inviteUrl)
    return { success: true, token, inviteUrl }

  } catch (err: any) {
    const error = err?.message || String(err)
    console.error('enrollCourse failed:', courseSlug, error)

    // Mark failed AND dead-letter so it can be retried/backfilled instead of
    // silently vanishing.
    await store
      .from('course_purchases')
      .update({ invitation_status: 'failed' })
      .eq('order_id', orderId)
      .eq('course_slug', courseSlug)

    let fallbackSaved = false
    try {
      await store.from('pending_enrollments').insert({ email, course_slug: courseSlug })
      fallbackSaved = true
    } catch (e: any) {
      console.error('Failed to write pending_enrollments dead-letter:', e?.message || e)
    }

    return { success: false, error, fallbackSaved }
  }
}
