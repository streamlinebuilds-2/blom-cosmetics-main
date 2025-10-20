import React from 'react';
import { fetchApprovedReviews } from '../../lib/approvedReviews';

export function ProductReviews({ productSlug }: { productSlug: string }) {
  const [rows, setRows] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>('');
  const [ratingFilter, setRatingFilter] = React.useState<number | null>(null);
  const [sort, setSort] = React.useState<'newest'|'highest'|'lowest'>('newest');

  React.useEffect(() => {
    setLoading(true);
    fetchApprovedReviews(productSlug)
      .then(setRows)
      .catch((e) => setError(e.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [productSlug]);

  if (loading) return <p className="text-gray-500">Loading reviews…</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  let list = rows.slice();
  if (ratingFilter) list = list.filter(r => Number(r.rating || 0) === ratingFilter);
  if (sort === 'highest') list.sort((a,b)=>Number(b.rating||0)-Number(a.rating||0));
  if (sort === 'lowest') list.sort((a,b)=>Number(a.rating||0)-Number(b.rating||0));
  if (sort === 'newest') list.sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime());

  if (!list.length) return <p className="text-gray-600">No reviews found for this filter.</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Filter:</span>
          <select value={ratingFilter ?? 0} onChange={(e)=>setRatingFilter(Number(e.target.value)||null)} className="border rounded px-2 py-1 text-sm">
            <option value={0}>All ratings</option>
            {[5,4,3,2,1].map(n=> <option key={n} value={n}>{n}★</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort:</span>
          <select value={sort} onChange={(e)=>setSort(e.target.value as any)} className="border rounded px-2 py-1 text-sm">
            <option value="newest">Newest</option>
            <option value="highest">Highest</option>
            <option value="lowest">Lowest</option>
          </select>
        </div>
      </div>

      <ul className="space-y-4">
        {list.map((r: any, i: number) => (
          <li key={i} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <strong className="text-gray-900">{r.reviewer_name}</strong>
              <small className="text-gray-500">{new Date(r.created_at).toLocaleDateString()}</small>
            </div>
            {r.title && <div className="font-medium text-gray-900 mt-1">{r.title}</div>}
            <div className="text-gray-700 mt-1">{r.body}</div>
            {r.rating ? <div className="text-sm text-gray-500 mt-1">{r.rating}★</div> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}


