import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, ChevronUp, ChevronDown } from 'lucide-react';

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
  const [shouldShake, setShouldShake] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Shake animation every 10 seconds
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 600); // Animation duration
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-50 transform transition-all duration-300">
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-lg"
        aria-label={isCollapsed ? "Show cart" : "Hide cart"}
      >
        {isCollapsed ? (
          <ChevronUp className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-600" />
        )}
      </button>

      {/* Cart Content */}
      <div className={`max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 transition-all duration-300 ${isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          {/* Product Info */}
          <div className="hidden sm:flex items-center gap-4 flex-1 min-w-0">
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
          <div className="flex items-center">
            <div className="flex items-center rounded-full bg-white border border-gray-200 shadow-sm overflow-hidden">
              <button
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                className="h-11 w-11 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4 text-gray-700" />
              </button>
              <span className="px-4 min-w-[48px] text-center font-bold text-base text-gray-900 select-none">
                {quantity}
              </span>
              <button
                onClick={() => onQuantityChange(quantity + 1)}
                className="h-11 w-11 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={onAddToCart}
            className={`flex-1 sm:flex-none sm:min-w-[unset] min-w-[150px] h-12 sm:h-12 px-4 sm:px-6 inline-flex items-center justify-center gap-2 rounded-full font-bold text-sm uppercase bg-pink-400 text-white hover:bg-pink-400 shadow-md active:scale-95 transition ${shouldShake ? 'animate-subtle-shake' : ''}`}
          >
            <ShoppingCart className="h-5 w-5" />
            Add to Cart
          </button>

          {/* Shopping Cart Icon (desktop only) */}
          <div className="hidden sm:flex w-12 h-12 bg-pink-100 rounded-full items-center justify-center hover:bg-pink-200 transition-colors cursor-pointer">
            <ShoppingCart className="h-6 w-6 text-pink-500" />
          </div>
        </div>
      </div>
    </div>
  );
};
