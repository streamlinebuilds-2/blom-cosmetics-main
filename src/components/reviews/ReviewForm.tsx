import React from 'react';
import { submitReview } from '../../lib/reviews';
import { OptimizedImage } from '../seo/OptimizedImage';

type ReviewFormProps = {
  productSlug: string;
  product?: { name: string; price?: number; compareAtPrice?: number; image?: string };
};

export function ReviewForm({ productSlug, product }: ReviewFormProps) {
  const [status, setStatus] = React.useState<'idle'|'saving'|'done'|'error'>('idle');
  const [open, setOpen] = React.useState(false);
  const [rating, setRating] = React.useState<number>(0);
  const [hoverRating, setHoverRating] = React.useState<number>(0);
  const [photos, setPhotos] = React.useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = React.useState<string[]>([]);
  const [errors, setErrors] = React.useState<{ body?: string; rating?: string }>(()=>({}));

  const CLOUD_NAME = 'dd89enrjz';
  const UPLOAD_PRESET = 'blom_unsigned';

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).slice(0, 3);
    setPhotos(files);
    setPhotoPreviews(files.map(f => URL.createObjectURL(f)));
  }

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', UPLOAD_PRESET);
    fd.append('folder', 'blom/reviews');
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, { method: 'POST', body: fd });
    const j = await res.json();
    if (!res.ok || j.error) throw new Error(j.error?.message || 'Upload failed');
    return j.secure_url as string;
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    // Basic validation
    const nextErrors: typeof errors = {};
    if (!fd.get('body')) nextErrors.body = 'Please share a few words about your experience';
    if (!rating) nextErrors.rating = 'Please select a star rating';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      setStatus('saving');
      // Upload photos (optional)
      const photoUrls: string[] = [];
      for (const p of photos) {
        // 5MB limit
        if (p.size > 5 * 1024 * 1024) continue;
        const url = await uploadToCloudinary(p);
        photoUrls.push(url);
      }

      await submitReview({
        product_slug: productSlug,
        reviewer_name: String(fd.get('name') || 'Anonymous'),
        reviewer_email: String(fd.get('email') || ''),
        title: String(fd.get('title') || ''),
        body: String(fd.get('body') || ''),
        rating,
        is_verified_buyer: Boolean(fd.get('verified')),
        order_id: String(fd.get('order_id') || ''),
        photos: photoUrls
      });

      setStatus('done');
      setPhotos([]);
      setPhotoPreviews([]);
      setRating(0);
      (e.target as HTMLFormElement).reset();
    } catch {
      setStatus('error');
    }
  }

  const Star: React.FC<{ index: number }> = ({ index }) => (
    <button
      type="button"
      aria-label={`${index} star`}
      onMouseEnter={() => setHoverRating(index)}
      onMouseLeave={() => setHoverRating(0)}
      onClick={() => setRating(index)}
      className="text-2xl focus:outline-none"
    >
      <span className={(hoverRating || rating) >= index ? 'text-yellow-400' : 'text-gray-300'}>★</span>
    </button>
  );

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center px-5 py-2 rounded-full font-semibold text-white transition-all bg-pink-400 hover:bg-pink-500 hover:shadow-lg active:scale-95"
      >
        Add a review
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-2xl rounded-2xl p-0 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h4 className="text-lg font-semibold">Write a review</h4>
              <button onClick={()=>setOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            {/* Product preview */}
            {product && (
              <div className="flex items-center gap-4 px-6 pt-5">
                <div className="w-16 h-16 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                  {product.image ? (
                    <OptimizedImage src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-xs text-gray-400">No image</div>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{product.name}</div>
                  {typeof product.price === 'number' && (
                    <div className="text-sm text-gray-600">
                      {product.compareAtPrice ? (
                        <>
                          <span className="line-through mr-2">R{product.compareAtPrice}</span>
                          <span className="font-semibold">R{product.price}</span>
                        </>
                      ) : (
                        <span className="font-semibold">R{product.price}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={onSubmit} className="px-6 pb-6 pt-4 space-y-4">
              {/* Star rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your rating</label>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => <Star key={i} index={i} />)}
                </div>
                {errors.rating && <p className="text-red-600 text-xs mt-1">{errors.rating}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <input name="name" placeholder="Your name" className="border rounded px-3 py-2" />
                <input name="email" type="email" placeholder="Email (optional)" className="border rounded px-3 py-2" />
              </div>
              <input name="order_id" placeholder="Order number (optional)" className="border rounded px-3 py-2 w-full" />
              <input name="title" placeholder="Title (optional)" className="border rounded px-3 py-2 w-full" />

              <div>
                <textarea name="body" placeholder="Share details about quality, feel, results…" required className="border rounded px-3 py-2 w-full min-h-[140px]" />
                {errors.body && <p className="text-red-600 text-xs mt-1">{errors.body}</p>}
              </div>

              {/* Photos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Add photos (up to 3)</label>
                <input type="file" accept="image/*" multiple onChange={onPhotoChange} className="block w-full text-sm text-gray-600" />
                {photoPreviews.length > 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {photoPreviews.map((src, i) => (
                      <img key={i} src={src} alt={`preview-${i}`} className="w-full h-20 object-cover rounded" />
                    ))}
                  </div>
                )}
              </div>

              <label className="text-sm text-gray-600 inline-flex items-center gap-2">
                <input type="checkbox" name="verified" className="mr-2" /> I’m a verified buyer
              </label>

              {/* Hidden rating field for compatibility */}
              <input type="hidden" name="rating" value={rating} />

              <div className="flex items-center gap-2 pt-2">
                <button type="submit" disabled={status==='saving'} className="inline-flex items-center px-5 py-2 rounded-full font-semibold text-white transition-all bg-pink-400 hover:bg-pink-500 hover:shadow-lg active:scale-95">
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


