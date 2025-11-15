// netlify/functions/save-product.ts
import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const s = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const handler: Handler = async (e) => {
  if (e.httpMethod === "OPTIONS") return { statusCode: 200, headers: CORS, body: "ok" };
  if (e.httpMethod !== "POST") return { statusCode: 405, headers: CORS, body: "Method Not Allowed" };

  try {
    if (!e.body) return { statusCode: 400, headers: CORS, body: "Empty body" };
    const body = JSON.parse(e.body);

    // FIX #1: Extract payload if nested { action, payload } structure
    const payload = body.payload || body;

    console.log("Product save - received payload:", payload);

    // Extract and validate required fields
    const name = String(payload.name || '').trim();
    const slug = String(payload.slug || '').trim();
    const sku = String(payload.sku || '').trim();
    const price = Number(payload.price);

    if (!name) return { statusCode: 400, headers: CORS, body: "Missing product name" };
    if (!slug) return { statusCode: 400, headers: CORS, body: "Missing product slug" };
    if (!sku) return { statusCode: 400, headers: CORS, body: "Missing product SKU" };
    if (isNaN(price) || price <= 0) return { statusCode: 400, headers: CORS, body: "Invalid price" };

    // Check for duplicate slug
    const { data: existingSlug } = await s
      .from("products")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existingSlug && existingSlug.id !== payload.id) {
      return { statusCode: 400, headers: CORS, body: "Slug already exists" };
    }

    // Check for duplicate SKU
    const { data: existingSku } = await s
      .from("products")
      .select("id")
      .eq("sku", sku)
      .maybeSingle();

    if (existingSku && existingSku.id !== payload.id) {
      return { statusCode: 400, headers: CORS, body: "SKU already exists" };
    }

    // Build product data object
    const productData: any = {
      name,
      slug,
      sku,
      status: payload.status || 'draft',
      price_cents: Math.round(price * 100),
      compare_at_price_cents: payload.compare_at_price ? Math.round(Number(payload.compare_at_price) * 100) : null,
      stock_qty: Number(payload.inventory_quantity || 0),
      short_desc: payload.short_description || '',
      overview: payload.description || '',
      features: Array.isArray(payload.features) ? payload.features : [],
      how_to_use: Array.isArray(payload.how_to_use) ? payload.how_to_use : [],
      inci_ingredients: Array.isArray(payload.inci_ingredients) ? payload.inci_ingredients : [],
      key_ingredients: Array.isArray(payload.key_ingredients) ? payload.key_ingredients : [],
      size: payload.size || null,
      shelf_life: payload.shelf_life || null,
      claims: Array.isArray(payload.claims) ? payload.claims : [],
      thumbnail_url: payload.thumbnail_url || null,
      gallery_urls: Array.isArray(payload.gallery_urls) ? payload.gallery_urls : [],
      category_id: payload.category_id || null,
      track_inventory: Boolean(payload.track_inventory ?? true),
      is_active: Boolean(payload.is_active ?? true),
      is_featured: Boolean(payload.is_featured ?? false),
      weight: payload.weight ? Number(payload.weight) : null,
      barcode: payload.barcode || null,
      meta_title: payload.meta_title || null,
      meta_description: payload.meta_description || null,
      updated_at: new Date().toISOString(),
    };

    let productId: string;

    // Insert or update product
    if (payload.id) {
      // Update existing product
      const { data, error } = await s
        .from("products")
        .update(productData)
        .eq("id", payload.id)
        .select("id")
        .single();

      if (error) {
        console.error("DB update error:", error);
        return { statusCode: 500, headers: CORS, body: `DB update failed: ${error.message}` };
      }

      productId = data.id;
      console.log("Product updated successfully:", productId);
    } else {
      // Insert new product
      const { data, error } = await s
        .from("products")
        .insert(productData)
        .select("id")
        .single();

      if (error) {
        console.error("DB insert error:", error);
        return { statusCode: 500, headers: CORS, body: `DB insert failed: ${error.message}` };
      }

      productId = data.id;
      console.log("Product created successfully:", productId);
    }

    // Handle product images if provided
    if (Array.isArray(payload.images) && payload.images.length > 0) {
      // Delete existing images for this product
      await s.from("product_images").delete().eq("product_id", productId);

      // Insert new images
      const imageRows = payload.images.map((img: any, index: number) => ({
        product_id: productId,
        image_url: typeof img === 'string' ? img : img.url,
        alt_text: typeof img === 'object' ? img.alt_text || '' : '',
        sort_order: index,
      }));

      const { error: imgError } = await s.from("product_images").insert(imageRows);
      if (imgError) {
        console.error("Image insert error:", imgError);
      }
    }

    // Handle product variants if provided
    if (Array.isArray(payload.variants) && payload.variants.length > 0) {
      // Delete existing variants for this product
      await s.from("product_variants").delete().eq("product_id", productId);

      // Insert new variants
      const variantRows = payload.variants
        .filter((v: any) => v.label || v.title) // Only insert variants with labels
        .map((variant: any) => ({
          product_id: productId,
          title: variant.label || variant.title || '',
          price: variant.price ? Math.round(Number(variant.price) * 100) : productData.price_cents,
          compare_at_price: variant.compare_at_price ? Math.round(Number(variant.compare_at_price) * 100) : null,
          sku: variant.sku || `${sku}-${variant.label || variant.title}`.toUpperCase().replace(/\s+/g, '-'),
          inventory_quantity: Number(variant.inventory_quantity || 0),
          option1: variant.option1 || variant.label || variant.title,
          option2: variant.option2 || null,
          option3: variant.option3 || null,
          is_active: Boolean(variant.is_active ?? true),
          weight: variant.weight ? Number(variant.weight) : null,
        }));

      if (variantRows.length > 0) {
        const { error: varError } = await s.from("product_variants").insert(variantRows);
        if (varError) {
          console.error("Variant insert error:", varError);
        }
      }
    }

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        ok: true,
        id: productId,
        message: payload.id ? "Product updated successfully" : "Product created successfully"
      })
    };
  } catch (err: any) {
    console.error("Save product exception:", err);
    return { statusCode: 500, headers: CORS, body: `save-product exception: ${err?.message || "unknown"}` };
  }
};
