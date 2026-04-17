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

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15_000)

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
    console.error('Academy course-purchase edge function failed:', err.message)

    await store
      .from('course_purchases')
      .update({ invitation_status: 'failed' })
      .eq('order_id', orderId)
      .eq('course_slug', courseSlug)

    return { success: false, error: err.message }
  }
}
