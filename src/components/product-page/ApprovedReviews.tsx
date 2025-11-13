import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Star } from 'lucide-react';

interface Review {
  id: string;
  reviewer_name: string;
  title: string | null;
  body: string;
  rating: number;
  images: string[];
  created_at: string;
  is_verified_buyer: boolean;
}

interface ApprovedReviewsProps {
  productSlug: string;
}

export const ApprovedReviews: React.FC<ApprovedReviewsProps> = ({ productSlug }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        const { data, error } = await supabase
          .from('product_reviews')
          .select('id, reviewer_name, title, body, rating, images, created_at, is_verified_buyer')
          .eq('product_slug', productSlug)
          .eq('status', 'approved')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setReviews(data || []);
      } catch (err) {
        console.error('Failed to load reviews:', err);
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, [productSlug]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            className="w-5 h-5"
            fill={i <= rating ? '#fbbf24' : 'none'}
            stroke={i <= rating ? '#fbbf24' : '#d1d5db'}
          />
        ))}
      </div>
    );
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#FF74A4] border-r-transparent"></div>
        <p className="mt-4 text-gray-500">Loading reviews...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="py-12 text-center bg-gradient-to-br from-[#CEE5FF]/30 to-[#FF74A4]/10 rounded-2xl">
        <p className="text-gray-700 mb-2 text-lg font-semibold">No reviews yet</p>
        <p className="text-sm text-gray-500">Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="bg-gradient-to-br from-[#CEE5FF]/40 to-[#FF74A4]/20 rounded-2xl p-6 md:p-8">
        <h3 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">Customer Reviews</h3>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="text-center sm:text-left">
            <div className="text-5xl md:text-6xl font-bold text-gray-900">{avgRating}</div>
            <div className="mt-2">
              {renderStars(Math.round(parseFloat(avgRating)))}
            </div>
          </div>
          <div className="text-center sm:text-left sm:pt-4">
            <p className="text-gray-700 font-medium">
              Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </p>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map(review => (
          <div
            key={review.id}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-3">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <span className="font-semibold text-gray-900 text-lg">{review.reviewer_name}</span>
                  {review.is_verified_buyer && (
                    <span className="inline-flex items-center text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium border border-green-200">
                      ✓ Verified Buyer
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {renderStars(review.rating)}
                </div>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(review.created_at).toLocaleDateString('en-ZA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>

            {review.title && (
              <h4 className="font-semibold text-lg mb-3 text-gray-900">{review.title}</h4>
            )}

            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">{review.body}</p>

            {review.images && review.images.length > 0 && (
              <div className="flex gap-3 flex-wrap">
                {review.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Review photo ${idx + 1}`}
                    className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-90 hover:scale-105 transition-all duration-200 border border-gray-200"
                    onClick={() => window.open(img, '_blank')}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
