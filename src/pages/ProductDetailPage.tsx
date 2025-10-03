import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Button } from '../ui/Button';
import { ProductPageTemplate } from '../components/product/ProductPageTemplate';
import { 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  ShoppingCart, 
  Star, 
  Minus, 
  Plus,
  CheckCircle,
  X
} from 'lucide-react';

interface ProductDetailPageProps {
  productSlug?: string;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productSlug = 'cuticle-oil' }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'how-to-use' | 'ingredients' | 'reviews'>('overview');
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>('overview');
  const [isWishlisted, setIsWishlisted] = useState(false);

  // All product data
  const allProductsData = {
    'cuticle-oil': {
      id: '1',
      name: 'Cuticle Oil',
      subtitle: 'Nourishing cuticle oil with Vitamin E, Jojoba & Soybean Oil',
      price: 149,
      comparePrice: 179,
      rating: 4.9,
      reviewCount: 156,
      inStock: true,
      stockCount: 25,
      description: 'Luxurious oil blend that hydrates cuticles and strengthens nails. Fast-absorbing and non-greasy, perfect for daily use.',
      images: [
        'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
        'https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
        'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop'
      ],
      variants: [
        { id: 'cotton-candy', name: 'Cotton Candy', inStock: true },
        { id: 'vanilla', name: 'Vanilla', inStock: true },
        { id: 'dragon-fruit', name: 'Dragon Fruit Lotus', inStock: false },
        { id: 'watermelon', name: 'Watermelon', inStock: true }
      ],
      overview: [
        '100% Cruelty-Free, Handmade in South Africa',
        'Non-greasy, quick absorbing formula',
        'Packed with Vitamin E for nail and skin health',
        'Available in 4 delicious scents',
        '30ml bottle with precision applicator'
      ],
      features: [
        { title: 'Vitamin E Enriched', description: 'Powerful antioxidant that nourishes and protects' },
        { title: 'Jojoba Oil', description: 'Deeply moisturizes without clogging pores' },
        { title: 'Soybean Oil', description: 'Rich in nutrients for healthy nail growth' },
        { title: 'Fast Absorbing', description: 'Non-greasy formula absorbs quickly' }
      ],
      howToUse: [
        'Clean hands and nails thoroughly',
        'Apply 1-2 drops to each cuticle area',
        'Massage gently in circular motions',
        'Use twice daily for best results'
      ],
      ingredients: [
        'Vitamin E (Tocopherol)',
        'Soybean Oil (Glycine Soja)',
        'Jojoba Oil (Simmondsia Chinensis)',
        'Sweet Almond Oil',
        'Natural Fragrance'
      ],
      specifications: {
        size: '30ml',
        shelfLife: '24 months',
        origin: 'Handmade in South Africa',
        certifications: ['Vegan', 'Cruelty-Free']
      }
    },
    'acrylic-powder': {
      id: '9',
      name: 'Acrylic Powder',
      subtitle: 'Professional acrylic powder in 13 beautiful colors',
      price: 250,
      comparePrice: null,
      rating: 4.9,
      reviewCount: 156,
      inStock: true,
      stockCount: 25,
      description: 'High-quality acrylic powder perfect for creating stunning nail enhancements. Available in 13 gorgeous colors with excellent coverage and smooth application.',
      images: [
        '/acrylic-powder-baby-blue.webp',
        '/acrylic-powder-baby-ligt-purple.webp',
        '/acrylic-powder-baby-pink.webp',
        '/acrylic-powder-ballet-pink.webp',
        '/acrylic-powder-hot-pink.webp',
        '/acrylic-powder-light-grey.webp',
        '/acrylic-powder-light-mint.webp',
        '/acrylic-powder-light-pink.webp',
        '/acrylic-powder-mint.webp',
        '/acrylic-powder-nude.webp',
        '/acrylic-powder-pink.webp',
        '/acrylic-powder-sky-blue.webp',
        '/acrylic-powder-yellow.webp'
      ],
      variants: [
        { id: 'baby-blue', name: 'Baby Blue', inStock: true, image: '/acrylic-powder-baby-blue.webp' },
        { id: 'lilac-mist', name: 'Lilac Mist', inStock: true, image: '/acrylic-powder-baby-ligt-purple.webp' },
        { id: 'blush-pink', name: 'Blush Pink', inStock: true, image: '/acrylic-powder-baby-pink.webp' },
        { id: 'ballet-pink', name: 'Ballet Pink', inStock: true, image: '/acrylic-powder-ballet-pink.webp' },
        { id: 'fuchsia-pink', name: 'Fuchsia Pink', inStock: true, image: '/acrylic-powder-hot-pink.webp' },
        { id: 'cloud-grey', name: 'Cloud Grey', inStock: true, image: '/acrylic-powder-light-grey.webp' },
        { id: 'mint-mist', name: 'Mint Mist', inStock: true, image: '/acrylic-powder-light-mint.webp' },
        { id: 'rose-pink', name: 'Rose Pink', inStock: true, image: '/acrylic-powder-light-pink.webp' },
        { id: 'fresh-mint', name: 'Fresh Mint', inStock: true, image: '/acrylic-powder-mint.webp' },
        { id: 'soft-nude', name: 'Soft Nude', inStock: true, image: '/acrylic-powder-nude.webp' },
        { id: 'petal-pink', name: 'Petal Pink', inStock: true, image: '/acrylic-powder-pink.webp' },
        { id: 'sky-blue', name: 'Sky Blue', inStock: true, image: '/acrylic-powder-sky-blue.webp' },
        { id: 'lemon-glow', name: 'Lemon Glow', inStock: true, image: '/acrylic-powder-yellow.webp' }
      ],
      overview: [
        'Professional-grade acrylic powder',
        '13 beautiful color options',
        'Excellent coverage and smooth application',
        'Perfect for nail enhancements and overlays',
        'High-quality pigments for vibrant results'
      ],
      features: [
        { title: 'Professional Quality', description: 'High-grade acrylic powder for salon-quality results' },
        { title: '13 Colors', description: 'Wide range of beautiful colors to choose from' },
        { title: 'Excellent Coverage', description: 'Strong coverage with smooth, even application' },
        { title: 'Vibrant Pigments', description: 'Rich, consistent colors that maintain their vibrancy' }
      ],
      howToUse: [
        'Prep nails with primer and dehydrator',
        'Pick up bead with monomer using size 8 brush',
        'Sculpt and refine the enhancement',
        'File, buff and finish with top coat'
      ],
      ingredients: [
        'PMMA (Polymethyl Methacrylate)',
        'Benzoyl Peroxide',
        'Cosmetic-grade pigments',
        'UV stabilizers'
      ],
      specifications: {
        size: '56g',
        shelfLife: '24 months',
        origin: 'Professional Grade',
        certifications: ['Vegan', 'Cruelty-Free']
      }
    }
  };

  const product = allProductsData[productSlug as keyof typeof allProductsData] || allProductsData['cuticle-oil'];

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleVariantSelect = (variantId: string) => {
    setSelectedVariant(variantId);
    // Update the main image to show the selected variant
    const variant = product.variants.find(v => v.id === variantId);
    if (variant && variant.image) {
      const imageIndex = product.images.findIndex(img => img === variant.image);
      if (imageIndex !== -1) {
        setSelectedImage(imageIndex);
      }
    }
  };

  const handleAddToCart = () => {
    // Add to cart logic here
    console.log('Added to cart:', {
      product: product.name,
      variant: selectedVariant,
      quantity
    });
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
  };

  const toggleAccordion = (tab: string) => {
    setExpandedAccordion(expandedAccordion === tab ? null : tab);
  };

  useEffect(() => {
    document.title = `${product.name} - BLOM Cosmetics`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', product.description);
    }
    window.scrollTo({ top: 0 });
  }, [product]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header showMobileMenu={true} />

      <main className="flex-1">
        {/* Breadcrumb */}
        <section className="py-4 border-b">
          <Container>
            <nav className="text-sm text-gray-500">
              <a href="/" className="hover:text-pink-400">Home</a>
              <span className="mx-2">/</span>
              <a href="/shop" className="hover:text-pink-400">Shop</a>
              <span className="mx-2">/</span>
              <a href={`/shop#acrylic-system`} className="hover:text-pink-400">
                Acrylic System
              </a>
              <span className="mx-2">/</span>
              <span className="text-gray-900">{product.name}</span>
            </nav>
          </Container>
        </section>

        {/* Product Detail */}
        <section className="section-padding">
          <Container>
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Product Media */}
              <div>
                {/* Main Image */}
                <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Navigation Arrows */}
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}

                  {/* Wishlist Button */}
                  <button
                    onClick={handleWishlistToggle}
                    className="absolute top-4 right-4 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
                  >
                    <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current text-pink-400' : 'text-gray-600'}`} />
                  </button>
                </div>

                {/* Thumbnail Images */}
                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                          selectedImage === index ? 'border-pink-400' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                <p className="text-lg text-gray-600 mb-4">{product.subtitle}</p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating)
                            ? 'fill-current text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        style={{ color: i < Math.floor(product.rating) ? '#F59E0B' : undefined }}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating} ({product.reviewCount} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-gray-900">
                      R{product.price.toFixed(2)}
                    </span>
                    {product.comparePrice && (
                      <span className="text-xl text-gray-500 line-through">
                        R{product.comparePrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {product.comparePrice && (
                    <div className="text-sm text-green-600 font-medium">
                      Save R{(product.comparePrice - product.price).toFixed(2)}
                    </div>
                  )}
                </div>

                {/* Variants */}
                {product.variants.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Colors</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {product.variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => handleVariantSelect(variant.id)}
                          disabled={!variant.inStock}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            selectedVariant === variant.id
                              ? 'border-pink-400 bg-pink-50'
                              : 'border-gray-200 hover:border-gray-300'
                          } ${!variant.inStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            {variant.image && (
                              <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                                <img
                                  src={variant.image}
                                  alt={variant.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{variant.name}</div>
                              <div className={`text-sm ${variant.inStock ? 'text-green-600' : 'text-red-600'}`}>
                                {variant.inStock ? 'In Stock' : 'Out of Stock'}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Quantity</h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-lg font-medium px-4">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Add to Cart */}
                <div className="mb-8">
                  <Button
                    onClick={handleAddToCart}
                    className="w-full bg-pink-400 hover:bg-pink-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                    disabled={!product.inStock}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                </div>

                {/* Product Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-600">Free shipping on orders over R500</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-600">30-day return policy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-600">Professional quality guarantee</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Information Tabs */}
            <div className="mt-16">
              <div className="border-b border-gray-200 mb-8">
                <nav className="flex space-x-8">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'features', label: 'Features' },
                    { id: 'how-to-use', label: 'How to Use' },
                    { id: 'ingredients', label: 'Ingredients' },
                    { id: 'reviews', label: 'Reviews' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-pink-400 text-pink-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="max-w-4xl">
                {activeTab === 'overview' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Product Overview</h3>
                    <ul className="space-y-2">
                      {product.overview.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-pink-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === 'features' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Features</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      {product.features.map((feature, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                          <p className="text-gray-600">{feature.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'how-to-use' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">How to Use</h3>
                    <ol className="space-y-3">
                      {product.howToUse.map((step, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-pink-400 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </span>
                          <span className="text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {activeTab === 'ingredients' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Ingredients</h3>
                    <ul className="space-y-2">
                      {product.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                          <span className="text-gray-700">{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Customer Reviews</h3>
                    <div className="text-center py-8">
                      <p className="text-gray-600">Reviews coming soon!</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
};