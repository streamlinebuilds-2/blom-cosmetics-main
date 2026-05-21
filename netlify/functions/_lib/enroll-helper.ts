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

// ---------- Lazy singleton client ----------

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
  const { orderId, courseSlug, buyerEmail, buyerName, buyerPhone, amountCents } = input
  const store = storeClient()

  // Try the Academy edge function up to MAX_ATTEMPTS times. Supabase edge cold
  // starts can exceed a tight timeout, which previously produced spurious
  // 'failed' enrollments (buyer then got nothing). Retry + a 30s budget fixes
  // the common transient case.
  const MAX_ATTEMPTS = 2
  let lastError = ''

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30_000)

      const response = await fetch(
        `${process.env.ACADEMY_FUNCTION_URL}/course-purchase`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.ACADEMY_WEBHOOK_SECRET}`,
          },
          body: JSON.stringify({
            order_id: orderId,
            email: buyerEmail,
            name: buyerName,
            phone: buyerPhone,
            course_slug: courseSlug,
            amount_cents: amountCents,
          }),
          signal: controller.signal,
        }
      )
      clearTimeout(timeout)

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || `HTTP ${response.status}`)
      }

      // result.action = 'enrolled' | 'invited' | 'skipped'
      const invitationStatus = result.action === 'enrolled' ? 'enrolled' : 'sent'

      await store
        .from('course_purchases')
        .update({
          invitation_status: invitationStatus,
          invited_at: new Date().toISOString(),
        })
        .eq('order_id', orderId)
        .eq('course_slug', courseSlug)

      return { success: true }
    } catch (err: any) {
      lastError = err?.message || String(err)
      console.error(`Academy course-purchase edge function failed (attempt ${attempt}/${MAX_ATTEMPTS}):`, lastError)
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, 1500))
      }
    }
  }

  // All attempts failed. Mark failed AND write a dead-letter row so the
  // enrollment can be retried/backfilled later instead of silently vanishing.
  await store
    .from('course_purchases')
    .update({ invitation_status: 'failed' })
    .eq('order_id', orderId)
    .eq('course_slug', courseSlug)

  let fallbackSaved = false
  try {
    await store.from('pending_enrollments').insert({ email: buyerEmail, course_slug: courseSlug })
    fallbackSaved = true
  } catch (e: any) {
    console.error('Failed to write pending_enrollments dead-letter:', e?.message || e)
  }

  return { success: false, error: lastError, fallbackSaved }
}
