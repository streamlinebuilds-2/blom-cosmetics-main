#!/bin/bash

# Execute SQL migrations via Supabase SQL Editor API
# This script sends the SQL to be executed

SUPABASE_URL="${SUPABASE_URL:-${VITE_SUPABASE_URL}}"
SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY}"

if [ -z "$SUPABASE_URL" ] || [ -z "$SERVICE_KEY" ]; then
  echo "❌ Error: Missing required environment variables"
  echo "   Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  exit 1
fi

echo "=========================================="
echo "🔄 RUNNING DATABASE MIGRATIONS"
echo "=========================================="
echo ""

# Migration 1: Order Constraints
echo "📋 Migration 1: Adding order constraints..."
cat migrations/001_add_order_constraints.sql

echo ""
echo "⚠️  This migration should be run manually in Supabase SQL Editor"
echo "   URL: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/editor"
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
echo "1. Go to your Supabase SQL Editor"
echo "2. Open the SQL Editor"
echo "3. Copy and paste each migration file:"
echo "   - migrations/001_add_order_constraints.sql"
echo "   - migrations/002_add_review_constraints.sql"
echo "   - migrations/003_fix_fulfillment_type.sql"
echo "4. Run each migration"
echo ""
echo "=========================================="
