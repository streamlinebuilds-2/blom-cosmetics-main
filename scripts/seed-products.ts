import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'csv-parse/sync'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY in .env')
  process.exit(1)
}

const admin = createClient(supabaseUrl, supabaseKey)

type Row = {
  name:string; sku?:string; slug?:string; status?:string;
  price?:string; price_cents?:string;
  compare_at_price?:string; compare_at_price_cents?:string;
  stock_qty?:string; short_desc?:string; overview?:string;
  features?:string; how_to_use?:string; inci_ingredients?:string; key_ingredients?:string;
  size?:string; shelf_life?:string; claims?:string;
  thumbnail_url?:string; gallery_urls?:string;
  category_slug?:string;
}

const csvPath = path.resolve(process.cwd(), 'seed/products.csv')
const raw = fs.readFileSync(csvPath, 'utf8')
const rows = parse(raw, { columns: true, skip_empty_lines: true }) as Row[]

const toInt = (v?:string) => (v && v.trim() !== '' ? parseInt(v, 10) : undefined)
const toNum = (v?:string) => (v && v.trim() !== '' ? Number(v) : undefined)
const toArr = (v?:string) => (v && v.trim() !== '' ? v.split(';').map(s => s.trim()).filter(Boolean) : [])

const titleCase = (s:string) => s.replace(/[-_]/g,' ').replace(/\b\w/g, c => c.toUpperCase())

async function ensureCategory(slug?:string) {
  if (!slug) return null
  const { data: existing } = await admin.from('categories').select('id').eq('slug', slug).maybeSingle()
  if (existing?.id) return existing.id
  const { data: created, error } = await admin.from('categories').insert({ slug, name: titleCase(slug) }).select('id').single()
  if (error) throw error
  return created.id
}

async function upsertProduct(r: Row) {
  let price = toNum(r.price)
  let price_cents = toInt(r.price_cents)
  if (price != null && (price_cents == null || price_cents === 0)) {
    price_cents = Math.round(price * 100)
  } else if (price_cents != null && price == null) {
    // If price_cents is provided, convert to actual price
    price = price_cents / 100
  }

  let compare_at_price = toNum(r.compare_at_price)
  let compare_at_price_cents = toInt(r.compare_at_price_cents)
  if (compare_at_price != null && (compare_at_price_cents == null || compare_at_price_cents === 0)) {
    compare_at_price_cents = Math.round(compare_at_price * 100)
  } else if (compare_at_price_cents != null && compare_at_price == null) {
    compare_at_price = compare_at_price_cents / 100
  }

  const category_id = await ensureCategory(r.category_slug)

  const payload: any = {
    name: r.name,
    sku: r.sku ?? null,
    slug: (r.slug && r.slug.trim()) || r.name.toLowerCase().replace(/\s+/g,'-'),
    status: (r.status ?? 'active').toLowerCase(),
    price_cents: price_cents || 0,
    compare_at_price_cents: compare_at_price_cents || null,
    stock_qty: toInt(r.stock_qty) ?? 10,
    short_desc: r.short_desc ?? null,
    overview: r.overview ?? null,
    features: toArr(r.features),
    how_to_use: toArr(r.how_to_use),
    inci_ingredients: toArr(r.inci_ingredients),
    key_ingredients: toArr(r.key_ingredients),
    size: r.size ?? null,
    shelf_life: r.shelf_life ?? null,
    claims: toArr(r.claims),
    thumbnail_url: r.thumbnail_url ?? null,
    gallery_urls: toArr(r.gallery_urls),
    category_id
  }

  // Upsert by slug
  const { data: existing } = await admin.from('products').select('id, stock_qty').eq('slug', payload.slug).maybeSingle()

  if (existing?.id) {
    // if stock changes, write a movement delta
    const oldStock = existing.stock_qty ?? 0
    const newStock = payload.stock_qty ?? 0
    const delta = newStock - oldStock

    const { error: uErr } = await admin.from('products').update(payload).eq('id', existing.id)
    if (uErr) throw uErr

    if (delta !== 0) {
      await admin.from('stock_movements').insert({
        product_id: existing.id,
        delta,
        reason: 'seed import'
      })
    }
    console.log('updated:', payload.slug)
  } else {
    const { data: created, error: cErr } = await admin.from('products').insert(payload).select('id').single()
    if (cErr) throw cErr
    if (payload.stock_qty) {
      await admin.from('stock_movements').insert({
        product_id: created.id,
        delta: payload.stock_qty,
        reason: 'seed import'
      })
    }
    console.log('created:', payload.slug)
  }
}

;(async () => {
  console.log(`Seeding ${rows.length} products...`)
  for (const r of rows) {
    try {
      await upsertProduct(r)
    } catch (e:any) {
      console.error('row failed:', r.slug || r.name, e.message)
    }
  }
  console.log('Done.')
})()

