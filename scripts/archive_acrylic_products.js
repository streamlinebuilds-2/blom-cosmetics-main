import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

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
  }
} catch (e) {
  console.error('Error loading .env file:', e);
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function archiveAcrylicProducts() {
  const targetNames = ['Crystal Clear Acrylic', 'Snow White Acrylic'];

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, status, is_active')
    .in('name', targetNames)
    .eq('status', 'active');

  if (error) {
    console.error('Error finding products:', error);
    return;
  }

  if (!products || products.length === 0) {
    console.log('No matching products found to archive.');
    return;
  }

  const ids = products.map(p => p.id);

  const { data: updated, error: updateError } = await supabase
    .from('products')
    .update({ status: 'archived', is_active: false })
    .in('id', ids)
    .select('id, name, status, is_active');

  if (updateError) {
    console.error('Error archiving products:', updateError);
    return;
  }

  console.log('Archived products:');
  updated.forEach(p => {
    console.log(`- ${p.name} (status: ${p.status}, is_active: ${p.is_active})`);
  });
}

archiveAcrylicProducts();
