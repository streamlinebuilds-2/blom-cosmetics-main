# How to run this script

## Option 1: Using .env.local (recommended)

Create a `.env.local` file in the project root with these values:

```env
# Store Supabase (your main blom-cosmetics database)
SUPABASE_URL=https://your-store-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-store-service-role-key

# Academy Supabase (blom-academy database)
ACADEMY_SUPABASE_URL=https://your-academy-project.supabase.co
ACADEMY_SUPABASE_SERVICE_KEY=your-academy-service-role-key

# Academy frontend URL (for invite links)
ACADEMY_URL=https://blom-academy.vercel.app

# n8n webhook URL
N8N_BASE=https://dockerfile-1n82.onrender.com
```

Then run:
```bash
npx tsx scripts/bulk-invite-customers.ts
```

## Option 2: Direct SQL (Academy database only)

If you have direct access to your Academy Supabase, run this SQL in the SQL editor:

```sql
-- For Danell
INSERT INTO course_invites (course_id, email, token, expires_at)
SELECT c.id, 'danell.nellie.vdmerwe@gmail.com', gen_random_uuid(), NOW() + INTERVAL '30 days'
FROM courses c WHERE c.slug = 'blom-flower-watercolor-workshop'
ON CONFLICT (course_id, email) DO UPDATE SET 
  token = gen_random_uuid(), expires_at = NOW() + INTERVAL '30 days', redeemed_at = NULL;

-- For Charne
INSERT INTO course_invites (course_id, email, token, expires_at)
SELECT c.id, 'charne.meyer23@icloud.com', gen_random_uuid(), NOW() + INTERVAL '30 days'
FROM courses c WHERE c.slug = 'blom-flower-watercolor-workshop'
ON CONFLICT (course_id, email) DO UPDATE SET 
  token = gen_random_uuid(), expires_at = NOW() + INTERVAL '30 days', redeemed_at = NULL;

-- Get tokens
SELECT email, token, expires_at FROM course_invites 
WHERE email IN ('danell.nellie.vdmerwe@gmail.com', 'charne.meyer23@icloud.com')
AND redeemed_at IS NULL;
```

Then provide me the tokens and I'll trigger the n8n webhooks.

## What each option does

1. **Option 1 (Script)** - Creates invites in Academy DB, updates store DB, triggers n8n (full automation)
2. **Option 2 (SQL)** - Only creates invites in Academy. You'll need to provide tokens for n8n triggers