import React from 'react';
import { Heart, ShoppingCart, ShoppingBag } from 'lucide-react';
import { cartStore } from '../lib/cart';
import { wishlistStore } from '../lib/wishlist';
import { OptimizedImage } from './seo/OptimizedImage';

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
  isListView?: boolean;
  // Enable homepage-only shine hover effect on image (no colorful hover image)
  hoverShine?: boolean;
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
  className = '',
  isListView = false,
  hoverShine = false
}) => {
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const cardRef = React.useRef<HTMLElement | null>(null);
  const [isInView, setIsInView] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    setIsWishlisted(wishlistStore.isInWishlist(slug));
    
    const unsubscribe = wishlistStore.subscribe(() => {
      setIsWishlisted(wishlistStore.isInWishlist(slug));
    });

    return unsubscribe;
  }, [slug]);

  // Detect mobile once on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
    }
  }, []);

  // Mobile-only: Scroll-triggered reveal when card center is within a band around viewport center
  React.useEffect(() => {
    if (!isListView) return;
    if (!isMobile) return;

    const el = cardRef.current;
    if (!el) return;

    const lastYRef = { current: typeof window !== 'undefined' ? window.scrollY : 0 } as { current: number };
    const lastTRef = { current: typeof performance !== 'undefined' ? performance.now() : 0 } as { current: number };
    const velRef = { current: 0 } as { current: number };

    const centerBandPct = 0.15; // ±15% around viewport center
    const enterDwellMs = 160;
    const exitDwellMs = 100;
    const maxScrollPxPerMs = 1.2; // velocity guard
    let timer: number | null = null;

    const onScroll = () => {
      const now = performance.now();
      const y = window.scrollY;
      const dy = Math.abs(y - lastYRef.current);
      const dt = Math.max(1, now - lastTRef.current);
      velRef.current = dy / dt; // px/ms
      lastYRef.current = y;
      lastTRef.current = now;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const center = rect.top + rect.height / 2;
      const bandTop = vh * 0.5 * (1 - centerBandPct);
      const bandBot = vh * 0.5 * (1 + centerBandPct);

      const isInBand = center >= bandTop && center <= bandBot;
      const isSlow = velRef.current <= maxScrollPxPerMs;

      if (timer) { window.clearTimeout(timer); timer = null; }

      if (isInBand && isSlow) {
        timer = window.setTimeout(() => setIsInView(true), enterDwellMs);
      } else {
        timer = window.setTimeout(() => setIsInView(false), exitDwellMs);
      }
    };

    // initial compute
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (timer) window.clearTimeout(timer);
    };
  }, [isListView, isMobile]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!inStock || price === -1) return;
    
    cartStore.addItem({
      id: `item_${Date.now()}`,
      productId: slug,
      name,
      price,
      image: images[0] || 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'
    });
    
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const wishlistItem = {
      id: slug,
      productId: slug,
      name,
      price,
      image: images[0] || 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
      slug
    };
    
    const wasAdded = wishlistStore.toggleItem(wishlistItem);
    
  };

  const handleCardClick = () => {
    window.location.href = `/products/${slug}`;
  };

  const formatPrice = (price: number) => `R${price.toFixed(2)}`;

  // List view layout - mobile: styled like best seller cards, desktop: horizontal list
  if (isListView) {
    return (
      <article 
        ref={cardRef as any}
        className={`product-card group cursor-pointer bg-white rounded-[18px] overflow-hidden relative transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] md:flex md:items-center md:gap-6 md:p-4 ${className}`}
        style={{ boxShadow: '0 10px 30px rgba(15,23,42,0.06)' }}
        onClick={handleCardClick}
      >
        {/* Image Container with Shimmer Effect */}
        <div className="relative aspect-square overflow-hidden md:w-24 md:h-24 md:flex-shrink-0">
          {/* Default white background image */}
          <OptimizedImage
            src={images[0] || 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'}
            alt={name}
            productName={name}
            productPrice={price}
            productCategory="Nail Care Products"
            className={`w-full h-full object-cover transition-all duration-300 ease-out ${
              isMobile ? (isInView ? 'opacity-0 scale-[1.02]' : 'opacity-100') : ''
            } group-hover:opacity-0 group-hover:scale-[1.02]`}
            width={400}
            height={400}
            loading="lazy"
          />
          {/* Hover colorful image */}
          {images[1] && (
            <OptimizedImage
              src={images[1]}
              alt={`${name} - Colorful view`}
              productName={name}
              productPrice={price}
              productCategory="Nail Care Products"
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ease-out ${
                isMobile ? (isInView ? 'opacity-100 scale-[1.02]' : 'opacity-0') : 'opacity-0'
              } group-hover:opacity-100 group-hover:scale-[1.02]`}
              width={400}
              height={400}
              loading="lazy"
            />
          )}
          
          {/* Shimmer Effect */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="shimmer"></div>
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div className="absolute top-3 left-3 z-10 md:top-1 md:left-1">
              {badges.map((badge, index) => (
                <span
                  key={index}
                  className={`inline-block text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide ${
                    badge === 'Bestseller' ? 'bg-pink-400 text-white' :
                    badge === 'New' ? 'bg-blue-500 text-white' :
                    badge === 'Sale' ? 'bg-red-500 text-white' : 'bg-pink-400 text-white'
                  }`}
                >
                  {badge}
                </span>
              ))}
            </div>
          )}

          {/* Wishlist Button - Bigger */}
          <div className="absolute top-3 right-3 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 md:top-1 md:right-1">
            <button
              type="button"
              onClick={handleWishlistToggle}
              className="relative p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300 group/btn md:p-2"
              aria-label="Toggle wishlist"
            >
              <Heart className={`h-6 w-6 transition-all md:h-4 md:w-4 ${
                isWishlisted 
                  ? 'fill-current text-pink-400' 
                  : 'text-gray-700'
              }`} />
            </button>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-6 md:p-0 md:flex-1 md:flex md:items-center md:justify-between">
          <div className="md:flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-400 transition-colors duration-[800ms] ease-out md:text-base md:mb-1">
              {name}
            </h3>
            
            {shortDescription && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2 md:text-xs md:mb-2">
                {shortDescription}
              </p>
            )}

            <div className="flex items-center gap-2 md:mb-0">
              <span className="text-xl font-bold text-gray-900 md:text-lg">
                {price === -1 ? 'Coming Soon' : formatPrice(price)}
              </span>
              {compareAtPrice && price !== -1 && (
                <span className="text-sm text-gray-500 line-through md:text-xs">
                  {formatPrice(compareAtPrice)}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!inStock || price === -1}
            className="w-full bg-pink-400 hover:bg-pink-400 text-white font-semibold py-3 px-4 rounded-full transition-all duration-300 ease-out hover:-translate-y-[1px] hover:shadow-[0_6px_20px_rgba(255,116,164,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none md:w-auto md:px-6 md:py-2 md:text-sm"
          >
            {price === -1 ? 'Coming Soon' : inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </article>
    );
  }

  // Grid view layout
  return (
    <article
      className={`product-card group relative bg-white rounded-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_24px_rgba(0,0,0,0.06)] transition-all duration-300 overflow-hidden cursor-pointer hover:-translate-y-1 ${className}`}
      onClick={handleCardClick}
    >
      {/* Image Container with 3D Flip Effect */}
      <div className="relative aspect-square overflow-hidden bg-[#fff7fb] product-card-flip-container p-6">
        <div className="product-card-flip-inner">
          {/* Front Face - White Background Image */}
          <div className="product-card-flip-front">
            <img
              src={images[0] || 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop';
              }}
            />
          </div>

          {/* Back Face - Colorful Image */}
          {!hoverShine && images[1] && (
            <div className="product-card-flip-back">
              <img
                src={images[1]}
                alt={name}
                className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = images[0] || 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop';
                }}
              />
            </div>
          )}
        </div>

        {/* Hover Shine Effect (homepage best sellers only) */}
        {hoverShine && (
          <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="shine-bar absolute top-0 bottom-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
          </div>
        )}

        {/* Soft capsule badges */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 md:top-4 md:left-4 space-y-1">
          {(!inStock || price === -1) && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium bg-[#fbd3e9] text-[#666]">Sold out</span>
          )}
          {badges.includes('New') && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium bg-[#fbd3e9] text-[#666]">NEW</span>
          )}
          {badges.includes('Bestseller') && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium bg-pink-100 text-pink-700">Bestseller</span>
          )}
        </div>


        {/* Wishlist Heart */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center border border-gray-100 hover:shadow-sm transition"
          aria-label="Toggle wishlist"
        >
          <Heart className={`h-5 w-5 transition-colors ${
            isWishlisted ? 'fill-pink-400 text-pink-400' : 'text-gray-600 group-hover:text-pink-400'
          }`} />
        </button>
      </div>

      {/* Content */}
      <div className="px-5 pt-4 pb-5 text-center">
        {/* Product Name */}
        <h3 className="font-semibold text-[15px] md:text-[16px] leading-snug text-gray-900 mb-2">
          {name}
        </h3>

        {/* Short Description */}
        {shortDescription && (
          <p className="text-[12px] text-gray-500 mb-3 leading-relaxed">
            {shortDescription}
          </p>
        )}

        {/* Price */}
        <div className="mb-4">
          <span className="text-[15px] font-medium text-[#333]">
            {price === -1 ? 'Coming Soon' : formatPrice(price)}
          </span>
          {compareAtPrice && price !== -1 && (
            <span className="ml-2 text-[12px] text-gray-400 line-through align-middle">
              {formatPrice(compareAtPrice)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!inStock || price === -1}
            className={`inline-flex items-center justify-center w-full md:w-auto px-6 py-2.5 rounded-full text-white font-semibold text-[13px] transition-all ${
              (!inStock || price === -1)
                ? 'bg-[#f2cbd8] cursor-not-allowed'
                : 'hover:shadow-[0_10px_24px_rgba(248,182,227,0.45)]'
            }`}
            style={{ backgroundImage: (!inStock || price === -1) ? 'none' : 'linear-gradient(135deg, #f8b6e3, #ffd6f0)' }}
            aria-disabled={!inStock || price === -1}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {price === -1 ? 'Coming Soon' : inStock ? 'Add to Cart' : 'Sold Out'}
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
        @keyframes shineMove {
          0% { transform: translateX(-150%) skewX(-12deg); }
          100% { transform: translateX(150%) skewX(-12deg); }
        }
        /* Trigger animation only on hover to avoid continuous motion */
        .group:hover .shine-bar {
          animation: shineMove 1.2s ease-in-out;
        }
      `}</style>
    </article>
  );
};
