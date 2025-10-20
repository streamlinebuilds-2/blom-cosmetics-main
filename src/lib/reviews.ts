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
  const url = 'https://dockerfile-1n82.onrender.com/webhook/reviews-intake';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...form,
      created_at: new Date().toISOString()
    })
  });
  if (!res.ok) throw new Error('Failed to submit review');
  try { return await res.json(); } catch { return { ok: true }; }
}


