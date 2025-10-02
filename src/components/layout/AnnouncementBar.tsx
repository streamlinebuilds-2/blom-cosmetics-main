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
    <div className="text-gray-900 py-2 px-4 relative z-50" style={{ backgroundColor: '#CEE5FF' }}>
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm font-semibold">
        <Truck className="h-4 w-4" />
        <span>FREE SHIPPING ON ORDERS OVER R1500</span>
      </div>
    </div>
  );
};
