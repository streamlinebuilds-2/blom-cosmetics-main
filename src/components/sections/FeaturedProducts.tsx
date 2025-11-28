import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ProductCard } from '../ProductCard';
import { Container } from '../layout/Container';

export const FeaturedProducts = () => {
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        // 1. Fetch the 3 slots from your new 'featured_items' table
        const { data, error } = await supabase
          .from('featured_items')
          .select(`
            slot_number,
            custom_image_url,
            products (
              id, name, slug, price, compare_at_price,
              short_description, thumbnail_url, category, stock
            )
          `)
          .not('product_id', 'is', null) // Only get slots that have products
          .order('slot_number');

        if (error) throw error;

        if (data) {
          // 2. Transform the data
          const items = data.map((item: any) => {
            const p = item.products;
            // Safety check if product was deleted
            if (!p) return null;

            return {
              id: p.id,
              name: p.name,
              price: p.price,
              compareAtPrice: p.compare_at_price,
              // Use custom image if set, otherwise fallback to product thumbnail
              image: item.custom_image_url || p.thumbnail_url,
              shortDescription: p.short_description,
              slug: p.slug,
              inStock: (p.stock || 0) > 0,
              // Include variants data for products that have variations
              variants: p.variants || []
            };
          }).filter(Boolean); // Remove empty slots

          setFeatured(items);
        }
      } catch (err) {
        console.error('Error loading featured items:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  if (loading) return <div className="py-20 text-center">Loading favorites...</div>;
  if (featured.length === 0) return null;

  return (
    <section className="section-padding bg-white">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">This Week's Favorites</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our most loved products, curated just for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featured.map((item) => (
            <ProductCard
              key={item.id}
              id={item.id}
              name={item.name}
              slug={item.slug}
              price={item.price}
              compareAtPrice={item.compareAtPrice}
              shortDescription={item.shortDescription}
              // CRITICAL FIX: ProductCard expects an array of strings for 'images'
              images={[item.image]}
              inStock={item.inStock}
              hoverShine={true}
              variants={item.variants || []}
            />
          ))}
        </div>
      </Container>
    </section>
  );
};
