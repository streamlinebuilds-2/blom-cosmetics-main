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
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setHasScrolled(scrollPosition > 400);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isVisible || !hasScrolled) return;

    const interval = setInterval(() => {
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 600);
    }, 9000);

    return () => clearInterval(interval);
  }, [isVisible, hasScrolled]);

  if (!isVisible || !hasScrolled) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50 transition-all duration-300 ${
        isCollapsed ? 'translate-y-full' : 'translate-y-0'
      }`}
      style={{
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-t-xl px-4 py-2 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-md"
        aria-label={isCollapsed ? "Show cart" : "Hide cart"}
      >
        {isCollapsed ? (
          <ChevronUp className="h-5 w-5 text-gray-600" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-600" />
        )}
      </button>

      {/* Cart Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-4">
          {/* Product Info - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-4 flex-1 min-w-0">
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
              <img
                src={productImage}
                alt={productName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-gray-900 text-base truncate">{productName}</h4>
              <p className="text-pink-400 font-bold text-lg">R{productPrice.toFixed(2)}</p>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center">
            <div className="flex items-center rounded-full bg-white border-2 border-gray-200 overflow-hidden">
              <button
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                className="h-10 w-10 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4 text-gray-700" />
              </button>
              <span className="px-4 min-w-[48px] text-center font-bold text-base text-gray-900 select-none">
                {quantity}
              </span>
              <button
                onClick={() => onQuantityChange(quantity + 1)}
                className="h-10 w-10 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={onAddToCart}
            className={`flex items-center justify-center gap-2 px-6 sm:px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wide bg-pink-400 text-white hover:bg-pink-500 shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 ${
              shouldShake ? 'animate-subtle-shake' : ''
            }`}
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="hidden sm:inline">Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
