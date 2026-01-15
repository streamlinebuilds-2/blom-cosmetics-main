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
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');

  // Fetch product data
  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      
      try {
        setLoading(true);
        console.log('Loading product for slug:', slug);

        // Fetch main product with variants
        const { data: productData, error } = await supabase
          .from('products')
          .select(`
            *, 
            product_reviews(count),
            product_variants (
              id,
              title,
              price,
              inventory_quantity,
              image_url
            )
          `)
          .eq('slug', slug)
          .maybeSingle(); // Use maybeSingle() instead of single() to avoid 406 errors on 0 rows

        console.log('Supabase response:', { productData, error });

        if (error) throw error;
        
        if (productData) {
          // Process product data
          const baseImages = Array.isArray(productData.gallery_urls) 
            ? [productData.image_url || productData.thumbnail_url, ...productData.gallery_urls].filter(Boolean)
            : [productData.image_url || productData.thumbnail_url].filter(Boolean);
          
          // Process variants
          const variants = Array.isArray(productData.product_variants)
            ? productData.product_variants.map((v: any) => ({
                id: v.id,
                name: v.title || v.name || '',
                price: v.price || productData.price,
                inStock: (v.inventory_quantity || 0) > 0,
                image: v.image_url || null
              }))
            : [];
          
          // Build images array including variant images
          const allImages: Array<{ url: string; variantName: string | null }> = [];
          
          // Add base product images
          baseImages.forEach((img: string) => {
            allImages.push({ url: img, variantName: null });
          });
          
          // Add variant images
          variants.forEach((variant: any) => {
            if (variant.image && !allImages.find(img => img.url === variant.image)) {
              allImages.push({ url: variant.image, variantName: variant.name });
            }
          });
          
          const processedProduct = {
            ...productData,
            images: allImages.length > 0 ? allImages.map(img => img.url) : ['/assets/blom_logo.webp'],
            imageVariants: allImages, // Store variant mapping
            variants: variants,
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
          // Set first variant as selected if variants exist
          if (variants.length > 0) {
            setSelectedVariant(variants[0].name);
          }

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

    // Get selected variant details
    const variantData = selectedVariant 
      ? product.variants?.find((v: any) => v.name === selectedVariant)
      : null;
    
    const variantImage = variantData?.image || product.images[selectedImageIndex] || product.images[0];
    const variantPrice = variantData?.price || product.price;

    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: variantPrice,
      image: variantImage,
      quantity: quantity,
      variant: selectedVariant ? { title: selectedVariant } : { title: 'Default' }
    });

    toast({
      title: "Added to cart",
      description: `${product.name}${selectedVariant ? ` (${selectedVariant})` : ''} has been added to your cart.`
    });
  };
  
  // Handle variant selection - update image if variant has specific image
  const handleVariantSelect = (variantName: string) => {
    setSelectedVariant(variantName);
    const variant = product.variants?.find((v: any) => v.name === variantName);
    if (variant?.image) {
      const imageIndex = product.images.findIndex((img: string) => img === variant.image);
      if (imageIndex !== -1) {
        setSelectedImageIndex(imageIndex);
      }
    }
  };
  
  // Handle image selection - update variant if image belongs to a variant
  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
    if (product.imageVariants && product.imageVariants[index]?.variantName) {
      setSelectedVariant(product.imageVariants[index].variantName);
    }
  };
  
  // Get current variant name for label
  const getCurrentVariantName = () => {
    if (product.imageVariants && product.imageVariants[selectedImageIndex]?.variantName) {
      return product.imageVariants[selectedImageIndex].variantName;
    }
    return selectedVariant;
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

                {/* Variant Name Label - Bottom Corner */}
                {getCurrentVariantName() && (
                  <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                    {getCurrentVariantName()}
                  </div>
                )}

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
                      onClick={() => handleImageSelect(idx)}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-all relative ${
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
                      {/* Variant indicator on thumbnail */}
                      {product.imageVariants && product.imageVariants[idx]?.variantName && (
                        <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                          {product.imageVariants[idx].variantName}
                        </div>
                      )}
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
                  R{(() => {
                    if (selectedVariant) {
                      const variant = product.variants?.find((v: any) => v.name === selectedVariant);
                      return (variant?.price || product.price || 0).toFixed(2);
                    }
                    return (product.price || 0).toFixed(2);
                  })()}
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

              {/* Variant Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-semibold text-gray-900">Select Variant:</span>
                    {selectedVariant && (
                      <span className="text-sm text-gray-500">({selectedVariant})</span>
                    )}
                  </div>
                  
                  {/* Variant Options */}
                  <div className="flex flex-wrap gap-3">
                    {product.variants.map((variant: any) => {
                      const isSelected = selectedVariant === variant.name;
                      const isOutOfStock = !variant.inStock;
                      
                      return (
                        <button
                          key={variant.id || variant.name}
                          onClick={() => handleVariantSelect(variant.name)}
                          disabled={isOutOfStock}
                          className={`
                            px-4 py-2 rounded-full text-sm font-medium transition-all
                            ${isSelected
                              ? 'bg-pink-500 text-white shadow-lg shadow-pink-200 ring-2 ring-pink-300'
                              : isOutOfStock
                              ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-pink-300 hover:bg-pink-50'
                            }
                          `}
                        >
                          {variant.name}
                          {variant.price && variant.price !== product.price && (
                            <span className="ml-1 text-xs opacity-75">
                              ({variant.price > product.price ? '+' : ''}R{(variant.price - product.price).toFixed(2)})
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Variant Images Grid */}
                  {product.variants.some((v: any) => v.image) && (
                    <div className="mt-4">
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {product.variants.map((variant: any) => {
                          if (!variant.image) return null;
                          const isSelected = selectedVariant === variant.name;
                          const imageIndex = product.images.findIndex((img: string) => img === variant.image);
                          
                          return (
                            <button
                              key={`variant-img-${variant.id || variant.name}`}
                              onClick={() => handleVariantSelect(variant.name)}
                              className={`
                                aspect-square rounded-lg overflow-hidden border-2 transition-all
                                ${isSelected
                                  ? 'border-pink-400 ring-2 ring-pink-100'
                                  : 'border-transparent hover:border-gray-300'
                                }
                              `}
                            >
                              <OptimizedImage
                                src={variant.image}
                                alt={variant.name}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
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
                    className="flex-1 h-12 bg-pink-500 text-white font-bold rounded-full transition-all shadow-lg shadow-pink-200 hover:bg-pink-600 hover:shadow-xl hover:shadow-pink-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>
                </div>

                {/* Buy Now Button */}
                <button
                  onClick={handleBuyNow}
                  className="w-full h-12 bg-white border-2 border-gray-900 text-gray-900 font-bold rounded-full hover:bg-gradient-to-r hover:from-blue-400 hover:to-blue-500 hover:text-white hover:border-blue-400 hover:shadow-lg hover:shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
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
