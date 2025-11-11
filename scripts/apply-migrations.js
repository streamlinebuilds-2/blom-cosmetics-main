/**
 * Script to apply SQL migrations to Supabase
 *
 * Usage:
 *   SUPABASE_URL=https://your-project.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
 *   node scripts/apply-migrations.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Migrations to apply
const migrations = [
  {
    name: '20251111000000_create_get_my_active_coupons.sql',
    description: 'Create RPC function to fetch active coupons'
  },
  {
    name: '20251111000001_create_user_addresses_table.sql',
    description: 'Create user_addresses table'
  }
];

async function applyMigration(migrationFile, description) {
  console.log(`\n📝 Applying: ${description}`);
  console.log(`   File: ${migrationFile}`);

  try {
    // Read migration file
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', migrationFile);
    const sql = readFileSync(migrationPath, 'utf8');

    // Execute SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If exec_sql RPC doesn't exist, try direct execution
      // This is a workaround - you might need to use the SQL editor directly
      throw error;
    }

    console.log(`✅ Success: ${description}`);
    return true;
  } catch (error) {
    console.error(`❌ Error applying migration: ${description}`);
    console.error(`   ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting migration process...');
  console.log(`   Target: ${supabaseUrl}`);

  let successCount = 0;
  let failCount = 0;

  for (const migration of migrations) {
    const success = await applyMigration(migration.name, migration.description);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 Migration Summary:`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log('='.repeat(60));

  if (failCount > 0) {
    console.log('\n⚠️  Some migrations failed. You may need to:');
    console.log('   1. Run the SQL directly in Supabase SQL Editor');
    console.log('   2. Check for existing objects or permissions issues');
    process.exit(1);
  }

  console.log('\n✨ All migrations applied successfully!');
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
