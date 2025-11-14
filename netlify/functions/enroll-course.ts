import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const STORE_SUPABASE = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ACADEMY_SUPABASE = createClient(
  process.env.ACADEMY_SUPABASE_URL!,
  process.env.ACADEMY_SUPABASE_SERVICE_KEY!
);

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  try {
    const { order_id, course_slug, buyer_email, buyer_name, buyer_phone } = JSON.parse(event.body || '{}');

    console.log('Enrolling in course:', { order_id, course_slug, buyer_email });

    // 1. Get course ID from slug
    const { data: course, error: courseError } = await ACADEMY_SUPABASE
      .from('courses')
      .select('id')
      .eq('slug', course_slug)
      .single();

    if (courseError || !course) {
      throw new Error(`Course not found: ${course_slug}`);
    }

    const course_id = course.id;
    console.log('Course ID:', course_id);

    // 2. Create invitation token
    const token = crypto.randomUUID();
    const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const { error: inviteError } = await ACADEMY_SUPABASE
      .from('course_invites')
      .insert({
        course_id,
        email: buyer_email,
        token,
        expires_at: expires_at.toISOString(),
        created_at: new Date().toISOString()
      });

    if (inviteError) {
      console.error('Invite creation error:', inviteError);
      throw new Error(`Failed to create invite: ${inviteError.message}`);
    }

    console.log('Invite token created:', token);

    // 3. Send invitation email via n8n
    const inviteUrl = `${process.env.ACADEMY_URL}/invite/${token}`;

    await fetch(`${process.env.N8N_BASE}/webhook/course-invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: buyer_email,
        name: buyer_name,
        course_name: course_slug.replace(/-/g, ' ').replace(/^./, s => s.toUpperCase()),
        invite_url: inviteUrl,
        expires_at: expires_at.toISOString()
      })
    }).catch(err => console.warn('n8n email failed:', err));

    // 4. Track in store database
    await STORE_SUPABASE
      .from('course_purchases')
      .insert({
        order_id,
        course_slug,
        buyer_email,
        buyer_name,
        buyer_phone,
        invited_at: new Date().toISOString(),
        invitation_status: 'sent',
        academy_user_id: null // Will be set when they redeem
      });

    console.log('Course enrollment complete');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        invite_token: token,
        invite_url: inviteUrl,
        message: 'Enrollment successful. Check your email for course access link.'
      })
    };

  } catch (error: any) {
    console.error('Course enrollment error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message || 'Failed to enroll in course'
      })
    };
  }
};
