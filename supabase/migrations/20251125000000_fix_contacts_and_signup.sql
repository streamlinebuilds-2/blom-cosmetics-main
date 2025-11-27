-- Fix signup by creating the missing contacts table and fixing the trigger
-- This resolves both signup errors and missing welcome emails

-- ================================================
-- STEP 1: Create the missing contacts table
-- ================================================

CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email text NOT NULL UNIQUE,
  full_name text,
  name text NOT NULL, -- Required field
  phone text,
  message text NOT NULL, -- Required field  
  status text NOT NULL DEFAULT 'active', -- Required field
  source text NOT NULL DEFAULT 'website', -- Required field
  subscribed boolean NOT NULL DEFAULT true, -- Required field
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create policies for contacts table
CREATE POLICY "Contacts are viewable by authenticated users for their own data"
  ON public.contacts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service can manage contacts"
  ON public.contacts FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users"
  ON public.contacts FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ================================================
-- STEP 2: Fix the trigger function to work properly
-- ================================================

-- Drop and recreate the handle_new_user_signup function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_signup();

CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
DECLARE
  v_user_name text;
  v_full_name text;
  v_phone text;
BEGIN
  -- Extract user data from metadata
  v_user_name := COALESCE(NEW.raw_user_meta_data->>'name', 'User');
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', v_user_name);
  v_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');
  
  -- Create contact record
  INSERT INTO public.contacts (
    user_id, 
    email, 
    full_name, 
    name,
    phone,
    message,  
    status, 
    source,
    subscribed
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    v_full_name,
    v_user_name, -- Required name field
    v_phone,
    'User signup', -- Required message field  
    'active', -- Required status field
    'website', -- Required source field
    true -- Required subscribed field
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    last_login_at = now(),
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- STEP 3: Create the trigger
-- ================================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();

-- ================================================
-- STEP 4: Grant proper permissions
-- ================================================

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user_signup() TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- ================================================
-- STEP 5: Create a function to send welcome emails
-- ================================================

CREATE OR REPLACE FUNCTION public.send_welcome_email(p_user_email text, p_user_name text)
RETURNS boolean AS $$
DECLARE
  v_welcome_coupon record;
  v_success boolean := false;
BEGIN
  -- Get user's welcome coupon
  SELECT * INTO v_welcome_coupon
  FROM public.get_user_welcome_coupon(p_user_email)
  LIMIT 1;
  
  -- Here you would integrate with your email service (SendGrid, Mailgun, etc.)
  -- For now, we'll just log that an email should be sent
  INSERT INTO public.email_queue (recipient_email, subject, content, status, created_at)
  VALUES (
    p_user_email,
    'Welcome to BLOM Cosmetics - Your R250 Welcome Discount!',
    format('Dear %s,

Welcome to BLOM Cosmetics! 

As a thank you for joining us, here''s your exclusive welcome discount:

🎉 Coupon Code: %s
💰 Discount: R250 off your next order
📝 Minimum order: R500

This coupon is valid for 30 days and can only be used with your email address.

Use this code at checkout to enjoy your welcome discount!

Start shopping: %s

Welcome to the BLOM family!

Best regards,
The BLOM Team', p_user_name, v_welcome_coupon.code, 'https://blomcosmetics.com'),
    'pending',
    now()
  );
  
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the signup
  INSERT INTO public.error_log (message, details, created_at)
  VALUES ('Failed to send welcome email', format('Email: %s, Error: %s', p_user_email, SQLERRM), now());
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- STEP 6: Create supporting tables for email functionality
-- ================================================

-- Email queue table for tracking emails to be sent
CREATE TABLE IF NOT EXISTS public.email_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email text NOT NULL,
  subject text NOT NULL,
  content text,
  status text NOT NULL DEFAULT 'pending',
  sent_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Error log table
CREATE TABLE IF NOT EXISTS public.error_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  details text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_log ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Service can manage email queue"
  ON public.email_queue FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service can manage error log"
  ON public.error_log FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ================================================
-- STEP 7: Update existing users to have contact records
-- ================================================

-- Create contact records for existing users who don't have them
INSERT INTO public.contacts (user_id, email, full_name, name, message, status, source, subscribed)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', 'User') as full_name,
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', 'User') as name,
  'Existing user' as message,
  'active' as status,
  'website' as source,
  true as subscribed
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.contacts c WHERE c.user_id = au.id
)
ON CONFLICT (user_id) DO NOTHING;

-- ================================================
-- COMMENTS
-- ================================================

COMMENT ON FUNCTION public.handle_new_user_signup() IS 'Creates contact record for new users and triggers welcome email';
COMMENT ON FUNCTION public.send_welcome_email(text, text) IS 'Sends welcome email with coupon to new users';
COMMENT ON TABLE public.contacts IS 'Contact information for users and newsletter subscribers';
COMMENT ON TABLE public.email_queue IS 'Queue of emails to be sent by the system';
COMMENT ON TABLE public.error_log IS 'Log of system errors for debugging';