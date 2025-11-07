import { Handler } from "@netlify/functions";
import fetch from "node-fetch";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const N8N_REVIEWS_WEBHOOK = process.env.N8N_REVIEWS_WEBHOOK || "";

type InBody = {
  // storefront may send either the "friendly" names OR already-mapped names:
  product_id?: string;         // may be slug ("cuticle-oil") or uuid
  product_slug?: string;       // alt key some pages send
  name?: string;               // storefront
  reviewer_name?: string;      // server/DB
  email?: string;              // storefront
  reviewer_email?: string;     // server/DB
  rating?: number | string;
  title?: string;
  comment?: string;            // preferred
  body?: string;               // some pages used "body"
};

const isUUID = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);

const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  // env guards
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return { statusCode: 500, body: "Missing SUPABASE_URL or SUPABASE_SERVICE_KEY" };
  }

  // enforce JSON parsing even if Content-Type is wrong
  let bodyText = event.body || "";
  if (!bodyText && event.isBase64Encoded && event.body) {
    bodyText = Buffer.from(event.body, "base64").toString("utf8");
  }

  let inBody: InBody;
  try {
    inBody = JSON.parse(bodyText || "{}");
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  // Normalize inputs (accept both old and new keys)
  const productIdRaw =
    (inBody.product_id || inBody.product_slug || "").toString().trim();
  const reviewer_name = (inBody.reviewer_name || inBody.name || "").toString().trim();
  const reviewer_email = (inBody.reviewer_email || inBody.email || "").toString().trim();
  const rating = Number(inBody.rating ?? 0);
  const title = (inBody.title || "").toString().trim();
  const comment = (inBody.comment || inBody.body || "").toString().trim();

  // Validate
  if (!productIdRaw) return { statusCode: 400, body: "product_id (or product_slug) is required" };
  if (!reviewer_name) return { statusCode: 400, body: "name is required" };
  if (!reviewer_email) return { statusCode: 400, body: "email is required" };
  if (!(rating >= 1 && rating <= 5)) return { statusCode: 400, body: "rating must be 1..5" };

  // Resolve product_id (slug -> uuid)
  let product_id = productIdRaw;
  if (!isUUID(productIdRaw)) {
    const prodRes = await fetch(
      `${SUPABASE_URL}/rest/v1/products?slug=eq.${encodeURIComponent(productIdRaw)}&select=id`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          Prefer: "return=representation",
        },
      }
    );
    if (!prodRes.ok) {
      const t = await prodRes.text();
      return { statusCode: 500, body: `Product lookup failed: ${t}` };
    }
    const rows = await prodRes.json();
    if (!Array.isArray(rows) || !rows.length) {
      return { statusCode: 400, body: `Unknown product slug: ${productIdRaw}` };
    }
    product_id = rows[0].id;
  }

  // Insert into product_reviews
  const insertBody = [
    {
      product_id,
      reviewer_name,
      reviewer_email,
      rating,
      title: title || null,
      comment: comment || null,
      status: "pending",
      source: "storefront",
    },
  ];

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
    const t = await insRes.text();
    return { statusCode: 500, body: `DB insert failed: ${t}` };
  }
  const reviews = await insRes.json();
  const review = Array.isArray(reviews) ? reviews[0] : reviews;

  // Optional: mirror to n8n webhook
  if (N8N_REVIEWS_WEBHOOK) {
    try {
      await fetch(N8N_REVIEWS_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "review_intake", review }),
      });
    } catch (e) {
      console.warn("n8n mirror failed", e);
    }
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true, review }) };
};

export { handler };
