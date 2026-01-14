import React from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
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
  variants = [] 
}) => { 
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const [showVariantModal, setShowVariantModal] = React.useState(false);

  // Ensure we have safe data
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

    const wishlistItem = {
      id: slug,
      productId: slug,
      name: safeName,
      price,
      image: safeImages[0],
      slug
    };
    wishlistStore.toggleItem(wishlistItem);
  };

  const handleCardClick = () => {
    window.location.href = `/products/${slug}`;
  };

  const formatPrice = (p: number) => `R${p.toFixed(2)}`;

  // --- LIST VIEW ---
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
          {/* Image */}
          <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
            <OptimizedImage
              src={safeImages[0]}
              alt={safeName}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
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

          {/* Actions */}
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
              {inStock ? (hasVariants ? 'Select' : 'Add') : 'Out of Stock'}
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

  // --- GRID VIEW ---
  return (
    <>
      <article 
        className={`
          group relative bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 
          ${className}
        `}
        onClick={handleCardClick}
      >
        {/* Image Area */}
        <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden">
          <OptimizedImage
            src={safeImages[0]}
            alt={safeName}
            width={400}
            height={500}
            className="w-full h-full object-cover"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {badges.map((badge) => (
              <span key={badge} className="bg-white/90 backdrop-blur-sm text-black text-xs font-bold px-2 py-1 rounded shadow-sm">
                {badge}
              </span>
            ))}
          </div>
          
          {/* Wishlist Fab */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white transition-all transform hover:scale-110"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-pink-500 text-pink-500' : 'text-gray-600'}`} />
          </button>
          
          {/* Quick Add Button (Desktop Hover) */}
          <div className="absolute bottom-4 left-4 right-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hidden md:block">
            <button
              onClick={hasVariants ? handleCardClick : handleAddToCart}
              disabled={!inStock || price === -1}
              className="w-full bg-white text-black font-semibold py-3 rounded-xl shadow-lg hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              {inStock ? (hasVariants ? 'Select Options' : 'Add to Cart') : 'Out of Stock'}
            </button>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 truncate group-hover:text-pink-500 transition-colors">
            {safeName}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2 mb-3 h-10">
            {safeShortDescription}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-bold text-lg text-gray-900">
                {price === -1 ? 'Coming Soon' : hasVariants ? `From ${formatPrice(lowestPrice)}` : formatPrice(price)}
              </span>
              {compareAtPrice && price !== -1 && (
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(compareAtPrice)}
                </span>
              )}
            </div>
            
            {/* Mobile Add Button */}
            <button 
              onClick={hasVariants ? handleCardClick : handleAddToCart}
              className="md:hidden bg-black text-white p-2 rounded-lg"
              disabled={!inStock}
            >
              <ShoppingCart className="w-4 h-4" />
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