import React, { useEffect, useRef, useState } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { cartStore } from '../lib/cart';
import { wishlistStore } from '../lib/wishlist';
import { analytics } from '../lib/analytics';

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
  discountPrice?: number;
  discountBadge?: string;
  discountBadgeColor?: string;
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
  discountPrice,
  discountBadge,
  discountBadgeColor,
  premium = false,
  showQuickAdd = true,
  // Add support for bundles
  includedProducts = [],
  // Add support for product variants
  variants = []
}) => {
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const cardRef = useRef<HTMLElement | null>(null);
  const [isInView, setIsInView] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [hasViewed, setHasViewed] = React.useState(false);

  // Ensure we always have valid data
  const safeName = name || 'Product Name';
  const safePrice = typeof price === 'number' ? price : 0;
  const safeShortDescription = shortDescription || 'Professional quality nail care product';
  const safeImages = Array.isArray(images) && images.length > 0 ? images : ['/placeholder-product.webp'];
  const safeInStock = inStock !== false;
  const safeCompareAtPrice = compareAtPrice || null;

  // Track product views when card comes into view
  useEffect(() => {
    if (isInView && !hasViewed) {
      const product = {
        id: slug,
        name: safeName,
        category: 'Nail Care Products',
        price: safePrice,
        brand: 'BLOM Cosmetics'
      };
      
      analytics.viewItem(product);
      setHasViewed(true);
    }
  }, [isInView, hasViewed, slug, safeName, safePrice]);

  // Wishlist tracking
  useEffect(() => {
    setIsWishlisted(wishlistStore.isInWishlist(slug));
    
    const unsubscribe = wishlistStore.subscribe(() => {
      setIsWishlisted(wishlistStore.isInWishlist(slug));
    });

    return unsubscribe;
  }, [slug]);

  // Mobile detection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
    }
  }, []);

  // Scroll-triggered reveal for mobile list view
  useEffect(() => {
    if (!isListView || !isMobile) return;

    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
          } else {
            setIsInView(false);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [isListView, isMobile]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!safeInStock || safePrice === -1) return;
    
    // Check if this is a product with variants that need selection
    const hasProductVariants = variants && variants.length > 0;
    
    if (hasProductVariants) {
      // For products with variants, we'd need to open a modal
      // For now, just add with default variant
      cartStore.addItem({
        id: `item_${Date.now()}`,
        productId: slug,
        name: safeName,
        price: safePrice,
        image: safeImages[0] || 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
        variant: { title: 'Default' },
        isBundle: includedProducts && includedProducts.length > 0,
        includedProducts
      });
    } else {
      // Regular product
      cartStore.addItem({
        id: `item_${Date.now()}`,
        productId: slug,
        name: safeName,
        price: safePrice,
        image: safeImages[0] || 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
        variant: { title: 'Default' },
        isBundle: includedProducts && includedProducts.length > 0,
        includedProducts
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
      price: safePrice,
      image: safeImages[0] || 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
      slug
    };
    
    const wasAdded = wishlistStore.toggleItem(wishlistItem);
    
    // Track wishlist action
    analytics.customEvent(wasAdded ? 'add_to_wishlist' : 'remove_from_wishlist', {
      item_id: slug,
      item_name: safeName,
      category: 'Nail Care Products'
    });
  };

  const handleCardClick = () => {
    // Track product click
    analytics.customEvent('select_item', {
      item_id: slug,
      item_name: safeName,
      item_category: 'Nail Care Products',
      item_brand: 'BLOM Cosmetics'
    });
    
    window.location.href = `/products/${slug}`;
  };

  const formatPrice = (price: number) => `R${price.toFixed(2)}`;

  // Enhanced card classes
  const cardClasses = [
    'product-card',
    'reveal-on-scroll',
    premium ? 'card-premium' : 'card-enhanced',
    isListView ? 'md:flex md:items-center md:gap-6 md:p-4' : '',
    className
  ].filter(Boolean).join(' ');

  // List view layout
  if (isListView) {
    return (
      <article 
        ref={cardRef as any}
        className={`${cardClasses} group cursor-pointer overflow-hidden transition-all duration-300 ease-out hover:-translate-y-2 bg-white rounded-lg shadow-sm hover:shadow-md`}
        onClick={handleCardClick}
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden md:w-24 md:h-24 md:flex-shrink-0">
          <img
            src={safeImages[0]}
            alt={safeName}
            className="w-full h-full object-cover transition-all duration-300 ease-out group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop';
            }}
          />
          
          {/* Badges */}
          {badges.length > 0 && (
            <div className="absolute top-2 left-2 z-10">
              {badges.map((badge, index) => (
                <span
                  key={index}
                  className="inline-block text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide bg-pink-400 text-white"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}

          {/* Wishlist Button */}
          <div className="absolute top-2 right-2 z-10">
            <button
              type="button"
              onClick={handleWishlistToggle}
              className="relative p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300"
              aria-label="Toggle wishlist"
            >
              <Heart className={`h-4 w-4 transition-all ${
                isWishlisted 
                  ? 'fill-current text-pink-400' 
                  : 'text-gray-700'
              }`} />
            </button>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 md:flex-1 md:flex md:items-center md:justify-between">
          <div className="md:flex-1">
            {/* Product Name */}
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-400 transition-colors">
              {safeName}
            </h3>
            
            {/* Short Description - ALWAYS SHOW */}
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {safeShortDescription}
            </p>

            {/* Price - ALWAYS SHOW */}
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">
                {safePrice === -1 ? 'Coming Soon' : formatPrice(safePrice)}
              </span>
              {safeCompareAtPrice && safePrice !== -1 && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(safeCompareAtPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Button - ALWAYS SHOW */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!safeInStock || safePrice === -1}
            className={`mt-4 md:mt-0 inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-pink-400 border-2 border-pink-400 rounded-lg transition-all duration-200 hover:bg-transparent hover:text-pink-400 hover:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2 ${
              !safeInStock || safePrice === -1 ? 'opacity-50 cursor-not-allowed bg-gray-300 border-gray-300 text-gray-500' : 'hover:shadow-lg transform hover:scale-[1.02] active:scale-95'
            }`}
          >
            <ShoppingCart className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">
              {safePrice === -1 ? 'COMING SOON' : safeInStock ? 'ADD TO CART' : 'OUT OF STOCK'}
            </span>
          </button>
        </div>
      </article>
    );
  }

  // Grid view layout
  return (
    <article
      className={`${cardClasses} group relative overflow-hidden cursor-pointer transform hover:-translate-y-2 bg-white rounded-lg shadow-sm hover:shadow-md`}
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={safeImages[0]}
          alt={safeName}
          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop';
          }}
        />

        {/* Wishlist Heart */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg"
          aria-label="Toggle wishlist"
        >
          <Heart className={`h-4 w-4 transition-all ${
            isWishlisted 
              ? 'fill-current text-pink-400' 
              : 'text-gray-600'
          }`} />
        </button>
      </div>

      {/* Content - Flex layout to ensure consistent height */}
      <div className="p-4 flex flex-col h-full">
        {/* Product Name */}
        <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-pink-500 transition-colors line-clamp-2">
          {safeName}
        </h3>

        {/* Short Description - ALWAYS PRESENT with consistent spacing */}
        <div className="flex-1 flex flex-col justify-center mb-3">
          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
            {safeShortDescription}
          </p>
        </div>

        {/* Price - ALWAYS SHOW */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl font-bold text-gray-900">
              {safePrice === -1 ? 'Coming Soon' : formatPrice(safePrice)}
            </span>
            {safeCompareAtPrice && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(safeCompareAtPrice)}
                </span>
                <span className="text-xs font-semibold text-white bg-blue-400 px-2 py-1 rounded-full">
                  {Math.round(((safeCompareAtPrice - safePrice) / safeCompareAtPrice) * 100)}% OFF
                </span>
              </>
            )}
          </div>
        </div>

        {/* Add to Cart Button - ALWAYS AT BOTTOM with consistent height */}
        <div className="flex items-end justify-center flex-shrink-0">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!safeInStock || safePrice === -1}
            className={`inline-flex items-center justify-center px-6 py-3 w-full min-h-[48px] text-sm font-semibold text-white bg-pink-400 border-2 border-pink-400 rounded-lg transition-all duration-200 hover:bg-transparent hover:text-pink-400 hover:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2 ${
              safeInStock && safePrice !== -1
                ? 'hover:shadow-lg transform hover:scale-[1.02] active:scale-95'
                : 'opacity-50 cursor-not-allowed bg-gray-300 border-gray-300 text-gray-500'
            }`}
            aria-disabled={!safeInStock || safePrice === -1}
          >
            <ShoppingCart className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">
              {safePrice === -1 ? 'COMING SOON' : safeInStock ? 'ADD TO CART' : 'OUT OF STOCK'}
            </span>
          </button>
        </div>
      </div>

      {/* Inline styles for line clamping */}
      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </article>
  );
};
