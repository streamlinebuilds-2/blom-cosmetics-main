import React from 'react';
import { fetchApprovedReviews } from '../../lib/approvedReviews';

export function ProductReviews({ productSlug }: { productSlug: string }) {
  const [rows, setRows] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>('');

  React.useEffect(() => {
    setLoading(true);
    fetchApprovedReviews(productSlug)
      .then(setRows)
      .catch((e) => setError(e.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [productSlug]);

  if (loading) return <p className="text-gray-500">Loading reviews…</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!rows.length) return <p className="text-gray-600">Be the first to review this product.</p>;

  return (
    <ul className="space-y-4">
      {rows.map((r: any, i: number) => (
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
  );
}


