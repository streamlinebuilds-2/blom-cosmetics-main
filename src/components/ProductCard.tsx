import React from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { cartStore, showNotification } from '../lib/cart';

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  shortDescription?: string;
  images: string[];
  inStock?: boolean;
  badges?: string[];
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  slug,
  price,
  compareAtPrice,
  shortDescription,
  images,
  inStock = true,
  badges = [],
  className = ''
}) => {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!inStock) return;
    
    cartStore.addItem({
      id: `item_${Date.now()}`,
      productId: slug,
      name,
      price,
      image: images || 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'
    });
    
    showNotification(`Added ${name} to cart!`);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Wishlist functionality placeholder
    showNotification(`Added ${name} to wishlist!`, 'info');
  };

  const handleCardClick = () => {
    window.location.href = `/products/${slug}`;
  };

  const formatPrice = (price: number) => `R${price.toFixed(2)}`;

  const hasSecondImage = images.length > 1;

  return (
    <article 
      className={`group relative flex flex-col rounded-2xl bg-white shadow-sm transition-all duration-300 will-change-transform hover:shadow-lg hover:-translate-y-0.5 hover:rotate-[1deg] cursor-pointer overflow-hidden ${className}`}
      role="article"
      onClick={handleCardClick}
      style={{ perspective: '1000px' }}
    >
      {/* Shimmer Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none hidden md:block">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent transform -translate-x-full -translate-y-full group-hover:translate-x-full group-hover:translate-y-full transition-transform duration-900 ease-out" />
      </div>

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-xl m-4 mb-0" style={{ transformStyle: 'preserve-3d' }}>
        {/* Front Image */}
        <img
          src={images || 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'}
          alt={name}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
            hasSecondImage 
              ? 'md:group-hover:[transform:rotateY(180deg)] backface-hidden' 
              : 'group-hover:opacity-90'
          }`}
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop';
          }}
        />

        {/* Back Image (if available) */}
        {hasSecondImage && (
          <img
            src={images}
            alt={`${name} - alternate view`}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-500 md:[transform:rotateY(-180deg)] md:group-hover:[transform:rotateY(0deg)] backface-hidden"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        )}

        {/* Badges */}
        {badges.length > 0 && (
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
            {badges.map((badge, index) => (
              <span
                key={index}
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  badge === 'New' ? 'bg-green-500 text-white' :
                  badge === 'Sale' ? 'bg-red-500 text-white' :
                  badge === 'Bestseller' ? 'bg-pink-500 text-white' :
                  'bg-gray-500 text-white'
                }`}
              >
                {badge}
              </span>
            ))}
          </div>
        )}

        {/* Out of Stock Badge */}
        {!inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              Out of Stock
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors duration-200 group/heart"
          aria-label={`Add ${name} to wishlist`}
          aria-pressed="false"
        >
          <Heart className="h-4 w-4 text-gray-600 group-hover/heart:text-pink-500 transition-colors" />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 pt-3">
        {/* Title */}
        <h3 className="font-semibold text-lg leading-tight mb-2 line-clamp-2 hover:text-pink-400 transition-colors">
          {name}
        </h3>

        {/* Short Description */}
        {shortDescription && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
            {shortDescription}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl font-bold text-pink-400">
            {formatPrice(price)}
          </span>
          {compareAtPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(compareAtPrice)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock}
          className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-auto ${
            inStock
              ? 'bg-gray-100 text-gray-700 hover:bg-pink-400 hover:text-white hover:shadow-md active:scale-95'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          aria-disabled={!inStock}
        >
          <ShoppingCart className="h-4 w-4" />
          {inStock ? 'ADD TO CART' : 'OUT OF STOCK'}
        </button>
      </div>

      <style jsx>{`
        .backface-hidden {
          backface-visibility: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @media (hover: none) {
          .group:hover {
            transform: none !important;
          }
          .group:hover .shimmer {
            opacity: 0 !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          * {
            transition-duration: 0.01ms !important;
            animation-duration: 0.01ms !important;
          }
        }
      `}</style>
    </article>
  );
};