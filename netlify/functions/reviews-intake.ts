// netlify/functions/reviews-intake.ts
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
    const payload = JSON.parse(e.body);

    console.log("Reviews intake - received payload:", payload);

    // Accept either product_id (uuid) OR product_slug - resolve both
    const rawProd = String(payload.product_id ?? payload.product_slug ?? "").trim();
    if (!rawProd) return { statusCode: 400, headers: CORS, body: "Missing product_id or product_slug" };

    let product_id = rawProd;
    let product_slug = rawProd;

    if (/^[0-9a-f-]{36}$/i.test(rawProd)) {
      // raw is UUID: look up slug
      const { data: p, error: pe } = await s.from("products").select("slug").eq("id", rawProd).single();
      if (pe || !p) return { statusCode: 400, headers: CORS, body: "Invalid product_id (not found)" };
      product_slug = p.slug;
    } else {
      // raw is slug: look up id
      const { data: p, error: pe } = await s.from("products").select("id").eq("slug", rawProd).single();
      if (pe || !p) return { statusCode: 400, headers: CORS, body: "Invalid product_slug (not found)" };
      product_id = p.id;
    }

    // Map fields - accept both naming conventions
    const reviewer_name = (payload.reviewer_name ?? payload.name ?? "").toString().trim();
    const reviewer_email = (payload.reviewer_email ?? payload.email ?? null)?.toString()?.trim() || null;
    const title = (payload.title ?? null)?.toString()?.trim() || null;
    const body = (payload.body ?? payload.comment ?? "").toString().trim();
    const rating = Number(payload.rating);
    const imagesIn = payload.images ?? payload.photos ?? [];
    const images: string[] = Array.isArray(imagesIn) ? imagesIn.map((u: any) => String(u)) : [];
    const is_verified_buyer = Boolean(payload.is_verified_buyer ?? false);
    const order_id = payload.order_id ? String(payload.order_id) : null;

    console.log("Normalized fields:", { reviewer_name, reviewer_email, body, rating });

    // Validate minimum
    if (!reviewer_name || !body || !(rating >= 1 && rating <= 5)) {
      return { statusCode: 400, headers: CORS, body: "Missing/invalid reviewer_name, body, or rating (1..5)" };
    }

    const row = {
      product_id,
      product_slug,
      reviewer_name,  // ✅ FIXED - correct column name
      reviewer_email, // ✅ FIXED - correct column name
      title,
      body,
      rating,
      images,
      is_verified_buyer,
      order_id,
      status: "pending",
    };

    console.log("Inserting row:", row);

    const { data, error } = await s.from("product_reviews").insert(row).select("id").single();

    if (error) {
      console.error("DB insert error:", error);
      return { statusCode: 500, headers: CORS, body: `DB insert failed: ${error.message}` };
    }

    console.log("Review created successfully:", data.id);

    // Send webhook to external service
    const WEBHOOK_URL = process.env.REVIEWS_INTAKE_WEBHOOK || 'https://dockerfile-1n82.onrender.com/webhook/reviews-intake';
    
    const webhookPayload = {
      review_id: data.id,
      product_id,
      product_slug,
      reviewer_name,
      reviewer_email,
      title,
      body,
      rating,
      images,
      is_verified_buyer,
      order_id,
      status: "pending",
      timestamp: new Date().toISOString(),
      source: 'website'
    };

    console.log('🔔 SENDING REVIEW WEBHOOK:', {
      url: WEBHOOK_URL,
      payload: webhookPayload
    });

    // Send webhook with timeout to prevent function timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const webhookResponse = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "BLOM-Cosmetics-Reviews/1.0"
        },
        body: JSON.stringify(webhookPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const webhookResponseText = await webhookResponse.text();
      console.log('📥 WEBHOOK RESPONSE:', {
        status: webhookResponse.status,
        statusText: webhookResponse.statusText,
        body: webhookResponseText
      });

      if (!webhookResponse.ok) {
        console.warn(`❌ Webhook responded with status ${webhookResponse.status}: ${webhookResponseText}`);
      } else {
        console.log('✅ WEBHOOK SUCCESS: Review payload sent successfully');
      }
    } catch (webhookError: any) {
      console.error('❌ Webhook failed (timeout or network error):', webhookError);
      // Don't fail the review submission if webhook fails, but log it clearly
    }

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true, id: data.id }) };
  } catch (err: any) {
    console.error("Reviews intake exception:", err);
    return { statusCode: 500, headers: CORS, body: `reviews-intake exception: ${err?.message || "unknown"}` };
  }
};
