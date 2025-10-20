import React from 'react';
import { submitReview } from '../../lib/reviews';

export function ReviewForm({ productSlug }: { productSlug: string }) {
  const [status, setStatus] = React.useState<'idle'|'saving'|'done'|'error'>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      setStatus('saving');
      await submitReview({
        product_slug: productSlug,
        reviewer_name: String(fd.get('name') || 'Anonymous'),
        reviewer_email: String(fd.get('email') || ''),
        title: String(fd.get('title') || ''),
        body: String(fd.get('body') || ''),
        rating: Number(fd.get('rating') || 0),
        is_verified_buyer: Boolean(fd.get('verified'))
      });
      setStatus('done');
      e.currentTarget.reset();
    } catch {
      setStatus('error');
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 bg-white rounded-lg border border-gray-200 p-4">
      <div className="grid md:grid-cols-2 gap-3">
        <input name="name" placeholder="Your name" className="border rounded px-3 py-2" />
        <input name="email" type="email" placeholder="Email (optional)" className="border rounded px-3 py-2" />
      </div>
      <input name="title" placeholder="Title (optional)" className="border rounded px-3 py-2 w-full" />
      <textarea name="body" placeholder="Your review" required className="border rounded px-3 py-2 w-full min-h-[120px]" />
      <div className="flex items-center gap-3">
        <select name="rating" defaultValue="0" className="border rounded px-3 py-2">
          <option value="0">No rating</option>
          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}★</option>)}
        </select>
        <label className="text-sm text-gray-600"><input type="checkbox" name="verified" className="mr-2" /> I’m a verified buyer</label>
      </div>
      <button type="submit" disabled={status==='saving'} className="inline-flex items-center px-5 py-2 rounded-full font-semibold text-white transition-all bg-pink-400 hover:bg-pink-400 hover:shadow-lg active:scale-95">
        {status==='saving'?'Submitting...':'Submit review'}
      </button>
      {status==='done' && <p className="text-green-600 text-sm">Thanks! Your review is awaiting approval.</p>}
      {status==='error' && <p className="text-red-600 text-sm">Something went wrong. Please try again.</p>}
    </form>
  );
}


