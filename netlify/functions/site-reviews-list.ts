// netlify/functions/site-reviews-list.ts
// Public read of approved homepage customer reviews, newest first.
import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const s = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const handler: Handler = async (e) => {
  if (e.httpMethod === "OPTIONS") return { statusCode: 200, headers: CORS, body: "ok" };
  if (e.httpMethod !== "GET") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ ok: false, error: "Method Not Allowed" }) };
  }

  const { data, error } = await s
    .from("site_reviews")
    .select("id, name, review_text, photo_url, products_mentioned, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(24);

  if (error) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ ok: false, error: error.message }) };
  }

  return {
    statusCode: 200,
    headers: { ...CORS, "Content-Type": "application/json" },
    body: JSON.stringify({ ok: true, reviews: data ?? [] }),
  };
};
