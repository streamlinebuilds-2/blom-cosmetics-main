import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Facebook, Quote, Star } from 'lucide-react';

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
  },
  {
    quote: 'The scent is warm and subtle, and it leaves my cuticles feeling soft, hydrated and healthy.',
    name: 'Shenike Olivier',
    detail: '5/5 customer testimonial',
    href: GOOGLE_REVIEWS_URL,
  },
  {
    quote: 'The consistency is perfectly balanced, making application smooth, easy to sculpt and beginner-friendly.',
    name: 'Christine de Beer',
    detail: '5/5 customer testimonial',
    href: FACEBOOK_REVIEWS_URL,
  },
];

export const Testimonials: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const review = reviewHighlights[current];

  return (
    <section className="home-reviews" aria-labelledby="reviews-heading">
      <div className="home-shell">
        <header className="home-reviews__header">
          <div>
            <p className="home-eyebrow">What our customers say</p>
            <h2 id="reviews-heading">Five-star love for BLOM.</h2>
          </div>
          <div className="home-reviews__rating" aria-label="5 out of 5 stars">
            {[0, 1, 2, 3, 4].map((star) => <Star key={star} fill="currentColor" aria-hidden="true" />)}
            <strong>5.0</strong>
          </div>
        </header>

        <div className="home-reviews__stage">
          <article className="home-review-quote">
            <Quote aria-hidden="true" />
            <p>{review.quote}</p>
            <footer>
              <span>
                <strong>{review.name}</strong>
                <small>{review.detail}</small>
              </span>
              <a href={review.href} target="_blank" rel="noopener noreferrer">
                Read reviews <ArrowUpRight aria-hidden="true" />
              </a>
            </footer>
          </article>

          <div className="home-reviews__controls">
            <button
              type="button"
              aria-label="Previous review platform"
              onClick={() => setCurrent((value) => (value - 1 + reviewHighlights.length) % reviewHighlights.length)}
            >
              <ArrowLeft aria-hidden="true" />
            </button>
            <span>{current + 1} / {reviewHighlights.length}</span>
            <button
              type="button"
              aria-label="Next review platform"
              onClick={() => setCurrent((value) => (value + 1) % reviewHighlights.length)}
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
    </section>
  );
};
