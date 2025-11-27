#!/usr/bin/env node

// Execute Stock Deduction Migration
// This script runs the complete stock deduction fix migration

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error('   Please set these in your .env file or environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function executeStockDeductionMigration() {
  console.log('\n🚀 RUNNING STOCK DEDUCTION FIX MIGRATION');
  console.log('='.repeat(80));

  try {
    // Read the migration file
    const migrationPath = 'supabase/migrations/20251127000000_fix_stock_deduction_complete.sql';
    const sql = readFileSync(migrationPath, 'utf-8');
    
    console.log('📋 Migration file loaded:', migrationPath);
    console.log('📏 SQL length:', sql.length, 'characters');
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));
    
    console.log('🔢 Total statements to execute:', statements.length);
    console.log('');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      const statementPreview = statement.substring(0, 100).replace(/\n/g, ' ');
      
      console.log(`   Executing statement ${i + 1}/${statements.length}: ${statementPreview}...`);

      try {
        // Execute via Supabase RPC if available, otherwise try direct postgres
        const response = await supabase.rpc('exec_sql', { 
          query: statement 
        });

        if (response.error) {
          // Try alternative method using direct postgres connection
          const altResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
            method: 'POST',
            headers: {
              'apikey': SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'params=single-object'
            },
            body: statement
          });

          if (!altResponse.ok) {
            const errorText = await altResponse.text();
            console.log(`   ⚠️  Statement ${i + 1} failed: ${errorText.substring(0, 150)}...`);
            
            // Check if it's a "already exists" error (which is OK)
            if (errorText.includes('already exists') || errorText.includes('duplicate') || errorText.includes('already been created')) {
              console.log(`   ✅ Statement ${i + 1}: Already exists (OK)`);
              successCount++;
            } else {
              errorCount++;
            }
          } else {
            console.log(`   ✅ Statement ${i + 1}: Success`);
            successCount++;
          }
        } else {
          console.log(`   ✅ Statement ${i + 1}: Success`);
          successCount++;
        }
      } catch (error) {
        console.log(`   ⚠️  Statement ${i + 1}: ${error.message}`);
        
        // Common errors that are OK
        if (error.message.includes('already exists') || 
            error.message.includes('duplicate') || 
            error.message.includes('already been created') ||
            error.message.includes('already dropped')) {
          console.log(`   ✅ Statement ${i + 1}: Already exists (OK)`);
          successCount++;
        } else {
          errorCount++;
        }
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 MIGRATION RESULTS');
    console.log('='.repeat(80));
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`⚠️  Errors (some may be expected): ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 STOCK DEDUCTION FIX MIGRATION COMPLETED SUCCESSFULLY!');
    } else {
      console.log('\n⚠️  Migration completed with some errors. Check the Supabase dashboard to verify.');
    }

    console.log('\n🔍 VERIFICATION STEPS:');
    console.log('1. Check that orders trigger stock movements when marked as paid');
    console.log('2. Verify stock_movements table is created');
    console.log('3. Confirm products stock decreases on order payment');
    console.log('4. Test order flow end-to-end');

    return { successCount, errorCount };

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.log('\n💡 MANUAL EXECUTION REQUIRED:');
    console.log('Please run the migration manually in Supabase SQL Editor:');
    console.log('File: supabase/migrations/20251127000000_fix_stock_deduction_complete.sql');
    return { successCount: 0, errorCount: 1 };
  }
}

// Run the migration
executeStockDeductionMigration().then((result) => {
  if (result.errorCount > 0) {
    console.log('\n⚠️  Manual intervention may be required.');
    process.exit(1);
  } else {
    console.log('\n✅ All done! Stock deduction is now fixed.');
    process.exit(0);
  }
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});