import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
  text?: string;
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  text,
  variant = 'spinner'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'border-primary',
    secondary: 'border-secondary',
    white: 'border-white'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div
            className={`
              ${sizeClasses[size]}
              border-2 ${colorClasses[color]}
              border-t-transparent
              rounded-full
              animate-spin
            `}
          />
        );
      
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`
                  ${color === 'white' ? 'bg-white' : 'bg-current'}
                  ${size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'}
                  rounded-full
                  animate-bounce
                `}
                style={{
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        );
      
      case 'pulse':
        return (
          <div
            className={`
              ${sizeClasses[size]}
              ${color === 'white' ? 'bg-white' : 'bg-current'}
              rounded-full
              animate-pulse
            `}
          />
        );
      
      case 'skeleton':
        return (
          <div className="space-y-3 w-full">
            <div className="skeleton h-4 rounded w-full"></div>
            <div className="skeleton h-4 rounded w-3/4"></div>
            <div className="skeleton h-4 rounded w-1/2"></div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (variant === 'skeleton') {
    return (
      <div className={className}>
        {renderSpinner()}
        {text && (
          <p className={`mt-3 text-center text-neutral-600 ${textSizeClasses[size]}`}>
            {text}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {renderSpinner()}
      {text && (
        <p className={`text-center text-neutral-600 ${textSizeClasses[size]}`}>
          {text}
        </p>
      )}
    </div>
  );
};

// Inline loading spinner for buttons
export const InlineLoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        border-2 border-white border-t-transparent
        rounded-full
        animate-spin
        mr-2
      `}
    />
  );
};

// Page loading component
export const PageLoadingSpinner: React.FC<{ text?: string }> = ({
  text = 'Loading...'
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-pink-100 to-blue-100">
      <div className="text-center">
        <LoadingSpinner 
          size="xl" 
          color="primary" 
          className="mb-6"
        />
        <p className="text-xl text-neutral-700 font-medium">
          {text}
        </p>
      </div>
    </div>
  );
};

// Product card skeleton loader
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="card-enhanced p-4 animate-pulse">
      <div className="aspect-square bg-neutral-200 rounded-xl mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
        <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
        <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
        <div className="h-10 bg-neutral-200 rounded-full"></div>
      </div>
    </div>
  );
};

// List of skeleton cards
export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};