## Copy/Paste Prompt for blom-admin (Courses Templates + Course Type)

You are working in the BLOM admin repo (blom-admin). This is an update to existing code, not a rebuild.

### Constraints (Non-Negotiable)
- Do not change folder structure.
- Do not add dependencies.
- Do not change authentication logic.
- Preserve existing styling/layout/components.
- Match existing Products CRUD patterns where applicable.
- Supabase remains the source of truth.
- Admin WRITES via Netlify functions (service role), frontend READS.

---

## Goal
1) Add a **Course Type** field (Online / In-Person) when creating/editing courses in the admin app.
2) Add a **Start from Template** dropdown on the create form so new courses can be created using the 3 existing customer course pages as defaults.
3) Add full edit control for in-person course details: dates, packages, deposit amount, key details.
4) **Note:** Instructor information is managed outside this tool or defaults to static values. Do NOT add UI controls for `instructor_name` or `instructor_bio`.

---

## Database / Supabase (SQL only; run in Supabase)
The `courses` table schema has been updated to include `image_url`, `duration`, `level`, `template_key`.

If you haven't run the migration yet, ensure these columns exist:

```sql
-- Ensure columns exist (idempotent)
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS duration text;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS level text;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS template_key text;

-- Instructor fields exist in DB but are NOT managed by Admin UI
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS instructor_name text;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS instructor_bio text;

-- Add course_type if missing
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS course_type text NOT NULL DEFAULT 'in-person';
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_course_type_check;
ALTER TABLE public.courses ADD CONSTRAINT courses_course_type_check CHECK (course_type IN ('online', 'in-person'));
```

### In-person editable content fields (required for full control)
Add these columns to `public.courses`:
- `deposit_amount numeric(10,2)` (used for in-person checkout deposit)
- `available_dates jsonb` (array of date strings)
- `packages jsonb` (array of package objects)
- `key_details jsonb` (optional: array of bullet strings)

```sql
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS deposit_amount numeric(10,2);
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS available_dates jsonb;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS packages jsonb;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS key_details jsonb;
```

Packages JSON shape (admin must store exactly this):
```json
[
  {
    "name": "Standard",
    "price": 7200,
    "kit_value": 3200,
    "features": ["5-day training", "Starter kit", "Certificate", "Handouts"],
    "popular": false
  }
]
```

---

## Netlify Functions (Writes)
### save-course.ts
Extend the payload and DB upsert to include all display fields EXCEPT instructor info.

Example payload shape:
```ts
{
  id?,
  title,
  slug,
  description?,
  price?,
  image_url?,      // Maps to `image_url` column (text)
  duration?,       // Maps to `duration` column (text)
  level?,          // Maps to `level` column (text)
  is_active?,
  course_type,     // 'online' | 'in-person'
  template_key?,   // string | null
  deposit_amount?,  // number | null
  available_dates?, // string[] | null
  packages?,        // Package[] | null (see JSON shape)
  key_details?      // string[] | null
}
```

Validation rules:
- If `course_type === 'in-person'`:
  - `deposit_amount` required (number > 0)
  - `available_dates` required (non-empty array)
  - `packages` required (non-empty array, each with name/price/features)
- If `course_type === 'online'`:
  - these can be null/empty

---

## Admin UI (Courses)
### 1) CourseEdit.jsx (create/edit page)
Add these UI controls:

#### A) Course Type select (required)
- Field name: `course_type`
- Options:
  - Online (`online`)
  - In-Person (`in-person`)

#### B) In-person details (only show when course_type === 'in-person')
- Deposit Amount (required): `deposit_amount`
- Available Dates editor (required):
  - “Add date” button
  - list of date text inputs (strings) with remove
- Packages editor (required):
  - “Add package” button
  - per package fields: name, price (number), kit value (number), popular (boolean)
  - features editor: add/remove feature strings
- Key details editor (optional): add/remove bullet strings

#### C) Start from Template dropdown (create-only)
Show only when `id === 'new'`.
- Label: “Start from Template”
- Options:
  - None
  - Professional Acrylic Training
  - Online Watercolour Workshop
  - Christmas Watercolor Workshop

When a template is selected, auto-fill these fields:
- title, slug, description, price
- image_url (or uploaded Storage URL)
- duration, level
- is_active, course_type
- template_key
- For in-person template: also auto-fill deposit_amount / available_dates / packages.

**Template defaults:**

1) Professional Acrylic Training
- template_key: `professional-acrylic-training`
- title: `Professional Acrylic Training`
- slug: `professional-acrylic-training`
- description: `Master the art of acrylic nail application with hands-on training in Randfontein. Master prep, application, structure & finishing in 5 days.`
- price: `7200.00`
- image_url: `/professional-acrylic-training-hero.webp`
- duration: `5 Days`
- level: `Beginner to Intermediate`
- course_type: `in-person`
- deposit_amount: `2000.00`
- available_dates: `["March 15-19, 2026", "April 12-16, 2026", "May 10-14, 2026"]`
- packages: see below
- is_active: true

packages example:
```json
[
  {
    "name": "Standard",
    "price": 7200,
    "kit_value": 3200,
    "features": [
      "5-day comprehensive training",
      "Basic starter kit included",
      "Certificate after you've completed your exam",
      "Course materials and handouts"
    ],
    "popular": false
  },
  {
    "name": "Deluxe",
    "price": 9900,
    "kit_value": 5100,
    "features": [
      "5-day comprehensive training",
      "Premium professional kit included",
      "Certificate after you've completed your exam",
      "Course materials and handouts",
      "Bigger kit — electric e-file & LED lamp included"
    ],
    "popular": true
  }
]
```

2) Online Watercolour Workshop
- template_key: `online-watercolour-workshop`
- title: `Online Watercolour Workshop`
- slug: `online-watercolour-workshop`
- description: `Learn how to create soft, dreamy watercolour designs from the comfort of your home.`
- price: `480.00`
- image_url: `/online-watercolor-card.webp`
- duration: `Self-Paced`
- level: `All Levels`
- course_type: `online`
- is_active: true

3) Christmas Watercolor Workshop
- template_key: `christmas-watercolor-workshop`
- title: `Christmas Watercolor Workshop`
- slug: `christmas-watercolor-workshop`
- description: `Paint festive watercolor nail art for the holidays! Learn Christmas tree designs, snowflakes, and winter wonderland techniques.`
- price: `450.00`
- image_url: `/christmas-watercolor-card.webp`
- duration: `Self-Paced`
- level: `All Levels`
- course_type: `online`
- is_active: true

### 2) Courses.jsx (list page)
- Add a “Type” column showing `course_type`.

---

## Data Adapter (Admin)
Update `supabaseAdapter.jsx` to include `image_url`, `duration`, `level`, `template_key`.
Also include: `deposit_amount`, `available_dates`, `packages`, `key_details`.
(Note: Do NOT include instructor fields).

---

## Verification Checklist
- Create a new course from each template and verify fields auto-fill.
- Save and confirm the row has the correct `course_type`.
- Customer frontend shows the course under the correct section (Online vs In-Person).
