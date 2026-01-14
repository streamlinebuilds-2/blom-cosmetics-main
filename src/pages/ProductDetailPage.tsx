import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Minus, Plus, ShoppingCart, Star, ChevronRight, Truck, ShieldCheck } from 'lucide-react';
import { cartStore } from '../lib/cart';
import { supabase } from '../lib/supabase';
import { PageLoadingSpinner } from '../components/ui/LoadingSpinner';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .single();

        if (data) {
          setProduct(data);
        }
      } catch (e) {
        console.error('Error loading product', e);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <main className="pt-4 pb-20">
        <Container>
          <PageLoadingSpinner text="Loading product..." />
        </Container>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="pt-4 pb-20">
        <Container>
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Link 
              to="/shop" 
              className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors font-medium"
            >
              Back to Shop
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  // Safely handle images
  const images = product.images || [product.image_url] || [];
  const price = product.price || (product.price_cents ? product.price_cents / 100 : 0);

  const handleAddToCart = () => {
    cartStore.addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: price,
      image: images[0] || '/placeholder.png',
      quantity: quantity
    });
  };

  return (
    <main className="pt-4 pb-20">
      <Container>
        {/* Breadcrumbs */}
        <div className="flex items-center text-xs text-gray-500 mb-6 overflow-x-auto whitespace-nowrap">
          <Link to="/">Home</Link>
          <ChevronRight className="w-3 h-3 mx-2" />
          <Link to="/shop">Shop</Link>
          <ChevronRight className="w-3 h-3 mx-2" />
          <span className="text-black font-medium">{product.name}</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          
          {/* --- Left: Image Gallery --- */}
          <div className="space-y-4">
            <div className="aspect-[4/5] bg-gray-50 rounded-2xl overflow-hidden relative">
              <img 
                src={images[activeImageIndex] || '/placeholder.png'} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${activeImageIndex === idx ? 'border-black' : 'border-transparent'}`}
                  >
                    <img src={img || '/placeholder.png'} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* --- Right: Product Info --- */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            
            {/* Reviews Summary (Static for now) */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <span className="text-sm text-gray-500">(12 Reviews)</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-6">
              R{price.toFixed(2)}
            </div>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {product.short_description || product.description || 'No description available.'}
            </p>
            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <div className="flex items-center border border-gray-200 rounded-xl w-fit">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-gray-50 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-black text-white py-3 px-8 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            </div>
            {/* --- THE TABS SECTION --- */}
            <div className="border-t border-gray-100 pt-8">
              <div className="flex gap-6 border-b border-gray-100 mb-6 overflow-x-auto no-scrollbar">
                {['details', 'how to use', 'ingredients', 'shipping'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
                      activeTab === tab 
                        ? 'border-black text-black' 
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="min-h-[200px] text-gray-600 text-sm leading-relaxed">
                {activeTab === 'details' && (
                  <div className="prose prose-sm">
                    {product.description || 'No detailed description available.'}
                  </div>
                )}
                
                {activeTab === 'how to use' && (
                  <div>
                    {product.how_to_use ? (
                      <ul className="list-disc pl-5 space-y-2">
                        {product.how_to_use.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ul>
                    ) : (
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Prepare the nail bed properly.</li>
                        <li>Apply product in thin, even coats.</li>
                        <li>Cure according to lamp specifications.</li>
                        <li>Finish with a top coat for lasting shine.</li>
                      </ul>
                    )}
                  </div>
                )}
                {activeTab === 'ingredients' && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    {product.ingredients || 'Acrylates Copolymer, Trimethylolpropane Triacrylate, Ethyl Methacrylate, Isopropyl Titanium Triisostearate, Ethyl Acetate, Dimethicone, Microcrystalline Wax.'}
                  </div>
                )}
                {activeTab === 'shipping' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-black" />
                      <span>Free delivery on orders over R1000</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-black" />
                      <span>14-day return policy if unopened</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
};
