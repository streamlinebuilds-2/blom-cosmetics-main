#!/bin/bash

# Execute SQL migrations via Supabase SQL Editor API
# This script sends the SQL to be executed

SUPABASE_URL="https://yvmnedjybrpvlupygusf.supabase.co"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bW5lZGp5YnJwdmx1cHlndXNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYwOTY0MywiZXhwIjoyMDc0MTg1NjQzfQ.dI1D3wtCcM_HwBDyT5bg_H5Yj5e0GUT2ILjDfw6gSyI"

echo "=========================================="
echo "🔄 RUNNING DATABASE MIGRATIONS"
echo "=========================================="
echo ""

# Migration 1: Order Constraints
echo "📋 Migration 1: Adding order constraints..."
cat migrations/001_add_order_constraints.sql

echo ""
echo "⚠️  This migration should be run manually in Supabase SQL Editor"
echo "   URL: https://supabase.com/dashboard/project/yvmnedjybrpvlupygusf/editor"
echo ""

# Migration 2: Review Constraints
echo "📋 Migration 2: Adding review constraints..."
cat migrations/002_add_review_constraints.sql

echo ""
echo "⚠️  This migration should be run manually in Supabase SQL Editor"
echo ""

# Migration 3: Fix Fulfillment Type
echo "📋 Migration 3: Fixing fulfillment_type..."
cat migrations/003_fix_fulfillment_type.sql

echo ""
echo "=========================================="
echo "ℹ️  MANUAL MIGRATION REQUIRED"
echo "=========================================="
echo ""
echo "Due to Supabase security restrictions, migrations must be run manually."
echo "Please follow these steps:"
echo ""
echo "1. Go to: https://supabase.com/dashboard/project/yvmnedjybrpvlupygusf/editor"
echo "2. Open the SQL Editor"
echo "3. Copy and paste each migration file:"
echo "   - migrations/001_add_order_constraints.sql"
echo "   - migrations/002_add_review_constraints.sql"
echo "   - migrations/003_fix_fulfillment_type.sql"
echo "4. Run each migration"
echo ""
echo "=========================================="
