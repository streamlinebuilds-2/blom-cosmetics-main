# Database Migrations

## Overview
This directory contains SQL migration scripts to add data integrity constraints to the Supabase database.

## Migrations

### 001_add_order_constraints.sql
Adds constraints and indexes to the `orders` table:
- NOT NULL constraints on critical fields (buyer_email, buyer_name, order_number, status)
- CHECK constraints for data validation (status values, total >= 0, etc.)
- Unique constraint on order_number
- Indexes for performance (status, email, m_payment_id, etc.)
- Trigger to auto-sync payment_status with paid_at timestamp

### 002_add_review_constraints.sql
Adds constraints and indexes to the `product_reviews` table:
- NOT NULL constraints (product_slug, name, email, rating, status)
- CHECK constraints (status values, rating 1-5, email format)
- Indexes for performance (product_slug, status, rating)
- Trigger to auto-set published_at when review is approved

## How to Run Migrations

### Option 1: Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard/project/yvmnedjybrpvlupygusf/editor
2. Open SQL Editor
3. Copy and paste the migration file content
4. Run the SQL

### Option 2: psql Command Line
```bash
# Set environment variables
export SUPABASE_DB_URL="postgresql://postgres:[PASSWORD]@db.yvmnedjybrpvlupygusf.supabase.co:5432/postgres"

# Run migration
psql $SUPABASE_DB_URL -f migrations/001_add_order_constraints.sql
psql $SUPABASE_DB_URL -f migrations/002_add_review_constraints.sql
```

### Option 3: Node.js Script
```javascript
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const migration = fs.readFileSync('./migrations/001_add_order_constraints.sql', 'utf8');
const { error } = await supabase.rpc('exec_sql', { sql: migration });

if (error) console.error('Migration failed:', error);
else console.log('Migration successful!');
```

## Important Notes

⚠️ **Before running migrations:**
1. Backup your database
2. Test on a development/staging environment first
3. Ensure all NULL test orders have been deleted (completed)

✅ **After running migrations:**
- All new orders will require buyer_email, buyer_name, and order_number
- Order status and payment_status will be validated
- Review submissions will require name, email, product_slug, and rating
- paid_at timestamp will auto-update when payment_status = 'paid'
- published_at timestamp will auto-update when review status = 'approved'

## Rollback

If you need to rollback migrations, you can:
```sql
-- Remove constraints from orders
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_total_valid;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_valid;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_valid;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_fulfillment_method_valid;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_order_number_unique;

-- Remove NOT NULL constraints from orders
ALTER TABLE orders ALTER COLUMN buyer_email DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN buyer_name DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN order_number DROP NOT NULL;

-- Remove constraints from product_reviews
ALTER TABLE product_reviews DROP CONSTRAINT IF EXISTS reviews_status_valid;
ALTER TABLE product_reviews DROP CONSTRAINT IF EXISTS reviews_rating_valid;
ALTER TABLE product_reviews DROP CONSTRAINT IF EXISTS reviews_email_format;

-- Remove NOT NULL constraints from reviews
ALTER TABLE product_reviews ALTER COLUMN product_slug DROP NOT NULL;
ALTER TABLE product_reviews ALTER COLUMN name DROP NOT NULL;
ALTER TABLE product_reviews ALTER COLUMN email DROP NOT NULL;
ALTER TABLE product_reviews ALTER COLUMN rating DROP NOT NULL;
```
