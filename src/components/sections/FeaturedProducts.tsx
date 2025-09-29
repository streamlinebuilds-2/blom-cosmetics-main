import React, { useState, useEffect } from 'react';
import { Container } from '../layout/Container';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { queries, Product, ProductImage } from '../../lib/supabase';

interface ProductWithImages extends Product {
  product_images: ProductImage[];
}

export const FeaturedProducts: React.FC = () => {
  const [products, setProducts] = useState<ProductWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            <h2 className="text-4xl font-bold mb-4">Featured Products</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our most popular products trusted by professionals worldwide
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
        name: 'Vitamin Primer',
        price: 299,
        image: 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
        description: 'Essential nail preparation for lasting results'
      },
      {
        id: '2',
        name: 'Premium Acrylic Powder',
        price: 450,
        image: 'https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
        description: 'Professional grade acrylic powder for perfect sculpting'
      },
      {
        id: '3',
        name: 'Crystal Clear Liquid',
        price: 380,
        image: 'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
        description: 'High-quality monomer for smooth application'
      }
    ];

    return (
      <section className="section-padding">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Featured Products</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our most popular products trusted by professionals worldwide
            </p>
          </div>

          <div className="grid-responsive">
            {fallbackProducts.map((product) => (
              <Card key={product.id} className="group cursor-pointer">
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
                    <Button size="sm">Add to Cart</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline">
              View All Products
            </Button>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="section-padding">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Featured Products</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our most popular products trusted by professionals worldwide
          </p>
        </div>

        <div className="grid-responsive">
          {products.map((product) => {
            const primaryImage = product.product_images.find(img => img.sort_order === 1) || product.product_images[0];
            const imageUrl = primaryImage?.image_url || 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop';

            return (
              <Card key={product.id} className="group cursor-pointer">
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
                    <Button size="sm">Add to Cart</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline">
            View All Products
          </Button>
        </div>
      </Container>
    </section>
  );
};