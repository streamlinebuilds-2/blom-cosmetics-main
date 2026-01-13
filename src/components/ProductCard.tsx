import React from 'react';
import { Heart, ShoppingCart, ShoppingBag } from 'lucide-react';
import { cartStore } from '../lib/cart';
import { wishlistStore } from '../lib/wishlist';
import { OptimizedImage } from './seo/OptimizedImage';
import { ProductVariantModal } from './product/ProductVariantModal';

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
  hoverShine?: boolean;
  premium?: boolean;
  showQuickAdd?: boolean;
  includedProducts?: any[];
  variants?: Array<{
    name: string;
    price?: number;
    inStock?: boolean;
    image?: string;
  }>;
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
  hoverShine = false,
  premium = false,
  showQuickAdd = true,
  // Add support for bundles
  includedProducts = [],
  // Add support for product variants
  variants = []
}) => {
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const cardRef = React.useRef<HTMLElement | null>(null);
  const [isInView, setIsInView] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [showVariantModal, setShowVariantModal] = React.useState(false);

  // Ensure we have safe data
  const safeName = name || 'Product Name';
  const safeShortDescription = shortDescription || 'Professional quality nail care product';
  const safeImages = Array.isArray(images) && images.length > 0 ? images : ['https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'];
  
  // Variant logic - available for both list and grid views
  const hasVariants = variants && variants.length > 0;
  const lowestPrice = hasVariants
    ? Math.min(...variants.map(v => v.price || price), price)
    : price;

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
    
    // Check if this is a product with ANY variants that need selection
    const hasProductVariants = variants && variants.length > 0;
    
    if (hasProductVariants) {
      // For products with multiple variants, show variant selection modal
      setShowVariantModal(true);
    } else {
      // Products with 0 or 1 variant - add directly to cart
      cartStore.addItem({
        id: `item_${Date.now()}`,
        productId: slug,
        name: safeName,
        price,
        image: safeImages[0]
      });
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const wishlistItem = {
      id: slug,
      productId: slug,
      name: safeName,
      price,
      image: safeImages[0],
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
      <>
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
              src={safeImages[0]}
              alt={safeName}
              productName={safeName}
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
            {safeImages[1] && (
              <OptimizedImage
                src={safeImages[1]}
                alt={`${safeName} - Colorful view`}
                productName={safeName}
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
                {safeName}
              </h3>
               
              {/* Short Description - ALWAYS SHOW */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2 md:text-xs md:mb-2">
                {safeShortDescription}
              </p>

              <div className="flex items-center gap-2 md:mb-0">
                <span className="text-xl font-bold text-gray-900 md:text-lg">
                  {price === -1 ? 'Coming Soon' : hasVariants ? `From ${formatPrice(lowestPrice)}` : formatPrice(price)}
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
              onClick={hasVariants ? handleCardClick : handleAddToCart}
              disabled={!inStock || price === -1}
              className="w-full bg-pink-400 hover:bg-pink-400 text-white font-semibold py-3 px-4 rounded-full transition-all duration-300 ease-out hover:-translate-y-[1px] hover:shadow-[0_6px_20px_rgba(255,116,164,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none md:w-auto md:px-6 md:py-2 md:text-sm"
            >
              {price === -1 ? 'Coming Soon' : inStock ? (hasVariants ? 'Select Options' : 'Add to Cart') : 'Out of Stock'}
            </button>
          </div>
        </article>

        {/* CSS Styles */}
        <style>{`
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          /* Premium Shimmer effect - Luxurious light beam */
          .shimmer {
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, 
              transparent 0%, 
              transparent 30%,
              rgba(255, 255, 255, 0.6) 50%, 
              transparent 70%,
              transparent 100%
            );
            transform: translate(-150%, -150%);
            opacity: 0;
            pointer-events: none;
            animation-fill-mode: forwards;
          }

          /* Desktop - shimmer on hover only for the hovered card */
          @media (hover: hover) and (pointer: fine) {
            .product-card:hover .shimmer {
              animation: luxurious-light-beam 1.2s ease-in-out 1;
              opacity: 1;
            }

            /* Reset shimmer when not hovering */
            .product-card .shimmer {
              animation: none;
              transform: translate(-150%, -150%);
              opacity: 0;
            }
          }

          /* Mobile - shimmer on tap/touch */
          @media (hover: none) and (pointer: coarse) {
            .product-card:active .shimmer {
              animation: luxurious-light-beam 1.2s ease-in-out 1 !important;
              opacity: 1 !important;
            }
          }

          /* Fast, luxurious light beam animation */
          @keyframes luxurious-light-beam {
            0% { 
              transform: translate(-150%, -150%);
              opacity: 0;
            }
            15% {
              opacity: 1;
            }
            85% {
              opacity: 1;
            }
            100% { 
              transform: translate(150%, 150%);
              opacity: 0;
            }
          }
        `}</style>

        {/* Product Variant Selection Modal */}
        {showVariantModal && (
          <ProductVariantModal
            isOpen={showVariantModal}
            onClose={() => setShowVariantModal(false)}
            product={{
              id,
              name: safeName,
              slug,
              price,
              images: safeImages,
              variants: variants || []
            }}
          />
        )}
      </>
    );
  }

  // Grid view layout
  return (
    <>
      <article
        className={`product-card group relative bg-white rounded-3xl border border-gray-200 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-3 ${hoverShine ? 'best-seller-card' : ''} ${className}`}
        onClick={handleCardClick}
      >
        {/* Image Container with or without Shimmer Effect */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <OptimizedImage
            src={safeImages[0]}
            alt={safeName}
            productName={safeName}
            productPrice={price}
            productCategory="Nail Care Products"
            className="w-full h-full object-cover"
            width={400}
            height={400}
            loading="lazy"
          />
          
          {/* Shimmer Effect - Only for Featured Products */}
          {hoverShine && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="shimmer"></div>
            </div>
          )}

          {/* Bestseller Badge */}
          {badges.includes('Bestseller') && (
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 md:top-4 md:left-4 bg-pink-100 text-pink-600 px-2 py-0.5 sm:px-3 sm:py-1 md:px-4 md:py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase shadow-md">
              BESTSELLER
            </div>
          )}

          {/* New Badge */}
          {badges.includes('New') && (
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 md:top-4 md:left-4 bg-blue-500 text-white px-2 py-0.5 sm:px-3 sm:py-1 md:px-4 md:py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase shadow-md">
              NEW
            </div>
          )}

          {/* Sale Badge */}
          {badges.includes('Sale') && (
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 md:top-4 md:left-4 bg-red-500 text-white px-2 py-0.5 sm:px-3 sm:py-1 md:px-4 md:py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase shadow-md">
              SALE
            </div>
          )}

          {/* Wishlist Heart */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg group/heart"
            aria-label="Toggle wishlist"
          >
            <Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 transition-all ${
              isWishlisted
                ? 'fill-current text-pink-400 group-hover/heart:text-pink-500'
                : 'text-gray-600 group-hover/heart:text-pink-500 group-hover/heart:fill-current'
            }`} />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 md:p-6 text-center">
          {/* Product Name */}
          <h3 className="font-bold text-sm sm:text-base md:text-xl mb-2 text-black group-hover:text-pink-500 transition-colors line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] md:min-h-[3.5rem]">
            {safeName}
          </h3>
 
          {/* Short Description - ALWAYS SHOW */}
          <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 md:mb-4 line-clamp-2 leading-relaxed">
            {safeShortDescription}
          </p>
 
          {/* Price - Centered */}
          <div className="mb-3 sm:mb-4">
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-black">
                {price === -1 ? 'Coming Soon' : hasVariants ? `From ${formatPrice(lowestPrice)}` : formatPrice(price)}
              </span>
              {compareAtPrice && (
                <>
                  <span className="text-sm sm:text-base md:text-lg text-gray-400 line-through">
                    {formatPrice(compareAtPrice)}
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold text-green-600 bg-green-100 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                    {Math.round(((compareAtPrice - price) / compareAtPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>
          </div>
 
          {/* Add to Cart Button - Centered */}
          <div className="mt-3">
            <button
              type="button"
              onClick={hasVariants ? handleCardClick : handleAddToCart}
              disabled={!inStock || price === -1}
              className={`inline-flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 py-2 px-4 sm:py-2.5 sm:px-5 md:py-3 md:px-6 rounded-full font-bold text-[10px] sm:text-xs md:text-sm uppercase transition-all duration-200 ${
                inStock && price !== -1
                  ? 'bg-pink-400 text-white hover:bg-blue-100 hover:text-black hover:border-2 hover:border-black active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              aria-disabled={!inStock || price === -1}
            >
              <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
              {price === -1 ? 'COMING SOON' : inStock ? (hasVariants ? 'SELECT OPTIONS' : 'ADD TO CART') : 'OUT OF STOCK'}
            </button>
          </div>
        </div>
      </article>

      {/* CSS Styles */}
      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Premium Shimmer effect - Luxurious light beam */
        .shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, 
            transparent 0%, 
            transparent 30%,
            rgba(255, 255, 255, 0.6) 50%, 
            transparent 70%,
            transparent 100%
          );
          transform: translate(-150%, -150%);
          opacity: 0;
          pointer-events: none;
          animation-fill-mode: forwards;
        }

        /* Desktop - shimmer on hover only for the hovered card */
        @media (hover: hover) and (pointer: fine) {
          .product-card:hover .shimmer {
            animation: luxurious-light-beam 1.2s ease-in-out 1;
            opacity: 1;
          }

          /* Reset shimmer when not hovering */
          .product-card .shimmer {
            animation: none;
            transform: translate(-150%, -150%);
            opacity: 0;
          }
        }

        /* Mobile - shimmer on tap/touch */
        @media (hover: none) and (pointer: coarse) {
          .product-card:active .shimmer {
            animation: luxurious-light-beam 1.2s ease-in-out 1 !important;
            opacity: 1 !important;
          }
        }

        /* Fast, luxurious light beam animation */
        @keyframes luxurious-light-beam {
          0% { 
            transform: translate(-150%, -150%);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% { 
            transform: translate(150%, 150%);
            opacity: 0;
          }
        }
      `}</style>

      {/* Product Variant Selection Modal */}
      {showVariantModal && (
        <ProductVariantModal
          isOpen={showVariantModal}
          onClose={() => setShowVariantModal(false)}
          product={{
            id,
            name: safeName,
            slug,
            price,
            images: safeImages,
            variants: variants || []
          }}
        />
      )}
    </>
  );
};