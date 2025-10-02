import React, { useState } from 'react';
import { X, Truck } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  // Check if user has already signed up
  const hasSignedUp = (() => {
    try {
      return localStorage.getItem('blom_user_signed_up') === 'true';
    } catch {
      return false;
    }
  })();
  
  const [isVisible, setIsVisible] = useState(() => {
    if (hasSignedUp) return false;
    try {
      return sessionStorage.getItem('signup_banner_closed') !== '1';
    } catch {
      return true;
    }
  });

  if (!isVisible || hasSignedUp) return null;

  return (
    <div className="bg-gradient-to-r from-pink-500 via-pink-400 to-pink-500 text-white py-2 px-4 relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm font-semibold">
        <Truck className="h-4 w-4" />
        <span>FREE SHIPPING ON ORDERS OVER R1500</span>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Close announcement"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
