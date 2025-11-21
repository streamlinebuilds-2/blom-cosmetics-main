import React, { useEffect, useState } from 'react';

interface SkeletonProps {
  className?: string;
  rows?: number;
  showImage?: boolean;
  variant?: 'card' | 'text' | 'button' | 'avatar' | 'image';
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({
  className = '',
  rows = 1,
  showImage = false,
  variant = 'text'
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  const baseClasses = "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]";
  
  const variantClasses = {
    card: "rounded-2xl h-80 w-full",
    text: "h-4 rounded w-full",
    button: "h-12 rounded-full w-32",
    avatar: "h-12 w-12 rounded-full",
    image: "aspect-square w-full rounded-2xl"
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className} ${variant === 'text' ? 'mt-2' : ''}`} 
         style={{ 
           animation: 'shimmer 2s ease-in-out infinite alternate',
           background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
           backgroundSize: '200% 100%'
         }}>
      {/* Repeat for text rows */}
      {variant === 'text' && rows > 1 && (
        <>
          {Array.from({ length: rows }, (_, i) => (
            <div 
              key={i} 
              className={`${baseClasses} h-4 rounded ${i === rows - 1 ? 'w-3/4' : 'w-full'} mt-2`}
              style={{ 
                animation: 'shimmer 2s ease-in-out infinite alternate',
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%'
              }}
            />
          ))}
        </>
      )}
      
      {/* Image placeholder */}
      {showImage && (
        <div className="aspect-square w-full rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300" />
      )}
    </div>
  );
};

// Product Card Skeleton
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-md animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl mb-4" />
      
      {/* Title skeleton */}
      <div className="h-6 bg-gray-200 rounded-lg mb-3 w-3/4 mx-auto" />
      
      {/* Description skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto" />
      </div>
      
      {/* Price skeleton */}
      <div className="h-8 bg-gray-200 rounded-lg mb-4 w-1/2 mx-auto" />
      
      {/* Button skeleton */}
      <div className="h-12 bg-gray-200 rounded-full w-full" />
    </div>
  );
};

// Collection of skeleton components
export const SkeletonGrid: React.FC<{ count?: number; className?: string }> = ({ 
  count = 6, 
  className = '' 
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

export default SkeletonLoader;