import React from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  title?: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  productName?: string;
  productPrice?: number;
  productCategory?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  title,
  className = '',
  width,
  height,
  loading = 'lazy',
  priority = false,
  productName,
  productPrice,
  productCategory
}) => {
  // Generate comprehensive alt text for SEO
  const generateAltText = () => {
    if (alt) return alt;
    
    if (productName) {
      return `${productName} - Premium nail care product by BLOM Cosmetics${productPrice ? ` - R${productPrice}` : ''}${productCategory ? ` - ${productCategory}` : ''}`;
    }
    
    return 'BLOM Cosmetics - Premium nail care products and professional training South Africa';
  };

  // Generate title for better SEO
  const generateTitle = () => {
    if (title) return title;
    if (productName) return `${productName} - Shop at BLOM Cosmetics`;
    return 'BLOM Cosmetics - Premium Nail Care Products South Africa';
  };

  // Ensure proper image URL
  const imageUrl = src.startsWith('http') ? src : `https://blom-cosmetics.co.za${src}`;

  return (
    <>
      <img
        src={src}
        alt={generateAltText()}
        title={generateTitle()}
        className={className}
        width={width}
        height={height}
        loading={priority ? 'eager' : loading}
        decoding="async"
        style={{
          maxWidth: '100%',
          height: 'auto'
        }}
        // Add structured data attributes for better indexing
        data-product-name={productName}
        data-product-price={productPrice}
        data-product-category={productCategory}
        // Add schema.org microdata
        itemProp="image"
      />
      
      {/* Add structured data for the image if it's a product */}
      {productName && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ImageObject",
              "contentUrl": imageUrl,
              "name": productName,
              "description": generateAltText(),
              "thumbnailUrl": imageUrl,
              "caption": `${productName} - Premium nail care product`,
              "keywords": [
                productName,
                "nail care",
                "beauty products",
                "BLOM Cosmetics",
                "South Africa",
                productCategory || "nail supplies"
              ].filter(Boolean),
              "license": "https://blom-cosmetics.co.za",
              "creator": {
                "@type": "Organization",
                "name": "BLOM Cosmetics"
              }
            })
          }}
        />
      )}
    </>
  );
};
