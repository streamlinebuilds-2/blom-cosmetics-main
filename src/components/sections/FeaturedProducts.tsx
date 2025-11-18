import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase'; // Adjust path if needed
import { ProductCard } from '../ProductCard'; // Adjust path if needed
import { Container } from '../layout/Container'; // Adjust path if needed

export const FeaturedProducts = () => {
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        // 1. Fetch the 3 slots from your new 'featured_items' table
        // We join the 'products' table to get the name/price info
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
          .not('product_id', 'is', null) // Only show slots that have a product selected
          .order('slot_number');

        if (error) throw error;

        if (data) {
          // 2. Transform the data into the format ProductCard expects
          const items = data.map((item: any) => {
            const p = item.products;
            // If product was deleted but slot remains, p might be null
            if (!p) return null;

            return {
              id: p.id,
              name: p.name,
              price: p.price,
              compareAtPrice: p.compare_at_price,
              // CRITICAL: This line prefers your Admin Custom Image over the default
              image: item.custom_image_url || p.thumbnail_url,
              category: p.category,
              slug: p.slug,
              inStock: p.stock > 0
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
  if (featured.length === 0) return null; // Hide section if no slots are set

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
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
};
