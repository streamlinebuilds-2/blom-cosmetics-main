import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { cartStore, CartState } from '../../lib/cart';

interface CartButtonProps {
  onClick?: () => void;
  className?: string;
}

export const CartButton: React.FC<CartButtonProps> = ({ onClick, className = '' }) => {
  const [cartState, setCartState] = useState<CartState>(cartStore.getState());

  useEffect(() => {
    const unsubscribe = cartStore.subscribe(setCartState);
    return unsubscribe;
  }, []);

  const itemCount = cartStore.getItemCount();

  return (
    <button 
      onClick={(e) => {
        if (onClick) return onClick();
        // Fallback: open the global cart drawer if present
        const trigger = document.getElementById('cart-drawer-trigger');
        if (trigger) (trigger as HTMLDivElement).click();
      }}
      className={`p-2 text-gray-400 hover:text-gray-500 relative ${className}`}
    >
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-pink-400 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </button>
  );
};