import React, { useState, useEffect } from 'react';
import { Container } from '../layout/Container';
import { ProductCard } from '../ProductCard';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { queries, Product, ProductImage } from '../../lib/supabase';
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
      const overlay = document.createElement('div');
      overlay.className = 'page-transition-overlay';
      document.body.appendChild(overlay);
      window.setTimeout(() => {
        window.location.assign('/shop');
      }, 500);
    } catch {
      window.location.assign('/shop');
    }
  };

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const data = await queries.getFeaturedProducts();
        setProducts(data as ProductWithImages[]);
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError('Failed to load featured products');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  if (loading) {
    return (
      <section className="section-padding">
        <Container>
          <div className="text-center mb-12">
            <p className="uppercase tracking-wide text-sm font-semibold text-slate-500 mb-2">EXPLORE THE COLLECTION</p>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-3 text-slate-900">BEST SELLERS</h2>
            <div className="h-1 w-16 bg-blue-200 rounded-full mx-auto mb-4" />
            <p className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto">
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
        image: '/nail-liquid-01.webp',
        description: 'High-quality monomer for smooth application'
      }
    ];

    return (
      <section className="section-padding">
        <Container>
          <div className="text-center mb-12">
            <p className="uppercase tracking-wide text-sm font-semibold text-slate-500 mb-2">EXPLORE THE COLLECTION</p>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-3 text-slate-900">BEST SELLERS</h2>
            <div className="h-1 w-16 bg-blue-200 rounded-full mx-auto mb-4" />
            <p className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto">
              Premium, HEMA-free formulas with a soft, salon-perfect finish — loved by nail artists across South Africa.
            </p>
          </div>

          <div className="grid-responsive">
            {fallbackProducts.map((product) => (
              <a key={product.id} href={`/products/${product.slug}`} className="block">
                <Card className="group cursor-pointer relative overflow-hidden">
                  {/* Lux shimmer overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none hidden md:block">
                    <div className="shimmer shimmer--lux" />
                  </div>
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent>
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-pink-400">R{product.price}</span>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          cartStore.addItem({
                            id: `item_${Date.now()}`,
                            productId: product.slug,
                            name: product.name,
                            price: product.price,
                            image: product.image
                          });
                          showNotification(`Added ${product.name} to cart!`);
                          const trigger = document.getElementById('cart-drawer-trigger');
                          if (trigger) (trigger as HTMLDivElement).click();
                        }}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </a>
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
            <h2 className="text-4xl md:text-5xl font-extrabold mb-3 text-slate-900">BEST SELLERS</h2>
            <div className="h-1 w-16 bg-blue-200 rounded-full mx-auto mb-4" />
            <p className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto">
              Premium, HEMA-free formulas with a soft, salon-perfect finish — loved by nail artists across South Africa.
            </p>
          </div>

        <div className="grid-responsive">
          {products.map((product) => {
            const primaryImage = product.product_images.find(img => img.sort_order === 1) || product.product_images[0];
            const imageUrl = primaryImage?.image_url || 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop';

            return (
              <a key={product.id} href={`/products/${product.slug}`} className="block">
                <Card className="group cursor-pointer relative overflow-hidden">
                  {/* Lux shimmer overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none hidden md:block">
                    <div className="shimmer shimmer--lux" />
                  </div>
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={primaryImage?.alt_text || product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop';
                      }}
                    />
                  </div>
                  <CardContent>
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{product.short_description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-pink-400">R{product.price}</span>
                        {product.compare_at_price && (
                          <span className="text-sm text-gray-400 line-through">
                            R{product.compare_at_price}
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          cartStore.addItem({
                            id: `item_${Date.now()}`,
                            productId: product.slug,
                            name: product.name,
                            price: product.price,
                            image: imageUrl
                          });
                          showNotification(`Added ${product.name} to cart!`);
                          const trigger = document.getElementById('cart-drawer-trigger');
                          if (trigger) (trigger as HTMLDivElement).click();
                        }}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </a>
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
