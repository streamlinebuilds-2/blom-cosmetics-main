import React, { useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';
import { cartStore } from '../../lib/cart';

interface BestSellerCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  shortDescription: string;
  image: string;
  inStock?: boolean;
  badges?: string[];
}

export const BestSellerCard: React.FC<BestSellerCardProps> = ({
  id,
  name,
  slug,
  price,
  compareAtPrice,
  shortDescription,
  image,
  inStock = true,
  badges = []
}) => {
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const shimmerContainer = card.querySelector('.shimmer-container');
    if (!shimmerContainer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Trigger shimmer animation on mobile when card comes into view
            shimmerContainer.classList.add('shimmer-triggered');
            
            // Remove class after animation completes to allow re-triggering
            setTimeout(() => {
              shimmerContainer.classList.remove('shimmer-triggered');
            }, 2000);
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    observer.observe(card);

    return () => observer.disconnect();
  }, []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!inStock) return;
    
    cartStore.addItem({
      id: `item_${Date.now()}`,
      productId: slug,
      name,
      price,
      image
    });
    
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleCardClick = () => {
    window.location.href = `/products/${slug}`;
  };

  const formatPrice = (price: number) => `R${price.toFixed(2)}`;

  return (
    <article 
      ref={cardRef}
      className="best-seller-card group cursor-pointer bg-white rounded-[18px] overflow-hidden relative transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
      style={{ boxShadow: '0 10px 30px rgba(15,23,42,0.06)' }}
      onClick={handleCardClick}
    >
      {/* Image Container with Shine Effect */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.03]"
        />
        
        {/* Shimmer Effect */}
        <div className="shimmer-container absolute inset-0 pointer-events-none">
          <div className="shimmer"></div>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="absolute top-3 left-3 z-10">
            {badges.map((badge, index) => (
              <span
                key={index}
                className="inline-block bg-pink-400 text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide"
              >
                {badge}
              </span>
            ))}
          </div>
        )}

        {/* Wishlist Button */}
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleWishlistToggle}
            className="relative p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300 group/btn"
            aria-label="Toggle wishlist"
          >
            <Heart className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-400 transition-colors duration-[800ms] ease-out">
          {name}
        </h3>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {shortDescription}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(price)}
            </span>
            {compareAtPrice && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(compareAtPrice)}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          className="w-full bg-pink-400 hover:bg-pink-400 text-white font-semibold py-3 px-4 rounded-full transition-all duration-300 ease-out hover:-translate-y-[1px] hover:shadow-[0_6px_20px_rgba(255,116,164,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
          disabled={!inStock}
        >
          {inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>

    </article>
  );
};
