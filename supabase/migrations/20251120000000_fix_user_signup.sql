-- Fix the handle_new_user_signup function to provide all required fields
-- This will resolve the signup/login database errors

CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.contacts (
    user_id, 
    email, 
    full_name, 
    phone,
    name, -- Required NOT NULL field
    message, -- Required NOT NULL field  
    status, -- Required NOT NULL field
    source, -- Required NOT NULL field
    subscribed -- Required NOT NULL field
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''), 
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'), -- name
    'User signup', -- message
    'active', -- status  
    'website', -- source
    true -- subscribed
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    last_login_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;