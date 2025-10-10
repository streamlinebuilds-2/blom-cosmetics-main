import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ReviewSection } from '../components/review/ReviewSection';
import { PaymentMethods } from '../components/payment/PaymentMethods';
import { StickyCart } from '../components/cart/StickyCart';
import { cartStore, showNotification } from '../lib/cart';
import { wishlistStore } from '../lib/wishlist';
import { 
  Star, 
  Heart, 
  Share2, 
  ShoppingCart, 
  Plus, 
  Minus,
  Check,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Leaf,
  Award,
  MessageCircle,
  Phone,
  ArrowLeft
} from 'lucide-react';

interface ProductDetailPageProps {
  productSlug: string;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productSlug }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'how-to-use' | 'ingredients' | 'details'>('overview');
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>('overview');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load product from JSON file
    fetch(`/content/products/${productSlug}.json`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((foundProduct) => {
        if (foundProduct) {
          setProduct(foundProduct);
          const firstVariant = foundProduct.variants[0];
          setSelectedVariant(typeof firstVariant === 'string' ? firstVariant : firstVariant?.name || '');

          // Set page title and meta description
          document.title = `${foundProduct.title} - BLOM Cosmetics`;
          const metaDescription = document.querySelector('meta[name="description"]');
          if (metaDescription) {
            metaDescription.setAttribute('content', foundProduct.shortDescription);
          }
        }
      })
      .catch((error) => {
        console.error('Failed to load product:', error);
        setProduct(null);
      })
      .finally(() => setLoading(false));
  }, [productSlug]);

  useEffect(() => {
    // Check if product is in wishlist
    setIsWishlisted(wishlistStore.isInWishlist(productSlug));
    
    const unsubscribe = wishlistStore.subscribe(() => {
      setIsWishlisted(wishlistStore.isInWishlist(productSlug));
    });

    return unsubscribe;
  }, [productSlug]);

  const handleAddToCart = () => {
    if (!product) return;
    
    const currentVariant = product.variants.find((v: any) => 
      typeof v === 'object' ? v.name === selectedVariant : v === selectedVariant
    );
    const variantPrice = typeof currentVariant === 'object' && currentVariant?.price ? currentVariant.price : product.price;
    const variantImage = typeof currentVariant === 'object' && currentVariant?.image ? currentVariant.image : product.images[selectedImage];

    cartStore.addItem({
      id: `item_${Date.now()}`,
      productId: product.slug,
      variantId: selectedVariant,
      name: product.title,
      price: variantPrice,
      image: variantImage || product.images[0] || 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
      variant: selectedVariant ? { title: selectedVariant } : undefined
    }, quantity);

    showNotification(`Added ${quantity} ${product.title} to cart!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    window.location.href = '/checkout';
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    
    const wishlistItem = {
      id: product.slug,
      productId: product.slug,
      name: product.title,
      price: product.price,
      image: product.images[0] || 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
      slug: product.slug
    };
    
    wishlistStore.toggleItem(wishlistItem);
  };

  const nextImage = () => {
    if (!product) return;
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    if (!product) return;
    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const toggleAccordion = (section: string) => {
    setExpandedAccordion(expandedAccordion === section ? null : section);
  };

  const formatPrice = (price: number) => `R${price.toFixed(2)}`;

  const relatedProducts = [
    {
      id: 'vitamin-primer',
      name: 'Vitamin Primer',
      slug: 'vitamin-primer',
      price: 210,
      image: '/vitamin-primer-white.webp',
      category: 'Prep & Finishing'
    },
    {
      id: 'top-coat',
      name: 'Top Coat',
      slug: 'top-coat',
      price: 190,
      image: '/top-coat-white.webp',
      category: 'Gel System'
    },
    {
      id: 'prep-solution',
      name: 'Prep Solution',
      slug: 'prep-solution',
      price: 200,
      image: '/prep-solution-white.webp',
      category: 'Prep & Finishing'
    }
  ];

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50">
          <Container>
            <div className="py-16">
              <div className="animate-pulse">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <div className="h-96 bg-gray-200 rounded-lg"></div>
                    <div className="flex space-x-2">
                      <div className="h-20 w-20 bg-gray-200 rounded"></div>
                      <div className="h-20 w-20 bg-gray-200 rounded"></div>
                      <div className="h-20 w-20 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-12 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50">
          <Container>
            <div className="py-16 text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Product Not Found</h1>
              <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
              <Button 
                onClick={() => window.history.back()}
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </Container>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <section className="bg-white border-b">
          <Container>
            <nav className="py-4 text-sm text-gray-600">
              <a href="/" className="hover:text-pink-400">Home</a>
              <span className="mx-2">/</span>
              <a href="/shop" className="hover:text-pink-400">Shop</a>
              <span className="mx-2">/</span>
              <a href={`/shop#${product.category.toLowerCase().replace(' & ', '-').replace(' ', '-')}`} className="hover:text-pink-400">
                {product.category}
              </a>
              <span className="mx-2">/</span>
              <span className="text-gray-900">{product.title}</span>
            </nav>
          </Container>
        </section>

        {/* Product Detail */}
        <section className="py-16">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Product Images */}
              <div className="space-y-4">
                <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-lg group">
                  <img
                    src={product.images[selectedImage]}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  
                  {/* Navigation Arrows */}
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white bg-opacity-90 rounded-full hover:bg-white transition-all shadow-lg opacity-0 group-hover:opacity-100"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white bg-opacity-90 rounded-full hover:bg-white transition-all shadow-lg opacity-0 group-hover:opacity-100"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}

                  {/* Sale Badge */}
                  {product.compareAt && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold uppercase shadow-lg">
                      SALE
                    </div>
                  )}

                  {/* Wishlist Button */}
                  <button
                    onClick={handleWishlistToggle}
                    className="absolute top-4 right-4 p-3 bg-white bg-opacity-90 rounded-full hover:bg-white transition-all shadow-lg"
                  >
                    <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                  </button>
                </div>

                {/* Thumbnail Images */}
                {product.images.length > 1 && (
                  <div className="flex space-x-2">
                    {product.images.map((image: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === index ? 'border-pink-500' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={image}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div>
                <div className="mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.title}</h1>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">{product.shortDescription}</p>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-600">
                      {product.rating} ({product.reviews} reviews)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-3xl font-bold text-gray-900">
                      {(() => {
                        const currentVariant = product.variants.find((v: any) => 
                          typeof v === 'object' ? v.name === selectedVariant : v === selectedVariant
                        );
                        const displayPrice = currentVariant?.price || product.price;
                        return formatPrice(displayPrice);
                      })()}
                    </span>
                    {product.compareAt && (
                      <span className="text-xl text-gray-400 line-through">{formatPrice(product.compareAt)}</span>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full mb-8">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-green-700 font-medium text-sm">{product.stockStatus}</span>
                  </div>
                </div>

                {/* Scent/Variants */}
                {product.variants.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {product.slug === 'cuticle-oil' ? 'Scent' : 'Variants'}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {product.variants.map((variant: any, index: number) => {
                        const variantName = typeof variant === 'string' ? variant : variant.name;
                        const variantImage = typeof variant === 'object' && variant.image ? variant.image : null;
                        const isSelected = selectedVariant === variantName;
                        
                        return (
                          <button
                            key={index}
                            onClick={() => setSelectedVariant(variantName)}
                            className={`p-3 rounded-lg border-2 transition-all text-left ${
                              isSelected 
                                ? 'border-pink-500 bg-pink-50' 
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            {variantImage && (
                              <img
                                src={variantImage}
                                alt={variantName}
                                className="w-full h-16 object-cover rounded mb-2"
                              />
                            )}
                            <div className="text-sm font-medium text-gray-900">{variantName}</div>
                            {typeof variant === 'object' && variant.price && (
                              <div className="text-xs text-gray-600">{formatPrice(variant.price)}</div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity & Add to Cart */}
                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-3 hover:bg-gray-50 transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-4 py-3 font-medium">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-3 hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={handleAddToCart}
                      disabled={product.price === -1}
                      className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-4 px-8 rounded-lg font-semibold text-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      {product.price === -1 ? 'Coming Soon' : 'Add to Cart'}
                    </Button>
                    <Button
                      onClick={handleBuyNow}
                      disabled={product.price === -1}
                      className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-4 px-8 rounded-lg font-semibold text-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Buy Now
                    </Button>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-gray-200">
                  <div className="text-center">
                    <Truck className="h-6 w-6 text-pink-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Free Shipping</p>
                  </div>
                  <div className="text-center">
                    <Shield className="h-6 w-6 text-pink-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Secure Payment</p>
                  </div>
                  <div className="text-center">
                    <RotateCcw className="h-6 w-6 text-pink-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Easy Returns</p>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Product Details Tabs */}
        <section className="py-16 bg-white">
          <Container>
            <div className="max-w-4xl mx-auto">
              {/* Tab Navigation */}
              <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'features', label: 'Features' },
                  { id: 'how-to-use', label: 'How to Use' },
                  { id: 'ingredients', label: 'Ingredients' },
                  { id: 'details', label: 'Details' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-6 py-3 font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-pink-500 border-b-2 border-pink-500'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="prose max-w-none">
                {activeTab === 'overview' && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Product Overview</h3>
                    <div 
                      className="text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: product.descriptionHtml || product.shortDescription }}
                    />
                  </div>
                )}

                {activeTab === 'features' && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h3>
                    <ul className="space-y-3">
                      {product.features?.map((feature: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === 'how-to-use' && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">How to Use</h3>
                    <ol className="space-y-3">
                      {product.howToUse?.map((step: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
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
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Ingredients</h3>
                    {product.ingredients?.inci && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Full Ingredient List</h4>
                        <p className="text-gray-700">{product.ingredients.inci.join(', ')}</p>
                      </div>
                    )}
                    {product.ingredients?.key && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Ingredients</h4>
                        <ul className="space-y-2">
                          {product.ingredients.key.map((ingredient: string, index: number) => (
                            <li key={index} className="text-gray-700">• {ingredient}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'details' && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Product Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h4>
                        <dl className="space-y-2">
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Size:</dt>
                            <dd className="text-gray-900 font-medium">{product.details?.size}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Shelf Life:</dt>
                            <dd className="text-gray-900 font-medium">{product.details?.shelfLife}</dd>
                          </div>
                        </dl>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Claims</h4>
                        <div className="flex flex-wrap gap-2">
                          {product.details?.claims?.map((claim: string, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm font-medium"
                            >
                              {claim}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Container>
        </section>

        {/* Related Products */}
        <section className="py-16 bg-gray-50">
          <Container>
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedProducts.map((relatedProduct) => (
                <Card key={relatedProduct.id} className="group hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-0">
                    <div className="aspect-square overflow-hidden rounded-t-lg">
                      <img
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-pink-500 transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">{relatedProduct.category}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-gray-900">{formatPrice(relatedProduct.price)}</span>
                        <Button
                          onClick={() => window.location.href = `/products/${relatedProduct.slug}`}
                          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        {/* Reviews Section */}
        <ReviewSection productId={product.slug} />

        {/* Payment Methods */}
        <PaymentMethods />
      </main>

      <Footer />
      <StickyCart />
    </>
  );
};