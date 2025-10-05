import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { ReviewSection } from '../components/review/ReviewSection';
import { PaymentMethods } from '../components/payment/PaymentMethods';
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

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productSlug = 'cuticle-oil' }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'how-to-use' | 'ingredients' | 'reviews'>('overview');
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>('overview');
  const [isWishlisted, setIsWishlisted] = useState(false);

  // All product data - Final Product List
  const allProductsData = {
    'cuticle-oil': {
      id: '1',
      name: 'Cuticle Oil',
      subtitle: 'Nourishing oil with Vitamin E, Jojoba & Soybean Oil',
      price: 140,
      comparePrice: null,
      rating: 4.9,
      reviewCount: 156,
      inStock: true,
      stockCount: 25,
      description: 'Luxurious oil blend that hydrates cuticles and strengthens nails. Fast-absorbing and non-greasy, perfect for daily use.',
      images: ['/cuticle-oil-white.webp', '/cuticle-oil-cotton-candy.webp'],
      variants: [
        { id: 'cotton-candy', name: 'Cotton Candy', inStock: true, image: '/cuticle-oil-cotton-candy.webp' },
        { id: 'vanilla', name: 'Vanilla', inStock: true, image: '/cuticle-oil-vanilla.webp' },
        { id: 'tiny-touch', name: 'Tiny Touch', inStock: true, image: '/cuticle-oil-tiny-touch.webp' },
        { id: 'dragon-fruit-lotus', name: 'Dragon Fruit Lotus', inStock: true, image: '/cuticle-oil-dragon-fruit-lotus.webp' },
        { id: 'watermelon', name: 'Watermelon', inStock: true, image: '/cuticle-oil-watermelon.webp' }
      ],
      overview: [
        '100% Cruelty-Free, Handmade in South Africa',
        'Non-greasy, quick absorbing formula',
        'Packed with Vitamin E for nail and skin health',
        'Available in 5 delicious scents',
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
    'vitamin-primer': {
      id: '2',
      name: 'Vitamin Primer',
      subtitle: 'Acid-free primer for adhesion, vitamin-enriched',
      price: 210,
      comparePrice: null,
      rating: 4.8,
      reviewCount: 124,
      inStock: true,
      stockCount: 30,
      description: 'Creates a long-lasting bond for gels and acrylics while protecting the natural nail.',
      images: ['/vitamin-primer-colorful.webp', '/vitamin-primer-white.webp'],
      variants: [],
      overview: [
        'Acid-free formula protects natural nails',
        'Vitamin enriched for nail health',
        'Strong adhesion for long-lasting results',
        'Professional grade quality',
        'Suitable for all nail types'
      ],
      features: [
        { title: 'Acid-Free', description: 'Gentle formula that protects your natural nails' },
        { title: 'Vitamin Enriched', description: 'Nourishes nails while providing strong adhesion' },
        { title: 'Strong Bond', description: 'Creates long-lasting adhesion for gels and acrylics' },
        { title: 'Professional Grade', description: 'High-quality formula trusted by professionals' }
      ],
      howToUse: [
        'Apply to clean, dry nails',
        'Allow to dry completely',
        'Apply gel or acrylic immediately',
        'Do not touch the nail surface after application'
      ],
      ingredients: [
        'Vitamin Complex',
        'Adhesion Promoters',
        'Solvents',
        'Preservatives'
      ],
      specifications: {
        size: '15ml',
        shelfLife: '18 months',
        origin: 'Professional Grade',
        certifications: ['Vegan', 'Cruelty-Free']
      }
    },
    'prep-solution': {
      id: '3',
      name: 'Prep Solution (Nail Dehydrator)',
      subtitle: 'Removes oils & moisture for better adhesion',
      price: 200,
      comparePrice: null,
      rating: 4.7,
      reviewCount: 89,
      inStock: true,
      stockCount: 20,
      description: 'Prepares natural nails by dehydrating the plate, preventing lifting.',
      images: ['/prep-solution-colorful.webp', '/prep-solution-white.webp'],
      variants: [],
      overview: [
        'Removes surface oils and moisture',
        'Prevents lifting and improves adhesion',
        'Quick drying formula',
        'Essential prep step',
        'Professional results'
      ],
      features: [
        { title: 'Oil Removal', description: 'Effectively removes surface oils from nail plate' },
        { title: 'Moisture Control', description: 'Dehydrates nail plate for better adhesion' },
        { title: 'Quick Drying', description: 'Fast-drying formula saves time' },
        { title: 'Prevents Lifting', description: 'Reduces risk of enhancement lifting' }
      ],
      howToUse: [
        'Apply to clean nails',
        'Allow to air dry',
        'Do not rinse',
        'Apply primer immediately after'
      ],
      ingredients: [
        'Isopropyl Alcohol',
        'Dehydrating Agents',
        'Preservatives'
      ],
      specifications: {
        size: '120ml',
        shelfLife: '24 months',
        origin: 'Professional Grade',
        certifications: ['Vegan', 'Cruelty-Free']
      }
    },
    'top-coat': {
      id: '4',
      name: 'Top Coat',
      subtitle: 'Mirror shine, chip-resistant, professional finish',
      price: 190,
      comparePrice: null,
      rating: 4.9,
      reviewCount: 201,
      inStock: true,
      stockCount: 35,
      description: 'High-gloss, chip-resistant finish for both gels and acrylics.',
      images: ['/top-coat-colorful.webp', '/top-coat-white.webp'],
      variants: [],
      overview: [
        'High-gloss mirror finish',
        'Chip-resistant protection',
        'Long-lasting durability',
        'UV protection included',
        'Professional results'
      ],
      features: [
        { title: 'High-Gloss Finish', description: 'Mirror-like shine that lasts' },
        { title: 'Chip Resistant', description: 'Strong protection against chipping' },
        { title: 'UV Protection', description: 'Protects against UV damage' },
        { title: 'Easy Application', description: 'Smooth, even application' }
      ],
      howToUse: [
        'Apply over cured gel or acrylic',
        'Cure under UV/LED lamp',
        'Wipe off inhibition layer',
        'Enjoy glossy finish'
      ],
      ingredients: [
        'Acrylic Resins',
        'UV Photoinitiators',
        'Gloss Enhancers',
        'Preservatives'
      ],
      specifications: {
        size: '15ml',
        shelfLife: '18 months',
        origin: 'Professional Grade',
        certifications: ['Vegan', 'Cruelty-Free']
      }
    },
    'fairy-dust-top-coat': {
      id: '5',
      name: 'Fairy Dust Top Coat',
      subtitle: 'Subtle glitter-infused top coat with smooth shine',
      price: 195,
      comparePrice: null,
      rating: 4.6,
      reviewCount: 73,
      inStock: true,
      stockCount: 15,
      description: 'Adds a sparkling finish to any gel or acrylic set.',
      images: ['/fairy-dust-top-coat-colorful.webp', '/fairy-dust-top-coat-white.webp'],
      variants: [],
      overview: [
        'Fine glitter particles for sparkle',
        'Smooth application',
        'High-shine finish',
        'Versatile use',
        'Long-lasting sparkle'
      ],
      features: [
        { title: 'Fine Glitter', description: 'Beautiful sparkle without roughness' },
        { title: 'Smooth Finish', description: 'Glossy surface with embedded glitter' },
        { title: 'Versatile', description: 'Works with any nail enhancement' },
        { title: 'Long-Lasting', description: 'Sparkle that lasts' }
      ],
      howToUse: [
        'Apply over cured gel or acrylic',
        'Cure under UV/LED lamp',
        'Wipe off inhibition layer',
        'Enjoy sparkling finish'
      ],
      ingredients: [
        'Acrylic Resins',
        'Fine Glitter',
        'UV Photoinitiators',
        'Gloss Enhancers'
      ],
      specifications: {
        size: '15ml',
        shelfLife: '18 months',
        origin: 'Professional Grade',
        certifications: ['Vegan', 'Cruelty-Free']
      }
    },
    'nail-file': {
      id: '6',
      name: 'Nail File (80/80 Grit)',
      subtitle: 'Durable pro file with floral design',
      price: 35,
      comparePrice: null,
      rating: 4.5,
      reviewCount: 67,
      inStock: true,
      stockCount: 50,
      description: 'Professional nail file with 80/80 grit for shaping and finishing.',
      images: ['/nail-file-colorful.webp', '/nail-file-white.webp', '/nail-file-bundle.webp'],
      variants: [
        { id: 'single', name: 'Single File', inStock: true, price: 35, image: '/nail-file-colorful.webp' },
        { id: 'bundle', name: '5-Pack Bundle', inStock: true, price: 160, image: '/nail-file-bundle.webp' }
      ],
      overview: [
        'Professional 80/80 grit',
        'Durable construction',
        'Floral design',
        'Perfect for shaping',
        'Long-lasting quality'
      ],
      features: [
        { title: 'Professional Grit', description: '80/80 grit for perfect shaping' },
        { title: 'Durable', description: 'Long-lasting construction' },
        { title: 'Floral Design', description: 'Beautiful aesthetic design' },
        { title: 'Bundle Option', description: '5-pack bundle available' }
      ],
      howToUse: [
        'Use for shaping nails',
        'File in one direction',
        'Clean after use',
        'Store in dry place'
      ],
      ingredients: [
        'High-grade emery',
        'Durable backing'
      ],
      specifications: {
        size: 'Single or 5-pack',
        shelfLife: 'N/A',
        origin: 'Professional Grade',
        certifications: ['Vegan', 'Cruelty-Free']
      }
    },
    'nail-forms': {
      id: '7',
      name: 'Nail Forms',
      subtitle: 'Holographic guide, strong adhesive, 300 forms per roll',
      price: 290,
      comparePrice: null,
      rating: 4.5,
      reviewCount: 67,
      inStock: true,
      stockCount: 50,
      description: 'Professional nail forms for creating perfect extensions and overlays.',
      images: ['/nail-forms-colorful.webp', '/nail-forms-white.webp'],
      variants: [],
      overview: [
        'Holographic guide',
        'Strong adhesive',
        '300 forms per roll',
        'Professional quality',
        'Easy to use'
      ],
      features: [
        { title: 'Holographic Guide', description: 'Clear visual guide for perfect placement' },
        { title: 'Strong Adhesive', description: 'Secure hold during application' },
        { title: '300 Forms', description: 'Value pack with 300 forms' },
        { title: 'Professional Quality', description: 'Durable material for professional use' }
      ],
      howToUse: [
        'Select appropriate size',
        'Apply to natural nail',
        'Sculpt with acrylic or gel',
        'Remove after curing',
        'Clean and reuse'
      ],
      ingredients: [
        'Medical-grade adhesive',
        'Flexible plastic'
      ],
      specifications: {
        size: '300 forms per roll',
        shelfLife: 'N/A',
        origin: 'Professional Grade',
        certifications: ['Vegan', 'Cruelty-Free']
      }
    },
    'acetone-remover': {
      id: '8',
      name: 'Acetone (Remover)',
      subtitle: 'Professional-grade, fast acting nail remover',
      price: 60,
      comparePrice: null,
      rating: 4.8,
      reviewCount: 112,
      inStock: true,
      stockCount: 25,
      description: 'Professional-grade acetone for fast and effective nail polish removal.',
      images: ['/acetone-remover-colorful.webp', '/acetone-remover-white.webp'],
      variants: [],
      overview: [
        'Professional-grade formula',
        'Fast acting',
        'Effective removal',
        '1L size',
        'Professional results'
      ],
      features: [
        { title: 'Professional Grade', description: 'High-quality formula for professionals' },
        { title: 'Fast Acting', description: 'Quick and effective removal' },
        { title: '1L Size', description: 'Large size for professional use' },
        { title: 'Effective', description: 'Removes all types of nail polish' }
      ],
      howToUse: [
        'Apply to cotton pad',
        'Press on nail for 30 seconds',
        'Wipe away polish',
        'Repeat if necessary',
        'Moisturize after use'
      ],
      ingredients: [
        'Acetone',
        'Moisturizing agents',
        'Preservatives'
      ],
      specifications: {
        size: '1L',
        shelfLife: '24 months',
        origin: 'Professional Grade',
        certifications: ['Vegan', 'Cruelty-Free']
      }
    },
    'core-acrylics': {
      id: '9',
      name: 'Core Acrylics (56 g)',
      subtitle: 'Strength powders in clear, white & natural tones',
      price: 280,
      comparePrice: null,
      rating: 4.9,
      reviewCount: 156,
      inStock: true,
      stockCount: 20,
      description: 'Professional strength acrylic powders in 13 beautiful colors for creative nail art.',
      images: ['/core-acrylics-colorful.webp', '/core-acrylics-white.webp'],
      variants: [
        { id: 'baby-blue', name: 'Baby Blue', inStock: true, image: '/core-acrylics-baby-blue.webp' },
        { id: 'lilac-mist', name: 'Lilac Mist', inStock: true, image: '/core-acrylics-lilac-mist.webp' },
        { id: 'blush-pink', name: 'Blush Pink', inStock: true, image: '/core-acrylics-blush-pink.webp' },
        { id: 'ballet-pink', name: 'Ballet Pink', inStock: true, image: '/core-acrylics-ballet-pink.webp' },
        { id: 'fuchsia-pink', name: 'Fuchsia Pink', inStock: true, image: '/core-acrylics-fuchsia-pink.webp' },
        { id: 'cloud-grey', name: 'Cloud Grey', inStock: true, image: '/core-acrylics-cloud-grey.webp' },
        { id: 'mint-mist', name: 'Mint Mist', inStock: true, image: '/core-acrylics-mint-mist.webp' },
        { id: 'rose-pink', name: 'Rose Pink', inStock: true, image: '/core-acrylics-rose-pink.webp' },
        { id: 'fresh-mint', name: 'Fresh Mint', inStock: true, image: '/core-acrylics-fresh-mint.webp' },
        { id: 'soft-nude', name: 'Soft Nude', inStock: true, image: '/core-acrylics-soft-nude.webp' },
        { id: 'petal-pink', name: 'Petal Pink', inStock: true, image: '/core-acrylics-petal-pink.webp' },
        { id: 'sky-blue', name: 'Sky Blue', inStock: true, image: '/core-acrylics-sky-blue.webp' },
        { id: 'lemon-glow', name: 'Lemon Glow', inStock: true, image: '/core-acrylics-lemon-glow.webp' }
      ],
      overview: [
        'Professional strength formula',
        '13 beautiful color variants',
        '56g size',
        'Excellent coverage',
        'Professional results'
      ],
      features: [
        { title: 'Professional Strength', description: 'High-quality formula for professional use' },
        { title: '13 Color Variants', description: 'Beautiful range of colors for creative nail art' },
        { title: '56g Size', description: 'Professional size for salon use' },
        { title: 'Excellent Coverage', description: 'Strong coverage with smooth application' }
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
    },
    'crystal-clear-acrylic': {
      id: '8',
      name: 'Crystal Clear Acrylic',
      subtitle: 'Professional grade acrylic powder in 13 beautiful colors',
      price: 450,
      comparePrice: null,
      rating: 4.9,
      reviewCount: 156,
      inStock: true,
      stockCount: 20,
      description: 'High-quality acrylic powder perfect for creating stunning nail enhancements. Available in 13 gorgeous colors with excellent coverage and smooth application.',
      images: ['/crystal-clear-acrylic-colorful.webp', '/crystal-clear-acrylic-white.webp'],
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
    },
    'vitamin-primer': {
      id: '2',
      name: 'Vitamin Primer',
      subtitle: 'Vitamin-infused, acid-free primer for strong adhesion',
      price: 140,
      comparePrice: null,
      rating: 4.8,
      reviewCount: 124,
      inStock: true,
      stockCount: 30,
      description: 'Creates a long-lasting bond for gels and acrylics while protecting the natural nail.',
      images: ['/vitamin-primer-colorful.webp', '/vitamin-primer-white.webp'],
      variants: [],
      overview: [
        'Acid-free formula protects natural nails',
        'Vitamin enriched for nail health',
        'Strong adhesion for long-lasting results',
        'Professional grade quality',
        'Suitable for all nail types'
      ],
      features: [
        { title: 'Acid-Free', description: 'Gentle formula that protects your natural nails' },
        { title: 'Vitamin Enriched', description: 'Nourishes nails while providing strong adhesion' },
        { title: 'Strong Bond', description: 'Creates long-lasting adhesion for gels and acrylics' },
        { title: 'Professional Grade', description: 'High-quality formula trusted by professionals' }
      ],
      howToUse: [
        'Apply to clean, dry nails',
        'Allow to dry completely',
        'Apply gel or acrylic immediately',
        'Do not touch the nail surface after application'
      ],
      ingredients: [
        'Vitamin Complex',
        'Adhesion Promoters',
        'Solvents',
        'Preservatives'
      ],
      specifications: {
        size: '15ml',
        shelfLife: '18 months',
        origin: 'Professional Grade',
        certifications: ['Vegan', 'Cruelty-Free']
      }
    },
    'prep-solution': {
      id: '3',
      name: 'Prep Solution (Nail Dehydrator)',
      subtitle: 'Removes oils & moisture for better adhesion',
      price: 120,
      comparePrice: null,
      rating: 4.7,
      reviewCount: 89,
      inStock: true,
      stockCount: 20,
      description: 'Prepares natural nails by dehydrating the plate, preventing lifting.',
      images: ['/prep-solution-colorful.webp', '/prep-solution-white.webp'],
      variants: [],
      overview: [
        'Removes surface oils and moisture',
        'Prevents lifting and improves adhesion',
        'Quick drying formula',
        'Essential prep step',
        'Professional results'
      ],
      features: [
        { title: 'Oil Removal', description: 'Effectively removes surface oils from nail plate' },
        { title: 'Moisture Control', description: 'Dehydrates nail plate for better adhesion' },
        { title: 'Quick Drying', description: 'Fast-drying formula saves time' },
        { title: 'Prevents Lifting', description: 'Reduces risk of enhancement lifting' }
      ],
      howToUse: [
        'Apply to clean nails',
        'Allow to air dry',
        'Do not rinse',
        'Apply primer immediately after'
      ],
      ingredients: [
        'Isopropyl Alcohol',
        'Dehydrating Agents',
        'Preservatives'
      ],
      specifications: {
        size: '120ml',
        shelfLife: '24 months',
        origin: 'Professional Grade',
        certifications: ['Vegan', 'Cruelty-Free']
      }
    },
    'top-coat': {
      id: '4',
      name: 'Top Coat',
      subtitle: 'Strong, protective top coat with mirror shine',
      price: 160,
      comparePrice: null,
      rating: 4.9,
      reviewCount: 201,
      inStock: true,
      stockCount: 35,
      description: 'High-gloss, chip-resistant finish for both gels and acrylics.',
      images: ['/top-coat-colorful.webp', '/top-coat-white.webp'],
      variants: [],
      overview: [
        'High-gloss mirror finish',
        'Chip-resistant protection',
        'Long-lasting durability',
        'UV protection included',
        'Professional results'
      ],
      features: [
        { title: 'High-Gloss Finish', description: 'Mirror-like shine that lasts' },
        { title: 'Chip Resistant', description: 'Strong protection against chipping' },
        { title: 'UV Protection', description: 'Protects against UV damage' },
        { title: 'Easy Application', description: 'Smooth, even application' }
      ],
      howToUse: [
        'Apply over cured gel or acrylic',
        'Cure under UV/LED lamp',
        'Wipe off inhibition layer',
        'Enjoy glossy finish'
      ],
      ingredients: [
        'Acrylic Resins',
        'UV Photoinitiators',
        'Gloss Enhancers',
        'Preservatives'
      ],
      specifications: {
        size: '15ml',
        shelfLife: '18 months',
        origin: 'Professional Grade',
        certifications: ['Vegan', 'Cruelty-Free']
      }
    },
    'fairy-dust-top-coat': {
      id: '5',
      name: 'Fairy Dust Top Coat',
      subtitle: 'Glitter-infused top coat with smooth shine',
      price: 180,
      comparePrice: null,
      rating: 4.6,
      reviewCount: 73,
      inStock: true,
      stockCount: 15,
      description: 'Adds a sparkling finish to any gel or acrylic set.',
      images: ['/fairy-dust-top-coat-colorful.webp', '/fairy-dust-top-coat-white.webp'],
      variants: [],
      overview: [
        'Fine glitter particles for sparkle',
        'Smooth application',
        'High-shine finish',
        'Versatile use',
        'Long-lasting sparkle'
      ],
      features: [
        { title: 'Fine Glitter', description: 'Beautiful sparkle without roughness' },
        { title: 'Smooth Finish', description: 'Glossy surface with embedded glitter' },
        { title: 'Versatile', description: 'Works with any nail enhancement' },
        { title: 'Long-Lasting', description: 'Sparkle that lasts' }
      ],
      howToUse: [
        'Apply over cured gel or acrylic',
        'Cure under UV/LED lamp',
        'Wipe off inhibition layer',
        'Enjoy sparkling finish'
      ],
      ingredients: [
        'Acrylic Resins',
        'Fine Glitter',
        'UV Photoinitiators',
        'Gloss Enhancers'
      ],
      specifications: {
        size: '15ml',
        shelfLife: '18 months',
        origin: 'Professional Grade',
        certifications: ['Vegan', 'Cruelty-Free']
      }
    },
    'nail-forms': {
      id: '6',
      name: 'Nail Forms',
      subtitle: 'Reusable forms for sculpting extensions',
      price: 45,
      comparePrice: null,
      rating: 4.5,
      reviewCount: 67,
      inStock: true,
      stockCount: 50,
      description: 'Professional nail forms for creating perfect extensions and overlays.',
      images: ['/nail-forms-colorful.webp', '/nail-forms-white.webp'],
      variants: [],
      overview: [
        'Reusable design',
        'Easy to apply',
        'Perfect fit',
        'Professional results',
        'Durable material'
      ],
      features: [
        { title: 'Reusable', description: 'Clean and reuse multiple times' },
        { title: 'Perfect Fit', description: 'Multiple sizes for perfect fit' },
        { title: 'Easy Application', description: 'Simple to apply and remove' },
        { title: 'Professional Quality', description: 'Durable material for professional use' }
      ],
      howToUse: [
        'Select appropriate size',
        'Apply to natural nail',
        'Sculpt with acrylic or gel',
        'Remove after curing',
        'Clean and reuse'
      ],
      ingredients: [
        'Medical-grade adhesive',
        'Flexible plastic'
      ],
      specifications: {
        size: '50 forms',
        shelfLife: 'N/A',
        origin: 'Professional Grade',
        certifications: ['Vegan', 'Cruelty-Free']
      }
    },
    'designer-file-set': {
      id: '7',
      name: 'Designer File Set',
      subtitle: 'Professional file set for shaping & finishing',
      price: 85,
      comparePrice: null,
      rating: 4.8,
      reviewCount: 112,
      inStock: true,
      stockCount: 25,
      description: 'Complete set of professional files for shaping, refining, and finishing nail enhancements.',
      images: ['/designer-file-01.webp'],
      variants: [],
      overview: [
        'Multiple grit options',
        'Professional quality',
        'Durable construction',
        'Precise shaping',
        'Complete set'
      ],
      features: [
        { title: 'Multiple Grits', description: 'Range from coarse to fine for all needs' },
        { title: 'Professional Quality', description: 'High-grade materials for professional results' },
        { title: 'Durable', description: 'Long-lasting construction' },
        { title: 'Complete Set', description: 'Everything needed for shaping and finishing' }
      ],
      howToUse: [
        'Use coarse file for shaping',
        'Medium file for refining',
        'Fine file for finishing',
        'Buff for smooth surface',
        'Clean between uses'
      ],
      ingredients: [
        'High-grade emery',
        'Durable backing'
      ],
      specifications: {
        size: '5 files',
        shelfLife: 'N/A',
        origin: 'Professional Grade',
        certifications: ['Vegan', 'Cruelty-Free']
      }
    }
  };

  const product = allProductsData[productSlug as keyof typeof allProductsData] || allProductsData['cuticle-oil'];

  // Sample reviews data
  const sampleReviews: Review[] = [
    {
      id: '1',
      name: 'Sarah Mitchell',
      rating: 5,
      title: 'Excellent quality!',
      comment: 'This product exceeded my expectations. The quality is outstanding and it works exactly as described. Highly recommend!',
      date: '2024-01-15',
      verified: true,
      helpful: 12
    },
    {
      id: '2',
      name: 'Jessica Chen',
      rating: 4,
      title: 'Great product',
      comment: 'Very happy with this purchase. Good value for money and fast delivery. Will definitely order again.',
      date: '2024-01-10',
      verified: true,
      helpful: 8
    },
    {
      id: '3',
      name: 'Michelle Adams',
      rating: 5,
      title: 'Perfect!',
      comment: 'Exactly what I was looking for. The quality is professional grade and the results are amazing.',
      date: '2024-01-08',
      verified: true,
      helpful: 15
    },
    {
      id: '4',
      name: 'Amanda Wilson',
      rating: 4,
      title: 'Very good',
      comment: 'Good product overall. Minor issues with packaging but the product itself is great.',
      date: '2024-01-05',
      verified: false,
      helpful: 3
    },
    {
      id: '5',
      name: 'Lisa Thompson',
      rating: 5,
      title: 'Love it!',
      comment: 'This has become my go-to product. The quality is consistent and the results are always perfect.',
      date: '2024-01-03',
      verified: true,
      helpful: 9
    }
  ];

  // Recommended products data
  const recommendedProducts = [
    {
      id: 'rec1',
      name: 'Cuticle Oil',
      price: 140,
      image: '/cuticle-oil-colorful.webp',
      rating: 4.8,
      slug: 'cuticle-oil'
    },
    {
      id: 'rec2',
      name: 'Vitamin Primer',
      price: 180,
      image: '/primer-01.webp',
      rating: 4.7,
      slug: 'vitamin-primer'
    },
    {
      id: 'rec3',
      name: 'Top Coat',
      price: 120,
      image: '/top-coat-01.webp',
      rating: 4.6,
      slug: 'top-coat'
    },
    {
      id: 'rec4',
      name: 'Nail File (80/80 Grit)',
      price: 35,
      image: '/nail-file-colorful.webp',
      rating: 4.5,
      slug: 'nail-file'
    }
  ];

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

  // Get current price based on selected variant
  const getCurrentPrice = () => {
    if (selectedVariant) {
      const variant = product.variants.find(v => v.id === selectedVariant);
      return variant ? variant.price : product.price;
    }
    return product.price;
  };

  const handleAddToCart = () => {
    // Add to cart logic here
    console.log('Added to cart:', {
      product: product.name,
      variant: selectedVariant,
      price: getCurrentPrice(),
      quantity
    });
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
  };

  const handleReviewSubmit = (reviewData: any) => {
    console.log('Review submitted:', reviewData);
    // In a real app, this would save to a database
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

                {/* Variant Thumbnails */}
                {product.variants.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Variants</h4>
                    <div className="grid grid-cols-5 gap-2">
                      {product.variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => handleVariantSelect(variant.id)}
                          className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                            selectedVariant === variant.id ? 'border-pink-400' : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={variant.image || product.images[0]}
                            alt={variant.name}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
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
                      R{getCurrentPrice().toFixed(2)}
                    </span>
                    {product.comparePrice && (
                      <span className="text-xl text-gray-500 line-through">
                        R{product.comparePrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {product.comparePrice && (
                    <div className="text-sm text-green-600 font-medium">
                      Save R{(product.comparePrice - getCurrentPrice()).toFixed(2)}
                    </div>
                  )}
                </div>

                {/* Variants */}
                {product.variants.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Options</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => handleVariantSelect(variant.id)}
                          disabled={!variant.inStock}
                          className={`px-4 py-2 rounded-full border transition-all ${
                            selectedVariant === variant.id
                              ? 'bg-pink-400 text-white border-pink-400'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                          } ${!variant.inStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span className="text-sm font-medium">{variant.name}</span>
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
                    <ReviewSection
                      productName={product.name}
                      productImage={product.images[0]}
                      productSlug={productSlug || 'cuticle-oil'}
                      averageRating={product.rating}
                      reviewCount={product.reviewCount}
                      reviews={sampleReviews}
                      onReviewSubmit={handleReviewSubmit}
                    />
                  </div>
                )}
              </div>
            </div>
          </Container>
        </section>

        {/* Payment Methods */}
        <section className="section-padding bg-gray-50">
          <Container>
            <PaymentMethods />
          </Container>
        </section>

        {/* You May Also Like */}
        <section className="section-padding">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">You May Also Like</h2>
              <p className="text-gray-600">Discover more products from our collection</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 max-w-6xl w-full mx-auto">
              {recommendedProducts.map((recProduct) => (
                <Card key={recProduct.id} className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={recProduct.image}
                      alt={recProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 sm:h-4 sm:w-4 ${
                            i < Math.floor(recProduct.rating)
                              ? 'fill-current'
                              : 'text-gray-300'
                          }`}
                          style={{ color: i < Math.floor(recProduct.rating) ? '#F59E0B' : undefined }}
                        />
                      ))}
                    </div>
                    <h3 className="font-semibold text-sm md:text-base mb-2 line-clamp-2 group-hover:text-pink-400 transition-colors">
                      {recProduct.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg md:text-xl font-bold text-gray-900">
                        R{recProduct.price.toFixed(2)}
                      </span>
                      <Button 
                        size="sm" 
                        className="text-xs md:text-sm px-2 py-1 md:px-3 md:py-2"
                        onClick={() => window.location.href = `/products/${recProduct.slug}`}
                      >
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
};