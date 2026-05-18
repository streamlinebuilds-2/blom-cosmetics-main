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
        // Fire both queries in parallel — featured slots + all Colour Acrylics variants
        const [{ data, error }, { data: allColourAcrylics }] = await Promise.all([
          supabase
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
            .not('product_id', 'is', null)
            .order('slot_number'),
          supabase
            .from('products')
            .select('id, name, price, thumbnail_url, stock, product_variants(id, title, price, inventory_quantity)')
            .ilike('name', 'Colour Acrylics%')
            .eq('status', 'active')
        ]);

        if (error) throw error;

        if (data) {
          const items = data.map((item: any) => {
            const p = item.products;
            if (!p) return null;

            const variants = Array.isArray(p.product_variants)
              ? p.product_variants.map((v: any) => {
                  if (typeof v === 'string') return { name: v, inStock: true };
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
              image: item.custom_image_url || p.thumbnail_url,
              shortDescription: p.short_description,
              slug: p.slug,
              inStock: (p.stock || 0) > 0,
              variants
            };
          }).filter(Boolean);

          // Build Colour Acrylics variant list from the pre-fetched parallel query
          const colourAcrylicVariants: any[] = [];
          if (Array.isArray(allColourAcrylics)) {
            allColourAcrylics.forEach((product: any) => {
              if (Array.isArray(product.product_variants) && product.product_variants.length > 0) {
                product.product_variants.forEach((variant: any) => {
                  if (!colourAcrylicVariants.find(v => v.name === (variant.title || variant.name))) {
                    colourAcrylicVariants.push({
                      name: variant.title || variant.name || '',
                      price: variant.price || product.price,
                      inStock: (variant.inventory_quantity || product.stock || 0) > 0,
                      image: variant.image || product.thumbnail_url
                    });
                  }
                });
              } else {
                const variantName = product.name.includes(' - ')
                  ? product.name.split(' - ').slice(1).join(' - ')
                  : product.name.replace(/^Colour Acrylics\s*/i, '').trim() || 'Default';
                if (!colourAcrylicVariants.find(v => v.name === variantName)) {
                  colourAcrylicVariants.push({
                    name: variantName,
                    price: product.price,
                    inStock: (product.stock || 0) > 0,
                    image: product.thumbnail_url
                  });
                }
              }
            });
          }

          const transformedItems = items.map((item: any) => {
            const isColourAcrylics = item.name && item.name.toLowerCase().includes('colour acrylics');
            if (!isColourAcrylics) return item;
            return {
              ...item,
              name: item.name.split(' - ')[0],
              shortDescription: 'Professional grade polymer powder for perfect sculpting and strength.',
              variants: colourAcrylicVariants.length > 0 ? colourAcrylicVariants : item.variants
            };
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
