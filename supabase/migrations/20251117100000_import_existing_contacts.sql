-- Import existing accounts and Beauty Club signups into contacts table
-- Run this AFTER setup_contacts.sql migration

-- 1. Import from profiles table (existing user accounts)
INSERT INTO public.contacts (name, email, phone, source, subscribed)
SELECT
  COALESCE(p.name, p.full_name, '') as name,
  p.email,
  COALESCE(p.phone, '') as phone,
  'account_creation' as source,
  true as subscribed
FROM public.profiles p
WHERE p.email IS NOT NULL
ON CONFLICT (email) DO UPDATE SET
  name = CASE
    WHEN EXCLUDED.name != '' AND contacts.name = '' THEN EXCLUDED.name
    ELSE contacts.name
  END,
  phone = CASE
    WHEN EXCLUDED.phone != '' AND contacts.phone = '' THEN EXCLUDED.phone
    ELSE contacts.phone
  END,
  updated_at = now();

-- 2. Import from subscribers table (Beauty Club signups)
INSERT INTO public.contacts (name, email, phone, source, subscribed)
SELECT
  '' as name,  -- subscribers table doesn't collect names
  s.email,
  COALESCE(s.phone, '') as phone,
  'beauty_club_signup' as source,
  s.consent as subscribed
FROM public.subscribers s
WHERE s.email IS NOT NULL
ON CONFLICT (email) DO UPDATE SET
  phone = CASE
    WHEN EXCLUDED.phone != '' AND contacts.phone = '' THEN EXCLUDED.phone
    ELSE contacts.phone
  END,
  subscribed = CASE
    WHEN EXCLUDED.subscribed = true THEN true
    ELSE contacts.subscribed
  END,
  updated_at = now();

-- Show count of imported contacts
DO $$
DECLARE
  contact_count integer;
BEGIN
  SELECT COUNT(*) INTO contact_count FROM public.contacts;
  RAISE NOTICE 'Total contacts after import: %', contact_count;
END $$;
