import React from 'react';

interface ProductBadgeProps {
  type: 'new' | 'sale' | 'soldout' | 'hot';
  discount?: number;
}

export const ProductBadge: React.FC<ProductBadgeProps> = ({ type, discount }) => {
  const badges = {
    new: {
      text: 'NEW',
      className: 'bg-blue-500 text-white'
    },
    sale: {
      text: discount ? `${discount}% OFF` : 'SALE',
      className: 'bg-red-500 text-white'
    },
    soldout: {
      text: 'SOLD OUT',
      className: 'bg-gray-800 text-white'
    },
    hot: {
      text: 'HOT',
      className: 'bg-orange-500 text-white'
    }
  };

  const badge = badges[type];

  return (
    <div className={`absolute top-4 left-4 ${badge.className} px-3 py-1 rounded-full text-xs font-bold uppercase shadow-lg z-10`}>
      {badge.text}
    </div>
  );
};
