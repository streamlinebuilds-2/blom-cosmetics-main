-- Step 1: Create invites in Academy database
-- Run this SQL in your Academy Supabase (not the store)

-- For Danell
INSERT INTO course_invites (course_id, email, token, expires_at)
SELECT 
  c.id,
  'danell.nellie.vdmerwe@gmail.com',
  gen_random_uuid(),
  NOW() + INTERVAL '30 days'
FROM courses c
WHERE c.slug = 'blom-flower-watercolor-workshop'
ON CONFLICT (course_id, email) DO UPDATE SET 
  token = gen_random_uuid(),
  expires_at = NOW() + INTERVAL '30 days',
  redeemed_at = NULL;

-- For Charne
INSERT INTO course_invites (course_id, email, token, expires_at)
SELECT 
  c.id,
  'charne.meyer23@icloud.com',
  gen_random_uuid(),
  NOW() + INTERVAL '30 days'
FROM courses c
WHERE c.slug = 'blom-flower-watercolor-workshop'
ON CONFLICT (course_id, email) DO UPDATE SET 
  token = gen_random_uuid(),
  expires_at = NOW() + INTERVAL '30 days',
  redeemed_at = NULL;

-- Get the tokens after creating
SELECT email, token, expires_at 
FROM course_invites 
WHERE email IN ('danell.nellie.vdmerwe@gmail.com', 'charne.meyer23@icloud.com')
AND redeemed_at IS NULL
ORDER BY created_at DESC;