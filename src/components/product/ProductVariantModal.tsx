import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Check, Plus, Minus } from 'lucide-react';
import { cartStore, showNotification } from '../../lib/cart';

interface ProductVariant {
  name: string;
  price?: number;
  inStock?: boolean;
  image?: string;
}

interface ProductVariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
    variants: ProductVariant[];
  };
  initialQuantity?: number;
}

export const ProductVariantModal: React.FC<ProductVariantModalProps> = ({
  isOpen,
  onClose,
  product,
  initialQuantity = 1
}) => {
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [quantity, setQuantity] = useState(initialQuantity);
  const [loading, setLoading] = useState(false);

  // Initialize selected variant when modal opens
  useEffect(() => {
    if (isOpen && product.variants.length > 0) {
      // Pre-select first available variant
      const firstInStockVariant = product.variants.find(variant => variant.inStock !== false);
      if (firstInStockVariant) {
        setSelectedVariant(firstInStockVariant.name);
      } else {
        setSelectedVariant(product.variants[0]?.name || '');
      }
    }
  }, [isOpen, product.variants]);

  const handleVariantSelect = (variantName: string) => {
    setSelectedVariant(variantName);
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) return;

    setLoading(true);
    try {
      // Find the selected variant details
      const selectedVariantData = product.variants.find(v => v.name === selectedVariant);
      
      const cartItem = {
        id: `item_${Date.now()}`,
        productId: product.slug,
        variantId: selectedVariant,
        name: product.name,
        price: selectedVariantData?.price || product.price,
        image: selectedVariantData?.image || product.images[0] || '',
        variant: { title: selectedVariant }
      };

      cartStore.addItem(cartItem, quantity);
      showNotification(`Added ${quantity} ${product.name} (${selectedVariant}) to cart!`);
      onClose();
    } catch (error) {
      console.error('Error adding product to cart:', error);
      showNotification('Failed to add product to cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedVariantPrice = () => {
    const selectedVariantData = product.variants.find(v => v.name === selectedVariant);
    return selectedVariantData?.price || product.price;
  };

  const isVariantSelected = (variantName: string) => {
    return selectedVariant === variantName;
  };

  const isVariantInStock = (variant: ProductVariant) => {
    return variant.inStock !== false; // Default to true if not specified
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal - Full height on mobile, auto height on desktop */}
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] sm:max-h-[90vh] overflow-hidden sm:mx-4 sm:max-w-2xl md:max-w-lg flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-400 to-blue-400 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{product.name}</h2>
              <p className="text-pink-100 mt-1">Choose your variant</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable on mobile */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Product Image */}
          <div className="mb-6">
            <img
              src={product.images[0] || 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'}
              alt={product.name}
              className="w-full h-40 sm:h-48 object-cover rounded-lg"
            />
          </div>

          {/* Variant Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Select Variant ({product.variants.length} available)
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {product.variants.map((variant) => (
                <button
                  key={variant.name}
                  onClick={() => handleVariantSelect(variant.name)}
                  disabled={!isVariantInStock(variant)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    isVariantSelected(variant.name)
                      ? 'border-pink-400 bg-pink-50 text-pink-700'
                      : isVariantInStock(variant)
                      ? 'border-gray-200 hover:border-pink-300 hover:bg-pink-25'
                      : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{variant.name}</div>
                      {variant.price && variant.price !== product.price && (
                        <div className="text-sm text-gray-600">
                          {variant.price > product.price ? '+' : ''}R{(variant.price - product.price).toFixed(2)}
                        </div>
                      )}
                    </div>
                    {isVariantSelected(variant.name) && (
                      <Check className="h-5 w-5 text-pink-600" />
                    )}
                  </div>
                  {!isVariantInStock(variant) && (
                    <div className="text-xs text-red-500 mt-1">Out of Stock</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quantity</h3>
            <div className="flex items-center border-2 border-gray-200 rounded-full bg-white inline-flex overflow-hidden w-fit">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 hover:bg-gray-50 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="h-5 w-5 text-gray-600" />
              </button>
              <span className="px-6 py-3 font-bold text-lg text-gray-900 min-w-[60px] text-center select-none">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-3 hover:bg-gray-50 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Price Display */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Price per item:</span>
              <span className="text-xl sm:text-2xl font-bold text-gray-900">
                R{getSelectedVariantPrice().toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-gray-700">Total ({quantity} items):</span>
              <span className="text-lg sm:text-xl font-bold text-pink-600">
                R{(getSelectedVariantPrice() * quantity).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer - Sticky on mobile */}
        <div className="border-t border-gray-200 p-6 bg-white sm:bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:border-gray-400 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant || loading}
              className="flex-1 px-6 py-3 bg-pink-400 text-white rounded-full font-semibold hover:bg-pink-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Adding...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </div>
              )}
            </button>
          </div>
          
          {!selectedVariant && (
            <div className="mt-3 text-sm text-amber-600 text-center">
              Please select a variant to continue
            </div>
          )}
        </div>
      </div>
    </div>
  );
};