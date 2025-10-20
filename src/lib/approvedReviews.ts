export async function fetchApprovedReviews(product_slug: string) {
  const base = (import.meta as any).env.VITE_SUPABASE_URL;
  const key = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
  if (!base || !key) throw new Error('Supabase env missing');

  const url = `${base}/rest/v1/product_reviews` +
              `?select=reviewer_name,title,body,rating,created_at` +
              `&product_slug=eq.${encodeURIComponent(product_slug)}` +
              `&order=created_at.desc`;
  const res = await fetch(url, {
    headers: { apikey: key, Authorization: `Bearer ${key}` }
  });
  if (!res.ok) throw new Error('Failed to load reviews');
  return res.json();
}


