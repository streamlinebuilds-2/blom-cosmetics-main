import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Facebook, MessageSquarePlus, Quote, Star } from 'lucide-react';
import { LeaveReviewModal, type SubmittedReview } from './LeaveReviewModal';

const GOOGLE_REVIEWS_URL =
  'https://www.google.com/maps/search/?api=1&query=BLOM%20Cosmetics%20South%20Africa';
const FACEBOOK_REVIEWS_URL =
  'https://www.facebook.com/profile.php?id=61581058185006&sk=reviews';

const platforms = [
  {
    name: 'Google',
    reviews: 7,
    href: GOOGLE_REVIEWS_URL,
    mark: <span className="review-platform__google" aria-hidden="true">G</span>,
  },
  {
    name: 'Facebook',
    reviews: 6,
    href: FACEBOOK_REVIEWS_URL,
    mark: <Facebook aria-hidden="true" />,
  },
];

const reviewHighlights = [
  {
    quote: 'Their top coat is amazing—it lasts forever and leaves my nails looking salon fresh.',
    name: 'Karabo Ofentse Ntsoelengoe',
    detail: '5/5 customer testimonial',
    href: GOOGLE_REVIEWS_URL,
    photo: null as string | null,
  },
  {
    quote: 'The scent is warm and subtle, and it leaves my cuticles feeling soft, hydrated and healthy.',
    name: 'Shenike Olivier',
    detail: '5/5 customer testimonial',
    href: GOOGLE_REVIEWS_URL,
    photo: null as string | null,
  },
  {
    quote: 'The consistency is perfectly balanced, making application smooth, easy to sculpt and beginner-friendly.',
    name: 'Christine de Beer',
    detail: '5/5 customer testimonial',
    href: FACEBOOK_REVIEWS_URL,
    photo: null as string | null,
  },
];

const toHighlight = (review: SubmittedReview) => ({
  quote: review.review_text,
  name: review.name,
  detail: review.products_mentioned ? `Loved: ${review.products_mentioned}` : 'BLOM customer review',
  href: null as string | null,
  photo: review.photo_url,
});

export const Testimonials: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState<SubmittedReview[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/.netlify/functions/site-reviews-list')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.ok && Array.isArray(data.reviews)) {
          setSubmitted(data.reviews);
        }
      })
      .catch(() => {
        // Homepage still works with the curated quotes if this fails.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const allReviews = [...submitted.map(toHighlight), ...reviewHighlights];
  const review = allReviews[current] ?? allReviews[0];

  const handleSubmitted = (newReview: SubmittedReview) => {
    setSubmitted((previous) => [newReview, ...previous]);
    setCurrent(0);
  };

  return (
    <section className="home-reviews" aria-labelledby="reviews-heading">
      <div className="home-shell">
        <header className="home-reviews__header">
          <div>
            <p className="home-eyebrow">What our customers say</p>
            <h2 id="reviews-heading">Five-star love for BLOM.</h2>
          </div>
          <div className="home-reviews__header-aside">
            <div className="home-reviews__rating" aria-label="5 out of 5 stars">
              {[0, 1, 2, 3, 4].map((star) => <Star key={star} fill="currentColor" aria-hidden="true" />)}
              <strong>5.0</strong>
            </div>
            <button type="button" className="home-button home-button--secondary" onClick={() => setShowForm(true)}>
              <MessageSquarePlus aria-hidden="true" /> Leave a review
            </button>
          </div>
        </header>

        <div className="home-reviews__stage">
          <article className="home-review-quote">
            <Quote aria-hidden="true" />
            <p>{review.quote}</p>
            <footer>
              <span className="home-review-quote__identity">
                {review.photo && (
                  <img className="home-review-quote__avatar" src={review.photo} alt="" aria-hidden="true" />
                )}
                <span>
                  <strong>{review.name}</strong>
                  <small>{review.detail}</small>
                </span>
              </span>
              {review.href && (
                <a href={review.href} target="_blank" rel="noopener noreferrer">
                  Read reviews <ArrowUpRight aria-hidden="true" />
                </a>
              )}
            </footer>
          </article>

          <div className="home-reviews__controls">
            <button
              type="button"
              aria-label="Previous review"
              onClick={() => setCurrent((value) => (value - 1 + allReviews.length) % allReviews.length)}
            >
              <ArrowLeft aria-hidden="true" />
            </button>
            <span>{current + 1} / {allReviews.length}</span>
            <button
              type="button"
              aria-label="Next review"
              onClick={() => setCurrent((value) => (value + 1) % allReviews.length)}
            >
              <ArrowRight aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="home-reviews__platforms">
          {platforms.map((platform) => (
            <a
              className="review-platform"
              href={platform.href}
              target="_blank"
              rel="noopener noreferrer"
              key={platform.name}
            >
              <span className="review-platform__mark">{platform.mark}</span>
              <span>
                <strong>{platform.name}</strong>
                <small>5.0 from {platform.reviews} reviews</small>
              </span>
              <ArrowUpRight aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>

      {showForm && (
        <LeaveReviewModal onClose={() => setShowForm(false)} onSubmitted={handleSubmitted} />
      )}
    </section>
  );
};
