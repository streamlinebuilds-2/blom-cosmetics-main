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
        // 1. Fetch the 3 slots + INCLUDE product_variants
        const { data, error } = await supabase
          .from('featured_items')
          .select(`
            slot_number,
            custom_image_url,
            products (
              id, name, slug, price, compare_at_price,
              short_description, thumbnail_url, category, stock,
              product_variants (
                id,
                title,
                price,
                inventory_quantity
              )
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

            // Map database variants to ProductCard format (same robust logic as ShopPage)
            const variants = Array.isArray(p.product_variants)
              ? p.product_variants.map((v: any) => {
                  // Handle both object and string variants
                  if (typeof v === 'string') {
                    return { name: v, inStock: true };
                  }
                  return {
                    name: v.name || v.label || v.title || '',
                    label: v.label || v.name || v.title || '',
                    inStock: v.inStock ?? v.in_stock ?? (v.inventory_quantity || 0) > 0,
                    image: v.image || v.image_url || null,
                    price: v.price || null
                  };
                })
              : [];

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
              variants: variants // <--- Pass the fetched variants here
            };
          }).filter(Boolean); // Remove empty slots

          // Transform Colour Acrylics products
          const transformedItems = items.map((item: any) => {
            // Check if this is a Colour Acrylics product (case-insensitive)
            const isColourAcrylics = item.name && item.name.toLowerCase().includes('colour acrylics');
            
            if (isColourAcrylics) {
              // Remove variant suffix (e.g., "Colour Acrylics - Raspberry Santa" → "Colour Acrylics")
              const baseName = item.name.split(' - ')[0];
              
              return {
                ...item,
                name: baseName,
                shortDescription: 'Professional grade polymer powder for perfect sculpting and strength.',
                // Add custom navigation override to go to shop page with acrylic-system filter
                onCardClickOverride: () => {
                  window.location.href = '/shop#acrylic-system';
                }
              };
            }
            
            return item;
          });

          setFeatured(transformedItems);
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
              images={[item.image]}
              inStock={item.inStock}
              hoverShine={true}
              variants={item.variants} // <--- Ensure variants are passed to the card
              onCardClickOverride={item.onCardClickOverride} // <--- Pass custom navigation if provided
            />
          ))}
        </div>
      </Container>
    </section>
  );
};
