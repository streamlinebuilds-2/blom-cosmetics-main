import fs from 'node:fs';
import path from 'node:path';

// Read the ShopPage.tsx file
const shopPagePath = path.resolve(process.cwd(), 'src/pages/ShopPage.tsx');
const content = fs.readFileSync(shopPagePath, 'utf8');

// Extract the allProducts array using regex
const arrayStart = content.indexOf('const allProducts = [');
const arrayEnd = content.indexOf('];', arrayStart) + 2;
const arrayContent = content.substring(arrayStart, arrayEnd);

// Parse the products
const products: any[] = [];
const regex = /id:\s*['"]([^'"]+)['"].*?name:\s*['"]([^'"]+)['"].*?slug:\s*['"]([^'"]+)['"].*?price:\s*(\d+)/gs;
let match;

while ((match = regex.exec(arrayContent)) !== null) {
  const [, id, name, slug, price] = match;
  products.push({ id, name, slug, price: parseInt(price) });
}

// Generate CSV
const csvHeader = 'id,name,slug,status,price,price_cents,compare_at_price,compare_at_price_cents,stock_qty,short_desc,overview,features,how_to_use,inci_ingredients,key_ingredients,size,shelf_life,claims,thumbnail_url,gallery_urls,category_slug\n';

const csvRows = products.map(p => {
  const price_cents = p.price * 100;
  return `${p.id},"${p.name}",${p.slug},active,${p.price},${price_cents},,,,10,"Product ${p.name}","Product ${p.name} description",";",";",";",";","","","https://example.com/${p.slug}.webp","https://example.com/${p.slug}-1.webp;https://example.com/${p.slug}-2.webp",nail-products`;
}).join('\n');

const csv = csvHeader + csvRows;

// Write CSV
const csvPath = path.resolve(process.cwd(), 'seed/products.csv');
fs.writeFileSync(csvPath, csv);

console.log(`Extracted ${products.length} products to seed/products.csv`);

