-- Add Faded Flowers Workshop to the store's courses table
-- Creates the courses table if it doesn't exist, then inserts the course.

CREATE TABLE IF NOT EXISTS public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  short_description text DEFAULT '',
  price decimal(10,2) NOT NULL DEFAULT 0,
  duration_hours integer DEFAULT 0,
  max_students integer,
  instructor_name text NOT NULL DEFAULT '',
  instructor_bio text DEFAULT '',
  featured_image text,
  course_type text DEFAULT 'online' CHECK (course_type IN ('online', 'in-person', 'hybrid')),
  difficulty_level text DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  image_url text,
  duration text,
  level text,
  template_key text
);

CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_active ON public.courses(is_active);
CREATE INDEX IF NOT EXISTS idx_courses_type ON public.courses(course_type);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'courses' AND policyname = 'Active courses are viewable by everyone'
  ) THEN
    CREATE POLICY "Active courses are viewable by everyone"
      ON public.courses FOR SELECT
      USING (is_active = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'courses' AND policyname = 'Courses can be managed by authenticated users'
  ) THEN
    CREATE POLICY "Courses can be managed by authenticated users"
      ON public.courses FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;

-- Insert existing courses (no-op if already present)
INSERT INTO public.courses (id, title, slug, description, price, image_url, duration, level, is_active, course_type, template_key, instructor_name, instructor_bio, created_at)
VALUES
(
  'a603be5f-2c56-4e95-9423-8229c8991b40',
  'Professional Acrylic Training',
  'professional-acrylic-training',
  'Master the art of acrylic nail application with hands-on training in Randfontein.',
  7600,
  '/professional-acrylic-training-hero.webp',
  '5 Days',
  'Beginner to Intermediate',
  true,
  'in-person',
  'professional-acrylic-training',
  'Avané Crous',
  'Professional nail artist and educator with over 8 years of experience in acrylic nail application.',
  now() - interval '3 days'
),
(
  '7c5276c1-9207-4653-89c3-bb4c675db5e2',
  'Flower Nail Art Workshop',
  'blom-flower-watercolor-workshop',
  'Learn how to create soft, dreamy flower nail art designs from the comfort of your home.',
  480,
  '/online-watercolor-card.webp',
  'Self-Paced',
  'All Levels',
  true,
  'online',
  'blom-flower-watercolor-workshop',
  'Avané Crous',
  'Professional nail artist and educator with over 8 years of experience.',
  now() - interval '2 days'
),
(
  'efe16488-1de6-4522-aeb3-b08cfae3a640',
  'Christmas Watercolor Nail Art Workshop',
  'holiday-watercolor-workshop',
  'Paint festive watercolor nail art for the holidays! Learn Christmas tree designs, snowflakes, and winter wonderland techniques.',
  450,
  '/christmas-watercolor-card.webp',
  'Self-Paced',
  'All Levels',
  true,
  'online',
  'holiday-watercolor-workshop',
  'Avané Crous',
  'Professional nail artist and educator with over 8 years of experience.',
  now() - interval '1 day'
)
ON CONFLICT (slug) DO NOTHING;

-- Insert Faded Flowers Workshop
INSERT INTO public.courses (
  title,
  slug,
  description,
  price,
  image_url,
  duration,
  level,
  is_active,
  course_type,
  template_key,
  instructor_name,
  instructor_bio,
  created_at
) VALUES (
  'Faded Flowers Workshop',
  'faded-flowers-workshop',
  'Master the art of faded flower nail designs from the comfort of your home. Step-by-step video tutorials guide you through sketching, shading, and creating six stunning faded flower designs.',
  690,
  'https://res.cloudinary.com/dnlgohkcc/image/upload/q_auto/f_auto/v1775453928/WhatsApp_Image_2026-04-03_at_12.34.07_uelxcc.jpg',
  'Self-Paced',
  'All Levels',
  true,
  'online',
  'faded-flowers-workshop',
  'Avané Crous',
  'Professional nail artist and educator with over 8 years of experience.',
  now()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  is_active = EXCLUDED.is_active,
  course_type = EXCLUDED.course_type,
  template_key = EXCLUDED.template_key,
  instructor_name = EXCLUDED.instructor_name,
  instructor_bio = EXCLUDED.instructor_bio;
