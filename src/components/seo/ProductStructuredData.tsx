import React from 'react';

interface ProductStructuredDataProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    image: string;
    inStock: boolean;
    category: string;
    brand: string;
  };
}

export const ProductStructuredData: React.FC<ProductStructuredDataProps> = ({ product }) => {
  // Robust fallback if image is missing
  const image = product.image || '/blom-academy-favicon.webp';
  const imageUrl = image.startsWith('http') ? image : `https://blom-cosmetics.co.za${image}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": imageUrl,
    "brand": {
      "@type": "Brand",
      "name": product.brand
    },
    "category": product.category,
    "sku": product.id,
    "offers": {
      "@type": "Offer",
      "url": `https://blom-cosmetics.co.za/products/${product.id}`,
      "priceCurrency": "ZAR",
      "price": product.price,
      "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "BLOM Cosmetics"
      }
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  );
};
