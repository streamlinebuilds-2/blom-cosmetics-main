import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { products } from '../data/products';
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
      compare_at_price: 179,
      short_description: 'Nourishing cuticle oil with Vitamin E, Jojoba & Soybean Oil.',
      description: 'Luxurious oil blend that hydrates cuticles and strengthens nails. Fast-absorbing and non-greasy, perfect for daily use.',
      image: 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
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
      price: 299,
      compare_at_price: 350,
      short_description: 'Vitamin-infused, acid-free primer for strong adhesion.',
      description: 'Creates a long-lasting bond for gels and acrylics while protecting the natural nail.',
      image: 'https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
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
      price: 189,
      compare_at_price: null,
      short_description: 'Removes oils & moisture for better adhesion.',
      description: 'Prepares natural nails by dehydrating the plate, preventing lifting.',
      image: 'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
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
      price: 249,
      compare_at_price: 299,
      short_description: 'Strong, protective top coat with mirror shine.',
      description: 'High-gloss, chip-resistant finish for both gels and acrylics.',
      image: 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
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
      price: 279,
      compare_at_price: null,
      short_description: 'Glitter-infused top coat with smooth shine.',
      description: 'Adds a sparkling finish to any gel or acrylic set.',
      image: 'https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
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
      price: 45,
      compare_at_price: null,
      short_description: 'Durable file with eco-friendly sponge core.',
      description: 'Double-sided professional nail file for shaping and refinements.',
      image: 'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
      category: 'tools-essentials',
      rating: 4.5,
      reviews: 45,
      badges: [],
      inStock: true,
      variants: []
    }
  ];

  const productCategories = [
    { name: 'All Products', slug: 'all', count: products.length },
    { name: 'Prep & Finish', slug: 'prep-finish', count: products.filter(p => p.category === 'Prep & Finish').length },
    { name: 'Acrylic System', slug: 'acrylic-system', count: products.filter(p => p.category === 'Acrylic System').length },
    { name: 'Accessories', slug: 'accessories', count: products.filter(p => p.category === 'Accessories').length }
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
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || 
      product.category.toLowerCase().replace(' & ', '-').replace(' ', '-') === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = parseFloat(a.price.replace('R', '') || '0');
    const priceB = parseFloat(b.price.replace('R', '') || '0');
    
    switch (sortBy) {
      case 'price-low':
        return priceA - priceB;
      case 'price-high':
        return priceB - priceA;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'newest':
        return products.indexOf(b) - products.indexOf(a);
      case 'featured':
      default:
        return 0;
    }
  });

  const handleAddToCart = (product: any) => {
    const priceValue = parseFloat(product.price.replace('R', '') || '0');
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
        return 'bg-pink-500 text-white';
      case 'Coming Soon':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header showMobileMenu={false} />

      <main>
        {/* Shop Hero Section */}
        <section className="relative bg-gradient-to-br from-pink-50 to-blue-50 section-padding overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-400/10 to-blue-300/10"></div>
          <Container>
            <div className="relative text-center max-w-4xl mx-auto">
              <h1 className="text-5xl font-bold mb-6">Discover Professional Nail Essentials</h1>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                Premium nail products designed for professionals who demand excellence. 
                From prep to finish, we have everything you need to create stunning nail art.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg">Shop All Products</Button>
                <Button size="lg" variant="outline">View Collections</Button>
              </div>
            </div>
          </Container>
        </section>

        {/* Sticky Filter Bar */}
        <section className="sticky top-16 z-40 bg-white border-b shadow-sm">
          <Container>
            <div className="py-4">
              {/* Desktop Filter Bar */}
              <div className="hidden lg:block">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
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

                  <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-10 pr-10 w-64"
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

                    {/* Sort */}
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

                    {/* View Toggle */}
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

                {/* Product Count */}
                <div className="text-sm text-gray-600">
                  {sortedProducts.length} products
                </div>
              </div>

              {/* Mobile Filter Summary */}
              <div className="lg:hidden">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {sortedProducts.length} products
                  </div>
                  <button
                    onClick={() => setShowMobileFilters(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </button>
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
              <div className={`grid ${getGridClasses()} gap-6`}>
                {sortedProducts.map((product) => (
                  <Card key={product.slug} className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
                      {/* Sale Badge */}
                      {product.compareAtPrice && (
                        <div className="absolute top-3 left-3 z-10">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500 text-white">
                            Sale
                          </span>
                        </div>
                      )}

                      {/* Wishlist Heart */}
                      <button className="absolute top-3 right-3 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-pink-50 transition-colors">
                        <Heart className="h-4 w-4 text-gray-400 hover:text-pink-400" />
                      </button>

                      {/* Product Image */}
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onClick={() => window.location.href = `/product/${product.slug}`}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop';
                        }}
                      />

                      {/* Quick View Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50">
                          <Eye className="h-5 w-5 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4">
                      {/* Product Title */}
                      <h3 
                        className="font-semibold text-lg mb-2 line-clamp-2 cursor-pointer hover:text-pink-400 transition-colors"
                        onClick={() => window.location.href = `/product/${product.slug}`}
                      >
                        {product.name}
                      </h3>

                      {/* Product Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.shortDescription}
                      </p>

                      {/* Scents Preview */}
                      {product.scents && product.scents.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">
                            {product.scents.length} scents available
                          </p>
                        </div>
                      )}

                      {/* Price and Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-pink-400">{product.price}</span>
                          {product.compareAtPrice && (
                            <span className="text-sm text-gray-400 line-through">
                              {product.compareAtPrice}
                            </span>
                          )}
                        </div>
                        
                        {product.stock === 'In Stock' ? (
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(product)}
                            className="hover:scale-105 transition-transform"
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Add to Cart
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" disabled>
                            Out of Stock
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
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