import React from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';

interface StickyCartProps {
  productName: string;
  productImage: string;
  productPrice: number;
  quantity: number;
  onQuantityChange: (newQuantity: number) => void;
  onAddToCart: () => void;
  isVisible: boolean;
}

export const StickyCart: React.FC<StickyCartProps> = ({
  productName,
  productImage,
  productPrice,
  quantity,
  onQuantityChange,
  onAddToCart,
  isVisible
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-50 transform transition-transform duration-300">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Product Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <img
              src={productImage}
              alt={productName}
              className="w-16 h-16 object-cover rounded-lg shadow-sm"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-gray-900 text-lg truncate">{productName}</h4>
              <p className="text-pink-500 font-bold text-xl">R{productPrice.toFixed(2)}</p>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-2">
            <div className="flex items-center border-2 border-gray-200 rounded-xl bg-white">
              <button
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                className="p-2 hover:bg-gray-50 transition-colors rounded-l-xl"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4 text-gray-600" />
              </button>
              <span className="px-4 py-2 font-bold text-lg text-gray-900 min-w-[50px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => onQuantityChange(quantity + 1)}
                className="p-2 hover:bg-gray-50 transition-colors rounded-r-xl"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={onAddToCart}
            className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center gap-3 text-lg whitespace-nowrap"
          >
            <ShoppingCart className="h-6 w-6" />
            ADD TO CART
          </button>

          {/* Shopping Cart Icon */}
          <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center hover:bg-pink-200 transition-colors cursor-pointer">
            <ShoppingCart className="h-6 w-6 text-pink-500" />
          </div>
        </div>
      </div>
    </div>
  );
};
