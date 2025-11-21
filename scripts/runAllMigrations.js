import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

console.log('🚀 RUNNING SUPABASE MIGRATIONS');
console.log('='.repeat(80));
console.log(`📍 Database: ${SUPABASE_URL}\n`);

async function executeMigration(migrationName, sql) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📝 MIGRATION: ${migrationName}`);
  console.log('='.repeat(80));

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.log(`❌ ERROR: ${error.message}`);
      console.log(`   Code: ${error.code}`);
      console.log(`   Details: ${JSON.stringify(error.details || {})}`);
      return false;
    }

    console.log(`✅ SUCCESS: Migration completed`);
    if (data) {
      console.log(`   Result: ${JSON.stringify(data).substring(0, 200)}`);
    }
    return true;
  } catch (err) {
    console.log(`❌ EXCEPTION: ${err.message}`);
    return false;
  }
}

async function main() {
  const migrations = [
    {
      name: '001_add_order_constraints.sql',
      path: join(__dirname, '..', 'migrations', '001_add_order_constraints.sql')
    },
    {
      name: '002_add_review_constraints.sql',
      path: join(__dirname, '..', 'migrations', '002_add_review_constraints.sql')
    },
    {
      name: '003_fix_fulfillment_type.sql',
      path: join(__dirname, '..', 'migrations', '003_fix_fulfillment_type.sql')
    }
  ];

  let successCount = 0;
  let failCount = 0;

  for (const migration of migrations) {
    try {
      console.log(`\n📖 Reading: ${migration.name}`);
      const sql = readFileSync(migration.path, 'utf8');
      console.log(`   Size: ${sql.length} bytes`);

      const success = await executeMigration(migration.name, sql);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    } catch (err) {
      console.log(`❌ Failed to read migration: ${err.message}`);
      failCount++;
    }
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📈 Total: ${migrations.length}`);
  console.log('='.repeat(80));

  if (failCount === 0) {
    console.log('\n🎉 All migrations completed successfully!');
  } else {
    console.log('\n⚠️  Some migrations failed. Check errors above.');
  }
}

main();
