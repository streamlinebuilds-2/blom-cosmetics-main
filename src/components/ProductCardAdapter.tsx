// src/components/ProductCardAdapter.tsx
import React from 'react';
import { ProductCard } from './ProductCard';
import { Product } from '../lib/products';

interface ProductCardAdapterProps {
  product: Product;
}

export function ProductCardAdapter({ product }: ProductCardAdapterProps) {
  // Safe extraction of first image
  const image = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : (product.image || '/placeholder.png');

  return (
    <ProductCard
      id={product.id}
      name={product.name}
      slug={product.slug}
      price={product.price}
      images={product.images}
    />
  );
}