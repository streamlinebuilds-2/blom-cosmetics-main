import React, { useState, useEffect } from 'react';
import { Header } from '../layout/Header';
import { Footer } from '../layout/Footer';
import { Container } from '../layout/Container';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { ReviewSection } from '../review/ReviewSection';
import { PaymentMethods } from '../payment/PaymentMethods';
import { StickyCart } from '../cart/StickyCart';
import { cartStore, showNotification } from '../../lib/cart';
import { ShareButton } from '../ui/ShareButton';
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
  Phone
} from 'lucide-react';

interface Review {
  id: string;
  name: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verified: boolean;
  helpful: number;
}

interface ProductData {
  name: string;
  slug: string;
  category: string;
  shortDescription: string;
  overview: string;
  price: string;
  compareAtPrice?: string;
  stock: string;
  images: string[];
  features: string[];
  howToUse: string[];
  ingredients: {
    inci: string[];
    key: string[];
  };
  details: {
    size: string;
    shelfLife: string;
    claims: string[];
  };
  variants: string[];
  related: string[];
  rating: number;
  reviewCount: number;
  reviews: Review[];
  seo: {
    title: string;
    description: string;
  };
}

interface ProductPageTemplateProps {
  product: ProductData;
}

export const ProductPageTemplate: React.FC<ProductPageTemplateProps> = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'how-to-use' | 'ingredients' | 'details'>('overview');
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>('overview');
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Set page title and meta description
  useEffect(() => {
    document.title = product.seo.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', product.seo.description);
    }
  }, [product]);

  const handleAddToCart = () => {
    const priceValue = parseFloat(product.price.replace('R', ''));
    
    cartStore.addItem({
      id: `item_${Date.now()}`,
      productId: product.slug,
      variantId: selectedVariant,
      name: product.name,
      price: priceValue,
      image: product.images[0] || 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
      variant: selectedVariant ? { title: selectedVariant } : undefined
    }, quantity);

    showNotification(`Added ${quantity} ${product.name} to cart!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    window.location.href = '/checkout';
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const toggleAccordion = (section: string) => {
    setExpandedAccordion(expandedAccordion === section ? null : section);
  };

  const getClaimIcon = (claim: string) => {
    switch (claim.toLowerCase()) {
      case 'vegan':
        return <Leaf className="h-4 w-4 text-green-500" />;
      case 'cruelty-free':
        return <Heart className="h-4 w-4 text-pink-500" />;
      case 'hema-free':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <Award className="h-4 w-4 text-purple-500" />;
    }
  };

  const relatedProducts = [
    {
      id: '1',
      name: 'Snow White Acrylic',
      price: 'R280',
      image: 'https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
      rating: 4.8
    },
    {
      id: '2',
      name: 'Core Acrylics Set',
      price: 'R450',
      image: 'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
      rating: 4.9
    },
    {
      id: '3',
      name: 'Acrylic Liquid',
      price: 'R320',
      image: 'https://images.pexels.com/photos/3997990/pexels-photo-3997990.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
      rating: 4.7
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header showMobileMenu={true} />

      <main>
        {/* Breadcrumb */}
        <section className="py-4 border-b">
          <Container>
            <nav className="text-sm text-gray-500">
              <a href="/" className="hover:text-pink-400">Home</a>
              <span className="mx-2">/</span>
              <a href="/shop" className="hover:text-pink-400">Shop</a>
              <span className="mx-2">/</span>
              <a href={`/shop/${product.category.toLowerCase().replace(' ', '-')}`} className="hover:text-pink-400">
                {product.category}
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
                <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100 shadow-md">
                  <img
                    src={product.images[selectedImage] || 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop'}
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

                  {/* Sale Badge */}
                  {product.compareAtPrice && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Save {product.compareAtPrice.replace('R', '')} - {product.price.replace('R', '')}
                    </div>
                  )}
                </div>

                {/* Thumbnail Images */}
                {product.images.length > 1 && (
                  <div className="flex gap-2">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                          selectedImage === index ? 'border-pink-400' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={image || `https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop`}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Buy Box */}
              <div>
                <div className="mb-6">
                  <h1 className="text-4xl font-bold text-gray-900 mb-3">{product.name}</h1>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">{product.shortDescription}</p>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(product.rating || 4.8)
                              ? 'fill-current text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-600 text-sm">({product.reviewCount || 124} reviews)</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-4xl font-bold text-gray-900">{product.price}</span>
                    {product.compareAtPrice && (
                      <span className="text-xl text-gray-400 line-through">{product.compareAtPrice}</span>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className="inline-flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full mb-8">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-green-700 font-medium text-sm">{product.stock}</span>
                  </div>
                </div>

                {/* Variants */}
                {product.variants.length > 1 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Scent</h3>
                    <div className="flex flex-wrap gap-3">
                      {product.variants.map((variant) => (
                        <button
                          key={variant}
                          onClick={() => setSelectedVariant(variant)}
                          className={`px-6 py-3 rounded-full font-medium text-sm transition-all duration-200 ${
                            selectedVariant === variant
                              ? 'bg-pink-400 text-white border-2 border-pink-400 shadow-md'
                              : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {variant}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quantity</h3>
                  <div className="flex items-center border-2 border-gray-200 rounded-full bg-white inline-flex">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-gray-50 transition-colors rounded-l-full"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-5 w-5 text-gray-600" />
                    </button>
                    <span className="px-8 py-3 font-bold text-lg text-gray-900 min-w-[60px] text-center select-none">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 hover:bg-gray-50 transition-colors rounded-r-full"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 mb-8">
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-pink-400 text-white rounded-full py-3 md:py-4 px-6 md:px-8 font-bold text-sm md:text-lg uppercase tracking-wide hover:bg-transparent hover:text-black hover:border-2 hover:border-black transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
                  >
                    ADD TO CART
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="w-full bg-white text-black border-2 border-black rounded-full py-3 md:py-4 px-6 md:px-8 font-bold text-sm md:text-lg uppercase tracking-wide hover:bg-blue-200 hover:border-blue-200 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                  >
                    BUY NOW
                  </button>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setIsWishlisted(!isWishlisted)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-full border-2 border-gray-300 hover:border-pink-400 transition-colors"
                    >
                      <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current text-pink-400' : 'text-gray-600'}`} />
                    </button>
                    <ShareButton
                      url={window.location.href}
                      title={productData.name}
                      description={productData.shortDescription}
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="space-y-3 py-6 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-gray-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Free shipping on orders over R1500</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-gray-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">100% Authentic products</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <RotateCcw className="h-5 w-5 text-gray-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">30-day hassle-free returns</span>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="pt-6 border-t border-gray-200">
                  <PaymentMethods />
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Product Information Accordions */}
        <section className="section-padding bg-pink-50">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Product Information</h2>
              
              <div className="space-y-4">
                {/* Overview */}
                <Card>
                  <button
                    onClick={() => toggleAccordion('overview')}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-semibold text-lg">Overview</h3>
                    {expandedAccordion === 'overview' ? (
                      <ChevronUp className="h-5 w-5 text-pink-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-pink-400" />
                    )}
                  </button>
                  {expandedAccordion === 'overview' && (
                    <div className="px-6 pb-6">
                      <p className="text-gray-600 leading-relaxed">{product.overview}</p>
                    </div>
                  )}
                </Card>

                {/* Features */}
                <Card>
                  <button
                    onClick={() => toggleAccordion('features')}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-semibold text-lg">Features & Benefits</h3>
                    {expandedAccordion === 'features' ? (
                      <ChevronUp className="h-5 w-5 text-pink-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-pink-400" />
                    )}
                  </button>
                  {expandedAccordion === 'features' && (
                    <div className="px-6 pb-6">
                      <ul className="space-y-3">
                        {product.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-pink-400 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>

                {/* How to Use */}
                <Card>
                  <button
                    onClick={() => toggleAccordion('how-to-use')}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-semibold text-lg">How to Use</h3>
                    {expandedAccordion === 'how-to-use' ? (
                      <ChevronUp className="h-5 w-5 text-pink-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-pink-400" />
                    )}
                  </button>
                  {expandedAccordion === 'how-to-use' && (
                    <div className="px-6 pb-6">
                      <ol className="space-y-3">
                        {product.howToUse.map((step, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-pink-400 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                              {index + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </Card>

                {/* Ingredients */}
                <Card>
                  <button
                    onClick={() => toggleAccordion('ingredients')}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-semibold text-lg">Ingredients</h3>
                    {expandedAccordion === 'ingredients' ? (
                      <ChevronUp className="h-5 w-5 text-pink-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-pink-400" />
                    )}
                  </button>
                  {expandedAccordion === 'ingredients' && (
                    <div className="px-6 pb-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3">INCI Names:</h4>
                          <ul className="space-y-2">
                            {product.ingredients.inci.map((ingredient, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                                <span className="text-sm">{ingredient}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-3">Key Ingredients:</h4>
                          <ul className="space-y-2">
                            {product.ingredients.key.map((ingredient, index) => (
                              <li key={index} className="text-sm text-gray-600">
                                {ingredient}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Details */}
                <Card>
                  <button
                    onClick={() => toggleAccordion('details')}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-semibold text-lg">Product Details</h3>
                    {expandedAccordion === 'details' ? (
                      <ChevronUp className="h-5 w-5 text-pink-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-pink-400" />
                    )}
                  </button>
                  {expandedAccordion === 'details' && (
                    <div className="px-6 pb-6">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Size:</span>
                          <span>{product.details.size}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shelf Life:</span>
                          <span>{product.details.shelfLife}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Claims:</span>
                          <span>{product.details.claims.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </Container>
        </section>

        {/* Related Products */}
        <section className="section-padding">
          <Container>
            <h2 className="text-3xl font-bold text-center mb-12">Related Products</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedProducts.map((relatedProduct) => (
                <Card key={relatedProduct.id} className="group cursor-pointer">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(relatedProduct.rating)
                              ? 'fill-current'
                              : 'text-gray-300'
                          }`}
                          style={{ color: i < Math.floor(relatedProduct.rating) ? '#F59E0B' : undefined }}
                        />
                      ))}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{relatedProduct.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-pink-400">{relatedProduct.price}</span>
                      <Button size="sm">Add to Cart</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        {/* Need Help Section */}
        <section className="section-padding bg-gradient-to-r from-pink-50 to-blue-50">
          <Container>
            <div className="text-center max-w-2xl mx-auto">
              <MessageCircle className="h-12 w-12 text-pink-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Need Help?</h2>
              <p className="text-gray-600 mb-6">
                Have questions about this product? Our nail experts are here to help you choose the perfect products for your needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-pink-400 hover:bg-transparent text-white hover:text-black font-bold py-3 px-6 rounded-full transition-all duration-300 border-2 border-transparent hover:border-black">
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="text-sm sm:text-base">WhatsApp Support</span>
                </Button>
                <Button size="lg" className="bg-transparent hover:bg-pink-400 text-pink-400 hover:text-white font-bold py-3 px-6 rounded-full transition-all duration-300 border-2 border-pink-400 hover:border-transparent">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="text-sm sm:text-base">Call Us</span>
                </Button>
              </div>
            </div>
          </Container>
        </section>


        {/* Reviews Section */}
        <ReviewSection
          productName={product.name}
          productImage={product.images[0] || 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'}
          productSlug={product.slug}
          averageRating={product.rating || 0}
          reviewCount={product.reviewCount || 0}
          reviews={product.reviews || []}
          onReviewSubmit={(reviewData) => {
            // In a real app, this would submit to your backend
            console.log('New review submitted:', reviewData);
            showNotification('Thank you for your review! It will be published after moderation.');
          }}
        />

        {/* Sticky Cart */}
        <StickyCart
          productName={product.name}
          productImage={product.images[0] || 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'}
          productPrice={parseFloat(product.price.replace('R', ''))}
          quantity={quantity}
          onQuantityChange={setQuantity}
          onAddToCart={handleAddToCart}
          isVisible={true}
        />
      </main>

      <Footer />
    </div>
  );
};
