import React, { useState } from 'react';
import { X, Truck } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  // Keep previous key for dismissing per session
  const [isVisible, setIsVisible] = useState(() => {
    try {
      return sessionStorage.getItem('signup_banner_closed') !== '1';
    } catch {
      return true;
    }
  });

  if (!isVisible) return null;

  return (
    <div className="py-2 px-4 relative z-50" style={{ backgroundColor: '#FF74A4' }}>
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm font-semibold text-white">
        <Truck className="h-4 w-4 text-white" />
        <span>FREE SHIPPING ON ORDERS OVER R1500</span>
        <button
          aria-label="Dismiss announcement"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/90 hover:text-white"
          onClick={() => {
            try { sessionStorage.setItem('signup_banner_closed', '1'); } catch {}
            setIsVisible(false);
          }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
