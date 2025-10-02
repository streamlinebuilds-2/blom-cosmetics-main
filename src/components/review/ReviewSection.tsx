import React, { useState } from 'react';
import { Star, MessageSquare, ThumbsUp, Calendar, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { ReviewForm } from './ReviewForm';

interface Review {
  id: string;
  name: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verified: boolean;
  helpful: number;
}

interface ReviewSectionProps {
  productName: string;
  productImage: string;
  productSlug: string;
  averageRating: number;
  reviewCount: number;
  reviews: Review[];
  onReviewSubmit: (review: any) => void;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({
  productName,
  productImage,
  productSlug,
  averageRating,
  reviewCount,
  reviews,
  onReviewSubmit
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Filter and sort reviews
  const filteredReviews = selectedRating 
    ? reviews.filter(review => review.rating === selectedRating)
    : reviews;

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'oldest':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      default:
        return 0;
    }
  });

  const displayedReviews = showAllReviews ? sortedReviews : sortedReviews.slice(0, 3);

  const handleReviewSubmit = (reviewData: any) => {
    onReviewSubmit(reviewData);
    setShowReviewForm(false);
  };

  return (
    <section className="section-padding">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Customer Reviews</h2>
            <div className="flex items-center gap-4 mt-6 mb-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-7 w-7 ${
                        i < Math.floor(averageRating)
                          ? 'text-primary-blue fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {averageRating.toFixed(1)} out of 5
                </span>
              </div>
              <span className="text-gray-500 text-lg">
                Based on {reviewCount} review{reviewCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <Button
            onClick={() => setShowReviewForm(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <MessageSquare className="h-5 w-5" />
            Write a Review
          </Button>
        </div>

        {/* Rating Summary & Breakdown */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm border border-gray-100">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-6xl font-bold text-gray-900 mb-6">{averageRating.toFixed(1)}</div>
              <div className="flex items-center justify-center gap-1 py-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-8 w-8 ${
                      i < Math.floor(averageRating)
                        ? 'text-blue-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-600 mt-4">Based on {reviewCount} review{reviewCount !== 1 ? 's' : ''}</p>
            </div>

            {/* Star Rating Breakdown */}
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter(r => r.rating === star).length;
                const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
                
                return (
                  <div key={star} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12">
                      <span className="text-sm font-medium text-gray-700">{star}★</span>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-pink-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          {/* Star Rating Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedRating(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedRating === null
                  ? 'bg-pink-400 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {[5, 4, 3, 2, 1].map((star) => (
              <button
                key={star}
                onClick={() => setSelectedRating(star)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedRating === star
                    ? 'bg-pink-400 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {star}★
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none bg-white border border-gray-300 rounded-full px-4 py-2 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {displayedReviews.length > 0 ? (
            displayedReviews.map((review) => (
              <Card key={review.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 mt-1">
                        <div className="flex items-center gap-1 py-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${
                                i < review.rating
                                  ? 'text-primary-blue fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-semibold text-gray-900">{review.name}</span>
                        {review.verified && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(review.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>
                  
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-pink-400 transition-colors">
                      <ThumbsUp className="h-4 w-4" />
                      Helpful ({review.helpful})
                    </button>
                    <button className="text-sm text-gray-500 hover:text-pink-400 transition-colors">
                      Report
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-600 mb-6">Be the first to share your experience with this product!</p>
              <Button
                onClick={() => setShowReviewForm(true)}
                className="bg-pink-400 hover:bg-pink-500 text-white font-semibold px-6 py-3 rounded-xl"
              >
                Write the First Review
              </Button>
            </div>
          )}
        </div>

        {/* Load More Reviews */}
        {reviews.length > 3 && (
          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="px-8 py-3 rounded-xl border-2 border-gray-300 hover:border-pink-400 hover:text-pink-400 transition-all"
            >
              {showAllReviews ? 'Show Less' : `Show All ${reviewCount} Reviews`}
            </Button>
          </div>
        )}

        {/* Review Form Modal */}
        {showReviewForm && (
          <ReviewForm
            productName={productName}
            productImage={productImage}
            productSlug={productSlug}
            onClose={() => setShowReviewForm(false)}
            onSubmit={handleReviewSubmit}
          />
        )}
      </div>
    </section>
  );
};
