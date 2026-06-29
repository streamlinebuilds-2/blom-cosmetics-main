import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ProductCard } from '../ProductCard';
import { Container } from '../layout/Container';

// "New & Featured" — an auto-scrolling marquee of the newest in-stock products.
// We scan the most recently added products and pick 6 with variety (so the row
// isn't six near-identical acrylic colours), then loop them right-to-left.

interface FeaturedItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  shortDescription?: string;
  image: string;
  inStock: boolean;
}

// Collapse close variants into one "family" so the picker can enforce variety.
const familyKey = (name: string): string => {
  const n = (name || '').toLowerCase();
  if (n.includes('acrylic')) {
    if (n.includes('glitter')) return 'glitter-acrylics';
    if (n.includes('core')) return 'core-acrylics';
    return 'colour-acrylics';
  }
  // Otherwise the base name before any code/size qualifier.
  return n.replace(/\(.*?\)/g, '').split(/[-–—]/)[0].trim() || n;
};

const stockLevel = (p: any): number =>
  Math.max(
    Number(p.stock_on_hand) || 0,
    Number(p.stock_available) || 0,
    Number(p.stock) || 0,
    Number(p.inventory_quantity) || 0,
  );

// Pick up to `count` items, preferring one per family first, then filling.
const pickWithVariety = (items: FeaturedItem[], families: string[], count: number): FeaturedItem[] => {
  const picked: FeaturedItem[] = [];
  const used = new Set<number>();
  const famCount: Record<string, number> = {};

  for (let cap = 1; cap <= 3 && picked.length < count; cap++) {
    for (let i = 0; i < items.length && picked.length < count; i++) {
      if (used.has(i)) continue;
      const k = families[i];
      if ((famCount[k] || 0) < cap) {
        picked.push(items[i]);
        used.add(i);
        famCount[k] = (famCount[k] || 0) + 1;
      }
    }
  }
  return picked;
};

export const FeaturedProducts: React.FC = () => {
  const [items, setItems] = useState<FeaturedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, slug, price, compare_at_price, short_description, thumbnail_url, image_url, product_type, status, out_of_stock, stock, stock_on_hand, stock_available, inventory_quantity, created_at')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(40);

        if (error || !data || cancelled) {
          if (!cancelled) setLoading(false);
          return;
        }

        const available: FeaturedItem[] = data
          .filter((p: any) =>
            (p.product_type || '') !== 'course' &&
            p.out_of_stock !== true &&
            stockLevel(p) > 0 &&
            (p.thumbnail_url || p.image_url),
          )
          .map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: Number(p.price) || 0,
            compareAtPrice: p.compare_at_price ? Number(p.compare_at_price) : undefined,
            shortDescription: p.short_description,
            image: p.thumbnail_url || p.image_url,
            inStock: true,
          }));

        const families = available.map((it) => familyKey(it.name));
        const chosen = pickWithVariety(available, families, 6);

        if (!cancelled) {
          setItems(chosen);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Duplicate the list so the marquee loops seamlessly (translateX 0 -> -50%).
  const loopItems = useMemo(() => (items.length ? [...items, ...items] : []), [items]);
  // Slow it down as the list grows so speed feels consistent.
  const durationSec = Math.max(28, items.length * 7);

  if (loading) return <div className="py-20 text-center text-gray-400">Loading new arrivals…</div>;
  if (items.length === 0) return null;

  return (
    <section className="section-padding bg-white overflow-hidden">
      <Container>
        <div className="text-center mb-10 md:mb-12">
          <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-pink-500 mb-3">Fresh Drops</span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">New &amp; Featured</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            The latest additions to the BLOM range — freshly stocked and ready to shop.
          </p>
        </div>
      </Container>

      {/* Full-bleed marquee track */}
      <div className="nf__marquee" aria-label="New and featured products carousel">
        <ul className="nf__track" style={{ ['--nf-duration' as any]: `${durationSec}s` }}>
          {loopItems.map((item, idx) => (
            <li className="nf__slide" key={`${item.id}-${idx}`} aria-hidden={idx >= items.length}>
              <ProductCard
                id={item.id}
                name={item.name}
                slug={item.slug}
                price={item.price}
                compareAtPrice={item.compareAtPrice}
                shortDescription={item.shortDescription}
                images={[item.image]}
                inStock={item.inStock}
                badges={['New']}
                hoverShine={true}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
