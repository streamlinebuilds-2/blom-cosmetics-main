import React from 'react';
import { submitReview } from '../../lib/reviews';

export function ReviewForm({ productSlug }: { productSlug: string }) {
  const [status, setStatus] = React.useState<'idle'|'saving'|'done'|'error'>('idle');
  const [open, setOpen] = React.useState(false);

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
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center px-5 py-2 rounded-full font-semibold text-white transition-all bg-pink-400 hover:bg-pink-400 hover:shadow-lg active:scale-95"
      >
        Add a review
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-lg rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">Write a review</h4>
              <button onClick={()=>setOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={onSubmit} className="space-y-3">
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
              <div className="flex items-center gap-2">
                <button type="submit" disabled={status==='saving'} className="inline-flex items-center px-5 py-2 rounded-full font-semibold text-white transition-all bg-pink-400 hover:bg-pink-400 hover:shadow-lg active:scale-95">
                  {status==='saving'?'Submitting...':'Submit review'}
                </button>
                <button type="button" onClick={()=>setOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
              </div>
              {status==='done' && <p className="text-green-600 text-sm">Thanks! Your review is awaiting approval.</p>}
              {status==='error' && <p className="text-red-600 text-sm">Something went wrong. Please try again.</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


