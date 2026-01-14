-- 1. Create a function to categorize products based on their name
CREATE OR REPLACE FUNCTION auto_categorize_product()
RETURNS TRIGGER AS $$
BEGIN
    -- Acrylic System Logic
    IF NEW.name ILIKE '%Colour Acrylic%' THEN
        NEW.category := 'acrylic-system';
        NEW.subcategory := 'Colour Acrylics';
    ELSIF NEW.name ILIKE '%Glitter Acrylic%' THEN
        NEW.category := 'acrylic-system';
        NEW.subcategory := 'Glitter Acrylics';
    ELSIF NEW.name ILIKE '%Core Acrylic%' THEN
        NEW.category := 'acrylic-system';
        NEW.subcategory := 'Core Acrylics';
    ELSIF NEW.name ILIKE '%Nail Liquid%' OR NEW.name ILIKE '%Monomer%' THEN
        NEW.category := 'acrylic-system';
        NEW.subcategory := 'Liquids';
    
    -- Furniture Logic
    ELSIF NEW.name ILIKE '%Table%' OR NEW.name ILIKE '%Station%' OR NEW.name ILIKE '%Desk%' OR NEW.name ILIKE '%Dresser%' OR NEW.name ILIKE '%Rack%' THEN
        NEW.category := 'furniture';
        NEW.subcategory := 'Salon Furniture';

    -- Essentials & Prep
    ELSIF NEW.name ILIKE '%Prep Solution%' OR NEW.name ILIKE '%Vitamin Primer%' OR NEW.name ILIKE '%Dehydrator%' OR NEW.name ILIKE '%Cuticle Oil%' THEN
        NEW.category := 'essentials';
        NEW.subcategory := 'Prep & Care';
    ELSIF NEW.name ILIKE '%Top Coat%' OR NEW.name ILIKE '%Base%' OR NEW.name ILIKE '%Finish%' THEN
        NEW.category := 'essentials';
        NEW.subcategory := 'Top Coats';
    
    -- Tools
    ELSIF NEW.name ILIKE '%Brush%' OR NEW.name ILIKE '%File%' OR NEW.name ILIKE '%Forms%' OR NEW.name ILIKE '%Tips%' THEN
        NEW.category := 'tools';
        NEW.subcategory := 'Tools & Accessories';

    -- Bundles
    ELSIF NEW.name ILIKE '%Bundle%' OR NEW.name ILIKE '%Collection%' OR NEW.name ILIKE '%Set%' THEN
        NEW.category := 'bundles';
        NEW.subcategory := 'Value Sets';
        
    -- Default
    ELSE
        IF NEW.category IS NULL THEN
            NEW.category := 'uncategorized';
            NEW.subcategory := 'General';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create the Trigger to run this function on every INSERT
DROP TRIGGER IF EXISTS trigger_auto_categorize_products ON products;
CREATE TRIGGER trigger_auto_categorize_products
BEFORE INSERT ON products
FOR EACH ROW
EXECUTE FUNCTION auto_categorize_product();

-- 3. Run a massive update on EXISTING products to apply these rules right now
UPDATE products SET category = 'acrylic-system', subcategory = 'Colour Acrylics' WHERE name ILIKE '%Colour Acrylic%';
UPDATE products SET category = 'acrylic-system', subcategory = 'Glitter Acrylics' WHERE name ILIKE '%Glitter Acrylic%';
UPDATE products SET category = 'acrylic-system', subcategory = 'Core Acrylics' WHERE name ILIKE '%Core Acrylic%';
UPDATE products SET category = 'acrylic-system', subcategory = 'Liquids' WHERE name ILIKE '%Nail Liquid%' OR name ILIKE '%Monomer%';
UPDATE products SET category = 'furniture', subcategory = 'Salon Furniture' WHERE name ILIKE '%Table%' OR name ILIKE '%Station%' OR name ILIKE '%Dresser%' OR name ILIKE '%Rack%';
UPDATE products SET category = 'essentials', subcategory = 'Prep & Care' WHERE name ILIKE '%Prep Solution%' OR name ILIKE '%Vitamin Primer%' OR name ILIKE '%Cuticle Oil%';
UPDATE products SET category = 'essentials', subcategory = 'Top Coats' WHERE name ILIKE '%Top Coat%';
UPDATE products SET category = 'tools', subcategory = 'Tools & Accessories' WHERE name ILIKE '%Brush%' OR name ILIKE '%File%' OR name ILIKE '%Nail Forms%';
UPDATE products SET category = 'bundles', subcategory = 'Value Sets' WHERE name ILIKE '%Bundle%' OR name ILIKE '%Collection%' OR name ILIKE '%Set%';