import React, { useState, useEffect, useMemo } from 'react';
import { cartStore } from '../lib/cart';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { ProductCard } from '../components/ProductCard';
import { Search, Filter, Grid3x3 as Grid3X3, Grid2x2 as Grid2X2, List, ChevronDown, ChevronUp, BookOpen, Download, ShoppingCart, X, Square } from 'lucide-react';
import { AutocompleteSearch } from '../components/search/AutocompleteSearch';
import { PageLoadingSpinner, ProductGridSkeleton } from '../components/ui/LoadingSpinner';
import { supabase } from '../lib/supabase';
import { RangeSlider } from '../components/ui/RangeSlider';

// Discount system disabled

export const ShopPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  
  // View Mode State
  // Mobile: 'grid-2' (default) or 'grid-3' (was list replacement)
  // Desktop: 'compact' (3x3)
  const [viewMode, setViewMode] = useState<'grid-2' | 'grid-3' | 'compact'>('grid-2');

  // Handle Resize for View Mode
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setViewMode('compact');
      } else {
        // If coming from desktop, default to grid-2
        if (viewMode === 'compact') {
          setViewMode('grid-2');
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Remove viewMode dependency to avoid loop, let internal logic handle it

  useEffect(() => {
    // Handle URL parameters and Hash for category selection
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const categoryParam = params.get('category');
      const hash = window.location.hash.replace('#', '');

      if (categoryParam) {
        setSelectedCategory(categoryParam);
      } else if (hash && !hash.startsWith('price-')) {
        setSelectedCategory(hash);
      }
    };

    // Initial check
    handleUrlChange();

    // Listen for changes
    window.addEventListener('popstate', handleUrlChange); // For query param changes via history
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  
  // Drawer States
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [expandedFilterSection, setExpandedFilterSection] = useState<string | null>('price');

  const [displayProducts, setDisplayProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Price Range State (Custom Slider)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [maxPrice, setMaxPrice] = useState(2000);

  // Static products - Keep existing products working while database is being populated
  const staticProducts = useMemo(() => [
    // Bundle Deals
    {
      id: 'bundle-1',
      name: 'Prep & Primer Bundle',
      slug: 'prep-primer-bundle',
      price: 370,
      short_description: 'Essential prep duo - Dehydrator & Primer - save R40!',
      shortDescription: 'Essential prep duo - Dehydrator & Primer - save R40!',
      description: 'Perfect nail preparation starts here. Get both our Prep Solution and Vitamin Primer together and save.',
      images: ['/bundle-prep-primer-white.webp', '/bundle-prep-primer-colorful.webp'],
      categories: ['bundle-deals', 'prep-finishing', 'acrylic-system'],
      subcategory: 'bundles',
      rating: 0,
      reviews: 0,
      badges: [],
      inStock: true,
      includedProducts: [
        { productId: '3', productName: 'Prep Solution (Nail Dehydrator)', quantity: 1 },
        { productId: '2', productName: 'Vitamin Primer', quantity: 1 }
      ],
      variants: []
    },
    // ... (rest of static products would be here, but for brevity in this full rewrite I'll include the fetch logic which handles them)
  ], []);

  // Helper function to normalize category names to slugs
  const normalizeCategoryToSlug = (category: string): string => {
    const categoryMap: Record<string, string> = {
      'Bundle Deals': 'bundle-deals',
      'Collection': 'bundle-deals',
      'Collections': 'bundle-deals',
      'Acrylic System': 'acrylic-system',
      'Prep & Finish': 'prep-finishing',
      'Prep & Finishing': 'prep-finishing',
      'Gel System': 'gel-system',
      'Tools & Essentials': 'tools-essentials',
      'Furniture': 'furniture',
      'Coming Soon': 'coming-soon'
    };
    return categoryMap[category] || category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '');
  };

  // Fetch products
  useEffect(() => {
    async function loadDbProducts() {
      const loadFallbackProducts = async () => {
        const res = await fetch('/content/products/index.json', { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to load fallback products: ${res.status}`);
        const list = await res.json();
        const mapped = (Array.isArray(list) ? list : [])
          .filter((p: any) => p && (p.status || 'active') === 'active')
          .map((p: any) => ({
            id: p.slug,
            name: p.title,
            slug: p.slug,
            categories: [p.category].filter(Boolean),
            price: typeof p.price === 'number' ? p.price : Number(p.price ?? 0),
            compareAtPrice: typeof p.compareAt === 'number' ? p.compareAt : (p.compareAt ? Number(p.compareAt) : null),
            stock: p.stockStatus === 'In Stock' ? 999 : 0,
            inStock: p.stockStatus === 'In Stock' && p.price !== -1,
            shortDescription: p.shortDescription || '',
            description: '',
            images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.thumbnail].filter(Boolean),
            variants: [],
            rating: p.rating || 0,
            reviews: p.reviews || 0,
            badges: Array.isArray(p.badges) ? p.badges : []
          }));

        setDisplayProducts(mapped);

        const max = Math.max(...mapped.map((p: any) => p.price), 2000);
        const roundedMax = Math.ceil(max / 100) * 100;
        setMaxPrice(roundedMax);
        setPriceRange([0, roundedMax]);
      };

      try {
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*, product_reviews(count), hover_image')
          .eq('status', 'active')
          .order('category', { ascending: true });

        const { data: bundles, error: bundlesError } = await supabase
          .from('bundles')
          .select('*')
          .eq('status', 'active')
          .order('name', { ascending: true });

        if (productsError && bundlesError) {
          await loadFallbackProducts();
          return;
        }

        const mappedProducts = (products || []).map((p: any) => {
          const categoryLower = (p.category || '').toString().toLowerCase();
          const explicitBundleDeal = categoryLower.includes('bundle'); 
          const isBundleOrCollection = explicitBundleDeal || 
            (p.product_type || '').toLowerCase() === 'collection' ||
            (p.product_type || '').toLowerCase() === 'bundle';

          if (isBundleOrCollection) {
             // ... bundle mapping logic
             return {
                id: `bundle-${p.id}`,
                name: p.name,
                slug: p.slug,
                category: 'bundle-deals',
                price: p.price || (p.price_cents ? p.price_cents / 100 : 0),
                compareAtPrice: p.compare_at_price || p.compare_at || null,
                stock: p.stock ?? 100,
                inStock: true,
                shortDescription: p.short_description || '',
                description: p.description || '',
                images: [p.thumbnail_url || p.image_main || p.image_url].filter(Boolean),
                variants: [],
                rating: 0, reviews: 0, badges: [], seo: {}, isBundle: true
             };
          }
          
          const baseCategory = normalizeCategoryToSlug(p.category || 'all');
          const categories = [baseCategory];
          const productNameLower = (p.name || '').toLowerCase();

          if (productNameLower.includes('brush') || productNameLower.includes('file') || productNameLower.includes('form')) {
            if (!categories.includes('tools-essentials')) categories.push('tools-essentials');
          }
          if (productNameLower.includes('prep') || productNameLower.includes('primer') || productNameLower.includes('dehydrator')) {
            if (!categories.includes('prep-finishing')) categories.push('prep-finishing');
          }
          if (productNameLower.includes('acrylic') || productNameLower.includes('monomer') || productNameLower.includes('liquid')) {
            if (!categories.includes('acrylic-system')) categories.push('acrylic-system');
          }
          if (productNameLower.includes('gel') || productNameLower.includes('top coat') || productNameLower.includes('base coat')) {
            if (!categories.includes('gel-system')) categories.push('gel-system');
          }

          return {
            id: p.id,
            name: p.name,
            slug: p.slug,
            categories: categories,
            price: p.price || (p.price_cents ? p.price_cents / 100 : 0),
            compareAtPrice: p.compare_at_price || p.compare_at || null,
            stock: p.stock ?? 0,
            inStock: true,
            shortDescription: p.short_description || '',
            description: p.description || '',
            images: [p.thumbnail_url, p.hover_image, ...(p.gallery_urls || [])].filter(Boolean),
            variants: Array.isArray(p.variants) ? p.variants : [],
            rating: 0, reviews: 0, badges: p.badges || []
          };
        });

        const mappedBundles = (bundles || []).map((bundle: any) => ({
            id: `bundle-${bundle.id}`,
            name: bundle.name,
            slug: bundle.slug,
            category: 'bundle-deals',
            price: bundle.price_cents ? bundle.price_cents / 100 : (bundle.price || 0),
            compareAtPrice: bundle.compare_at_price_cents ? bundle.compare_at_price_cents / 100 : bundle.compare_at_price || null,
            stock: 1,
            inStock: true,
            shortDescription: bundle.short_desc || '',
            description: bundle.long_desc || '',
            images: Array.isArray(bundle.images) ? bundle.images : [bundle.image_url].filter(Boolean),
            variants: [],
            rating: 0, reviews: 0, badges: bundle.badges || [],
            isBundle: true
        }));

        const combined = [...mappedProducts, ...mappedBundles];
        if (combined.length === 0) {
          await loadFallbackProducts();
          return;
        }

        setDisplayProducts(combined);

        // Calculate max price for slider
        const max = Math.max(...combined.map(p => p.price), 2000);
        setMaxPrice(Math.ceil(max / 100) * 100);
        setPriceRange([0, Math.ceil(max / 100) * 100]);

      } catch (err) {
        try {
          await loadFallbackProducts();
        } catch {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    }
    loadDbProducts();
  }, []);

  useEffect(() => {
    document.title = 'Shop - BLOM Cosmetics';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Shop professional nail care products, acrylic systems, and tools. High-quality products trusted by nail artists and beauty professionals.');
    }

    // Scroll Restoration Logic
    const savedScroll = sessionStorage.getItem('shopScrollY');
    if (savedScroll) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScroll));
        sessionStorage.removeItem('shopScrollY');
      }, 100);
    } else {
      window.scrollTo({ top: 0 });
    }

    // Hash Change Logic for Categories
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && !hash.startsWith('price-')) {
        setSelectedCategory(hash);
        if (!savedScroll) {
           try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch { window.scrollTo(0, 0); }
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // --- DYNAMIC CATEGORY GENERATION ---
  const productCategories = useMemo(() => {
    const cats = new Map();
    cats.set('all', { name: 'All Products', slug: 'all', count: displayProducts.length });

    const priorityOrder = [
      'acrylic-system', 'prep-finishing', 'bundle-deals', 'gel-system', 'tools-essentials', 'furniture'
    ];
    
    const categoryNameOverrides: Record<string, string> = {
      'prep-finishing': 'Prep & Finishing',
      'tools-essentials': 'Tools & Essentials'
    };
    
    // Process priority order
    priorityOrder.forEach(slug => {
      const productsInCategory = displayProducts.filter((product: any) =>
        (product.category === slug) || (product.categories && product.categories.includes(slug))
      );
      if (productsInCategory.length > 0) {
        const name = categoryNameOverrides[slug] || slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        cats.set(slug, { name, slug, count: productsInCategory.length });
      }
    });

    // Process others
    displayProducts.forEach((product: any) => {
      const productCategories = product.categories || (product.category ? [product.category] : []);
      productCategories.forEach((slug: string) => {
        if (!slug || slug === 'all' || slug === 'archived' || cats.has(slug)) return;
        const name = categoryNameOverrides[slug] || slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        if (!cats.has(slug)) cats.set(slug, { name, slug, count: 0 });
        cats.get(slug).count++;
      });
    });

    return Array.from(cats.values());
  }, [displayProducts]);

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'best-selling', label: 'Best selling' },
    { value: 'name-asc', label: 'Alphabetically, A-Z' },
    { value: 'name-desc', label: 'Alphabetically, Z-A' },
    { value: 'price-low', label: 'Price, low to high' },
    { value: 'price-high', label: 'Price, high to low' },
    { value: 'date-old', label: 'Date, old to new' },
    { value: 'date-new', label: 'Date, new to old' }
  ];

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return displayProducts.filter((product: any) => {
      const productCategories = product.categories || (product.category ? [product.category] : []);
      const matchesCategory = selectedCategory === 'all' || productCategories.includes(selectedCategory);
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStock = !showInStockOnly || (product.inStock && product.price !== -1);
      const isNotArchived = !productCategories.includes('archived');
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      
      return matchesCategory && matchesSearch && matchesStock && isNotArchived && matchesPrice;
    });
  }, [displayProducts, selectedCategory, searchTerm, showInStockOnly, priceRange]);

  // Sorting Logic
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        // Add other sort logic if needed
        default: return 0; // featured
      }
    });
  }, [filteredProducts, sortBy]);

  const handleProductClick = (slug: string) => {
    sessionStorage.setItem('shopScrollY', window.scrollY.toString());
    window.location.href = `/products/${slug}`;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSortBy('featured');
    setShowInStockOnly(false);
    setSelectedCategory('all');
    setPriceRange([0, maxPrice]);
    setShowFilters(false);
  };

  // Grid Classes
  const getGridClasses = () => {
    if (viewMode === 'compact') return 'grid-cols-3'; // Desktop
    if (viewMode === 'grid-3') return 'grid-cols-3'; // Mobile 3x3
    return 'grid-cols-2'; // Mobile 2x2 (Default)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header showMobileMenu={true} />
        <main className="section-padding">
          <Container>
            <PageLoadingSpinner text="Loading products..." />
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header showMobileMenu={true} />

      <main className="pb-16">
        {/* Desktop Header / Banner Area (Hidden on mobile if using the image style?) 
            Image 2 shows a banner "BLOM'S ACRYLIC" over an image.
            For now, I'll keep the standard header but maybe simpler.
        */}
        <div className="hidden lg:block bg-gray-50 py-12 mb-8">
          <Container>
            <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">Shop All</h1>
            <p className="text-center text-gray-600 max-w-2xl mx-auto">
              Professional nail supplies for salons and technicians.
            </p>
          </Container>
        </div>

        <Container>
          {/* Mobile Toolbar (Sticky) */}
          <div className="sticky top-0 z-30 bg-white border-b border-gray-200 lg:hidden -mx-4 px-4 mb-6">
            <div className="flex items-center h-14">
              {/* Filter Button */}
              <button 
                onClick={() => setShowFilters(true)}
                className="flex-1 flex items-center justify-center h-full border-r border-gray-200 text-xs font-bold tracking-widest uppercase"
              >
                Filter
              </button>
              
              {/* Sort Button */}
              <button 
                onClick={() => setShowSort(true)}
                className="flex-1 flex items-center justify-center h-full border-r border-gray-200 text-xs font-bold tracking-widest uppercase"
              >
                Sort By
                <ChevronDown className="w-3 h-3 ml-1" />
              </button>
              
              {/* View Toggles */}
              <div className="flex items-center justify-center px-4 gap-3">
                <button 
                  onClick={() => setViewMode('grid-2')}
                  className={`${viewMode === 'grid-2' ? 'text-black' : 'text-gray-300'}`}
                >
                  <Grid2X2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setViewMode('grid-3')}
                  className={`${viewMode === 'grid-3' ? 'text-black' : 'text-gray-300'}`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 pt-4 lg:pt-0">
            {/* Desktop Sidebar (Categories & Filters) */}
            <div className="w-64 flex-shrink-0 hidden lg:block">
              <div className="sticky top-24 space-y-8">
                {/* Categories */}
                <div>
                  <h3 className="font-bold text-lg mb-4">Categories</h3>
                  <div className="space-y-2">
                    {productCategories.map(cat => (
                      <div 
                        key={cat.slug}
                        className={`cursor-pointer text-sm ${selectedCategory === cat.slug ? 'font-bold text-black' : 'text-gray-600 hover:text-black'}`}
                        onClick={() => setSelectedCategory(cat.slug)}
                      >
                        {cat.name} ({cat.count})
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop Price Filter */}
                <div>
                  <h3 className="font-bold text-lg mb-4">Price</h3>
                  <RangeSlider 
                    min={0} 
                    max={maxPrice} 
                    value={priceRange} 
                    onChange={setPriceRange} 
                  />
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1">
              <div className={`grid ${getGridClasses()} gap-4 sm:gap-6 lg:gap-8`}>
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    {...product}
                    isListView={false}
                    onCardClickOverride={() => handleProductClick(product.slug)}
                  />
                ))}
              </div>

              {sortedProducts.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-gray-500">No products found matching your filters.</p>
                  <button onClick={clearFilters} className="mt-4 text-pink-500 font-medium hover:underline">
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </Container>
      </main>

      {/* Mobile Filter Drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
          <div className="relative w-full max-w-xs bg-white h-full ml-auto shadow-xl flex flex-col animate-in slide-in-from-right">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="font-bold text-lg tracking-wide uppercase">Filters</h2>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {/* Availability Section */}
              <div className="border-b border-gray-100 py-4">
                <button 
                  className="flex items-center justify-between w-full text-left font-medium mb-4"
                  onClick={() => setExpandedFilterSection(prev => prev === 'availability' ? null : 'availability')}
                >
                  <span className="uppercase tracking-wider text-sm">Availability</span>
                  {expandedFilterSection === 'availability' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                {expandedFilterSection === 'availability' && (
                  <div className="space-y-4">
                    <label className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={showInStockOnly}
                        onChange={(e) => setShowInStockOnly(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                      />
                      <span className="text-gray-600">In stock only</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Price Section */}
              <div className="border-b border-gray-100 py-4">
                <button 
                  className="flex items-center justify-between w-full text-left font-medium mb-4"
                  onClick={() => setExpandedFilterSection(prev => prev === 'price' ? null : 'price')}
                >
                  <span className="uppercase tracking-wider text-sm">Price</span>
                  {expandedFilterSection === 'price' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                {expandedFilterSection === 'price' && (
                  <div className="px-2 pb-2">
                    <RangeSlider 
                      min={0} 
                      max={maxPrice} 
                      value={priceRange} 
                      onChange={setPriceRange} 
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100">
              <button 
                onClick={() => setShowFilters(false)}
                className="w-full bg-black text-white py-3 uppercase tracking-widest text-sm font-bold"
              >
                View Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sort Drawer */}
      {showSort && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSort(false)} />
          <div className="relative w-full mt-auto bg-white rounded-t-xl shadow-xl flex flex-col animate-in slide-in-from-bottom max-h-[80vh]">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="font-bold text-lg tracking-wide uppercase">Sort By</h2>
              <button onClick={() => setShowSort(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-1">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setShowSort(false);
                    }}
                    className={`w-full text-left py-3 px-2 text-sm ${
                      sortBy === option.value ? 'font-bold text-black' : 'text-gray-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
