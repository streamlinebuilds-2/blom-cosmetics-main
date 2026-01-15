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

async function listProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('name, price')
    .not('name', 'ilike', 'z_Trash_%')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  const output = [`Found ${data.length} products:\n`];
  data.forEach(p => {
    output.push(`${p.name} - R${p.price}`);
  });
  
  const content = output.join('\n');
  console.log(content);
  
  // Also save to file
  fs.writeFileSync('products_list.txt', content);
  console.log('\nList saved to products_list.txt');
}

listProducts();
