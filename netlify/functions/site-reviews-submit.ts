// netlify/functions/site-reviews-submit.ts
// Public intake for homepage "customer reviews" (name, review text, optional photo,
// optional products mentioned). Distinct from the per-product review pipeline in
// reviews-intake.ts, which requires a product_slug and star rating.
import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const SB_URL = process.env.SUPABASE_URL!;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = "assets";

const s = createClient(SB_URL, SB_KEY);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const MAX_NAME_LEN = 80;
const MAX_REVIEW_LEN = 600;
const MAX_PRODUCTS_LEN = 150;
const MAX_PHOTO_BYTES = 4 * 1024 * 1024; // 4MB decoded

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function json(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: { ...CORS, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

async function uploadPhoto(dataUrl: string): Promise<string> {
  const match = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/.exec(dataUrl);
  if (!match) throw new Error("Photo must be a base64 image data URL");

  const mime = match[1].toLowerCase();
  const ext = MIME_TO_EXT[mime];
  if (!ext) throw new Error("Unsupported photo type. Use JPG, PNG, WEBP or GIF");

  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length > MAX_PHOTO_BYTES) throw new Error("Photo is too large (max 4MB)");

  const filename = `site-reviews/${crypto.randomUUID()}.${ext}`;

  const res = await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${filename}`, {
    method: "POST",
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      "Content-Type": mime,
      "x-upsert": "true",
    },
    body: buffer,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Photo upload failed: ${errText}`);
  }

  return `${SB_URL}/storage/v1/object/public/${BUCKET}/${filename}`;
}

export const handler: Handler = async (e) => {
  if (e.httpMethod === "OPTIONS") return { statusCode: 200, headers: CORS, body: "ok" };
  if (e.httpMethod !== "POST") return json(405, { ok: false, error: "Method Not Allowed" });

  try {
    if (!e.body) return json(400, { ok: false, error: "Empty body" });
    const payload = JSON.parse(e.body);

    const name = String(payload.name ?? "").trim().slice(0, MAX_NAME_LEN);
    const review_text = String(payload.review_text ?? "").trim().slice(0, MAX_REVIEW_LEN);
    const products_mentioned = payload.products_mentioned
      ? String(payload.products_mentioned).trim().slice(0, MAX_PRODUCTS_LEN)
      : null;
    const photo = payload.photo ? String(payload.photo) : null;

    if (!name) return json(400, { ok: false, error: "Please enter your name" });
    if (!review_text) return json(400, { ok: false, error: "Please write your review" });

    let photo_url: string | null = null;
    if (photo) {
      try {
        photo_url = await uploadPhoto(photo);
      } catch (uploadError: any) {
        return json(400, { ok: false, error: uploadError.message || "Could not upload photo" });
      }
    }

    const { data, error } = await s
      .from("site_reviews")
      .insert({ name, review_text, photo_url, products_mentioned, status: "approved" })
      .select("id, name, review_text, photo_url, products_mentioned, created_at")
      .single();

    if (error) return json(500, { ok: false, error: error.message });

    return json(200, { ok: true, review: data });
  } catch (err: any) {
    return json(500, { ok: false, error: err?.message || "Unexpected error" });
  }
};
