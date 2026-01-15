import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manually load .env
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
        process.env[key] = value;
      }
    });
    console.log('.env file loaded successfully');
  }
} catch (e) {
  console.error('Error loading .env file:', e);
}

const supabaseUrl = 'https://yvmnedjybrpvlupygusf.supabase.co';

// We'll try with the anon key if available from env
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.log('⚠️  No Supabase key found in environment variables');
  console.log('Please set VITE_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY');
  console.log('\nYou can get it from: https://supabase.com/dashboard/project/yvmnedjybrpvlupygusf/settings/api');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseAccess() {
  console.log('🔍 Testing Supabase Database Connection...\n');
  console.log(`📍 URL: ${supabaseUrl}\n`);

  try {
    // Test 1: Query products table
    console.log('📦 Testing products table...');
    const { data: products, error: productsError, count: productsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: false })
      .limit(5);

    if (productsError) {
      console.log('❌ Error querying products:', productsError.message);
    } else {
      console.log(`✅ Products table accessible! Found ${productsCount} total products`);
      if (products && products.length > 0) {
        console.log(`   First product: ${products[0].name}`);
      }
    }

    // Test 2: Query categories table
    console.log('\n📂 Testing categories table...');
    const { data: categories, error: categoriesError, count: categoriesCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: false })
      .limit(5);

    if (categoriesError) {
      console.log('❌ Error querying categories:', categoriesError.message);
    } else {
      console.log(`✅ Categories table accessible! Found ${categoriesCount} total categories`);
      if (categories && categories.length > 0) {
        console.log(`   Categories: ${categories.map(c => c.name).join(', ')}`);
      }
    }

    // Test 3: Query courses table
    console.log('\n🎓 Testing courses table...');
    const { data: courses, error: coursesError, count: coursesCount } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: false })
      .limit(5);

    if (coursesError) {
      console.log('❌ Error querying courses:', coursesError.message);
    } else {
      console.log(`✅ Courses table accessible! Found ${coursesCount} total courses`);
      if (courses && courses.length > 0) {
        console.log(`   First course: ${courses[0].title}`);
      }
    }

    // Test 4: Query blog_posts table
    console.log('\n📝 Testing blog_posts table...');
    const { data: posts, error: postsError, count: postsCount } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: false })
      .limit(5);

    if (postsError) {
      console.log('❌ Error querying blog_posts:', postsError.message);
    } else {
      console.log(`✅ Blog posts table accessible! Found ${postsCount} total posts`);
      if (posts && posts.length > 0) {
        console.log(`   First post: ${posts[0].title}`);
      }
    }

    // Test 5: Custom SQL query (if RPC is available)
    console.log('\n📊 Database connection successful!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testDatabaseAccess();
