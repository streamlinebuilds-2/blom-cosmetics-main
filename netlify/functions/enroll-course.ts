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

    // 1. Check if user already exists in academy
    const { data: existingUsers } = await ACADEMY_SUPABASE.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === buyer_email);

    let academy_user_id = existingUser?.id;

    if (!existingUser) {
      // 2. Invite new user to academy
      const { data: invitation, error: inviteError } = await ACADEMY_SUPABASE.auth.admin.inviteUserByEmail(
        buyer_email,
        {
          data: {
            full_name: buyer_name,
            phone: buyer_phone
          },
          redirectTo: `${process.env.ACADEMY_URL}/auth/callback`
        }
      );

      if (inviteError) {
        console.error('Invitation error:', inviteError);
        throw new Error(`Failed to invite user: ${inviteError.message}`);
      }

      academy_user_id = invitation.user?.id;
      console.log('User invited:', academy_user_id);
    } else {
      console.log('User already exists:', academy_user_id);
    }

    // 3. Grant course access
    const { error: enrollError } = await ACADEMY_SUPABASE
      .from('enrollments')
      .insert({
        user_id: academy_user_id,
        course_slug: course_slug,
        status: 'active',
        enrolled_at: new Date().toISOString()
      });

    if (enrollError) {
      console.error('Enrollment error:', enrollError);
      throw new Error(`Failed to enroll: ${enrollError.message}`);
    }

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
        academy_user_id
      });

    console.log('Course enrollment complete');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        academy_user_id,
        message: 'Enrollment successful. Check your email for login instructions.'
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
