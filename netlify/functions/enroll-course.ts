import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const STORE_SUPABASE = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Academy Supabase client (for course enrollment system)
const ACADEMY_SUPABASE = process.env.ACADEMY_SUPABASE_URL && process.env.ACADEMY_SUPABASE_SERVICE_KEY
  ? createClient(
      process.env.ACADEMY_SUPABASE_URL!,
      process.env.ACADEMY_SUPABASE_SERVICE_KEY!
    )
  : null;

export const handler: Handler = async (event) => {
  try {
    const { order_id, course_slug, buyer_email, buyer_name } = JSON.parse(event.body || '{}');

    if (!order_id || !course_slug || !buyer_email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: order_id, course_slug, buyer_email' })
      };
    }

    console.log(`Enrolling ${buyer_email} in course ${course_slug} for order ${order_id}`);

    // If Academy Supabase is configured, enroll the student
    if (ACADEMY_SUPABASE) {
      try {
        // 1. Create user invitation in Academy Supabase
        const { data: invitation, error: inviteError } = await ACADEMY_SUPABASE.auth.admin.inviteUserByEmail(
          buyer_email,
          {
            data: {
              full_name: buyer_name,
              enrolled_course: course_slug
            }
          }
        );

        if (inviteError && !inviteError.message.includes('already registered')) {
          console.error('Invitation error:', inviteError);
          throw inviteError;
        }

        console.log('User invitation sent/exists:', buyer_email);

        // 2. Grant course access in Academy database
        const { error: accessError } = await ACADEMY_SUPABASE
          .from('course_enrollments') // Your academy table name
          .insert({
            user_email: buyer_email,
            course_slug: course_slug,
            enrolled_at: new Date().toISOString(),
            status: 'active'
          })
          .select()
          .maybeSingle();

        if (accessError && !accessError.message.includes('duplicate')) {
          console.error('Access grant error:', accessError);
          throw accessError;
        }

        console.log('Course access granted:', course_slug);
      } catch (academyError: any) {
        console.error('Academy enrollment error:', academyError);
        // Continue to track in store database even if academy enrollment fails
      }
    } else {
      console.warn('Academy Supabase not configured - skipping user invitation and enrollment');
    }

    // 3. Track in store database
    const { error: trackError } = await STORE_SUPABASE
      .from('course_purchases')
      .insert({
        order_id,
        course_slug,
        buyer_email,
        buyer_name,
        invited_at: new Date().toISOString(),
        invitation_status: ACADEMY_SUPABASE ? 'sent' : 'pending_config'
      })
      .select()
      .maybeSingle();

    if (trackError && !trackError.message.includes('duplicate')) {
      console.error('Track error:', trackError);
      // Don't fail the request if tracking fails
    }

    console.log('Course purchase tracked in store database');

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Course enrollment completed',
        academy_configured: !!ACADEMY_SUPABASE
      })
    };
  } catch (error: any) {
    console.error('Course enrollment error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Enrollment failed' })
    };
  }
};
