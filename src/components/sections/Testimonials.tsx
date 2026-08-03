import React from 'react';
import { ArrowUpRight, Facebook, Star } from 'lucide-react';

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

export const Testimonials: React.FC = () => (
  <section className="home-reviews" aria-labelledby="reviews-heading">
    <div className="home-shell home-reviews__layout">
      <div className="home-reviews__intro">
        <p className="home-reviews__kicker">Loved by artists and customers</p>
        <h2 id="reviews-heading">Five stars, across every platform.</h2>
        <p>
          Thirteen five-star reviews from customers and nail professionals across Google
          and Facebook.
        </p>
        <div className="home-reviews__rating" aria-label="5 out of 5 stars">
          {[0, 1, 2, 3, 4].map((star) => <Star key={star} fill="currentColor" aria-hidden="true" />)}
          <strong>5.0</strong>
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
