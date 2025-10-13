import React from 'react';
import { Truck } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  return (
    <div 
      className="py-2 px-4 relative z-50 w-full" 
      style={{ 
        backgroundColor: '#8EC5FF',
        display: 'block',
        position: 'relative',
        width: '100%'
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm font-semibold text-white">
        <Truck className="h-4 w-4 text-white" />
        <span>FREE SHIPPING ON ORDERS OVER R1500</span>
      </div>
    </div>
  );
};
