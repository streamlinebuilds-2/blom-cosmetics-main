# Academy Database Schema

This document outlines the required tables in the Academy Supabase database for the course invite/enrollment system.

## Required Tables

### 1. `courses`

Stores course information.

```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2. `course_invites`

Stores course invitation tokens sent to purchasers.

```sql
CREATE TABLE course_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  redeemed_at TIMESTAMPTZ,
  redeemed_by_user_id UUID,
  CONSTRAINT unique_active_invite UNIQUE (course_id, email, redeemed_at)
);

CREATE INDEX idx_course_invites_token ON course_invites(token);
CREATE INDEX idx_course_invites_email ON course_invites(email);
CREATE INDEX idx_course_invites_course_id ON course_invites(course_id);
```

**Columns:**
- `id`: Primary key
- `course_id`: Reference to the course
- `email`: Email address of the invitee
- `token`: Unique invite token (UUID)
- `expires_at`: When the invite expires (typically 7 days from creation)
- `created_at`: When the invite was created
- `redeemed_at`: When the invite was redeemed (NULL if not redeemed)
- `redeemed_by_user_id`: User ID who redeemed the invite

### 3. `enrollments`

Stores course enrollments (grants access to courses).

```sql
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'completed'
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_enrollment UNIQUE (user_id, course_id)
);

CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);
```

**Columns:**
- `id`: Primary key
- `user_id`: Reference to the user (from Supabase Auth)
- `course_id`: Reference to the course
- `enrolled_at`: When the user was enrolled
- `status`: Enrollment status (active, suspended, completed)
- `completed_at`: When the user completed the course (optional)
- `created_at`: Record creation timestamp
- `updated_at`: Record update timestamp

### 4. Alternative: `course_access`

If you prefer a simpler access control table instead of `enrollments`:

```sql
CREATE TABLE course_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- NULL for lifetime access
  CONSTRAINT unique_course_access UNIQUE (user_id, course_id)
);

CREATE INDEX idx_course_access_user_id ON course_access(user_id);
CREATE INDEX idx_course_access_course_id ON course_access(course_id);
```

## Course Invite/Enrollment Flow

### Step 1: Purchase Course (Store Database)
When a customer purchases a course:
1. Order is created in the store's `orders` table
2. `enroll-course.ts` Netlify function is triggered
3. Function creates invite token in Academy's `course_invites` table
4. Function sends invitation email via n8n webhook
5. Function tracks purchase in Store's `course_purchases` table

### Step 2: Redeem Invite (Academy Database)
When user clicks invite link:
1. User lands on Academy frontend `/invite/{token}` page
2. Frontend calls `redeem-invite.ts` Netlify function
3. Function validates token from `course_invites` table
4. Function creates user account (if needed) via Supabase Auth
5. Function grants access via `enrollments` or `course_access` table
6. Function marks invite as redeemed in `course_invites`
7. Function updates Store's `course_purchases` with `academy_user_id`

## Environment Variables Required

```bash
# Store Database (Main Supabase)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx

# Academy Database (Separate Supabase)
ACADEMY_SUPABASE_URL=https://yyy.supabase.co
ACADEMY_SUPABASE_SERVICE_KEY=xxx

# Academy Frontend URL
ACADEMY_URL=https://academy.yoursite.com

# n8n Webhook Base URL
N8N_BASE=https://n8n.yoursite.com
```

## Security Considerations

1. **Token Expiration**: Invite tokens expire after 7 days
2. **One-time Use**: Tokens can only be redeemed once
3. **Email Validation**: Tokens are tied to specific email addresses
4. **Service Keys**: Use Supabase service role keys for server-side operations
5. **CORS**: Netlify functions include appropriate CORS headers

## Testing the Flow

1. Create a test order with a course product
2. Check that invite is created in Academy `course_invites`
3. Check that email is sent via n8n webhook
4. Visit the invite URL
5. Create account or sign in
6. Verify enrollment in `enrollments` table
7. Verify `course_purchases` shows `redeemed` status
