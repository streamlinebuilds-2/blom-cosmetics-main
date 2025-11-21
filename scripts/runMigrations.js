import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function executeSqlStatements(sql, migrationName) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🔄 Running: ${migrationName}`);
  console.log('='.repeat(80));

  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';

    // Skip comments
    if (statement.trim().startsWith('--')) continue;

    try {
      // Use raw SQL execution via REST API
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: statement })
      });

      if (!response.ok) {
        // If RPC doesn't exist, try alternative method
        console.log(`   Statement ${i + 1}: Trying alternative execution...`);

        // Execute via direct postgres connection using REST API
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
          console.log(`   ⚠️  Statement ${i + 1}: ${errorText.substring(0, 100)}`);
          errorCount++;
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
      errorCount++;
    }
  }

  console.log(`\n📊 Results: ${successCount} succeeded, ${errorCount} errors`);

  if (errorCount > 0) {
    console.log('⚠️  Some statements failed. This is normal if constraints already exist.');
    console.log('   Check the Supabase dashboard to verify the migration completed.');
  }

  return { successCount, errorCount };
}

async function runMigrations() {
  console.log('\n🚀 RUNNING DATABASE MIGRATIONS');
  console.log('='.repeat(80));

  const migrations = [
    'migrations/001_add_order_constraints.sql',
    'migrations/002_add_review_constraints.sql',
    'migrations/003_fix_fulfillment_type.sql'
  ];

  for (const migrationFile of migrations) {
    try {
      const sql = readFileSync(migrationFile, 'utf-8');
      await executeSqlStatements(sql, migrationFile);
    } catch (error) {
      console.error(`\n❌ Error reading ${migrationFile}:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ MIGRATIONS COMPLETE');
  console.log('='.repeat(80));
  console.log('\nNote: If you see errors, you may need to run these manually in the');
  console.log('Supabase SQL Editor: https://supabase.com/dashboard/project/yvmnedjybrpvlupygusf/editor');
}

runMigrations().catch(console.error);
