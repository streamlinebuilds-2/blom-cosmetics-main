import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const s = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
};

function isUuid(x: string) {
  return /^[0-9a-f-]{36}$/i.test(x);
}

export const handler: Handler = async (e) => {
  if (e.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS, body: "ok" };
  }

  if (e.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      headers: CORS, 
      body: JSON.stringify({ error: "Method Not Allowed" }) 
    };
  }

  try {
    if (!e.body) {
      return { 
        statusCode: 400, 
        headers: CORS, 
        body: JSON.stringify({ error: "Empty body" }) 
      };
    }

    const payload = JSON.parse(e.body);

    // Accept either product_id (uuid) OR product_slug
    const rawProd = (payload.product_id ?? payload.product_slug ?? "").toString().trim();
    if (!rawProd) {
      return { 
        statusCode: 400, 
        headers: CORS, 
        body: JSON.stringify({ error: "Missing product_id or product_slug" }) 
      };
    }

    let product_id: string | null = rawProd;
    let product_slug = rawProd;

    if (!isUuid(rawProd)) {
      // treat as slug → lookup id and confirm slug exists
      const { data: p, error: pe } = await s
        .from("products")
        .select("id, slug")
        .eq("slug", rawProd)
        .single();

      if (pe || !p) {
        return { 
          statusCode: 400, 
          headers: CORS, 
          body: JSON.stringify({ error: "Invalid product_slug (not found)" }) 
        };
      }

      product_id = p.id;
      product_slug = p.slug;
    } else {
      // it's a UUID → lookup slug
      const { data: p, error: pe } = await s
        .from("products")
        .select("slug")
        .eq("id", rawProd)
        .single();

      if (!pe && p?.slug) {
        product_slug = p.slug;
      }
    }

    // Map fields (accept both naming conventions)
    const reviewer_name = (payload.name ?? payload.reviewer_name ?? "").toString().trim();
    const reviewer_email = (payload.email ?? payload.reviewer_email ?? null)?.toString()?.trim() || null;
    const title = (payload.title ?? null)?.toString()?.trim() || null;
    const body = (payload.body ?? "").toString().trim();
    const rating = Number(payload.rating);
    
    // Handle photos/images (accept both field names)
    const photosIn = payload.photos ?? payload.images ?? [];
    const photos: any[] = Array.isArray(photosIn) 
      ? photosIn.map((u: any) => String(u)).filter(Boolean)
      : [];

    const is_verified_buyer = Boolean(payload.is_verified_buyer ?? false);
    const order_id = payload.order_id ? String(payload.order_id) : null;

    // Validate minimum
    if (!reviewer_name || !body || !(rating >= 1 && rating <= 5)) {
      return { 
        statusCode: 400, 
        headers: CORS, 
        body: JSON.stringify({ error: "Missing/invalid name, body, or rating (1..5)" }) 
      };
    }

    const { data, error } = await s
      .from("product_reviews")
      .insert({
        product_slug,
        product_id: product_id || null,
        reviewer_name,
        reviewer_email,
        title,
        body,
        rating: Math.round(rating),
        photos,
        is_verified_buyer,
        order_id,
      })
      .select("id")
      .single();

    if (error) {
      console.error("DB insert error:", error);
      return { 
        statusCode: 500, 
        headers: CORS, 
        body: JSON.stringify({ error: `DB insert failed: ${error.message}` }) 
      };
    }

    // Optional: notify n8n if you set REVIEWS_INTAKE_WEBHOOK
    if (process.env.REVIEWS_INTAKE_WEBHOOK) {
      fetch(process.env.REVIEWS_INTAKE_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          review_id: data.id,
          product_id,
          product_slug,
          reviewer_name,
          reviewer_email,
          title,
          body,
          rating,
          photos,
          is_verified_buyer,
          order_id,
          status: "pending",
        }),
      }).catch(() => {});
    }

    return { 
      statusCode: 200, 
      headers: CORS, 
      body: JSON.stringify({ ok: true, id: data.id }) 
    };
  } catch (err: any) {
    console.error("reviews-intake exception:", err);
    return { 
      statusCode: 500, 
      headers: CORS, 
      body: JSON.stringify({ error: `reviews-intake exception: ${err?.message || "unknown"}` }) 
    };
  }
};
