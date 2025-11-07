import { Handler } from "@netlify/functions";
import fetch from "node-fetch";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

// Optional mirror destinations (leave undefined if not used)
const N8N_REVIEWS_WEBHOOK = process.env.N8N_REVIEWS_WEBHOOK; // e.g. https://dockerfile-1n82.onrender.com/webhook/reviews-intake
const AIRTABLE_REVIEWS_URL = process.env.AIRTABLE_REVIEWS_URL;
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;

type InBody = {
  product_id?: string;        // slug like "cuticle-oil" or uuid
  name?: string;              // from storefront
  email?: string;
  rating?: number;            // 1..5
  title?: string;
  comment?: string;           // review body
  body?: string;              // review body (matches original)
};

const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // Guard envs
  for (const [k, v] of Object.entries({ SUPABASE_URL, SUPABASE_SERVICE_KEY })) {
    if (!v) return { statusCode: 500, body: `Missing env: ${k}` };
  }

  let payload: InBody;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  // Normalize + validate
  const product_id_raw = (payload.product_id || "").trim();
  const reviewer_name = (payload.name || "").trim();
  const reviewer_email = (payload.email || "").trim();
  const rating = Number(payload.rating ?? 0);
  const title = (payload.title || "").trim();
  const comment = (payload.comment || payload.body || "").trim();

  // Required checks
  if (!product_id_raw) return { statusCode: 400, body: "product_id is required" };
  if (!reviewer_name || reviewer_name.length === 0) return { statusCode: 400, body: "name is required and cannot be empty" };
  if (!reviewer_email || reviewer_email.length === 0) return { statusCode: 400, body: "email is required and cannot be empty" };
  if (!(rating >= 1 && rating <= 5)) return { statusCode: 400, body: "rating must be 1..5" };

  // Resolve product_id: if slug provided, map to UUID
  let product_id = product_id_raw;

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(product_id_raw);
  if (!isUUID) {
    // assume slug; look up product UUID
    const prodRes = await fetch(`${SUPABASE_URL}/rest/v1/products?slug=eq.${encodeURIComponent(product_id_raw)}&select=id`, {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        Prefer: "return=representation",
      },
    });
    if (!prodRes.ok) {
      const txt = await prodRes.text();
      return { statusCode: 500, body: `Product lookup failed: ${txt}` };
    }
    const rows = await prodRes.json();
    if (!Array.isArray(rows) || !rows.length) {
      return { statusCode: 400, body: `Unknown product slug: ${product_id_raw}` };
    }
    product_id = rows[0].id;
  }

  // Insert review (status = 'pending' for moderation)
  const insertBody = [{
    product_id,
    reviewer_name,
    reviewer_email,
    rating,
    title,
    comment,
    status: "pending",          // adjust if your schema uses different default
    source: "storefront",       // optional metadata column
  }];

  const insRes = await fetch(`${SUPABASE_URL}/rest/v1/product_reviews`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(insertBody),
  });

  if (!insRes.ok) {
    const txt = await insRes.text();
    return { statusCode: 500, body: `DB insert failed: ${txt}` };
  }
  const reviews = await insRes.json();
  const review = Array.isArray(reviews) ? reviews[0] : reviews;

  // Mirror to n8n webhook (optional)
  if (N8N_REVIEWS_WEBHOOK) {
    try {
      await fetch(N8N_REVIEWS_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "review_intake",
          review,
        }),
      });
    } catch (e) {
      // don't fail the request if mirror errors
      console.warn("n8n mirror failed", e);
    }
  }

  // Mirror to Airtable (optional)
  if (AIRTABLE_REVIEWS_URL && AIRTABLE_API_KEY) {
    try {
      await fetch(AIRTABLE_REVIEWS_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            Product: product_id_raw,
            Name: reviewer_name,
            Email: reviewer_email,
            Rating: rating,
            Title: title || null,
            Comment: comment || null,
            Status: "Pending",
            Source: "Storefront",
          },
        }),
      });
    } catch (e) {
      console.warn("Airtable mirror failed", e);
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true, review }),
  };
};

export { handler };
