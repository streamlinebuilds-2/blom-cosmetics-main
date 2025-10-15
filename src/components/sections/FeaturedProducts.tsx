import React, { useState, useEffect } from 'react';
import { Container } from '../layout/Container';
import { ProductCard } from '../ProductCard';
import { HomepageBestSellerCard } from './HomepageBestSellerCard';
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
    // Use hardcoded bestseller products instead of Supabase query
    const bestsellerProducts = [
      {
        id: '1',
        name: 'Cuticle Oil',
        slug: 'cuticle-oil',
        price: 140,
        compare_at_price: null,
        short_description: 'Nourishing oil with Vitamin E, Jojoba & Soybean Oil.',
        product_images: [
          { image_url: '/cuticle-oil-white.webp', sort_order: 1 }
        ]
      },
      {
        id: '4',
        name: 'Top Coat',
        slug: 'top-coat',
        price: 190,
        compare_at_price: null,
        short_description: 'Mirror shine, chip-resistant, professional finish.',
        product_images: [
          { image_url: '/top-coat-white.webp', sort_order: 1 }
        ]
      },
      {
        id: '8',
        name: 'Acetone (Remover)',
        slug: 'acetone-remover',
        price: 60,
        compare_at_price: null,
        short_description: 'Professional-grade, fast acting nail remover.',
        product_images: [
          { image_url: '/acetone-remover-white.webp', sort_order: 1 }
        ]
      },
      {
        id: '9',
        name: 'Core Acrylics (56 g)',
        slug: 'core-acrylics',
        price: 280,
        compare_at_price: null,
        short_description: 'Professional acrylic powders in 13 beautiful colors.',
        product_images: [
          { image_url: '/core-acrylics-white.webp', sort_order: 1 }
        ]
      }
    ];

    setProducts(bestsellerProducts as ProductWithImages[]);
    setLoading(false);
  }, []);

  // Intersection Observer for mobile shimmer effect
  useEffect(() => {
    const observerOptions = {
      threshold: 0.5,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const shimmerElement = entry.target.querySelector('.shimmer');
          if (shimmerElement && !shimmerElement.classList.contains('shimmer-on-scroll')) {
            // Make container visible first
            const shimmerContainer = entry.target.querySelector('.absolute.inset-0');
            if (shimmerContainer) {
              shimmerContainer.style.opacity = '1';
              shimmerContainer.style.pointerEvents = 'none';
            }
            
            shimmerElement.classList.add('shimmer-on-scroll');
            // Remove class after animation to allow re-triggering
            setTimeout(() => {
              shimmerElement.classList.remove('shimmer-on-scroll');
              if (shimmerContainer) {
                shimmerContainer.style.opacity = '0';
              }
            }, 4000);
          }
        } else {
          // When element goes out of view, reset for re-triggering
          const shimmerElement = entry.target.querySelector('.shimmer');
          if (shimmerElement) {
            shimmerElement.classList.remove('shimmer-on-scroll');
            const shimmerContainer = entry.target.querySelector('.absolute.inset-0');
            if (shimmerContainer) {
              shimmerContainer.style.opacity = '0';
            }
          }
        }
      });
    }, observerOptions);

    // Observe all best seller cards
    const bestSellerCards = document.querySelectorAll('.best-seller-card');
    bestSellerCards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [products, loading, error]);

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
        id: '1',
        slug: 'vitamin-primer',
        name: 'Vitamin Primer',
        price: 299,
        image: '/primer-01.webp',
        description: 'Essential nail preparation for lasting results'
      },
      {
        id: '2',
        slug: 'crystal-clear-acrylic-56g',
        name: 'Crystal Clear Acrylic (56 g)',
        price: 450,
        image: '/acrylic-powder-01.webp',
        description: 'Professional grade acrylic powder for perfect sculpting'
      },
      {
        id: '3',
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
              <HomepageBestSellerCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                shortDescription={product.description}
                image={product.image}
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
            const primaryImage = product.product_images.find(img => img.sort_order === 1) || product.product_images[0];
            const imageUrl = primaryImage?.image_url || 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop';

            return (
              <HomepageBestSellerCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                compareAtPrice={product.compare_at_price}
                shortDescription={product.short_description}
                image={imageUrl}
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

