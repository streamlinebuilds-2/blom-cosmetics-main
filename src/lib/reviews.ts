export async function submitReview(form: {
  product_slug: string;
  reviewer_name: string;
  reviewer_email?: string;
  title?: string;
  body: string;
  rating?: number;
  photos?: string[];
  is_verified_buyer?: boolean;
  order_id?: string;
}) {
  const url = 'https://blom-admin-1.netlify.app/.netlify/functions/reviews-intake';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_id: form.product_slug, // product_slug can be used as product_id
      name: form.reviewer_name,
      rating: form.rating || 0,
      title: form.title,
      body: form.body
    })
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Failed to submit review');
  }
  try { return await res.json(); } catch { return { ok: true }; }
}


