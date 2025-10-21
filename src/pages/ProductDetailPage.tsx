import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PaymentMethods } from '../components/payment/PaymentMethods';
import { StickyCart } from '../components/cart/StickyCart';
import { cartStore, showNotification } from '../lib/cart';
import { wishlistStore } from '../lib/wishlist';
import { updateSEO, productSEO, trackPageView } from '../lib/seo';
import { ProductStructuredData } from '../components/seo/ProductStructuredData';
import { ShareButton } from '../components/ui/ShareButton';
import { ProductReviews } from '../components/reviews/ProductReviews';
import { ReviewForm } from '../components/reviews/ReviewForm';
import { loadDiscounts, computeFinalPrice, formatDiscountBadge, getDiscountBadgeColor, type Discount, type ProductItem } from '../utils/discounts';
import { 
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
  const [thumbnailScrollIndex, setThumbnailScrollIndex] = useState(0);
  const [allImages, setAllImages] = useState<string[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);

  // Product database - matches ShopPage products
  const productDatabase = {
    'prep-primer-bundle': {
      id: 'bundle-1',
      name: 'Prep & Primer Bundle',
      slug: 'prep-primer-bundle',
      category: 'Bundle Deals',
      shortDescription: 'Essential prep duo - Dehydrator & Primer - save R40!',
      overview: 'Get the perfect foundation for long-lasting nail enhancements with our Prep & Primer Bundle. This essential duo combines our Prep Solution (Nail Dehydrator) to remove oils and moisture, with our Vitamin Primer for superior adhesion. Save R40 when you buy them together.',
      price: 370,
      compareAtPrice: 410,
      stock: 'In Stock',
      images: ['/bundle-prep-primer-white.webp', '/bundle-prep-primer-colorful.webp'],
      features: [
        'Complete nail preparation system',
        'Professional-grade adhesion products',
        'Save R40 compared to buying individually',
        'Perfect for gel and acrylic applications',
        'Prevents lifting and ensures long-lasting results',
        'Suitable for both beginners and professionals'
      ],
      howToUse: [
        'Start with clean, shaped natural nails',
        'Apply Prep Solution to dehydrate the nail plate',
        'Allow to dry completely (30-60 seconds)',
        'Apply a thin layer of Vitamin Primer',
        'Let primer dry before applying gel or acrylic',
        'Proceed with your nail enhancement application'
      ],
      ingredients: {
        inci: ['See individual product pages for full ingredient lists'],
        key: [
          'Prep Solution – Removes oils and moisture from nail plate',
          'Vitamin Primer – Acid-free, vitamin-enriched adhesion formula',
          'Both products work together for maximum bond strength'
        ]
      },
      includedProducts: [
        { id: '3', name: 'Prep Solution (Nail Dehydrator)', quantity: 1, price: 200 },
        { id: '2', name: 'Vitamin Primer', quantity: 1, price: 210 }
      ],
      details: {
        bundleValue: 'R410',
        bundlePrice: 'R370',
        savings: 'R40 (10% off)',
        totalItems: '2 products included'
      },
      variants: [],
      rating: 0,
      reviewCount: 0,
      reviews: []
    },
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
      rating: 0,
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
          'Isopropylidenediphenyl bisoxyhydroxypropyl methacrylate',
          'Tocopherol',
          'Panthenol',
          'p-Hydroxyanisole',
          'Hydroquinone'
        ],
        key: [
          'Ethyl Acetate – solvent for proper application',
          'Tocopherol – Vitamin E for nail health',
          'Panthenol – Vitamin B5 for nail strengthening',
          'p-Hydroxyanisole – antioxidant preservative',
          'Hydroquinone – stabilizer for product integrity'
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
        'Non-wipe technology',
        'Works with gels and acrylics',
        'Long-lasting protection',
        'Professional salon quality'
      ],
      howToUse: [
        'Apply thin layer over cured gel or acrylic',
        'Cure under LED lamp for 60 seconds',
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
      rating: 0,
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
        'Cure under LED lamp for 60 seconds'
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
      category: 'Archived',
      shortDescription: 'Professional-grade, fast acting nail remover.',
      overview: 'Professional-grade acetone for fast and effective nail polish removal. Pure formula ensures quick removal of gel polish, acrylics, and regular polish without damaging the natural nail.',
      price: 60,
      compareAtPrice: null,
      stock: 'Archived',
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
    'nail-liquid-monomer': {
      id: '10',
      name: 'Nail Liquid (Monomer)',
      slug: 'nail-liquid-monomer',
      category: 'Acrylic System',
      shortDescription: 'Professional monomer for acrylic applications.',
      overview: 'Premium quality monomer formulated for optimal acrylic application. Low odor formula with superior clarity and strength. Essential for creating durable, beautiful acrylic enhancements.',
      price: -1,
      compareAtPrice: null,
      stock: 'Coming Soon',
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
        { name: '250ml', image: '/nail-liquid-monomer-colorful.webp', price: -1 },
        { name: '500ml', image: '/nail-liquid-monomer-white.webp', price: -1 }
      ],
      rating: 4.8,
      reviewCount: 94,
      reviews: []
    },
    'crystal-kolinsky-sculpting-brush': {
      id: '11',
      name: 'Crystal Kolinsky Sculpting Brush',
      slug: 'crystal-kolinsky-sculpting-brush',
      category: 'Tools & Essentials',
      shortDescription: 'Premium Kolinsky brush with floating glitter handle.',
      overview: 'Premium 100% Kolinsky brush with floating glitter handle for professional acrylic work. Perfect precision and control for sculpting beautiful acrylic nails.',
      price: 450,
      compareAtPrice: null,
      stock: 'In Stock',
      images: [
        '/acrylic-sculpture-brush-white.webp',
        '/acrylic-sculpture-brush-colorful.webp'
      ],
      features: [
        '100% Kolinsky hair',
        'Floating glitter handle',
        'Professional grade',
        'Durable construction',
        'Precision application'
      ],
      howToUse: [
        'Load with monomer',
        'Pick up acrylic powder',
        'Apply to nail',
        'Shape as desired',
        'Clean thoroughly after use'
      ],
      ingredients: {
        inci: [],
        key: []
      },
      details: {
        size: '10mm',
        shelfLife: 'N/A',
        claims: ['100% Kolinsky', 'Professional Grade']
      },
      variants: [
        { name: '10mm', price: 450, inStock: true }
      ],
      rating: 0,
      reviewCount: 23,
      reviews: []
    },
    'rose-petal-manicure-table': {
      id: '13',
      name: 'Rose Petal Manicure Table',
      slug: 'rose-petal-manicure-table',
      category: 'Furniture',
      shortDescription: 'Beautiful manicure table perfect for salons and home studios.',
      overview: 'The Rose Petal Manicure Table is designed for beauty professionals who value elegance and functionality. Handcrafted locally with premium finishes, this workstation blends timeless style with everyday practicality. Perfect for creating a welcoming, professional atmosphere in your salon or home studio.',
      price: 2590,
      compareAtPrice: null,
      stock: 'Made to Order',
      images: ['/rose-petal-manicure-table-white.webp', '/rose-petal-manicure-table-colorful.webp'],
      features: [
        'Handcrafted from durable, high-quality materials',
        'Elegant pastel-white design fits any salon aesthetic',
        'Smooth surfaces for easy cleaning and long-lasting use',
        'Comfortable working height optimized for professionals',
        'Sturdy construction for daily salon use'
      ],
      dimensions: [
        'Table Size: 120 cm (L) × 50 cm (W) × 80 cm (H)',
        'Perfect for standard salon spaces',
        'Custom sizing available upon request'
      ],
      materialsFinish: [
        'Premium MDF wood structure',
        'High-gloss enamel finish (pastel white)',
        'Smooth lacquered surface',
        'Reinforced joints for durability'
      ],
      productionDelivery: [
        'Each piece is handcrafted on order',
        'Standard lead time: 10–14 business days',
        'Courier within Randfontein area: R350',
        'Outside Randfontein: calculated based on delivery address',
        'All furniture is securely packaged and ready to use upon arrival'
      ],
      variants: [
        { name: 'Standard', price: 2590, inStock: true, image: '/rose-petal-manicure-table-colorful.webp' }
      ],
      rating: 5.0,
      reviewCount: 12,
      reviews: []
    },
    'iris-manicure-table': {
      id: '14',
      name: 'Iris Manicure Table',
      slug: 'iris-manicure-table',
      category: 'Furniture',
      shortDescription: 'Professional manicure table with integrated shelf system.',
      overview: 'The Iris Manicure Table combines workspace and storage in one elegant, space-efficient unit. Designed for busy professionals who need both style and functionality, this table features an integrated shelf system that keeps all your essentials organized and within reach. Choose between wooden or glass top to perfectly match your salon aesthetic.',
      price: 3490,
      compareAtPrice: null,
      stock: 'Made to Order',
      images: ['/iris-manicure-table-white.webp', '/iris-manicure-table-colorful.webp', '/iris-manicure-table-glass.webp'],
      features: [
        'Integrated shelf system maximizes vertical storage',
        'Choice of wooden or tempered glass top',
        'Spacious work surface for comfortable client service',
        'Multiple shelf levels for organized product display',
        'Professional-grade construction for daily salon use',
        'Elegant design complements any salon decor'
      ],
      dimensions: [
        'Table Size: 124 cm (L) × 50 cm (W) × 80 cm (H)',
        'Total Height with Shelf: 180 cm',
        'Shelf Depth: Optimized for product storage',
        'Custom sizing available upon request'
      ],
      materialsFinish: [
        'Premium MDF wood structure',
        'High-gloss enamel finish (pastel white)',
        'Optional tempered glass top (6mm thickness)',
        'Reinforced shelf brackets',
        'Smooth, easy-to-clean surfaces'
      ],
      productionDelivery: [
        'Each piece is handcrafted on order',
        'Standard lead time: 10–14 business days',
        'Courier within Randfontein area: R350',
        'Outside Randfontein: calculated based on delivery address',
        'Basic assembly required (instructions included)',
        'All furniture is securely packaged and ready to use upon arrival'
      ],
      variants: [
        { name: 'With wooden top', price: 3490, inStock: true, image: '/iris-manicure-table-colorful.webp' },
        { name: 'With glass top', price: 3700, inStock: true, image: '/iris-manicure-table-glass.webp' }
      ],
      rating: 5.0,
      reviewCount: 8,
      reviews: []
    },
    'blom-manicure-workstation': {
      id: '15',
      name: 'Blom Manicure Table & Work Station',
      slug: 'blom-manicure-workstation',
      category: 'Furniture',
      shortDescription: 'Complete professional workstation with table and shelf.',
      overview: 'The Blom Manicure Workstation is the ultimate all-in-one solution for professional nail technicians. This complete set combines a spacious manicure table with a coordinated shelf unit, giving you everything you need for an organized, efficient workspace. Perfect for salons that want a cohesive, professional look with maximum functionality.',
      price: 4500,
      compareAtPrice: null,
      stock: 'Made to Order',
      images: ['/blom-manicure-workstation-white.webp', '/blom-manicure-workstation-colorful.webp', '/blom-manicure-workstation-glass.webp'],
      features: [
        'Complete workstation set with matching table and shelf',
        'Generous work surface for comfortable client service',
        'Coordinated design creates cohesive salon aesthetic',
        'Choice of all-wood or glass top configuration',
        'Ample storage for products, tools, and supplies',
        'Professional-grade construction for busy salons',
        'Maximizes workspace efficiency'
      ],
      dimensions: [
        'Table: 120 cm (L) × 45 cm (W) × 80 cm (H)',
        'Shelf Unit: 120 cm (L) × 32 cm (W) × 120 cm (H)',
        'Coordinated sizing for perfect visual balance',
        'Custom sizing available upon request'
      ],
      materialsFinish: [
        'Premium MDF wood structure',
        'High-gloss enamel finish (pastel white)',
        'Optional tempered glass tops (6mm thickness)',
        'Reinforced joints and shelf brackets',
        'Smooth, easy-to-clean surfaces throughout',
        'Matching finish on table and shelf'
      ],
      productionDelivery: [
        'Each set is handcrafted on order',
        'Standard lead time: 10–14 business days',
        'Courier within Randfontein area: R350',
        'Outside Randfontein: calculated based on delivery address',
        'Some assembly required (instructions included)',
        'All furniture is securely packaged and ready to use upon arrival'
      ],
      variants: [
        { name: 'With wooden tops', price: 4500, inStock: true, image: '/blom-manicure-workstation-colorful.webp' },
        { name: 'With glass top shelf & workstation', price: 5100, inStock: true, image: '/blom-manicure-workstation-glass.webp' }
      ],
      rating: 5.0,
      reviewCount: 15,
      reviews: []
    },
    'daisy-manicure-table': {
      id: '16',
      name: 'Daisy Manicure Table',
      slug: 'daisy-manicure-table',
      category: 'Furniture',
      shortDescription: 'Classic manicure table with timeless design.',
      overview: 'The Daisy Manicure Table embodies timeless elegance with modern functionality. Its classic design makes it a versatile choice for any salon style, from traditional to contemporary. Perfect for both home studios and professional salons, the Daisy offers a compact footprint without sacrificing workspace quality.',
      price: 2700,
      compareAtPrice: null,
      stock: 'Made to Order',
      images: ['/daisy-manicure-table-white.webp', '/daisy-manicure-table-colorful.webp', '/daisy-manicure-table-glass.webp'],
      features: [
        'Timeless classic design suits any salon aesthetic',
        'Quality wood construction for lasting durability',
        'Optional tempered glass top upgrade',
        'Comfortable working height for extended sessions',
        'Compact yet spacious surface maximizes workspace',
        'Elegant details add sophisticated touch'
      ],
      dimensions: [
        'Table Size: 120 cm (L) × 45 cm (W) × 78 cm (H)',
        'Ideal for smaller spaces without compromising function',
        'Custom sizing available upon request'
      ],
      materialsFinish: [
        'Premium MDF wood structure',
        'High-gloss enamel finish (pastel white)',
        'Optional tempered glass top (6mm thickness)',
        'Smooth lacquered wood base',
        'Easy-to-clean surfaces',
        'Reinforced construction'
      ],
      productionDelivery: [
        'Each piece is handcrafted on order',
        'Standard lead time: 10–14 business days',
        'Courier within Randfontein area: R350',
        'Outside Randfontein: calculated based on delivery address',
        'Minimal assembly required (instructions included)',
        'All furniture is securely packaged and ready to use upon arrival'
      ],
      variants: [
        { name: 'Wooden top', price: 2700, inStock: true, image: '/daisy-manicure-table-colorful.webp' },
        { name: 'Wooden base & glass top', price: 3100, inStock: true, image: '/daisy-manicure-table-glass.webp' }
      ],
      rating: 5.0,
      reviewCount: 10,
      reviews: []
    },
    'polish-garden-rack': {
      id: '17',
      name: 'Polish Garden (Gel Polish Rack)',
      slug: 'polish-garden-rack',
      category: 'Furniture',
      shortDescription: 'Wall-mounted gel polish rack for organized storage.',
      overview: 'The Polish Garden transforms your gel polish collection into a beautiful, organized display. This wall-mounted rack keeps your polishes visible, accessible, and professionally presented. Perfect for salons wanting to showcase their color range while maximizing floor space. Turn your polish collection into a stunning focal point.',
      price: 1150,
      compareAtPrice: null,
      stock: 'Made to Order',
      images: ['/polish-garden-rack-white.webp', '/polish-garden-rack-colorful.webp'],
      features: [
        'Wall-mounted design maximizes floor space',
        'Holds extensive polish collection',
        'Professional display showcases your color range',
        'Easy access for quick color selection',
        'Sturdy construction supports full bottle weight',
        'Elegant design complements any salon decor'
      ],
      dimensions: [
        'Rack Size: 120 cm (L) × 11 cm (W) × 70 cm (H)',
        'Multiple tier levels for organized display',
        'Fits standard gel polish bottles',
        'Custom sizing available upon request'
      ],
      materialsFinish: [
        'Premium MDF wood structure',
        'High-gloss enamel finish (pastel white)',
        'Reinforced shelf supports',
        'Smooth, easy-to-clean surfaces',
        'Durable construction for heavy loads'
      ],
      productionDelivery: [
        'Each piece is handcrafted on order',
        'Standard lead time: 10–14 business days',
        'Courier within Randfontein area: R350',
        'Outside Randfontein: calculated based on delivery address',
        'Wall mounting hardware included',
        'Installation instructions provided',
        'All furniture is securely packaged and ready to use upon arrival'
      ],
      variants: [
        { name: 'Standard', price: 1150, inStock: true, image: '/polish-garden-rack-colorful.webp' }
      ],
      rating: 5.0,
      reviewCount: 18,
      reviews: []
    },
    'blossom-manicure-table': {
      id: '18',
      name: 'Blossom Manicure Table',
      slug: 'blossom-manicure-table',
      category: 'Furniture',
      shortDescription: 'Premium manicure table with elegant design and superior build quality.',
      overview: 'The Blossom Manicure Table represents the pinnacle of salon furniture craftsmanship. This premium piece combines exquisite design with uncompromising build quality, making it the perfect centerpiece for high-end salons. With three distinct top configurations, you can customize the Blossom to perfectly match your vision of luxury and functionality.',
      price: 5200,
      compareAtPrice: null,
      stock: 'Made to Order',
      images: ['/blossom-manicure-table-white.webp', '/blossom-manicure-table-colorful.webp', '/blossom-manicure-table-glass.webp', '/blossom-manicure-table-mixed.webp'],
      features: [
        'Premium quality construction with superior materials',
        'Three distinct top configuration options',
        'Elegant Blossom design with refined details',
        'Exceptional build quality for lasting investment',
        'Professional salon-grade durability',
        'Sophisticated aesthetic elevates any space',
        'Customizable to your exact specifications'
      ],
      dimensions: [
        'Table Size: Professional standard dimensions',
        'Generous work surface for premium client experience',
        'Optimal height for extended comfort',
        'Custom sizing available upon request'
      ],
      materialsFinish: [
        'Premium MDF wood structure with reinforced core',
        'High-gloss enamel finish (pastel white)',
        'Optional tempered glass tops (8mm premium thickness)',
        'Polished chrome or brushed steel accents',
        'Hand-finished surfaces for flawless appearance',
        'Museum-quality construction standards'
      ],
      productionDelivery: [
        'Each piece is meticulously handcrafted on order',
        'Standard lead time: 10–14 business days',
        'Courier within Randfontein area: R350',
        'Outside Randfontein: calculated based on delivery address',
        'Professional assembly recommended (instructions included)',
        'White-glove packaging ensures pristine arrival',
        'All furniture is securely packaged and ready to use upon arrival'
      ],
      variants: [
        { name: 'Wooden top', price: 5200, inStock: true, image: '/blossom-manicure-table-colorful.webp' },
        { name: 'Wooden & glass top', price: 5550, inStock: true, image: '/blossom-manicure-table-mixed.webp' },
        { name: 'Glass top only', price: 6200, inStock: true, image: '/blossom-manicure-table-glass.webp' }
      ],
      rating: 5.0,
      reviewCount: 6,
      reviews: []
    },
    'pearly-pedicure-station': {
      id: '19',
      name: 'Pearly Pedicure Station',
      slug: 'pearly-pedicure-station',
      category: 'Furniture',
      shortDescription: 'Complete pedicure station with platform, step and storage drawers.',
      overview: 'The Pearly Pedicure Station is your complete foundation for professional pedicure services. This comprehensive platform includes integrated step access and three spacious storage drawers, creating an organized, efficient workspace for your pedicure business. Build your perfect pedicure setup around this solid, professional-grade foundation. Note: Stools, basin, and top table sold separately for maximum customization.',
      price: 4800,
      compareAtPrice: null,
      stock: 'Made to Order',
      images: ['/pearly-pedicure-station-white.webp', '/pearly-pedicure-station-colorful.webp'],
      features: [
        'Complete platform foundation for pedicure services',
        'Integrated step for easy client access',
        'Three spacious storage drawers for supplies',
        'Professional-grade construction for daily use',
        'Spacious 1.2m × 1.2m platform accommodates all basin types',
        'Customizable setup (add your choice of basin, stools, and top table)',
        'Sturdy construction supports full equipment weight'
      ],
      dimensions: [
        'Platform Size: 1.2 m (L) × 1.2 m (W) × 72 cm (H)',
        'Integrated step for client comfort',
        'Three full-depth storage drawers',
        'Accommodates standard pedicure basins',
        'Custom sizing available upon request'
      ],
      materialsFinish: [
        'Premium MDF wood structure',
        'High-gloss enamel finish (pastel white)',
        'Reinforced platform for basin weight',
        'Smooth drawer glides for easy access',
        'Water-resistant finish for spa environment',
        'Durable construction for high-traffic use'
      ],
      productionDelivery: [
        'Each piece is handcrafted on order',
        'Standard lead time: 10–14 business days',
        'Courier within Randfontein area: R350',
        'Outside Randfontein: calculated based on delivery address',
        'Some assembly required (instructions included)',
        'Platform, step, and 3 drawers included',
        'Stools, basin, and top table sold separately',
        'All furniture is securely packaged and ready to use upon arrival'
      ],
      variants: [
        { name: 'Standard', price: 4800, inStock: true, image: '/pearly-pedicure-station-colorful.webp' }
      ],
      rating: 5.0,
      reviewCount: 9,
      reviews: []
    },
    'princess-dresser': {
      id: '20',
      name: 'Princess Dresser',
      slug: 'princess-dresser',
      category: 'Furniture',
      shortDescription: 'Elegant princess-style dresser with glass open top and LED lighting.',
      overview: 'The Princess Dresser brings royal elegance to your salon with its sophisticated design and premium features. Featuring a stunning glass open top, integrated LED lighting system, and included mirror, this piece creates a luxurious atmosphere that clients will love. Perfect for creating that special princess experience in your beauty space.',
      price: 7400,
      compareAtPrice: null,
      stock: 'Made to Order',
      images: ['/princess-dresser-white.webp', '/princess-dresser-colorful.webp'],
      features: [
        'Elegant princess-style design with sophisticated details',
        'Glass open top for premium aesthetic',
        'Integrated LED lighting system for perfect illumination',
        'Mirror included for complete setup',
        'Premium wood construction for durability',
        'Perfect for creating luxurious salon atmosphere',
        'Custom built to your specifications'
      ],
      dimensions: [
        'Dimensions: 130cm (L) × 45cm (W) × 180cm (H)',
        'Glass open top for elegant display',
        'Integrated LED lighting system',
        'Mirror included in price',
        'Custom sizing available upon request'
      ],
      materialsFinish: [
        'Premium wood construction with glass open top',
        'Integrated LED lighting system',
        'High-quality mirror included',
        'Professional finish for salon environment',
        'Durable construction for daily use',
        'Elegant princess-style design elements'
      ],
      productionDelivery: [
        'Custom built to order',
        'Delivery within 3-4 weeks',
        'Professional installation available',
        'LED lighting system included',
        'Mirror included in price',
        'All components professionally assembled'
      ],
      variants: [
        { name: 'Standard with LED', price: 7400, inStock: true, image: '/princess-dresser-colorful.webp' }
      ],
      rating: 5.0,
      reviewCount: 0,
      reviews: []
    },
    'floral-manicure-table': {
      id: '21',
      name: 'Floral Manicure Table',
      slug: 'floral-manicure-table',
      category: 'Furniture',
      shortDescription: 'Beautiful floral-themed manicure table with glass top included.',
      overview: 'The Floral Manicure Table brings natural beauty to your workspace with its elegant floral design elements and included glass top. This stunning piece combines functionality with artistic flair, creating a serene and professional environment. The glass top adds a premium touch while the floral details provide a calming, nature-inspired aesthetic perfect for any salon.',
      price: 4300,
      compareAtPrice: null,
      stock: 'Made to Order',
      images: ['/floral-manicure-table-white.webp', '/floral-manicure-table-colorful.webp'],
      features: [
        'Beautiful floral-themed design with decorative details',
        'Glass top included for premium aesthetic',
        'High-quality wood construction',
        'Perfect for creating calming salon atmosphere',
        'Professional-grade durability',
        'Artistic flair with functional design',
        'Custom built to your specifications'
      ],
      dimensions: [
        'Dimensions: 120cm (L) × 45cm (W) × 80cm (H)',
        'Glass top included in price',
        'Floral decorative elements',
        'Professional workspace size',
        'Custom sizing available upon request'
      ],
      materialsFinish: [
        'High-quality wood construction with decorative floral accents',
        'Glass top included for premium look',
        'Professional finish for salon environment',
        'Floral design elements for aesthetic appeal',
        'Durable construction for daily use',
        'Nature-inspired design theme'
      ],
      productionDelivery: [
        'Custom built to order',
        'Delivery within 3-4 weeks',
        'Glass top included in price',
        'Professional installation available',
        'All floral details handcrafted',
        'Ready to use upon delivery'
      ],
      variants: [
        { name: 'With Glass Top', price: 4300, inStock: true, image: '/floral-manicure-table-colorful.webp' }
      ],
      rating: 5.0,
      reviewCount: 0,
      reviews: []
    },
    'orchid-manicure-table': {
      id: '22',
      name: 'Orchid Manicure Table',
      slug: 'orchid-manicure-table',
      category: 'Furniture',
      shortDescription: 'Stylish orchid-themed manicure table with elegant design.',
      overview: 'The Orchid Manicure Table embodies exotic elegance with its sophisticated orchid-inspired design elements. This beautiful piece brings a touch of luxury and refinement to any salon space. With its elegant proportions and artistic details, the Orchid table creates a premium atmosphere that reflects the beauty and sophistication of the orchid flower itself.',
      price: 3700,
      compareAtPrice: null,
      stock: 'Made to Order',
      images: ['/orchid-manicure-table-white.webp', '/orchid-manicure-table-colorful.webp'],
      features: [
        'Sophisticated orchid-inspired design elements',
        'Elegant proportions for premium appearance',
        'Premium wood construction for durability',
        'Artistic details for aesthetic appeal',
        'Perfect for luxury salon environments',
        'Professional-grade build quality',
        'Custom built to your specifications'
      ],
      dimensions: [
        'Dimensions: 140cm (L) × 50cm (W) × 79cm (H)',
        'Orchid-inspired decorative elements',
        'Generous workspace for professional use',
        'Elegant proportions and design',
        'Custom sizing available upon request'
      ],
      materialsFinish: [
        'Premium wood construction with orchid-inspired decorative details',
        'Professional finish for salon environment',
        'Artistic orchid design elements',
        'High-quality materials for durability',
        'Sophisticated aesthetic appeal',
        'Exotic elegance in every detail'
      ],
      productionDelivery: [
        'Custom built to order',
        'Delivery within 3-4 weeks',
        'Professional installation available',
        'Orchid details handcrafted with care',
        'Premium materials and construction',
        'Ready for immediate salon use'
      ],
      variants: [
        { name: 'Standard', price: 3700, inStock: true, image: '/orchid-manicure-table-colorful.webp' }
      ],
      rating: 5.0,
      reviewCount: 0,
      reviews: []
    }
  };

  useEffect(() => {
    // Load discounts
    loadDiscounts().then(setDiscounts).catch(console.error);
    
    // Find product by slug
    const foundProduct = productDatabase[productSlug as keyof typeof productDatabase];

    if (foundProduct) {
      setProduct(foundProduct);
      const firstVariant = foundProduct.variants[0];
      setSelectedVariant(typeof firstVariant === 'string' ? firstVariant : firstVariant?.name || '');

      // Build allImages array including variant images
      const images = [...foundProduct.images];
      foundProduct.variants.forEach((variant: any) => {
        if (typeof variant === 'object' && variant.image && !images.includes(variant.image)) {
          images.push(variant.image);
        }
      });
      setAllImages(images);

      // Update SEO with product data
      const seoData = productSEO(
        foundProduct.name,
        foundProduct.shortDescription,
        foundProduct.price,
        foundProduct.images[0]
      );
      updateSEO(seoData);
      
      // Track product page view
      trackPageView(seoData.title || '', seoData.url || '');
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

  // Auto-scroll thumbnail carousel to keep selected image visible
  useEffect(() => {
    if (allImages.length <= 4) return;
    
    // If selected image is beyond current view, scroll to show it
    if (selectedImage < thumbnailScrollIndex) {
      setThumbnailScrollIndex(selectedImage);
    } else if (selectedImage >= thumbnailScrollIndex + 4) {
      setThumbnailScrollIndex(selectedImage - 3);
    }
  }, [selectedImage, allImages.length, thumbnailScrollIndex]);

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
    setSelectedImage((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    if (!product) return;
    setSelectedImage((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const nextThumbnail = () => {
    if (allImages.length <= 4) return;
    setThumbnailScrollIndex((prev) => Math.min(prev + 1, allImages.length - 4));
  };

  const prevThumbnail = () => {
    if (allImages.length <= 4) return;
    setThumbnailScrollIndex((prev) => Math.max(prev - 1, 0));
  };

  const toggleAccordion = (section: string) => {
    setExpandedAccordion(expandedAccordion === section ? null : section);
  };

  const formatPrice = (price: number) => `R${price.toFixed(2)}`;

  // Generate related products from the same category
  const relatedProducts = React.useMemo(() => {
    if (!product) return [];
    
    // Get all products in the same category
    const sameCategory = Object.values(productDatabase)
      .filter(p => p.category === product.category && p.slug !== product.slug)
      .map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.images[0],
        rating: p.rating,
        slug: p.slug
      }));
    
    // If we have products in the same category, return up to 3
    if (sameCategory.length > 0) {
      return sameCategory.slice(0, 3);
    }
    
    // Fallback: show any other products
    return Object.values(productDatabase)
      .filter(p => p.slug !== product.slug)
      .map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.images[0],
        rating: p.rating,
        slug: p.slug
      }))
      .slice(0, 3);
  }, [product]);

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
      
      {/* Structured Data */}
      {product && (
        <ProductStructuredData 
          product={{
            id: product.id,
            name: product.name,
            description: product.shortDescription,
            price: product.price,
            originalPrice: product.compareAtPrice,
            image: product.images[0],
            inStock: product.stock !== 'Out of Stock',
            category: product.category,
            brand: 'BLOM Cosmetics'
          }}
        />
      )}

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
                <div className={`relative aspect-square mb-6 overflow-hidden rounded-2xl bg-gray-50 shadow-md ${
                  'max-h-[350px] sm:max-h-none'
                }`}>
                  <img
                    src={allImages[selectedImage] || product.images[0] || 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Navigation Arrows */}
                  {allImages.length > 1 && (
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

                {/* Thumbnail Images - Mobile Carousel */}
                {allImages.length > 1 && (
                  <div className="relative">
                    {/* Desktop: Show all thumbnails */}
                    <div className="hidden md:flex gap-3">
                      {allImages.map((image: string, index: number) => (
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

                    {/* Mobile: Sliding carousel showing 4 at a time */}
                    <div className="md:hidden relative">
                      {/* Navigation arrows */}
                      {allImages.length > 4 && (
                        <>
                          <button
                            onClick={prevThumbnail}
                            disabled={thumbnailScrollIndex === 0}
                            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all ${
                              thumbnailScrollIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white hover:scale-110'
                            }`}
                          >
                            <ChevronLeft className="h-4 w-4 text-gray-700" />
                          </button>
                          <button
                            onClick={nextThumbnail}
                            disabled={thumbnailScrollIndex >= allImages.length - 4}
                            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all ${
                              thumbnailScrollIndex >= allImages.length - 4 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white hover:scale-110'
                            }`}
                          >
                            <ChevronRight className="h-4 w-4 text-gray-700" />
                          </button>
                        </>
                      )}

                      {/* Thumbnail container */}
                      <div className="flex gap-3 overflow-hidden">
                        {allImages.slice(thumbnailScrollIndex, thumbnailScrollIndex + 4).map((image: string, index: number) => {
                          const actualIndex = thumbnailScrollIndex + index;
                          return (
                            <button
                              key={actualIndex}
                              onClick={() => setSelectedImage(actualIndex)}
                              className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors flex-shrink-0 ${
                                selectedImage === actualIndex ? 'border-pink-400' : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <img
                                src={image || `https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop`}
                                alt={`${product.name} ${actualIndex + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div>
                <div className="mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">{product.shortDescription}</p>

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
                {product.variants && product.variants.length > 0 && (
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
                                const imageIndex = allImages.indexOf(variantImage);
                                if (imageIndex !== -1) {
                                  setSelectedImage(imageIndex);
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
                    <ShareButton
                      url={window.location.href}
                      title={product.name}
                      description={product.shortDescription}
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

                {/* Features & Benefits */}
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
                        {product.features && product.features.map((feature: string, index: number) => (
                          <li key={index} className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-pink-400 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>

                {/* Furniture-specific sections */}
                {product.category === 'Furniture' ? (
                  <>
                    {/* Dimensions */}
                    {product.dimensions && (
                      <Card>
                        <button
                          onClick={() => toggleAccordion('dimensions')}
                          className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <h3 className="font-semibold text-lg">Dimensions</h3>
                          {expandedAccordion === 'dimensions' ? (
                            <ChevronUp className="h-5 w-5 text-pink-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-pink-400" />
                          )}
                        </button>
                        {expandedAccordion === 'dimensions' && (
                          <div className="px-6 pb-6">
                            <ul className="space-y-3">
                              {product.dimensions.map((dim: string, index: number) => (
                                <li key={index} className="flex items-start gap-3">
                                  <Check className="h-5 w-5 text-pink-400 flex-shrink-0 mt-0.5" />
                                  <span className="text-gray-700">{dim}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </Card>
                    )}

                    {/* Materials & Finish */}
                    {product.materialsFinish && (
                      <Card>
                        <button
                          onClick={() => toggleAccordion('materials')}
                          className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <h3 className="font-semibold text-lg">Materials & Finish</h3>
                          {expandedAccordion === 'materials' ? (
                            <ChevronUp className="h-5 w-5 text-pink-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-pink-400" />
                          )}
                        </button>
                        {expandedAccordion === 'materials' && (
                          <div className="px-6 pb-6">
                            <ul className="space-y-3">
                              {product.materialsFinish.map((material: string, index: number) => (
                                <li key={index} className="flex items-start gap-3">
                                  <Check className="h-5 w-5 text-pink-400 flex-shrink-0 mt-0.5" />
                                  <span className="text-gray-700">{material}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </Card>
                    )}

                    {/* Production & Delivery */}
                    {product.productionDelivery && (
                      <Card>
                        <button
                          onClick={() => toggleAccordion('production')}
                          className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <h3 className="font-semibold text-lg">Production & Delivery</h3>
                          {expandedAccordion === 'production' ? (
                            <ChevronUp className="h-5 w-5 text-pink-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-pink-400" />
                          )}
                        </button>
                        {expandedAccordion === 'production' && (
                          <div className="px-6 pb-6">
                            <ul className="space-y-3">
                              {product.productionDelivery.map((item: string, index: number) => (
                                <li key={index} className="flex items-start gap-3">
                                  <Check className="h-5 w-5 text-pink-400 flex-shrink-0 mt-0.5" />
                                  <span className="text-gray-700">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </Card>
                    )}
                  </>
                ) : (
                  <>
                    {/* How to Use - for nail products only */}
                    {product.howToUse && (
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
                    )}

                    {/* Ingredients - for nail products only */}
                    {product.ingredients && (
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
                                  {product.ingredients.inci && product.ingredients.inci.map((ingredient: string, index: number) => (
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
                                  {product.ingredients.key && product.ingredients.key.map((ingredient: string, index: number) => (
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
                    )}

                    {/* Details - for nail products only */}
                    {product.details && (
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
                                  {product.details.claims && product.details.claims.map((claim: string, index: number) => (
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
                    )}
                  </>
                )}

                {/* What's Included in This Bundle - Only for bundles */}
                {product.includedProducts && product.includedProducts.length > 0 && (
                  <Card className="mt-6">
                    <button
                      onClick={() => toggleAccordion('bundle-contents')}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="font-semibold text-lg">What's Included in This Bundle</h3>
                      {expandedAccordion === 'bundle-contents' ? (
                        <ChevronUp className="h-5 w-5 text-pink-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-pink-400" />
                      )}
                    </button>
                    {expandedAccordion === 'bundle-contents' && (
                      <div className="px-6 pb-6">
                        <div className="bg-gradient-to-br from-pink-50 to-blue-50 rounded-2xl p-6 space-y-4">
                          {product.includedProducts.map((item: any, index: number) => (
                            <div key={index} className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <Check className="h-6 w-6 text-pink-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                </div>
                              </div>
                              <span className="text-gray-600 font-medium">R{item.price}</span>
                            </div>
                          ))}
                          <div className="border-t-2 border-gray-200 pt-4 mt-4">
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold text-gray-900">Bundle Total:</span>
                              <div className="text-right">
                                <span className="text-2xl font-bold text-pink-600">R{product.price}</span>
                                {product.compareAtPrice && (
                                  <div className="text-sm text-gray-500 line-through">R{product.compareAtPrice}</div>
                                )}
                              </div>
                            </div>
                            <div className="mt-2 text-right">
                              <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                                Save R{product.compareAtPrice - product.price} ({Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% off)
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                )}
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
                <div
                  key={relatedProduct.id}
                  className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                  onClick={() => window.location.href = `/products/${relatedProduct.slug}`}
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    <div className="absolute inset-0 border-2 border-gray-900 rounded-lg m-4 group-hover:rotate-3 transition-transform duration-300"></div>
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover relative z-10"
                    />
                  </div>
                  <div className="p-6">
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
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Reviews (approved only) */}
        <section className="section-padding">
          <Container>
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
              {product && <ProductReviews productSlug={product.slug} />}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Write a review</h3>
                {product && <ReviewForm productSlug={product.slug} />}
              </div>
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
                <Button size="lg" className="bg-transparent hover:bg-blue-100 text-black hover:text-black font-bold py-3 px-6 rounded-full transition-all duration-300 border-2 border-black hover:border-blue-100">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="text-sm sm:text-base">Call Us</span>
                </Button>
              </div>
            </div>
          </Container>
        </section>

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