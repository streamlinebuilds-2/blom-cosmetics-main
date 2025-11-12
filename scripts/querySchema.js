import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yvmnedjybrpvlupygusf.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bW5lZGp5YnJwdmx1cHlndXNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYwOTY0MywiZXhwIjoyMDc0MTg1NjQzfQ.dI1D3wtCcM_HwBDyT5bg_H5Yj5e0GUT2ILjDfw6gSyI';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function exploreSchema() {
  console.log('🔍 DATABASE SCHEMA EXPLORER\n');
  console.log('=' .repeat(80) + '\n');

  try {
    // Query to get all tables and views
    const { data: tables, error: tablesError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT
            table_schema,
            table_name,
            table_type
          FROM information_schema.tables
          WHERE table_schema = 'public'
          ORDER BY table_type, table_name;
        `
      });

    if (tablesError) {
      console.log('⚠️  Standard RPC not available, using REST API...\n');
      await exploreViaCurl();
      return;
    }

    console.log('📊 TABLES & VIEWS:\n');
    tables.forEach(t => {
      const icon = t.table_type === 'VIEW' ? '👁️' : '📁';
      console.log(`${icon}  ${t.table_name} (${t.table_type})`);
    });

  } catch (error) {
    console.log('⚠️  Error:', error.message);
    console.log('\nFalling back to REST API queries...\n');
    await exploreViaCurl();
  }
}

async function exploreViaCurl() {
  // List known tables from the API
  console.log('📋 KNOWN TABLES:\n');

  const tables = [
    'products',
    'categories',
    'blog_posts',
    'courses',
    'orders',
    'order_items',
    'payments',
    'product_reviews',
    'beauty_club_members',
    'contacts',
    'addresses',
    'course_bookings',
    'product_images',
    'product_variants'
  ];

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (!error) {
        console.log(`✅ ${table.padEnd(25)} - ${count || 0} records`);
      }
    } catch (e) {
      // Table might not exist
    }
  }
}

exploreSchema();
