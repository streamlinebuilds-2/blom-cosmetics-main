import { Handler } from "@netlify/functions";
import fetch from "node-fetch";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

type InBody = {
  product_id?: string;   // may be slug
  product_slug?: string; // alt
  name?: string;
  reviewer_name?: string;
  email?: string;
  reviewer_email?: string;
  rating?: number | string;
  title?: string;
  comment?: string;
  body?: string;
};

const isUUID = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return { statusCode: 500, body: "Missing Supabase envs" };
  }

  let text = event.body || "";
  if (event.isBase64Encoded && text) text = Buffer.from(text, "base64").toString("utf8");

  let inBody: InBody = {};
  try {
    inBody = JSON.parse(text || "{}");
  } catch (e) {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  // DEBUG: log what the function actually sees
  console.log("reviews-intake parsed body:", inBody);

  const productIdRaw = (inBody.product_id || inBody.product_slug || "").toString().trim();
  const reviewer_name = (inBody.reviewer_name || inBody.name || "").toString().trim();
  const reviewer_email = (inBody.reviewer_email || inBody.email || "").toString().trim();
  const rating = Number(inBody.rating ?? 0);
  const title = (inBody.title || "").toString().trim();
  const comment = (inBody.comment || inBody.body || "").toString().trim();

  // Guardrails with clear messages
  if (!productIdRaw) return { statusCode: 400, body: "product_id (or product_slug) is required" };
  if (!reviewer_name) return { statusCode: 400, body: "name is required" };
  if (!reviewer_email) return { statusCode: 400, body: "email is required" };
  if (!(rating >= 1 && rating <= 5)) return { statusCode: 400, body: "rating must be 1..5" };

  // Resolve slug -> UUID
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
    if (!prodRes.ok) return { statusCode: 500, body: `Product lookup failed: ${await prodRes.text()}` };
    const rows = await prodRes.json();
    if (!rows?.length) return { statusCode: 400, body: `Unknown product slug: ${productIdRaw}` };
    product_id = rows[0].id;
  }

  // Insert
  const insertRows = [{
    product_id,
    reviewer_name,
    reviewer_email,
    rating,
    title: title || null,
    comment: comment || null,
    status: "pending",
    source: "storefront",
  }];

  const insRes = await fetch(`${SUPABASE_URL}/rest/v1/product_reviews`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(insertRows),
  });

  if (!insRes.ok) {
    const t = await insRes.text();
    console.error("DB insert failed:", t);
    return { statusCode: 500, body: `DB insert failed: ${t}` };
  }

  const [review] = await insRes.json();
  return { statusCode: 200, body: JSON.stringify({ ok: true, review }) };
};
