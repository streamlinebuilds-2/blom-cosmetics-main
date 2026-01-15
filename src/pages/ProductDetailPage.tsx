import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../lib/cart';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { PageLoadingSpinner } from '../components/ui/LoadingSpinner';
import { AccordionItem } from '../components/ui/Accordion';
import { ReviewSection } from '../components/review/ReviewSection';
import { ShareButton } from '../components/ui/ShareButton';
import { OptimizedImage } from '../components/seo/OptimizedImage';
import { 
  Star, 
  Minus, 
  Plus, 
  Truck, 
  ShieldCheck, 
  ArrowRight, 
  Heart,
  ShoppingCart,
  CreditCard
} from 'lucide-react';
import { useToast } from '../components/ui/use-toast';
import { ProductCard } from '../components/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');

  // Fetch product data
  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      
      try {
        setLoading(true);
        console.log('Loading product for slug:', slug);

        // Fetch main product
        const { data: productData, error } = await supabase
          .from('products')
          .select('*, product_reviews(count)')
          .eq('slug', slug)
          .maybeSingle(); // Use maybeSingle() instead of single() to avoid 406 errors on 0 rows

        console.log('Supabase response:', { productData, error });

        if (error) throw error;
        
        if (productData) {
          // Process product data
          const images = Array.isArray(productData.gallery_urls) 
            ? [productData.image_url || productData.thumbnail_url, ...productData.gallery_urls].filter(Boolean)
            : [productData.image_url || productData.thumbnail_url].filter(Boolean);
            
          const processedProduct = {
            ...productData,
            images: images.length > 0 ? images : ['/assets/blom_logo.webp'], // Fallback image
            features: Array.isArray(productData.features) ? productData.features : [],
            howToUse: Array.isArray(productData.how_to_use) ? productData.how_to_use : [],
            ingredients: {
              inci: Array.isArray(productData.inci_ingredients) ? productData.inci_ingredients : [],
              key: Array.isArray(productData.key_ingredients) ? productData.key_ingredients : []
            },
            details: {
              size: productData.size,
              shelfLife: productData.shelf_life,
              claims: Array.isArray(productData.claims) ? productData.claims : []
            }
          };
          
          setProduct(processedProduct);
          setSelectedImageIndex(0);

          // Fetch related products (same category)
          if (productData.category) {
            const { data: related } = await supabase
              .from('products')
              .select('*')
              .eq('category', productData.category)
              .neq('id', productData.id)
              .eq('status', 'active')
              .limit(4);
              
            if (related) {
              setRelatedProducts(related.map(p => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                price: p.price,
                images: [p.image_url || p.thumbnail_url],
                category: p.category,
                inStock: (p.stock_quantity || 0) > 0
              })));
            }
          }
        }
      } catch (err) {
        console.error('Error loading product:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
    // Scroll to top when slug changes
    window.scrollTo(0, 0);
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: quantity,
      variant: { title: 'Default' }
    });

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header showMobileMenu={true} />
        <main className="pt-32 pb-16">
          <Container>
            <PageLoadingSpinner text="Loading product details..." />
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Header showMobileMenu={true} />
        <main className="pt-32 pb-16 text-center">
          <Container>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-8">The product you are looking for does not exist or has been moved.</p>
            <Link to="/shop" className="inline-block bg-pink-400 text-white px-8 py-3 rounded-full hover:bg-pink-500 transition-colors">
              Back to Shop
            </Link>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate discount percentage if compare_at_price exists
  const discountPercentage = product.compare_at_price 
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-white">
      <Header showMobileMenu={true} />

      <main className="pt-8 pb-16">
        {/* Breadcrumbs */}
        <Container className="mb-6">
          <nav className="flex items-center text-sm text-gray-500">
            <Link to="/" className="hover:text-pink-500 transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/shop" className="hover:text-pink-500 transition-colors">Shop</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </Container>

        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-20">
            {/* Left Column: Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden relative group">
                <OptimizedImage
                  src={product.images[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {discountPercentage > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      -{discountPercentage}%
                    </span>
                  )}
                  {(product.stock_quantity || 0) < 1 && (
                    <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>

                <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md text-gray-400 hover:text-pink-500 transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {product.images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImageIndex === idx 
                          ? 'border-pink-400 ring-2 ring-pink-100' 
                          : 'border-transparent hover:border-gray-200'
                      }`}
                    >
                      <OptimizedImage
                        src={img}
                        alt={`${product.name} view ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Product Info */}
            <div className="flex flex-col">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2 leading-tight">
                {product.name}
              </h1>
              
              {/* Reviews Summary */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-gray-500 font-medium">
                  ({product.product_reviews?.[0]?.count || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-end gap-3 mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  R{(product.price || 0).toFixed(2)}
                </span>
                {product.compare_at_price && (
                  <span className="text-xl text-gray-400 line-through mb-1">
                    R{(product.compare_at_price || 0).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Short Description */}
              {product.short_description && (
                <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                  {product.short_description}
                </p>
              )}

              {/* Quantity & Actions */}
              <div className="space-y-4 mb-8 pb-8 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-semibold text-gray-900">Quantity</span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Quantity Selector */}
                  <div className="flex items-center border border-gray-200 rounded-xl h-12 w-fit">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-full flex items-center justify-center text-gray-500 hover:text-pink-500 transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium text-gray-900">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-full flex items-center justify-center text-gray-500 hover:text-pink-500 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 h-12 bg-pink-400 hover:bg-pink-500 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-pink-200 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>
                </div>

                {/* Buy Now Button */}
                <button
                  onClick={handleBuyNow}
                  className="w-full h-12 bg-white border-2 border-gray-900 text-gray-900 font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  Buy Now
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-pink-500">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900">Free Shipping</h4>
                    <p className="text-xs text-gray-500 mt-1">On orders over R1000</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-pink-500">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900">Quality Guarantee</h4>
                    <p className="text-xs text-gray-500 mt-1">Professional grade products</p>
                  </div>
                </div>
              </div>

              {/* Accordion Sections - Smart Content Hiding */}
              <div className="border-t border-gray-100">
                {/* Overview */}
                {(product.description || product.overview) && (
                  <AccordionItem title="Overview" defaultOpen={true}>
                    <div className="prose prose-pink max-w-none text-gray-600">
                      <p>{product.overview || product.description}</p>
                    </div>
                  </AccordionItem>
                )}

                {/* Features & Benefits */}
                {product.features && product.features.length > 0 && (
                  <AccordionItem title="Features & Benefits">
                    <ul className="space-y-2 list-disc pl-5">
                      {product.features.map((feature: string, idx: number) => (
                        <li key={idx} className="text-gray-600">{feature}</li>
                      ))}
                    </ul>
                  </AccordionItem>
                )}

                {/* How to Use */}
                {product.howToUse && product.howToUse.length > 0 && (
                  <AccordionItem title="How to Use">
                    <ol className="space-y-3 list-decimal pl-5">
                      {product.howToUse.map((step: string, idx: number) => (
                        <li key={idx} className="text-gray-600 pl-1">{step}</li>
                      ))}
                    </ol>
                  </AccordionItem>
                )}

                {/* Ingredients */}
                {(product.ingredients?.key?.length > 0 || product.ingredients?.inci?.length > 0) && (
                  <AccordionItem title="Ingredients">
                    <div className="space-y-6">
                      {product.ingredients.key?.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Key Ingredients:</h4>
                          <ul className="space-y-1 list-disc pl-5">
                            {product.ingredients.key.map((item: string, idx: number) => (
                              <li key={idx} className="text-gray-600">{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {product.ingredients.inci?.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">INCI Names:</h4>
                          <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg">
                            {product.ingredients.inci.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  </AccordionItem>
                )}

                {/* Product Details */}
                {(product.details?.size || product.details?.shelfLife || product.details?.claims?.length > 0) && (
                  <AccordionItem title="Product Details">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                      {product.details.size && (
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">Size</h4>
                          <p className="text-gray-600">{product.details.size}</p>
                        </div>
                      )}
                      
                      {product.details.shelfLife && (
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">Shelf Life</h4>
                          <p className="text-gray-600">{product.details.shelfLife}</p>
                        </div>
                      )}
                      
                      {product.details.claims?.length > 0 && (
                        <div className="col-span-2">
                          <h4 className="font-semibold text-gray-900 text-sm mb-2">Claims</h4>
                          <div className="flex flex-wrap gap-2">
                            {product.details.claims.map((claim: string, idx: number) => (
                              <span key={idx} className="bg-pink-50 text-pink-700 text-xs font-medium px-2.5 py-1 rounded-full border border-pink-100">
                                {claim}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionItem>
                )}
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mb-20 scroll-mt-24" id="reviews">
            <ReviewSection 
              productName={product.name}
              productImage={product.images[0]}
              productSlug={product.slug}
              averageRating={0} // TODO: Fetch from DB
              reviewCount={product.product_reviews?.[0]?.count || 0}
              reviews={[]} // TODO: Fetch reviews
            />
          </div>

          {/* You Might Also Like */}
          {relatedProducts.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">You Might Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {relatedProducts.map((related) => (
                  <ProductCard key={related.id} {...related} />
                ))}
              </div>
            </div>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
