import React, { useState, useEffect } from 'react';
import { Container } from '../layout/Container';
import { ProductCard } from '../ProductCard';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Product, ProductImage } from '../../lib/supabase';
import { cartStore, showNotification } from '../../lib/cart';

interface ProductWithImages extends Product {
  product_images: ProductImage[];
}

export const FeaturedProducts: React.FC = () => {
  const [products, setProducts] = useState<ProductWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleViewAllClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.location.assign('/shop');
    } catch {
      window.location.assign('/shop');
    }
  };

  useEffect(() => {
    // Use specially made bestseller products with special images
    const bestsellerProducts = [
      {
        id: '2',
        name: 'Vitamin Primer',
        slug: 'vitamin-primer',
        price: 210,
        compare_at_price: null,
        short_description: 'Essential nail preparation for lasting results',
        product_images: [
          { image_url: '/primer-01.webp', sort_order: 1 }
        ]
      },
      {
        id: '9',
        name: 'Core Acrylics (56 g)',
        slug: 'core-acrylics',
        price: 280,
        compare_at_price: null,
        short_description: 'Professional grade acrylic powder for perfect sculpting',
        product_images: [
          { image_url: '/acrylic-powder-01.webp', sort_order: 1 }
        ]
      },
      {
        id: '10',
        name: 'Nail Liquid (Monomer)',
        slug: 'nail-liquid-monomer',
        price: 380,
        compare_at_price: null,
        short_description: 'High-quality monomer for smooth application',
        product_images: [
          { image_url: '/nail-liquid-monomer.webp', sort_order: 1 }
        ]
      }
    ];

    setProducts(bestsellerProducts as ProductWithImages[]);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <section className="section-padding">
        <Container>
          <div className="text-center mb-12">
            <p className="uppercase tracking-wide text-sm font-semibold text-slate-500 mb-2">EXPLORE THE COLLECTION</p>
            <h2 className="heading-with-stripe">BEST SELLERS</h2>
            <p className="section-subheader">
              Premium, HEMA-free formulas with a soft, salon-perfect finish — loved by nail artists across South Africa.
            </p>
          </div>
          <div className="grid-responsive">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <CardContent>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-20 bg-gray-200 rounded"></div>
                    <div className="h-10 w-24 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </div>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  if (error || products.length === 0) {
    // Fallback to static data if database fails
    const fallbackProducts = [
      {
        id: '2',
        slug: 'vitamin-primer',
        name: 'Vitamin Primer',
        price: 210,
        image: '/primer-01.webp',
        description: 'Essential nail preparation for lasting results'
      },
      {
        id: '9',
        slug: 'core-acrylics',
        name: 'Core Acrylics (56 g)',
        price: 280,
        image: '/acrylic-powder-01.webp',
        description: 'Professional grade acrylic powder for perfect sculpting'
      },
      {
        id: '10',
        slug: 'nail-liquid-monomer',
        name: 'Nail Liquid (Monomer)',
        price: 380,
        image: '/nail-liquid-monomer.webp',
        description: 'High-quality monomer for smooth application'
      }
    ];

    return (
      <section className="section-padding">
        <Container>
          <div className="text-center mb-12">
            <p className="uppercase tracking-wide text-sm font-semibold text-slate-500 mb-2">EXPLORE THE COLLECTION</p>
            <h2 className="heading-with-stripe">BEST SELLERS</h2>
            <p className="section-subheader">
              Premium, HEMA-free formulas with a soft, salon-perfect finish — loved by nail artists across South Africa.
            </p>
          </div>

          <div className="grid-responsive">
            {fallbackProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                shortDescription={product.description}
                images={[product.image]}
                inStock={true}
                badges={['Bestseller']}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <a href="/shop" className="inline-block" onClick={handleViewAllClick}>
              <Button size="lg" variant="outline">
                View All Products
              </Button>
            </a>
          </div>
        </Container>
      </section>
    );
  }

  return (
      <section className="section-padding">
        <Container>
          <div className="text-center mb-12">
            <p className="uppercase tracking-wide text-sm font-semibold text-slate-500 mb-2">EXPLORE THE COLLECTION</p>
            <h2 className="heading-with-stripe">BEST SELLERS</h2>
            <p className="section-subheader">
              Premium, HEMA-free formulas with a soft, salon-perfect finish — loved by nail artists across South Africa.
            </p>
          </div>

        <div className="grid-responsive">
          {products.map((product) => {
            const images = product.product_images.map(img => img.image_url);

            return (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                compareAtPrice={product.compare_at_price}
                shortDescription={product.short_description}
                images={images}
                inStock={true}
                badges={['Bestseller']}
              />
            );
          })}
        </div>

        <div className="text-center mt-12">
          <a href="/shop" className="inline-block" onClick={handleViewAllClick}>
            <Button size="lg" variant="outline">
              View All Products
            </Button>
          </a>
        </div>
      </Container>
    </section>
  );
};

