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
      image: images[0] || 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'
    });
    
    showNotification(`Added ${name} to cart!`);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    showNotification(`Added ${name} to wishlist!`, 'info');
  };

  const handleCardClick = () => {
    window.location.href = `/products/${slug}`;
  };

  const formatPrice = (price: number) => `R${price.toFixed(2)}`;

  return (
    <article 
      className={`group relative bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-2 ${className}`}
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={images[0] || 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop';
          }}
        />
        
        {/* Shimmer Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <div className="shimmer shimmer--lux"></div>
        </div>

        {/* Bestseller Badge */}
        {badges.includes('Bestseller') && (
          <div className="absolute top-4 left-4 bg-pink-100 text-pink-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase shadow-md">
            BESTSELLER
          </div>
        )}

        {/* New Badge */}
        {badges.includes('New') && (
          <div className="absolute top-4 left-4 bg-blue-500 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase shadow-md">
            NEW
          </div>
        )}

        {/* Sale Badge */}
        {badges.includes('Sale') && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase shadow-md">
            SALE
          </div>
        )}

        {/* Out of Stock Overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-gray-900 text-white px-6 py-2 rounded-full text-sm font-bold uppercase shadow-xl">
              Out of Stock
            </span>
          </div>
        )}

        {/* Wishlist Heart */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg group/heart"
          aria-label={`Add ${name} to wishlist`}
        >
          <Heart className="h-5 w-5 text-gray-600 group-hover/heart:text-pink-500 group-hover/heart:fill-current transition-all" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Product Name */}
        <h3 className="font-bold text-xl mb-2 text-gray-900 group-hover:text-pink-500 transition-colors line-clamp-2 min-h-[3.5rem]">
          {name}
        </h3>

        {/* Short Description */}
        {shortDescription && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
            {shortDescription}
          </p>
        )}

        {/* Price - Centered */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl font-bold text-pink-500">
              {formatPrice(price)}
            </span>
            {compareAtPrice && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(compareAtPrice)}
                </span>
                <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  {Math.round(((compareAtPrice - price) / compareAtPrice) * 100)}% OFF
                </span>
              </>
            )}
          </div>
        </div>

        {/* Add to Cart Button - Centered */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`inline-flex items-center justify-center gap-2 py-3.5 px-8 rounded-full font-bold text-sm uppercase transition-all duration-200 ${
              inStock
                ? 'bg-pink-400 text-white hover:bg-pink-500 hover:shadow-lg transform hover:scale-[1.02] active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            aria-disabled={!inStock}
          >
            <ShoppingCart className="h-4 w-4" />
            {inStock ? 'ADD TO CART' : 'OUT OF STOCK'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .shimmer {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          animation: shimmer 2s infinite;
        }
        
        .shimmer--lux {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 182, 193, 0.3),
            rgba(255, 255, 255, 0.6),
            rgba(255, 182, 193, 0.3),
            transparent
          );
        }
        
        @keyframes shimmer {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>
    </article>
  );
};
