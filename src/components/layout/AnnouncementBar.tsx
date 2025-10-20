import React from 'react';
import { Truck } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  return (
    <div 
      className="py-1 px-2 sm:py-2 sm:px-4 relative z-50 w-full" 
      style={{ 
        backgroundColor: '#CEE5FF',
        display: 'block',
        position: 'relative',
        width: '100%'
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold text-gray-800">
        <Truck className="h-3 w-3 sm:h-4 sm:w-4 text-gray-800" />
        <span>FREE SHIPPING ON ORDERS OVER R1500</span>
      </div>
    </div>
  );
};
