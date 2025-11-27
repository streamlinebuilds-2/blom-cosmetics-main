#!/usr/bin/env node

// Simple Stock Deduction Migration Verifier
// This script checks if the stock deduction migration is needed

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.log('\n❌ MISSING ENVIRONMENT VARIABLES');
  console.log('='.repeat(50));
  console.log('To run this migration, you need to set:');
  console.log('');
  console.log('1. SUPABASE_URL');
  console.log('2. SUPABASE_SERVICE_ROLE_KEY');
  console.log('');
  console.log('💡 You can either:');
  console.log('   - Set these in your .env file');
  console.log('   - Export them in your terminal');
  console.log('   - Run the migration manually in Supabase SQL Editor');
  console.log('');
  console.log('📋 MANUAL EXECUTION STEPS:');
  console.log('='.repeat(50));
  console.log('1. Open Supabase SQL Editor');
  console.log('2. Copy the entire content from:');
  console.log('   supabase/migrations/20251127000002_stock_deduction_schema_fixed.sql');
  console.log('3. Paste and run the SQL');
  console.log('4. Check for any errors');
  console.log('');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function verifySchema() {
  console.log('\n🔍 VERIFYING DATABASE SCHEMA');
  console.log('='.repeat(50));

  try {
    // Check if stock_movements table exists
    const { data: stockMovementsTable, error: tableError } = await supabase
      .from('stock_movements')
      .select('id')
      .limit(1);

    if (tableError && tableError.code === 'PGRST116') {
      console.log('❌ stock_movements table does NOT exist');
      console.log('✅ Migration is REQUIRED');
    } else if (tableError) {
      console.log('⚠️  Could not check stock_movements table:', tableError.message);
    } else {
      console.log('✅ stock_movements table EXISTS');
    }

    // Check if functions exist
    const functions = [
      'create_stock_movements_for_paid_order',
      'validate_stock_availability',
      'get_stock_movement_summary'
    ];

    for (const funcName of functions) {
      const { data, error } = await supabase
        .rpc('get_function_exists', { function_name: funcName });

      if (error) {
        // Try alternative check
        const { error: altError } = await supabase
          .from('information_schema.routines')
          .select('routine_name')
          .eq('routine_name', funcName)
          .eq('routine_schema', 'public');

        if (altError || !altError?.data?.length) {
          console.log(`❌ Function ${funcName} does NOT exist`);
        } else {
          console.log(`✅ Function ${funcName} EXISTS`);
        }
      } else {
        console.log(`✅ Function ${funcName} EXISTS`);
      }
    }

    // Check view
    const { data: viewData, error: viewError } = await supabase
      .from('stock_analytics')
      .select('id')
      .limit(1);

    if (viewError && viewError.code === 'PGRST116') {
      console.log('❌ stock_analytics view does NOT exist');
    } else if (viewError) {
      console.log('⚠️  Could not check stock_analytics view:', viewError.message);
    } else {
      console.log('✅ stock_analytics view EXISTS');
    }

    console.log('\n📋 SUMMARY:');
    console.log('If any items show ❌, you need to run the migration.');

  } catch (error) {
    console.error('Error verifying schema:', error.message);
  }
}

// Run verification
verifySchema();