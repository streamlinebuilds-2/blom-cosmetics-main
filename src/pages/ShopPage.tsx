import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/Button';
import { Search, Filter, Grid3x3 as Grid3X3, Grid2x2 as Grid2X2, List, X, ChevronDown } from 'lucide-react';

type ProductSummary = {
  slug: string;
  title: string;
  price: number;
  thumbnail: string;
  badges?: string[];
  status?: "active" | "draft" | "archived";
  rating?: number;
  reviews?: number;
  compareAt?: number;
  stockStatus?: string;
  category?: string;
  shortDescription?: string;
};

export const ShopPage: React.FC = () => {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid-3' | 'grid-2' | 'list'>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 'list' : 'grid-3';
    }
    return 'grid-3';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);


  const productCategories = [
    { name: 'All Products', slug: 'all', count: products.length },
    { name: 'Acrylic System', slug: 'acrylic-system', count: products.filter(p => p.category === 'acrylic-system').length },
    { name: 'Prep & Finish', slug: 'prep-finishing', count: products.filter(p => p.category === 'prep-finishing').length },
    { name: 'Gel System', slug: 'gel-system', count: products.filter(p => p.category === 'gel-system').length },
    { name: 'Tools & Essentials', slug: 'tools-essentials', count: products.filter(p => p.category === 'tools-essentials').length }
  ];

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'name', label: 'Name A-Z' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  useEffect(() => {
    document.title = 'Shop - BLOM Cosmetics';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Shop professional nail care products, acrylic systems, and tools. High-quality products trusted by nail artists and beauty professionals.');
    }
    window.scrollTo({ top: 0 });

    // Load products from JSON
    fetch("/content/products/index.json", { cache: "no-store" })
      .then((r) => r.json())
      .then((list: ProductSummary[]) => {
        // Keep compatibility: only show active (same as your current logic)
        setProducts(list.filter(p => p.status !== "archived"));
      })
      .catch((error) => {
        console.error('Failed to load products:', error);
        setProducts([]);
      })
      .finally(() => setLoading(false));

    // If navigated with hash to a category (e.g., #acrylic-system), preselect it
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setSelectedCategory(hash);
      // Scroll to filter bar smoothly
      try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch { window.scrollTo(0, 0); }
    }
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' ||
      product.category === selectedCategory;
    
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.shortDescription && product.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStock = !showInStockOnly || (product.stockStatus === 'In Stock' && product.price !== -1);
    
    return matchesCategory && matchesSearch && matchesStock;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.title.localeCompare(b.title);
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  const getGridClasses = () => {
    switch (viewMode) {
      case 'grid-3':
        return 'grid-cols-3 lg:grid-cols-3';
      case 'grid-2':
        return 'grid-cols-2 lg:grid-cols-2';
      case 'list':
        return 'grid-cols-1';
      default:
        return 'grid-cols-3 lg:grid-cols-3';
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSortBy('featured');
    setShowInStockOnly(false);
    setSelectedCategory('all');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showMobileMenu={true} />
        <main className="section-padding">
          <Container>
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #FFE4F1 0%, #E0F2FE 100%)' }}>
      <Header showMobileMenu={true} />

      <main className="section-padding">
        <Container>
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="heading-with-stripe">SHOP</h1>
            <p className="section-subheader">
              High-quality products trusted by nail artists and beauty professionals.
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search Bar */}
              <div className="flex-1 w-full lg:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
                  />
                </div>
              </div>

              {/* Filter Button (Mobile) */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-3 bg-pink-400 text-white rounded-xl hover:bg-pink-500 transition-colors"
              >
                <Filter className="h-5 w-5" />
                Filters
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid-3')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid-3' ? 'bg-pink-400 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  <Grid3X3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('grid-2')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid-2' ? 'bg-pink-400 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  <Grid2X2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-pink-400 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Mobile Filter Sheet */}
            {showFilters && (
              <div className="lg:hidden mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-4">
                  {/* Categories */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
                    >
                      {productCategories.map((category) => (
                        <option key={category.slug} value={category.slug}>
                          {category.name} ({category.count})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Sort by</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* In Stock Only */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="inStockOnly"
                      checked={showInStockOnly}
                      onChange={(e) => setShowInStockOnly(e.target.checked)}
                      className="rounded border-gray-300 text-pink-400 focus:ring-pink-300"
                    />
                    <label htmlFor="inStockOnly" className="text-sm text-gray-700">
                      In Stock Only
                    </label>
                  </div>

                  {/* Clear Filters */}
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 text-pink-400 border border-pink-400 rounded-lg hover:bg-pink-50 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Filters */}
          <div className="hidden lg:flex items-center justify-between mb-8">
            {/* Categories */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-800">Category:</span>
              <div className="flex gap-2">
                {productCategories.map((category) => (
                  <button
                    key={category.slug}
                    onClick={() => setSelectedCategory(category.slug)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category.slug
                        ? 'bg-pink-400 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Sort and Filters */}
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="inStockOnlyDesktop"
                  checked={showInStockOnly}
                  onChange={(e) => setShowInStockOnly(e.target.checked)}
                  className="rounded border-gray-300 text-pink-400 focus:ring-pink-300"
                />
                <label htmlFor="inStockOnlyDesktop" className="text-sm text-gray-700">
                  In Stock Only
                </label>
              </div>

              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-3 py-2 text-pink-400 border border-pink-400 rounded-lg hover:bg-pink-50 transition-colors"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {sortedProducts.length} of {products.length} products
            </p>
          </div>

          {/* Products Grid */}
          <section className="section-padding">
            <div className={`grid ${getGridClasses()} gap-6`}>
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.slug}
                  id={product.slug}
                  title={product.title}
                  slug={product.slug}
                  price={product.price}
                  compareAt={product.compareAt}
                  shortDescription={product.shortDescription}
                  images={[product.thumbnail]}
                  inStock={product.stockStatus === 'In Stock'}
                  badges={product.badges}
                  isListView={viewMode === 'list'}
                />
              ))}
            </div>

            {sortedProducts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-600 text-lg">No products found matching your criteria.</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-6 py-3 bg-pink-400 text-white rounded-xl hover:bg-pink-500 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </section>
        </Container>
      </main>

      <Footer />
    </div>
  );
};