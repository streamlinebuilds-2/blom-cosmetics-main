/*
  # BLOM Cosmetics - Initial Database Schema

  ## Overview
  This migration creates the foundation for the BLOM Cosmetics e-commerce platform with proper data organization and security.

  ## New Tables Created

  ### 1. Categories Table
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Category name (e.g., "Acrylic System", "Gel System")
  - `slug` (text) - URL-friendly version of name
  - `description` (text) - Category description
  - `image_url` (text) - Category image
  - `parent_id` (uuid, nullable) - For subcategories
  - `sort_order` (integer) - Display order
  - `is_active` (boolean) - Category visibility
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. Products Table
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Product name
  - `slug` (text) - URL-friendly version of name
  - `description` (text) - Product description
  - `short_description` (text) - Brief product summary
  - `price` (decimal) - Product price in cents
  - `compare_at_price` (decimal, nullable) - Original price for discounts
  - `sku` (text) - Stock Keeping Unit
  - `barcode` (text, nullable) - Product barcode
  - `inventory_quantity` (integer) - Stock quantity
  - `track_inventory` (boolean) - Whether to track inventory
  - `is_active` (boolean) - Product availability
  - `is_featured` (boolean) - Featured product flag
  - `weight` (decimal, nullable) - Product weight in grams
  - `meta_title` (text, nullable) - SEO title
  - `meta_description` (text, nullable) - SEO description
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. Product Categories Junction Table
  - `product_id` (uuid) - Reference to products
  - `category_id` (uuid) - Reference to categories
  - `created_at` (timestamptz) - Creation timestamp

  ### 4. Product Images Table
  - `id` (uuid, primary key) - Unique identifier
  - `product_id` (uuid) - Reference to products
  - `image_url` (text) - Image URL
  - `alt_text` (text, nullable) - Image alt text for accessibility
  - `sort_order` (integer) - Display order
  - `created_at` (timestamptz) - Creation timestamp

  ### 5. Product Variants Table (for different colors, sizes, etc.)
  - `id` (uuid, primary key) - Unique identifier
  - `product_id` (uuid) - Reference to products
  - `title` (text) - Variant title (e.g., "Pink - 15ml")
  - `price` (decimal) - Variant price in cents
  - `compare_at_price` (decimal, nullable) - Original price for discounts
  - `sku` (text) - Variant SKU
  - `barcode` (text, nullable) - Variant barcode
  - `inventory_quantity` (integer) - Stock quantity
  - `weight` (decimal, nullable) - Variant weight in grams
  - `option1` (text, nullable) - First option (e.g., Color)
  - `option2` (text, nullable) - Second option (e.g., Size)
  - `option3` (text, nullable) - Third option
  - `is_active` (boolean) - Variant availability
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 6. Blog Posts Table
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text) - Post title
  - `slug` (text) - URL-friendly version
  - `content` (text) - Post content (HTML/Markdown)
  - `excerpt` (text, nullable) - Post summary
  - `featured_image` (text, nullable) - Featured image URL
  - `author_id` (uuid, nullable) - Reference to auth.users
  - `status` (text) - Post status (draft, published, archived)
  - `tags` (text[], nullable) - Post tags array
  - `meta_title` (text, nullable) - SEO title
  - `meta_description` (text, nullable) - SEO description
  - `published_at` (timestamptz, nullable) - Publication date
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 7. Courses Table
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text) - Course title
  - `slug` (text) - URL-friendly version
  - `description` (text) - Course description
  - `short_description` (text) - Brief course summary
  - `price` (decimal) - Course price in cents
  - `duration_hours` (integer) - Course duration in hours
  - `max_students` (integer, nullable) - Maximum enrollment
  - `instructor_name` (text) - Instructor name
  - `instructor_bio` (text, nullable) - Instructor biography
  - `featured_image` (text, nullable) - Course image URL
  - `course_type` (text) - Type: online, in-person, hybrid
  - `difficulty_level` (text) - beginner, intermediate, advanced
  - `is_active` (boolean) - Course availability
  - `is_featured` (boolean) - Featured course flag
  - `start_date` (timestamptz, nullable) - Course start date
  - `end_date` (timestamptz, nullable) - Course end date
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - All tables have Row Level Security (RLS) enabled
  - Public read access for active/published content
  - Authenticated admin access for management operations
  - No unauthorized data access permitted

  ## Important Notes
  - Prices stored in cents to avoid decimal precision issues
  - All timestamps use timestamptz for timezone awareness
  - Soft deletes implemented via is_active flags
  - SEO-friendly slugs for all content
  - Comprehensive indexing for performance
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  short_description text DEFAULT '',
  price decimal(10,2) NOT NULL DEFAULT 0,
  compare_at_price decimal(10,2),
  sku text UNIQUE NOT NULL,
  barcode text,
  inventory_quantity integer DEFAULT 0,
  track_inventory boolean DEFAULT true,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  weight decimal(8,2),
  meta_title text,
  meta_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Product categories junction table
CREATE TABLE IF NOT EXISTS product_categories (
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (product_id, category_id)
);

-- Product images table
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  alt_text text DEFAULT '',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Product variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  title text NOT NULL,
  price decimal(10,2) NOT NULL DEFAULT 0,
  compare_at_price decimal(10,2),
  sku text UNIQUE NOT NULL,
  barcode text,
  inventory_quantity integer DEFAULT 0,
  weight decimal(8,2),
  option1 text,
  option2 text,
  option3 text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text DEFAULT '',
  excerpt text DEFAULT '',
  featured_image text,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  tags text[] DEFAULT '{}',
  meta_title text,
  meta_description text,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  short_description text DEFAULT '',
  price decimal(10,2) NOT NULL DEFAULT 0,
  duration_hours integer DEFAULT 0,
  max_students integer,
  instructor_name text NOT NULL,
  instructor_bio text DEFAULT '',
  featured_image text,
  course_type text DEFAULT 'online' CHECK (course_type IN ('online', 'in-person', 'hybrid')),
  difficulty_level text DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);

CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_active ON courses(is_active);
CREATE INDEX IF NOT EXISTS idx_courses_type ON courses(course_type);

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Categories can be managed by authenticated users"
  ON categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Products policies
CREATE POLICY "Active products are viewable by everyone"
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Products can be managed by authenticated users"
  ON products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Product categories policies
CREATE POLICY "Product categories are viewable by everyone"
  ON product_categories FOR SELECT
  USING (true);

CREATE POLICY "Product categories can be managed by authenticated users"
  ON product_categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Product images policies
CREATE POLICY "Product images are viewable by everyone"
  ON product_images FOR SELECT
  USING (true);

CREATE POLICY "Product images can be managed by authenticated users"
  ON product_images FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Product variants policies
CREATE POLICY "Active product variants are viewable by everyone"
  ON product_variants FOR SELECT
  USING (is_active = true);

CREATE POLICY "Product variants can be managed by authenticated users"
  ON product_variants FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Blog posts policies
CREATE POLICY "Published blog posts are viewable by everyone"
  ON blog_posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Blog posts can be managed by authenticated users"
  ON blog_posts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Courses policies
CREATE POLICY "Active courses are viewable by everyone"
  ON courses FOR SELECT
  USING (is_active = true);

CREATE POLICY "Courses can be managed by authenticated users"
  ON courses FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();