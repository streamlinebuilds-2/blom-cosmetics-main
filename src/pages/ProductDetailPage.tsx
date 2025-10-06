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

  // Product database - matches ShopPage products
  const productDatabase = {
    'cuticle-oil': {
      id: '1',
      name: 'Cuticle Oil',
      slug: 'cuticle-oil',
      category: 'Prep & Finishing',
      shortDescription: 'Nourishing oil with Vitamin E, Jojoba & Soybean Oil.',
      overview: 'Luxurious oil blend that hydrates cuticles and strengthens nails. Fast-absorbing and non-greasy, perfect for daily use. Enriched with Vitamin E, Jojoba Oil, and Soybean Oil for maximum nourishment.',
      price: 140,
      compareAtPrice: null,
      stock: 'In Stock',
      images: [
        '/cuticle-oil-white.webp',
        '/cuticle-oil-colorful.webp'
      ],
      features: [
        'Enriched with Vitamin E for nail health',
        'Fast-absorbing, non-greasy formula',
        'Strengthens and nourishes cuticles',
        'Available in 5 beautiful scents',
        'Professional salon quality'
      ],
      howToUse: [
        'Apply a small amount to clean cuticles',
        'Gently massage into cuticle area',
        'Use daily for best results',
        'Can be used before or after manicure'
      ],
      ingredients: {
        inci: [
          'Simmondsia Chinensis (Jojoba) Seed Oil',
          'Glycine Soja (Soybean) Oil',
          'Tocopheryl Acetate (Vitamin E)',
          'Fragrance'
        ],
        key: [
          'Jojoba Oil – deeply moisturizes and conditions',
          'Vitamin E – antioxidant protection',
          'Soybean Oil – strengthens nail structure'
        ]
      },
      details: {
        size: '15ml',
        shelfLife: '24 months',
        claims: ['Vegan', 'Cruelty-Free', 'HEMA-Free']
      },
      variants: [
        { name: 'Cotton Candy', image: '/cuticle-oil-cotton-candy.webp' },
        { name: 'Vanilla', image: '/cuticle-oil-vanilla.webp' },
        { name: 'Tiny Touch', image: '/cuticle-oil-tiny-touch.webp' },
        { name: 'Dragon Fruit Lotus', image: '/cuticle-oil-dragon-fruit-lotus.webp' },
        { name: 'Watermelon', image: '/cuticle-oil-watermelon.webp' }
      ],
      rating: 4.9,
      reviewCount: 156,
      reviews: [
        {
          id: '1',
          name: 'Sarah M.',
          rating: 5,
          title: 'Amazing quality!',
          comment: 'This cuticle oil is incredible. My cuticles have never looked better!',
          date: '2024-01-15',
          verified: true,
          helpful: 12
        }
      ]
    },
    'vitamin-primer': {
      id: '2',
      name: 'Vitamin Primer',
      slug: 'vitamin-primer',
      category: 'Prep & Finishing',
      shortDescription: 'Acid-free primer for adhesion, vitamin-enriched.',
      overview: 'Creates a long-lasting bond for gels and acrylics while protecting the natural nail. Our acid-free formula is enriched with vitamins to promote nail health while ensuring superior adhesion.',
      price: 210,
      compareAtPrice: null,
      stock: 'In Stock',
      images: [
        '/vitamin-primer-white.webp',
        '/vitamin-primer-colorful.webp'
      ],
      features: [
        'Acid-free formula for nail safety',
        'Vitamin-enriched for nail health',
        'Superior adhesion for gels and acrylics',
        'Prevents lifting and chipping',
        'Professional salon quality'
      ],
      howToUse: [
        'Apply thin layer to clean, dry nails',
        'Allow to air dry for 30 seconds',
        'Proceed with gel or acrylic application',
        'Do not over-apply'
      ],
      ingredients: {
        inci: [
          'Ethyl Acetate',
          'Butyl Acetate',
          'Nitrocellulose',
          'Tocopheryl Acetate (Vitamin E)'
        ],
        key: [
          'Vitamin E – promotes nail health',
          'Acid-free formula – safe for natural nails',
          'Superior bonding agents – long-lasting adhesion'
        ]
      },
      details: {
        size: '15ml',
        shelfLife: '24 months',
        claims: ['Acid-Free', 'Vitamin-Enriched', 'Professional Grade']
      },
      variants: [],
      rating: 4.8,
      reviewCount: 124,
      reviews: []
    },
    'prep-solution': {
      id: '3',
      name: 'Prep Solution (Nail Dehydrator)',
      slug: 'prep-solution',
      category: 'Prep & Finishing',
      shortDescription: 'Removes oils & moisture for better adhesion.',
      overview: 'Professional nail dehydrator that removes oils and moisture from the nail plate, ensuring optimal adhesion for gel and acrylic applications. Essential for preventing lifting and extending wear time.',
      price: 200,
      compareAtPrice: null,
      stock: 'In Stock',
      images: [
        '/prep-solution-white.webp',
        '/prep-solution-colorful.webp'
      ],
      features: [
        'Removes oils and moisture effectively',
        'Prevents lifting and chipping',
        'Fast-acting formula',
        'Professional salon standard',
        'Essential for long-lasting results'
      ],
      howToUse: [
        'Apply to clean, dry nails',
        'Allow to air dry completely',
        'Proceed with primer application',
        'Use sparingly for best results'
      ],
      ingredients: {
        inci: [
          'Isopropyl Alcohol',
          'Ethyl Acetate',
          'Dehydrating Agents'
        ],
        key: [
          'Isopropyl Alcohol – removes oils and moisture',
          'Fast-evaporating formula – quick preparation',
          'Professional grade – salon quality results'
        ]
      },
      details: {
        size: '15ml',
        shelfLife: '24 months',
        claims: ['Professional Grade', 'Fast-Acting', 'Salon Quality']
      },
      variants: [],
      rating: 4.7,
      reviewCount: 89,
      reviews: []
    },
    'top-coat': {
      id: '4',
      name: 'Top Coat',
      slug: 'top-coat',
      category: 'Gel System',
      shortDescription: 'Mirror shine, chip-resistant, professional finish.',
      overview: 'High-gloss, chip-resistant finish for both gels and acrylics. Our professional formula provides mirror-like shine and superior protection against chips and wear.',
      price: 190,
      compareAtPrice: null,
      stock: 'In Stock',
      images: [
        '/top-coat-white.webp',
        '/top-coat-colorful.webp'
      ],
      features: [
        'Mirror-like high gloss finish',
        'Chip-resistant formula',
        'Works with gels and acrylics',
        'Long-lasting protection',
        'Professional salon quality'
      ],
      howToUse: [
        'Apply thin layer over cured gel or acrylic',
        'Cure under LED lamp for 60 seconds',
        'Wipe with alcohol to remove sticky layer',
        'Enjoy long-lasting shine'
      ],
      ingredients: {
        inci: [
          'Acrylates Copolymer',
          'Trimethylbenzoyl Diphenylphosphine Oxide',
          'Hydroxycyclohexyl Phenyl Ketone'
        ],
        key: [
          'Acrylates Copolymer – provides durability and shine',
          'Photo-initiators – ensure proper curing',
          'High-gloss formula – mirror-like finish'
        ]
      },
      details: {
        size: '15ml',
        shelfLife: '24 months',
        claims: ['High Gloss', 'Chip-Resistant', 'Professional Grade']
      },
      variants: [],
      rating: 4.9,
      reviewCount: 201,
      reviews: []
    },
    'fairy-dust-top-coat': {
      id: '5',
      name: 'Fairy Dust Top Coat',
      slug: 'fairy-dust-top-coat',
      category: 'Gel System',
      shortDescription: 'Subtle glitter-infused top coat with smooth shine.',
      overview: 'Adds a sparkling finish to any gel or acrylic set. Our fairy dust formula contains fine glitter particles that create a magical shimmer while maintaining a smooth, professional finish.',
      price: 195,
      compareAtPrice: null,
      stock: 'In Stock',
      images: [
        '/fairy-dust-top-coat-white.webp',
        '/fairy-dust-top-coat-colorful.webp'
      ],
      features: [
        'Fine glitter particles for subtle sparkle',
        'Smooth, professional finish',
        'Works over any base color',
        'Easy application and removal',
        'Magical shimmer effect'
      ],
      howToUse: [
        'Apply over cured base color',
        'Use thin, even coats',
        'Cure under LED lamp for 60 seconds',
        'Seal with regular top coat if desired'
      ],
      ingredients: {
        inci: [
          'Acrylates Copolymer',
          'Mica',
          'Titanium Dioxide',
          'Iron Oxides'
        ],
        key: [
          'Mica – creates natural shimmer',
          'Fine glitter particles – subtle sparkle',
          'Smooth formula – professional finish'
        ]
      },
      details: {
        size: '15ml',
        shelfLife: '24 months',
        claims: ['Glitter-Infused', 'Smooth Finish', 'Professional Grade']
      },
      variants: [],
      rating: 4.6,
      reviewCount: 73,
      reviews: []
    },
    'nail-file': {
      id: '6',
      name: 'Nail File (80/80 Grit)',
      slug: 'nail-file',
      category: 'Tools & Essentials',
      shortDescription: 'Durable pro file with floral design.',
      overview: 'Professional nail file with 80/80 grit for shaping and finishing. Features beautiful floral design and durable construction for long-lasting use in professional settings.',
      price: 35,
      compareAtPrice: null,
      stock: 'In Stock',
      images: [
        '/nail-file-white.webp',
        '/nail-file-colorful.webp'
      ],
      features: [
        '80/80 grit for versatile use',
        'Durable construction',
        'Beautiful floral design',
        'Professional quality',
        'Washable and sanitizable'
      ],
      howToUse: [
        'File nails in one direction',
        'Use gentle, smooth strokes',
        'Shape according to desired style',
        'Clean after each use'
      ],
      ingredients: {
        inci: [
          'Aluminum Oxide',
          'Adhesive Backing',
          'Foam Core'
        ],
        key: [
          'Aluminum Oxide – effective filing surface',
          'Foam Core – comfortable grip',
          'Durable backing – long-lasting use'
        ]
      },
      details: {
        size: 'Standard',
        shelfLife: 'Indefinite with proper care',
        claims: ['Professional Grade', 'Washable', 'Durable']
      },
      variants: [
        { name: 'Single File', image: '/nail-file-colorful.webp' },
        { name: '5-Pack Bundle', image: '/nail-file-white.webp' }
      ],
      rating: 4.5,
      reviewCount: 67,
      reviews: []
    },
    'nail-forms': {
      id: '7',
      name: 'Nail Forms',
      slug: 'nail-forms',
      category: 'Tools & Essentials',
      shortDescription: 'Holographic guide, strong adhesive, 300 forms per roll.',
      overview: 'Professional nail forms for creating perfect extensions and overlays. Features holographic guidelines for precise application and strong adhesive for secure placement during sculpting.',
      price: 290,
      compareAtPrice: null,
      stock: 'In Stock',
      images: [
        '/nail-forms-white.webp',
        '/nail-forms-colorful.webp'
      ],
      features: [
        'Holographic guidelines for precision',
        'Strong adhesive backing',
        '300 forms per roll',
        'Professional quality',
        'Easy removal after curing'
      ],
      howToUse: [
        'Clean and prep natural nail',
        'Apply form under free edge',
        'Ensure secure adhesion',
        'Sculpt acrylic or gel extension',
        'Remove form after curing'
      ],
      ingredients: {
        inci: [
          'Paper Substrate',
          'Adhesive Coating',
          'Holographic Film'
        ],
        key: [
          'Strong adhesive – secure placement',
          'Holographic guides – precise application',
          'Quality paper – clean removal'
        ]
      },
      details: {
        size: '300 forms per roll',
        shelfLife: 'Indefinite when stored properly',
        claims: ['Professional Grade', 'Precision Guides', 'Strong Adhesive']
      },
      variants: [],
      rating: 4.5,
      reviewCount: 67,
      reviews: []
    },
    'acetone-remover': {
      id: '8',
      name: 'Acetone (Remover)',
      slug: 'acetone-remover',
      category: 'Tools & Essentials',
      shortDescription: 'Professional-grade, fast acting nail remover.',
      overview: 'Professional-grade acetone for fast and effective nail polish removal. Pure formula ensures quick removal of gel polish, acrylics, and regular polish without damaging the natural nail.',
      price: 60,
      compareAtPrice: null,
      stock: 'In Stock',
      images: [
        '/acetone-remover-white.webp',
        '/acetone-remover-colorful.webp'
      ],
      features: [
        'Professional-grade purity',
        'Fast-acting formula',
        'Effective on all polish types',
        'Clean removal without residue',
        'Salon quality'
      ],
      howToUse: [
        'Soak cotton pad with acetone',
        'Place on nail for 10-15 seconds',
        'Gently wipe away polish',
        'Moisturize nails after use'
      ],
      ingredients: {
        inci: [
          'Acetone (99.9% Pure)'
        ],
        key: [
          'Pure Acetone – effective removal',
          'Professional grade – salon quality',
          'Fast-acting – quick results'
        ]
      },
      details: {
        size: '100ml',
        shelfLife: 'Indefinite when sealed',
        claims: ['Professional Grade', 'Pure Formula', 'Fast-Acting']
      },
      variants: [],
      rating: 4.8,
      reviewCount: 112,
      reviews: []
    },
    'core-acrylics': {
      id: '9',
      name: 'Core Acrylics (56 g)',
      slug: 'core-acrylics',
      category: 'Acrylic System',
      shortDescription: 'Professional acrylic powders in 13 beautiful colors.',
      overview: 'Professional strength acrylic powders in 13 beautiful colors for creative nail art. Each powder is carefully formulated for optimal consistency, strength, and color payoff.',
      price: 280,
      compareAtPrice: null,
      stock: 'In Stock',
      images: [
        '/core-acrylics-white.webp',
        '/core-acrylics-colorful.webp'
      ],
      features: [
        '13 beautiful color options',
        'Professional strength formula',
        'Optimal consistency for sculpting',
        'Vibrant color payoff',
        'Self-leveling properties'
      ],
      howToUse: [
        'Prep nails with primer and dehydrator',
        'Pick up bead with monomer using brush',
        'Sculpt and shape the enhancement',
        'File, buff and finish as desired'
      ],
      ingredients: {
        inci: [
          'Polymethyl Methacrylate',
          'Polyethyl Methacrylate',
          'Benzoyl Peroxide',
          'Color Pigments'
        ],
        key: [
          'PMMA – provides strength and durability',
          'Color pigments – vibrant, long-lasting color',
          'Benzoyl Peroxide – curing activator'
        ]
      },
      details: {
        size: '56g',
        shelfLife: '24 months',
        claims: ['Professional Grade', '13 Colors', 'Self-Leveling']
      },
      variants: [
        { name: 'Baby Blue', image: '/acrylic-powder-baby-blue.webp' },
        { name: 'Lilac Mist', image: '/core-acrylics-colorful.webp' },
        { name: 'Blush Pink', image: '/core-acrylics-colorful.webp' },
        { name: 'Ballet Pink', image: '/core-acrylics-colorful.webp' },
        { name: 'Fuchsia Pink', image: '/core-acrylics-colorful.webp' },
        { name: 'Cloud Grey', image: '/core-acrylics-colorful.webp' },
        { name: 'Mint Mist', image: '/core-acrylics-colorful.webp' },
        { name: 'Rose Pink', image: '/core-acrylics-colorful.webp' },
        { name: 'Fresh Mint', image: '/core-acrylics-colorful.webp' },
        { name: 'Soft Nude', image: '/core-acrylics-colorful.webp' },
        { name: 'Petal Pink', image: '/core-acrylics-colorful.webp' },
        { name: 'Sky Blue', image: '/core-acrylics-colorful.webp' },
        { name: 'Lemon Glow', image: '/core-acrylics-colorful.webp' }
      ],
      rating: 4.9,
      reviewCount: 156,
      reviews: []
    },
    'nail-liquid-monomer': {
      id: '10',
      name: 'Nail Liquid (Monomer)',
      slug: 'nail-liquid-monomer',
      category: 'Acrylic System',
      shortDescription: 'Professional monomer for acrylic applications.',
      overview: 'Premium quality monomer formulated for optimal acrylic application. Low odor formula with superior clarity and strength. Essential for creating durable, beautiful acrylic enhancements.',
      price: 350,
      compareAtPrice: null,
      stock: 'In Stock',
      images: [
        '/nail-liquid-monomer-white.webp',
        '/nail-liquid-monomer-colorful.webp'
      ],
      features: [
        'Low odor formula',
        'Superior clarity and strength',
        'Professional grade quality',
        'Optimal working time',
        'Creates durable enhancements'
      ],
      howToUse: [
        'Pour into dappen dish',
        'Dip acrylic brush into liquid',
        'Pick up acrylic powder to form bead',
        'Apply to nail and sculpt',
        'Allow to air dry completely'
      ],
      ingredients: {
        inci: [
          'Ethyl Methacrylate',
          'Polymethyl Methacrylate',
          'Catalyst'
        ],
        key: [
          'Ethyl Methacrylate – creates strong bond',
          'Low odor formula – comfortable application',
          'Professional grade – salon quality results'
        ]
      },
      details: {
        size: '250ml / 500ml',
        shelfLife: '24 months',
        claims: ['Professional Grade', 'Low Odor', 'High Quality']
      },
      variants: [
        { name: '250ml', image: '/nail-liquid-monomer-colorful.webp', price: 350 },
        { name: '500ml', image: '/nail-liquid-monomer-white.webp', price: 550 }
      ],
      rating: 4.8,
      reviewCount: 94,
      reviews: []
    }
  };

  useEffect(() => {
    // Find product by slug
    const foundProduct = productDatabase[productSlug as keyof typeof productDatabase];

    if (foundProduct) {
      setProduct(foundProduct);
      const firstVariant = foundProduct.variants[0];
      setSelectedVariant(typeof firstVariant === 'string' ? firstVariant : firstVariant?.name || '');

      // Set page title and meta description
      document.title = `${foundProduct.name} - BLOM Cosmetics`;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', foundProduct.shortDescription);
      }
    }

    setLoading(false);
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
      name: product.name,
      price: variantPrice,
      image: variantImage || product.images[0] || 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
      variant: selectedVariant ? { title: selectedVariant } : undefined
    }, quantity);

    showNotification(`Added ${quantity} ${product.name} to cart!`);
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
      name: product.name,
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
      id: '1',
      name: 'Vitamin Primer',
      price: 210,
      image: '/vitamin-primer-white.webp',
      rating: 4.8,
      slug: 'vitamin-primer'
    },
    {
      id: '2',
      name: 'Top Coat',
      price: 190,
      image: '/top-coat-white.webp',
      rating: 4.9,
      slug: 'top-coat'
    },
    {
      id: '3',
      name: 'Prep Solution',
      price: 200,
      image: '/prep-solution-white.webp',
      rating: 4.7,
      slug: 'prep-solution'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header showMobileMenu={true} />
        <main className="section-padding">
          <Container>
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading product...</p>
            </div>
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
        <main className="section-padding">
          <Container>
            <div className="text-center py-16">
              <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
              <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
              <Button onClick={() => window.location.href = '/shop'}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shop
              </Button>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header showMobileMenu={true} />

      <main>
        {/* Breadcrumb */}
        <section className="py-4 border-b bg-gray-50">
          <Container>
            <nav className="text-sm text-gray-500">
              <a href="/" className="hover:text-pink-400">Home</a>
              <span className="mx-2">/</span>
              <a href="/shop" className="hover:text-pink-400">Shop</a>
              <span className="mx-2">/</span>
              <a href={`/shop#${product.category.toLowerCase().replace(' & ', '-').replace(' ', '-')}`} className="hover:text-pink-400">
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
                <div className="relative aspect-square mb-6 overflow-hidden rounded-2xl bg-gray-50">
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
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all shadow-lg"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all shadow-lg"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}

                  {/* Sale Badge */}
                  {product.compareAtPrice && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold uppercase shadow-lg">
                      SALE
                    </div>
                  )}

                  {/* Wishlist Button */}
                  <button
                    onClick={handleWishlistToggle}
                    className="absolute top-4 right-4 p-3 bg-white bg-opacity-90 rounded-full hover:bg-white transition-all shadow-lg"
                  >
                    <Heart className={`h-6 w-6 ${isWishlisted ? 'fill-current text-pink-400' : 'text-gray-600'}`} />
                  </button>
                </div>

                {/* Thumbnail Images */}
                {product.images.length > 1 && (
                  <div className="flex gap-3">
                    {product.images.map((image: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                          selectedImage === index ? 'border-pink-400' : 'border-gray-200 hover:border-gray-300'
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

              {/* Product Info */}
              <div>
                <div className="mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">{product.shortDescription}</p>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(product.rating)
                              ? 'fill-current text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-600">({product.reviewCount} reviews)</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-4 mb-3">
                    <span className="text-4xl font-bold text-gray-900">
                      {(() => {
                        const currentVariant = product.variants.find((v: any) =>
                          (typeof v === 'object' && v.name === selectedVariant)
                        );
                        const displayPrice = currentVariant?.price || product.price;
                        return formatPrice(displayPrice);
                      })()}
                    </span>
                    {product.compareAtPrice && (
                      <span className="text-xl text-gray-400 line-through">{formatPrice(product.compareAtPrice)}</span>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full mb-8">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-green-700 font-medium text-sm">{product.stock}</span>
                  </div>
                </div>

                {/* Scent/Variants */}
                {product.variants.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {product.slug === 'cuticle-oil' ? 'Scent' : product.slug === 'nail-liquid-monomer' ? 'Size' : 'Options'}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {product.variants.map((variant: any) => {
                        const variantName = typeof variant === 'string' ? variant : variant.name;
                        const variantImage = typeof variant === 'object' && variant.image ? variant.image : null;
                        const variantPrice = typeof variant === 'object' && variant.price ? variant.price : null;

                        return (
                          <button
                            key={variantName}
                            onClick={() => {
                              setSelectedVariant(variantName);
                              if (variantImage) {
                                const imageIndex = product.images.indexOf(variantImage);
                                if (imageIndex !== -1) {
                                  setSelectedImage(imageIndex);
                                } else {
                                  product.images.push(variantImage);
                                  setSelectedImage(product.images.length - 1);
                                }
                              }
                            }}
                            className={`px-6 py-3 rounded-full font-medium text-sm transition-all duration-200 border-2 ${
                              selectedVariant === variantName
                                ? 'bg-pink-400 text-white border-pink-400 shadow-md'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-pink-400 hover:text-pink-400'
                            }`}
                          >
                            {variantName}
                            {variantPrice && <span className="ml-2 text-xs">({formatPrice(variantPrice)})</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quantity</h3>
                  <div className="flex items-center border-2 border-gray-200 rounded-full bg-white inline-flex overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-4 hover:bg-gray-50 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-5 w-5 text-gray-600" />
                    </button>
                    <span className="px-8 py-4 font-bold text-lg text-gray-900 min-w-[80px] text-center select-none">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-4 hover:bg-gray-50 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4 mb-8">
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-pink-400 text-white rounded-full py-4 px-8 font-bold text-lg uppercase tracking-wide hover:bg-pink-500 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
                  >
                    ADD TO CART
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="w-full bg-pink-400 text-white rounded-full py-4 px-8 font-bold text-lg uppercase tracking-wide hover:bg-pink-500 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
                  >
                    BUY NOW
                  </button>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {}}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-full border-2 border-gray-300 hover:border-gray-400 transition-colors"
                    >
                      <Share2 className="h-5 w-5 text-gray-600" />
                      <span className="text-sm font-medium">Share</span>
                    </button>
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
        <section className="section-padding bg-gray-50">
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
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
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
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {expandedAccordion === 'features' && (
                    <div className="px-6 pb-6">
                      <ul className="space-y-3">
                        {product.features.map((feature: string, index: number) => (
                          <li key={index} className="flex items-center gap-3">
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
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
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {expandedAccordion === 'how-to-use' && (
                    <div className="px-6 pb-6">
                      <ol className="space-y-3">
                        {product.howToUse.map((step: string, index: number) => (
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
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {expandedAccordion === 'ingredients' && (
                    <div className="px-6 pb-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3">INCI Names:</h4>
                          <ul className="space-y-2">
                            {product.ingredients.inci.map((ingredient: string, index: number) => (
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
                            {product.ingredients.key.map((ingredient: string, index: number) => (
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
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {expandedAccordion === 'details' && (
                    <div className="px-6 pb-6">
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">Size:</span>
                          <span>{product.details.size}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Shelf Life:</span>
                          <span>{product.details.shelfLife}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Claims:</span>
                          <div className="flex gap-2">
                            {product.details.claims.map((claim: string, index: number) => (
                              <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                {claim}
                              </span>
                            ))}
                          </div>
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
            <h2 className="text-3xl font-bold text-center mb-12">You Might Also Like</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedProducts.map((relatedProduct) => (
                <Card key={relatedProduct.id} className="group cursor-pointer" onClick={() => window.location.href = `/products/${relatedProduct.slug}`}>
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(relatedProduct.rating)
                              ? 'fill-current text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-pink-400 transition-colors">{relatedProduct.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-pink-400">{formatPrice(relatedProduct.price)}</span>
                      <Button size="sm" onClick={(e) => {
                        e.stopPropagation();
                        // Add to cart logic here
                      }}>
                        Add to Cart
                      </Button>
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
                <Button size="lg" className="bg-green-500 hover:bg-green-600">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  WhatsApp Support
                </Button>
                <Button size="lg" variant="outline">
                  <Phone className="h-5 w-5 mr-2" />
                  Call Us
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
          averageRating={product.rating}
          reviewCount={product.reviewCount}
          reviews={product.reviews}
          onReviewSubmit={(reviewData) => {
            console.log('New review submitted:', reviewData);
            showNotification('Thank you for your review! It will be published after moderation.');
          }}
        />

        {/* Sticky Cart */}
        <StickyCart
          productName={product.name}
          productImage={product.images[0] || 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'}
          productPrice={product.price}
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