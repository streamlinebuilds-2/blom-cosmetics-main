import React from 'react';
import { Heart, ShoppingCart, Plus } from 'lucide-react';
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
  hideDescription?: boolean; 
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
  hideDescription = false,
  variants = [] 
}) => { 
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const [showVariantModal, setShowVariantModal] = React.useState(false);

  // Safe Fallbacks
  const safeName = name || 'Product Name';
  const safeShortDescription = shortDescription || 'Professional quality nail care product';
  const safeImages = Array.isArray(images) && images.length > 0 ? images : ['https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'];

  const hasVariants = variants && variants.length > 0;
  const lowestPrice = hasVariants ? Math.min(...variants.map(v => v.price || price), price) : price;

  React.useEffect(() => {
    setIsWishlisted(wishlistStore.isInWishlist(slug));
    const unsubscribe = wishlistStore.subscribe(() => {
      setIsWishlisted(wishlistStore.isInWishlist(slug));
    });
    return unsubscribe;
  }, [slug]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!inStock || price === -1) return;
    if (hasVariants) {
      setShowVariantModal(true);
    } else {
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
    wishlistStore.toggleItem({ id: slug, productId: slug, name: safeName, price, image: safeImages[0], slug });
  };

  const handleCardClick = () => {
    window.location.href = `/products/${slug}`;
  };

  const formatPrice = (p: number) => `R${p.toFixed(2)}`;

  // --- LIST VIEW STYLING ---
  if (isListView) {
    return (
      <>
        <article 
          className={`
            group cursor-pointer bg-white rounded-xl border border-gray-100 overflow-hidden relative transition-all duration-300 hover:shadow-lg flex flex-row items-center gap-4 p-4 
            ${className}
          `}
          onClick={handleCardClick}
        >
          <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
            <OptimizedImage
              src={safeImages[0]}
              alt={safeName}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-pink-500 transition-colors">
              {safeName}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-1 mb-2">
              {safeShortDescription}
            </p>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900">
                {price === -1 ? 'Coming Soon' : hasVariants ? `From ${formatPrice(lowestPrice)}` : formatPrice(price)}
              </span>
              {compareAtPrice && price !== -1 && (
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(compareAtPrice)}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleWishlistToggle}
              className={`p-2 rounded-full transition-colors ${isWishlisted ? 'text-pink-500 bg-pink-50' : 'text-gray-400 hover:bg-gray-100'}`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={hasVariants ? handleCardClick : handleAddToCart}
              disabled={!inStock || price === -1}
              className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {inStock ? (hasVariants ? 'Select' : 'Add') : 'Out'}
            </button>
          </div>
        </article>
        {showVariantModal && (
          <ProductVariantModal
            isOpen={showVariantModal}
            onClose={() => setShowVariantModal(false)}
            product={{ id, name: safeName, slug, price, images: safeImages, variants }}
          />
        )}
      </>
    );
  }

  // --- PREMIUM GRID VIEW ---
  return (
    <>
      <article
        className={`
          group relative flex flex-col h-full bg-white rounded-2xl border border-gray-100 overflow-hidden
          transition-all duration-500 hover:shadow-2xl hover:-translate-y-2
          ${className}
        `}
        onClick={handleCardClick}
      >
        {/* 1:1 Image Area */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <OptimizedImage
            src={safeImages[0]}
            alt={safeName}
            width={500}
            height={500}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
            {badges.map((badge) => (
              <span key={badge} className="bg-black/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm">
                {badge}
              </span>
            ))}
          </div>
          
          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white hover:scale-110 transition-all z-10"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-pink-500 text-pink-500' : 'text-gray-600'}`} />
          </button>
        </div>
        
        {/* Content Area */}
        <div className="p-5 flex flex-col flex-grow">
          {/* Header */}
          <div className="mb-2">
            <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-pink-600 transition-colors">
              {safeName}
            </h3>
            {!hideDescription && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                {safeShortDescription}
              </p>
            )}
          </div>
          
          {/* Spacer to push bottom section down */}
          <div className="mt-auto pt-4 space-y-4">
            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-xl text-gray-900">
                {price === -1 ? 'Coming Soon' : hasVariants ? `From ${formatPrice(lowestPrice)}` : formatPrice(price)}
              </span>
              {compareAtPrice && price !== -1 && (
                <span className="text-sm text-gray-400 line-through decoration-gray-300">
                  {formatPrice(compareAtPrice)}
                </span>
              )}
            </div>
            
            {/* Pink Pill Button */}
            <button
              onClick={hasVariants ? handleCardClick : handleAddToCart}
              disabled={!inStock || price === -1}
              className="w-full bg-pink-500 text-white font-bold py-3 px-4 rounded-full shadow-lg shadow-pink-200 hover:bg-pink-600 hover:shadow-pink-300 hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {inStock ? (
                <>
                  <Plus className="w-5 h-5" />
                  <span>{hasVariants ? 'Select Options' : 'Add to Cart'}</span>
                </>
              ) : (
                'Out of Stock'
              )}
            </button>
          </div>
        </div>
      </article>
      {showVariantModal && (
        <ProductVariantModal
          isOpen={showVariantModal}
          onClose={() => setShowVariantModal(false)}
          product={{ id, name: safeName, slug, price, images: safeImages, variants }}
        />
      )}
    </>
  );
};