import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { wishlistStore } from '../../lib/wishlist';

export const WishlistButton: React.FC = () => {
  const [itemCount, setItemCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Initialize count
    setItemCount(wishlistStore.getItemCount());

    // Subscribe to wishlist changes
    const unsubscribe = wishlistStore.subscribe(() => {
      const newCount = wishlistStore.getItemCount();
      setItemCount(newCount);
      
      // Trigger animation when items are added or removed
      if (newCount !== itemCount) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
      }
    });

    return unsubscribe;
  }, [itemCount]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    // Smooth scroll to top first
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Navigate to dedicated wishlist page
    setTimeout(() => {
      window.location.href = '/wishlist';
    }, 100);
  };

  return (
    <a
      href="/wishlist"
      onClick={handleClick}
      className="relative p-2.5 text-gray-700 hover:text-pink-400 transition-all duration-200 group"
      aria-label={`Wishlist (${itemCount} items)`}
    >
      <Heart
        className={`h-6 w-6 transition-all duration-200 ${
          itemCount > 0
            ? 'fill-current text-pink-400 group-hover:text-pink-500'
            : 'group-hover:text-pink-400'
        } ${isAnimating ? 'scale-110' : ''}`}
        strokeWidth={2}
      />

      {itemCount > 0 && (
        <span
          className={`absolute -top-0.5 -right-0.5 bg-pink-400 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transition-all duration-200 ${
            isAnimating ? 'scale-110' : ''
          }`}
        >
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </a>
  );
};
