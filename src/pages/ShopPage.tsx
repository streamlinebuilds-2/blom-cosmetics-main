import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/Button';
import { cartStore, showNotification } from '../lib/cart';
import { Filter, Grid2x2 as Grid, List, Search, ShoppingCart, Star, Eye, Heart, X, SlidersHorizontal } from 'lucide-react';

export const ShopPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid-3' | 'grid-2' | 'list'>('grid-3');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // All BLOM products with detailed information
  const allProducts = [
    {
      id: '1',
      name: 'Cuticle Oil',
      slug: 'cuticle-oil',
      price: 149,
      compareAtPrice: 179,
      short_description: 'Nourishing cuticle oil with Vitamin E, Jojoba & Soybean Oil.',
      shortDescription: 'Nourishing cuticle oil with Vitamin E, Jojoba & Soybean Oil.',
      description: 'Luxurious oil blend that hydrates cuticles and strengthens nails. Fast-absorbing and non-greasy, perfect for daily use.',
      images: ['https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'],
      category: 'prep-finishing',
      rating: 4.9,
      reviews: 156,
      badges: ['Bestseller'],
      inStock: true,
      variants: [
        { name: 'Cotton Candy', inStock: true },
        { name: 'Vanilla', inStock: true },
        { name: 'Dragon Fruit Lotus', inStock: false },
        { name: 'Watermelon', inStock: true }
      ]
    },
    {
      id: '2',
      name: 'Vitamin Primer',
      slug: 'vitamin-primer',
      price: 140,
      compareAtPrice: undefined,
      short_description: 'Vitamin-infused, acid-free primer for strong adhesion.',
      shortDescription: 'Vitamin-infused, acid-free primer for strong adhesion.',
      description: 'Creates a long-lasting bond for gels and acrylics while protecting the natural nail.',
      images: ['https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'],
      category: 'prep-finishing',
      rating: 4.8,
      reviews: 124,
      badges: ['New'],
      inStock: true,
      variants: []
    },
    {
      id: '3',
      name: 'Prep Solution (Nail Dehydrator)',
      slug: 'prep-solution',
      price: 120,
      compareAtPrice: undefined,
      short_description: 'Removes oils & moisture for better adhesion.',
      shortDescription: 'Removes oils & moisture for better adhesion.',
      description: 'Prepares natural nails by dehydrating the plate, preventing lifting.',
      images: ['https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'],
      category: 'prep-finishing',
      rating: 4.7,
      reviews: 89,
      badges: [],
      inStock: true,
      variants: []
    },
    {
      id: '4',
      name: 'Top Coat',
      slug: 'top-coat',
      price: 130,
      compareAtPrice: undefined,
      short_description: 'Strong, protective top coat with mirror shine.',
      shortDescription: 'Strong, protective top coat with mirror shine.',
      description: 'High-gloss, chip-resistant finish for both gels and acrylics.',
      images: ['https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'],
      category: 'gel-system',
      rating: 4.9,
      reviews: 201,
      badges: ['Bestseller'],
      inStock: true,
      variants: []
    },
    {
      id: '5',
      name: 'Fairy Dust Top Coat',
      slug: 'fairy-dust-top-coat',
      price: 140,
      compareAtPrice: undefined,
      short_description: 'Glitter-infused top coat with smooth shine.',
      shortDescription: 'Glitter-infused top coat with smooth shine.',
      description: 'Adds a sparkling finish to any gel or acrylic set.',
      images: ['https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'],
      category: 'gel-system',
      rating: 4.6,
      reviews: 73,
      badges: ['New'],
      inStock: true,
      variants: []
    },
    {
      id: '6',
      name: 'Nail File (80/80 Grit)',
      slug: 'nail-file-80-80',
      price: 35,
      compareAtPrice: undefined,
      short_description: 'Durable file with eco-friendly sponge core.',
      shortDescription: 'Durable file with eco-friendly sponge core.',
      description: 'Double-sided professional nail file for shaping and refinements.',
      images: ['https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'],
      category: 'tools-essentials',
      rating: 4.5,
      reviews: 45,
      badges: [],
      inStock: true,
      variants: []
    },
    {
      id: '7',
      name: 'Nail Forms',
      slug: 'nail-forms',
      price: -1, // Coming Soon
      compareAtPrice: undefined,
      short_description: 'Sculpting forms with holographic guide for precision.',
      shortDescription: 'Sculpting forms with holographic guide for precision.',
      description: 'Professional sculpting forms with holographic guide lines for precise nail extensions.',
      images: ['/public/nail-forms.webp'],
      category: 'tools-essentials',
      rating: 4.5,
      reviews: 32,
      badges: [],
      inStock: true,
      variants: []
    },
    {
      id: '8',
      name: 'Nail Liquid Monomer',
      slug: 'nail-liquid-monomer',
      price: -1, // Coming Soon
      compareAtPrice: undefined,
      short_description: 'Low-odor EMA monomer. MMA-free, HEMA-free.',
      shortDescription: 'Low-odor EMA monomer. MMA-free, HEMA-free.',
      description: 'Professional grade liquid monomer with low odor formula. MMA-free and HEMA-free for safe application.',
      images: ['/public/nail-liquid-monomer.webp'],
      category: 'acrylic-system',
      rating: 4.8,
      reviews: 87,
      badges: [],
      inStock: true,
      variants: []
    },
    {
      id: '9',
      name: 'Crystal Clear Acrylic',
      slug: 'crystal-clear-acrylic',
      price: -1, // Coming Soon
      compareAtPrice: undefined,
      short_description: 'Glass-clear powder for encapsulation & overlays.',
      shortDescription: 'Glass-clear powder for encapsulation & overlays.',
      description: 'Ultra-clear acrylic powder perfect for encapsulation work and crystal-clear overlays.',
      images: ['/public/crystal-clear-acrylic.webp'],
      category: 'acrylic-system',
      rating: 4.9,
      reviews: 156,
      badges: ['Bestseller'],
      inStock: true,
      variants: []
    },
    {
      id: '10',
      name: 'Snow White Acrylic',
      slug: 'snow-white-acrylic',
      price: -1, // Coming Soon
      compareAtPrice: undefined,
      short_description: 'Opaque white acrylic for French & design work.',
      shortDescription: 'Opaque white acrylic for French & design work.',
      description: 'Pure opaque white acrylic powder ideal for French manicures and design work.',
      images: ['/public/snow-white-acrylic.webp'],
      category: 'acrylic-system',
      rating: 4.7,
      reviews: 94,
      badges: [],
      inStock: true,
      variants: []
    },
    {
      id: '11',
      name: 'Colour Acrylic',
      slug: 'colour-acrylic',
      price: -1, // Coming Soon
      compareAtPrice: undefined,
      short_description: 'High-pigment acrylic powders for bold designs.',
      shortDescription: 'High-pigment acrylic powders for bold designs.',
      description: 'Vibrant, high-pigment acrylic powders available in multiple colors for bold nail designs.',
      images: ['/public/colour-acrylic.webp'],
      category: 'acrylic-system',
      rating: 4.6,
      reviews: 73,
      badges: ['New'],
      inStock: true,
      variants: []
    },
    {
      id: '12',
      name: 'Glitter Acrylic',
      slug: 'glitter-acrylic',
      price: -1, // Coming Soon
      compareAtPrice: undefined,
      short_description: 'Sparkle acrylics for encapsulated effects.',
      shortDescription: 'Sparkle acrylics for encapsulated effects.',
      description: 'Glitter-infused acrylic powders perfect for creating stunning encapsulated sparkle effects.',
      images: ['/public/glitter-acrylic.webp'],
      category: 'acrylic-system',
      rating: 4.5,
      reviews: 61,
      badges: [],
      inStock: true,
      variants: []
    },
    {
      id: '13',
      name: 'Core Acrylics',
      slug: 'core-acrylics',
      price: -1, // Coming Soon
      compareAtPrice: undefined,
      short_description: 'Strength powders in clear, white, and natural tones.',
      shortDescription: 'Strength powders in clear, white, and natural tones.',
      description: 'Essential strength acrylic powders available in clear, white, and natural tones for all nail applications.',
      images: ['/public/core-acrylics.webp'],
      category: 'acrylic-system',
      rating: 4.8,
      reviews: 128,
      badges: [],
      inStock: true,
      variants: []
    }
  ];

  const productCategories = [
    { name: 'All Products', slug: 'all', count: allProducts.length },
    { name: 'Acrylic System', slug: 'acrylic-system', count: allProducts.filter(p => p.category === 'acrylic-system').length },
    { name: 'Prep & Finish', slug: 'prep-finishing', count: allProducts.filter(p => p.category === 'prep-finishing').length },
    { name: 'Gel System', slug: 'gel-system', count: allProducts.filter(p => p.category === 'gel-system').length },
    { name: 'Tools & Essentials', slug: 'tools-essentials', count: allProducts.filter(p => p.category === 'tools-essentials').length }
  ];

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'name', label: 'Name A-Z' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest' }
  ];

  useEffect(() => {
    // Simulate loading
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);

    // If navigated with hash to a category (e.g., #acrylic-system), preselect it
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setSelectedCategory(hash);
      // Scroll to filter bar smoothly
      try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch { window.scrollTo(0, 0); }
    }
  }, []);

  const filteredProducts = allProducts.filter(product => {
    const matchesCategory = selectedCategory === 'all' || 
      product.category.toLowerCase().replace(' & ', '-').replace(' ', '-') === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.short_description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.price;
    const priceB = b.price;
    
    switch (sortBy) {
      case 'price-low':
        return priceA - priceB;
      case 'price-high':
        return priceB - priceA;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'newest':
        return allProducts.indexOf(b) - allProducts.indexOf(a);
      case 'featured':
      default:
        return 0;
    }
  });

  const handleAddToCart = (product: any) => {
    const priceValue = product.price || 0;
    cartStore.addItem({
      id: `item_${Date.now()}`,
      productId: product.slug,
      name: product.name,
      price: priceValue,
      image: product.images[0]
    });
    showNotification(`Added ${product.name} to cart!`);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
    setSortBy('featured');
  };

  const getGridClasses = () => {
    switch (viewMode) {
      case 'grid-3':
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 'grid-2':
        return 'grid-cols-1 sm:grid-cols-2';
      case 'list':
        return 'grid-cols-1';
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'New':
        return 'bg-green-500 text-white';
      case 'Bestseller':
        return 'bg-pink-400 text-white';
      case 'Coming Soon':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header showMobileMenu={true} />

      <main className="flex-1">
        {/* Shop Hero Section */}
        <section className="relative bg-gradient-to-br from-pink-50 to-blue-50 section-padding overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-400/10 to-blue-300/10"></div>
          <Container>
            <div className="relative text-center max-w-4xl mx-auto">
              <h1 className="heading-with-stripe">Discover Professional Nail Essentials</h1>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                High-quality products trusted by nail artists and beauty professionals.
              </p>
              {/* Buttons removed as requested */}
            </div>
          </Container>
        </section>

        {/* Sticky Filter Bar */}
        <section className="sticky top-16 z-40 bg-white border-b shadow-sm">
          <Container>
            <div className="py-4">
              {/* Desktop Filter Bar */}
              <div className="hidden lg:block">
                <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4" id="category-filter-bar">
                    {/* Category Pills */}
                    <div className="flex gap-2 overflow-x-auto">
                      {productCategories.map((category) => (
                        <button
                          key={category.slug}
                          onClick={() => setSelectedCategory(category.slug)}
                          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                            selectedCategory === category.slug
                              ? 'bg-pink-400 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {category.name} ({category.count})
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="hidden"></div>
                </div>

                {/* Controls row under category pills: search + sort + view */}
                <div className="mt-3 flex items-center justify-between gap-4 flex-wrap">
                  <div className="relative flex-1 min-w-[260px] max-w-xl">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-field pl-10 pr-10 w-full"
                    />
                    {searchTerm && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                      >
                        <X className="h-4 w-4 text-gray-400" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="input-field w-auto"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <div className="flex border rounded-lg overflow-hidden">
                      <button
                        onClick={() => setViewMode('grid-3')}
                        className={`p-2 ${viewMode === 'grid-3' ? 'bg-pink-400 text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                        title="3 columns"
                      >
                        <Grid className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('grid-2')}
                        className={`p-2 ${viewMode === 'grid-2' ? 'bg-pink-400 text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                        title="2 columns"
                      >
                        <Grid className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 ${viewMode === 'list' ? 'bg-pink-400 text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                        title="List view"
                      >
                        <List className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Product count removed as requested */}
              </div>

              {/* Mobile Filter Summary */}
              <div className="lg:hidden">
                {/* Top row: search + filters button */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-field pl-10 pr-10 w-full"
                    />
                    {searchTerm && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                        aria-label="Clear search"
                      >
                        <X className="h-4 w-4 text-gray-400" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => setShowMobileFilters(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </button>
                </div>

                {/* Pink Category Pills */}
                <div className="mt-3 overflow-x-auto">
                  <div className="flex gap-2 min-w-max">
                    {productCategories.map((category) => (
                      <button
                        key={category.slug}
                        onClick={() => setSelectedCategory(category.slug)}
                        className={`px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                          selectedCategory === category.slug
                            ? 'bg-pink-400 text-white border-pink-400 shadow-sm'
                            : 'bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-200'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Product Grid */}
        <section className="section-padding">
          <Container>
            {loading ? (
              <div className={`grid ${getGridClasses()} gap-6`}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="aspect-[4/5] bg-gray-200 rounded-t-lg"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="flex items-center justify-between">
                        <div className="h-6 w-20 bg-gray-200 rounded"></div>
                        <div className="h-10 w-24 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <Search className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filter criteria
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className={`grid ${getGridClasses()} gap-x-6 gap-y-10`}>
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.slug}
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    price={product.price}
                    compareAtPrice={product.compareAtPrice}
                    shortDescription={product.shortDescription}
                    images={product.images}
                    inStock={product.inStock}
                    badges={product.badges}
                  />
                ))}
              </div>
            )}
          </Container>
        </section>

        {/* Mobile Filter Sheet */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileFilters(false)} />
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">Filters & Sort</h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Mobile Categories */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Categories</h4>
                  <div className="space-y-2">
                    {productCategories.map((category) => (
                      <button
                        key={category.slug}
                        onClick={() => setSelectedCategory(category.slug)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                          selectedCategory === category.slug
                            ? 'bg-pink-100 text-pink-600 border border-pink-200'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{category.name}</span>
                          <span className="text-sm text-gray-500">({category.count})</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Search */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Search</h4>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-field pl-10 pr-10 w-full"
                    />
                    {searchTerm && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                      >
                        <X className="h-4 w-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Mobile Sort */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Sort By</h4>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input-field w-full"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mobile View Mode */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">View</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('grid-2')}
                      className={`flex-1 p-3 rounded-lg border transition-colors ${
                        viewMode === 'grid-2'
                          ? 'border-pink-400 bg-pink-50 text-pink-600'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Grid className="h-5 w-5 mx-auto mb-1" />
                      <span className="text-sm">Grid</span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex-1 p-3 rounded-lg border transition-colors ${
                        viewMode === 'list'
                          ? 'border-pink-400 bg-pink-50 text-pink-600'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <List className="h-5 w-5 mx-auto mb-1" />
                      <span className="text-sm">List</span>
                    </button>
                  </div>
                </div>

                {/* Mobile Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={clearFilters}
                  >
                    Clear All
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => setShowMobileFilters(false)}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};