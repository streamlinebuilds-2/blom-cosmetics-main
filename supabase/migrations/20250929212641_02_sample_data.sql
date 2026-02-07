/*
  # BLOM Cosmetics - Sample Data

  ## Overview
  This migration populates the database with sample data to demonstrate the website functionality.

  ## Data Added

  ### Categories
  - Main categories: Acrylic System, Gel System, Prep & Finishing, Tools & Essentials
  - Subcategories for each main category
  - Proper hierarchy and sorting

  ### Products
  - Featured products for homepage
  - Products across all categories
  - Variants for different options
  - Product images and proper pricing

  ### Blog Posts
  - Sample blog posts for tutorials, reviews, and tips
  - Published content for public viewing

  ### Courses
  - Online and in-person courses
  - Different skill levels and pricing
  - Featured courses for homepage

  ## Notes
  - All content uses placeholder images from Pexels
  - Prices are in South African Rand (realistic pricing)
  - All timestamps set appropriately for realistic data
*/

-- Insert main categories
INSERT INTO categories (name, slug, description, image_url, sort_order) VALUES
('Acrylic System', 'acrylic-system', 'Complete acrylic nail system including powders, liquids, and tools for professional sculpting and enhancement.', 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop', 1),
('Gel System', 'gel-system', 'Comprehensive gel nail products including polishes, base coats, top coats, and LED equipment for lasting manicures.', 'https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop', 2),
('Prep & Finishing', 'prep-finishing', 'Essential preparation and finishing products for perfect nail applications and long-lasting results.', 'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop', 3),
('Tools & Essentials', 'tools-essentials', 'Professional tools, files, and accessories for all your nail artistry needs.', 'https://images.pexels.com/photos/3997990/pexels-photo-3997990.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop', 4);

-- Get category IDs for subcategories
DO $$
DECLARE
    acrylic_id uuid;
    gel_id uuid;
    prep_id uuid;
    tools_id uuid;
BEGIN
    SELECT id INTO acrylic_id FROM categories WHERE slug = 'acrylic-system';
    SELECT id INTO gel_id FROM categories WHERE slug = 'gel-system';
    SELECT id INTO prep_id FROM categories WHERE slug = 'prep-finishing';
    SELECT id INTO tools_id FROM categories WHERE slug = 'tools-essentials';

    -- Acrylic System subcategories
    INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
    ('Acrylic Powders', 'acrylic-powders', 'High-quality acrylic powders in various colors and formulations', acrylic_id, 1),
    ('Liquid Monomers', 'liquid-monomers', 'Professional liquid monomers for acrylic application', acrylic_id, 2),
    ('Acrylic Brushes', 'acrylic-brushes', 'Specialized brushes for acrylic nail application', acrylic_id, 3),
    ('Sculpting Forms', 'sculpting-forms', 'Forms and templates for nail sculpting', acrylic_id, 4);

    -- Gel System subcategories
    INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
    ('Gel Polish', 'gel-polish', 'Long-lasting gel polish colors', gel_id, 1),
    ('Base Coats', 'base-coats', 'Protective base coat formulas', gel_id, 2),
    ('Top Coats', 'top-coats', 'Finishing top coat products', gel_id, 3),
    ('LED Lamps', 'led-lamps', 'Professional LED curing lamps', gel_id, 4);

    -- Prep & Finishing subcategories
    INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
    ('Primers', 'primers', 'Nail preparation primers', prep_id, 1),
    ('Cleansers', 'cleansers', 'Nail cleansing solutions', prep_id, 2),
    ('Cuticle Care', 'cuticle-care', 'Cuticle oils and treatments', prep_id, 3),
    ('Nail Art', 'nail-art', 'Nail art supplies and decorations', prep_id, 4);

    -- Tools & Essentials subcategories
    INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
    ('Files & Buffers', 'files-buffers', 'Nail files and buffing tools', tools_id, 1),
    ('Electric Files', 'electric-files', 'Electric nail files and bits', tools_id, 2),
    ('Professional Kits', 'professional-kits', 'Complete professional nail kits', tools_id, 3),
    ('Accessories', 'accessories', 'Additional nail accessories', tools_id, 4);
END $$;

-- Insert featured products
INSERT INTO products (name, slug, description, short_description, price, sku, inventory_quantity, is_active, is_featured, meta_title, meta_description) VALUES
('Vitamin Primer', 'vitamin-primer', 'Essential nail preparation primer enriched with vitamins for optimal adhesion and nail health. Creates a strong bond between the natural nail and enhancement products while nourishing the nail bed.', 'Essential nail preparation for lasting results', 299.00, 'VP-001', 50, true, true, 'Vitamin Primer - Professional Nail Preparation', 'Professional vitamin-enriched nail primer for superior adhesion and nail health'),

('Premium Acrylic Powder - Clear', 'premium-acrylic-powder-clear', 'Professional grade crystal clear acrylic powder for perfect nail sculpting and extensions. Self-leveling formula ensures smooth application and superior strength for long-lasting results.', 'Professional grade acrylic powder for perfect sculpting', 450.00, 'PAP-CLEAR-001', 30, true, true, 'Premium Clear Acrylic Powder - Professional Grade', 'High-quality clear acrylic powder for professional nail sculpting and extensions'),

('Crystal Clear Liquid Monomer', 'crystal-clear-liquid', 'High-quality liquid monomer specially formulated for smooth acrylic application. Low odor formula with excellent working time for precision nail artistry and professional results.', 'High-quality monomer for smooth application', 380.00, 'CCL-001', 40, true, true, 'Crystal Clear Liquid Monomer - Professional Formula', 'Premium liquid monomer for smooth acrylic nail application with low odor formula'),

('Professional LED Lamp 48W', 'professional-led-lamp-48w', 'High-performance 48W LED lamp with advanced dual-light technology. Features automatic sensor, timer settings, and even light distribution for perfect gel curing every time.', 'Professional 48W LED lamp for perfect curing', 1299.00, 'LED-48W-001', 15, true, true, 'Professional 48W LED Lamp - Salon Quality', 'Professional LED nail lamp with 48W power and automatic sensor for perfect gel curing'),

('Gel Polish Set - Signature Collection', 'gel-polish-signature-set', 'Complete collection of 12 bestselling gel polish colors including base coat and top coat. Long-lasting formula with chip-resistant finish and vibrant color payoff.', 'Complete gel polish collection with 12 colors', 899.00, 'GPS-SIG-001', 20, true, true, 'Signature Gel Polish Collection - 12 Colors', 'Professional gel polish set with 12 popular colors plus base and top coat'),

('Cuticle Oil - Nourishing Blend', 'cuticle-oil-nourishing', 'Luxurious cuticle oil blend with vitamin E, jojoba oil, and essential botanicals. Deeply moisturizes and conditions cuticles while promoting healthy nail growth.', 'Nourishing cuticle oil with vitamin E', 180.00, 'CO-NOUR-001', 60, true, false, 'Nourishing Cuticle Oil - Vitamin E Blend', 'Premium cuticle oil with vitamin E and botanicals for healthy nail growth'),

('Professional Nail File Set', 'professional-file-set', 'Complete set of professional nail files including different grits for shaping, smoothing, and finishing. Washable and sanitizable for professional use.', 'Complete professional nail file set', 220.00, 'PFS-001', 45, true, false, 'Professional Nail File Set - Multiple Grits', 'Complete set of professional nail files for shaping and finishing'),

('Acrylic Brush - Kolinsky Size 8', 'acrylic-brush-kolinsky-8', 'Premium Kolinsky sable brush perfect for acrylic application. Size 8 with excellent liquid retention and precise control for professional nail sculpting.', 'Premium Kolinsky sable brush for acrylics', 350.00, 'AB-KOL-8-001', 25, true, false, 'Kolinsky Acrylic Brush Size 8 - Professional', 'Premium Kolinsky sable acrylic brush for professional nail sculpting');

-- Insert product images for featured products
DO $$
DECLARE
    primer_id uuid;
    powder_id uuid;
    liquid_id uuid;
    lamp_id uuid;
    polish_id uuid;
    oil_id uuid;
    file_id uuid;
    brush_id uuid;
BEGIN
    SELECT id INTO primer_id FROM products WHERE slug = 'vitamin-primer';
    SELECT id INTO powder_id FROM products WHERE slug = 'premium-acrylic-powder-clear';
    SELECT id INTO liquid_id FROM products WHERE slug = 'crystal-clear-liquid';
    SELECT id INTO lamp_id FROM products WHERE slug = 'professional-led-lamp-48w';
    SELECT id INTO polish_id FROM products WHERE slug = 'gel-polish-signature-set';
    SELECT id INTO oil_id FROM products WHERE slug = 'cuticle-oil-nourishing';
    SELECT id INTO file_id FROM products WHERE slug = 'professional-file-set';
    SELECT id INTO brush_id FROM products WHERE slug = 'acrylic-brush-kolinsky-8';

    -- Insert product images
    INSERT INTO product_images (product_id, image_url, alt_text, sort_order) VALUES
    (primer_id, 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', 'Vitamin Primer bottle', 1),
    (powder_id, 'https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', 'Premium Acrylic Powder jar', 1),
    (liquid_id, 'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', 'Crystal Clear Liquid bottle', 1),
    (lamp_id, 'https://images.pexels.com/photos/3997990/pexels-photo-3997990.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', 'Professional LED Lamp', 1),
    (polish_id, 'https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', 'Gel Polish Set collection', 1),
    (oil_id, 'https://images.pexels.com/photos/3997988/pexels-photo-3997988.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', 'Cuticle Oil bottle', 1),
    (file_id, 'https://images.pexels.com/photos/3997987/pexels-photo-3997987.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', 'Professional File Set', 1),
    (brush_id, 'https://images.pexels.com/photos/3997986/pexels-photo-3997986.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', 'Kolinsky Acrylic Brush', 1);
END $$;

-- Link products to categories
DO $$
DECLARE
    primer_id uuid;
    powder_id uuid;
    liquid_id uuid;
    lamp_id uuid;
    polish_id uuid;
    oil_id uuid;
    file_id uuid;
    brush_id uuid;
    prep_cat_id uuid;
    acrylic_cat_id uuid;
    gel_cat_id uuid;
    tools_cat_id uuid;
    primers_cat_id uuid;
    powders_cat_id uuid;
    liquids_cat_id uuid;
    lamps_cat_id uuid;
    gel_polish_cat_id uuid;
    cuticle_cat_id uuid;
    files_cat_id uuid;
    brushes_cat_id uuid;
BEGIN
    -- Get product IDs
    SELECT id INTO primer_id FROM products WHERE slug = 'vitamin-primer';
    SELECT id INTO powder_id FROM products WHERE slug = 'premium-acrylic-powder-clear';
    SELECT id INTO liquid_id FROM products WHERE slug = 'crystal-clear-liquid';
    SELECT id INTO lamp_id FROM products WHERE slug = 'professional-led-lamp-48w';
    SELECT id INTO polish_id FROM products WHERE slug = 'gel-polish-signature-set';
    SELECT id INTO oil_id FROM products WHERE slug = 'cuticle-oil-nourishing';
    SELECT id INTO file_id FROM products WHERE slug = 'professional-file-set';
    SELECT id INTO brush_id FROM products WHERE slug = 'acrylic-brush-kolinsky-8';

    -- Get category IDs
    SELECT id INTO prep_cat_id FROM categories WHERE slug = 'prep-finishing';
    SELECT id INTO acrylic_cat_id FROM categories WHERE slug = 'acrylic-system';
    SELECT id INTO gel_cat_id FROM categories WHERE slug = 'gel-system';
    SELECT id INTO tools_cat_id FROM categories WHERE slug = 'tools-essentials';
    SELECT id INTO primers_cat_id FROM categories WHERE slug = 'primers';
    SELECT id INTO powders_cat_id FROM categories WHERE slug = 'acrylic-powders';
    SELECT id INTO liquids_cat_id FROM categories WHERE slug = 'liquid-monomers';
    SELECT id INTO lamps_cat_id FROM categories WHERE slug = 'led-lamps';
    SELECT id INTO gel_polish_cat_id FROM categories WHERE slug = 'gel-polish';
    SELECT id INTO cuticle_cat_id FROM categories WHERE slug = 'cuticle-care';
    SELECT id INTO files_cat_id FROM categories WHERE slug = 'files-buffers';
    SELECT id INTO brushes_cat_id FROM categories WHERE slug = 'acrylic-brushes';

    -- Link products to categories
    INSERT INTO product_categories (product_id, category_id) VALUES
    (primer_id, prep_cat_id),
    (primer_id, primers_cat_id),
    (powder_id, acrylic_cat_id),
    (powder_id, powders_cat_id),
    (liquid_id, acrylic_cat_id),
    (liquid_id, liquids_cat_id),
    (lamp_id, gel_cat_id),
    (lamp_id, lamps_cat_id),
    (polish_id, gel_cat_id),
    (polish_id, gel_polish_cat_id),
    (oil_id, prep_cat_id),
    (oil_id, cuticle_cat_id),
    (file_id, tools_cat_id),
    (file_id, files_cat_id),
    (brush_id, acrylic_cat_id),
    (brush_id, brushes_cat_id);
END $$;

-- Insert sample blog posts
INSERT INTO blog_posts (title, slug, content, excerpt, featured_image, status, tags, meta_title, meta_description, published_at) VALUES
('10 Essential Tips for Perfect Acrylic Application', '10-essential-acrylic-tips', 'Master the art of acrylic nail application with these professional tips and techniques. From preparation to finishing, learn how to achieve salon-quality results every time.', 'Professional tips for flawless acrylic nail application and long-lasting results.', 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'published', '{tutorials,acrylics,tips}', '10 Essential Tips for Perfect Acrylic Nails', 'Learn professional acrylic nail application tips for salon-quality results at home', NOW() - INTERVAL '5 days'),

('Gel Polish vs Regular Polish: Which is Better?', 'gel-vs-regular-polish', 'Compare the benefits and drawbacks of gel polish versus regular nail polish. Discover which option is best for different nail types and lifestyle needs.', 'Complete comparison guide between gel polish and regular nail polish options.', 'https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'published', '{gel-polish,reviews,comparison}', 'Gel Polish vs Regular Polish - Complete Guide', 'Compare gel polish and regular polish to find the best option for your nails', NOW() - INTERVAL '10 days'),

('Spring Nail Art Trends 2024', 'spring-nail-art-trends-2024', 'Discover the hottest nail art trends for spring 2024. From minimalist designs to bold patterns, get inspired for your next manicure.', 'Latest spring nail art trends and design inspiration for the new season.', 'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'published', '{trends,nail-art,spring}', 'Spring 2024 Nail Art Trends - Latest Designs', 'Discover the hottest spring 2024 nail art trends and get design inspiration', NOW() - INTERVAL '15 days'),

('How to Care for Your Cuticles Like a Pro', 'professional-cuticle-care', 'Learn professional cuticle care techniques for healthy, beautiful nails. Discover the best products and methods for maintaining perfect cuticles.', 'Professional cuticle care tips and techniques for healthier nails.', 'https://images.pexels.com/photos/3997990/pexels-photo-3997990.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'published', '{cuticle-care,tips,health}', 'Professional Cuticle Care Guide', 'Learn how to care for your cuticles like a professional nail technician', NOW() - INTERVAL '20 days');

-- Insert sample courses
INSERT INTO courses (title, slug, description, short_description, price, duration_hours, instructor_name, instructor_bio, featured_image, course_type, difficulty_level, is_active, is_featured, start_date) VALUES
('Flower Nail Art Workshop', 'blom-flower-workshop', 'Learn how to create soft, dreamy flower nail art designs from the comfort of your home with step-by-step videos and detailed guidance.', 'Create soft, dreamy flower nail art online', 480.00, 0, 'Avané Crous', 'Professional nail artist and educator with over 8 years of experience.', '/online-watercolor-card.webp', 'online', 'beginner', true, true, NOW() + INTERVAL '7 days'),

('Professional Acrylic Training', 'professional-acrylic-training', 'Complete professional acrylic nail training course covering everything from basic application to advanced sculpting techniques. Includes certification upon completion.', 'Comprehensive acrylic nail training with certification', 2499.00, 16, 'Jessica Chen', 'Master nail technician and certified instructor with over 20 years in the industry.', 'https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'in-person', 'beginner', true, true, NOW() + INTERVAL '14 days'),

('Advanced Nail Art Masterclass', 'advanced-nail-art-masterclass', 'Take your nail art skills to the next level with advanced techniques including 3D art, encapsulation, and complex design work. Perfect for experienced technicians.', 'Advanced techniques for experienced nail artists', 1899.00, 8, 'Michelle Adams', 'International nail art champion and educator specializing in advanced artistic techniques.', 'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'online', 'advanced', true, false, NOW() + INTERVAL '21 days'),

('Gel System Fundamentals', 'gel-system-fundamentals', 'Learn the fundamentals of gel nail systems including proper application, curing, and maintenance. Perfect for beginners entering the nail industry.', 'Essential gel nail system training for beginners', 1299.00, 6, 'Amanda Roberts', 'Certified gel specialist with extensive experience in gel system education and training.', 'https://images.pexels.com/photos/3997990/pexels-photo-3997990.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'hybrid', 'beginner', true, false, NOW() + INTERVAL '28 days');
