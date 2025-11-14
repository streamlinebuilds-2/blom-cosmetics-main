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
    const { token, user_email, user_password, user_name } = JSON.parse(event.body || '{}');

    if (!token) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing invite token' })
      };
    }

    console.log('Redeeming invite token:', token);

    // 1. Validate invite token
    const { data: invite, error: inviteError } = await ACADEMY_SUPABASE
      .from('course_invites')
      .select('*')
      .eq('token', token)
      .single();

    if (inviteError || !invite) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Invalid or expired invite token' })
      };
    }

    // Check if token is expired
    if (new Date(invite.expires_at) < new Date()) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invite token has expired' })
      };
    }

    // Check if already redeemed
    if (invite.redeemed_at) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invite token has already been redeemed' })
      };
    }

    console.log('Valid invite found:', invite);

    // 2. Create or get user account
    let userId: string;

    // Check if user already exists
    const { data: existingUser } = await ACADEMY_SUPABASE.auth.admin.listUsers();
    const userExists = existingUser?.users?.find(u => u.email === invite.email);

    if (userExists) {
      userId = userExists.id;
      console.log('User already exists:', userId);
    } else if (user_email && user_password) {
      // Create new user account
      const { data: newUser, error: createError } = await ACADEMY_SUPABASE.auth.admin.createUser({
        email: user_email,
        password: user_password,
        email_confirm: true,
        user_metadata: {
          full_name: user_name || invite.email.split('@')[0]
        }
      });

      if (createError || !newUser.user) {
        console.error('User creation error:', createError);
        throw new Error(`Failed to create user account: ${createError?.message}`);
      }

      userId = newUser.user.id;
      console.log('New user created:', userId);
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'User credentials required for account creation',
          requires_signup: true
        })
      };
    }

    // 3. Grant course access
    const { error: enrollmentError } = await ACADEMY_SUPABASE
      .from('enrollments')
      .insert({
        user_id: userId,
        course_id: invite.course_id,
        enrolled_at: new Date().toISOString(),
        status: 'active'
      })
      .select()
      .single();

    if (enrollmentError && !enrollmentError.message.includes('duplicate')) {
      console.error('Enrollment error:', enrollmentError);
      throw new Error(`Failed to grant course access: ${enrollmentError.message}`);
    }

    console.log('Course access granted');

    // 4. Mark invite as redeemed
    await ACADEMY_SUPABASE
      .from('course_invites')
      .update({
        redeemed_at: new Date().toISOString(),
        redeemed_by_user_id: userId
      })
      .eq('token', token);

    // 5. Update store database
    await STORE_SUPABASE
      .from('course_purchases')
      .update({
        invitation_status: 'redeemed',
        academy_user_id: userId,
        redeemed_at: new Date().toISOString()
      })
      .eq('buyer_email', invite.email);

    console.log('Invite redemption complete');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user_id: userId,
        course_id: invite.course_id,
        message: 'Course access granted successfully'
      })
    };

  } catch (error: any) {
    console.error('Invite redemption error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message || 'Failed to redeem invite'
      })
    };
  }
};
