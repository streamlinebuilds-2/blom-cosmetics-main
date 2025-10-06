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
      images: [
        '/cuticle-oil-white.webp', 
        '/cuticle-oil-cotton-candy.webp',
        '/cuticle-oil-vanilla.webp',
        '/cuticle-oil-tiny-touch.webp',
        '/cuticle-oil-dragon-fruit-lotus.webp',
        '/cuticle-oil-watermelon.webp'
      ],
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
        'Apply a small amount to each cuticle',
        'Massage gently into cuticle and nail',
        'Use daily for best results',
        'Can be used on hands and feet'
      ],
      ingredients: 'Vitamin E, Jojoba Oil, Soybean Oil, Sweet Almond Oil, Fragrance',
      specifications: {
        volume: '30ml',
        type: 'Cuticle Treatment',
        finish: 'Non-greasy',
        application: 'Brush applicator',
        madeIn: 'South Africa',
        certifications: ['Cruelty-Free', 'Handmade']
      }
    },
    'vitamin-primer': {
      id: '2',
      name: 'Vitamin Primer',
      subtitle: 'Acid-free primer with vitamins',
      price: 180,
      comparePrice: null,
      rating: 4.8,
      reviewCount: 132,
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
        { title: 'Long-Lasting', description: 'Creates a durable bond for extended wear' },
        { title: 'Professional Grade', description: 'Salon-quality results at home' }
      ],
      howToUse: [
        'Apply a thin layer to prepared nails',
        'Allow to air dry completely',
        'Proceed with your nail enhancement',
        'Do not cure in lamp'
      ],
      ingredients: 'Proprietary vitamin-enriched formula',
      specifications: {
        volume: '15ml',
        type: 'Nail Primer',
        finish: 'Matte',
        application: 'Brush applicator',
        madeIn: 'South Africa',
        certifications: ['Professional Grade', 'Acid-Free']
      }
    },
    'prep-solution': {
      id: '3',
      name: 'Prep Solution',
      subtitle: 'Dehydrates and preps the nail plate',
      price: 150,
      comparePrice: null,
      rating: 4.7,
      reviewCount: 98,
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
        { title: 'Quick Drying', description: 'Fast-acting formula saves time' },
        { title: 'Professional Results', description: 'Ensures long-lasting nail enhancements' }
      ],
      howToUse: [
        'Apply to clean, dry nails',
        'Allow to air dry completely',
        'Proceed with primer and enhancement',
        'Use before each application'
      ],
      ingredients: 'Isopropyl Alcohol, Proprietary blend',
      specifications: {
        volume: '15ml',
        type: 'Nail Prep',
        finish: 'Clear',
        application: 'Brush applicator',
        madeIn: 'South Africa',
        certifications: ['Professional Grade']
      }
    },
    'top-coat': {
      id: '4',
      name: 'Top Coat',
      subtitle: 'High-gloss, chip-resistant finish',
      price: 160,
      comparePrice: null,
      rating: 4.9,
      reviewCount: 145,
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
        { title: 'UV Protection', description: 'Prevents yellowing and fading' },
        { title: 'Quick Dry', description: 'Fast-drying formula for convenience' }
      ],
      howToUse: [
        'Apply thin layer over cured color',
        'Cure in LED lamp for 60 seconds',
        'Wipe with alcohol if needed',
        'Apply cuticle oil to finish'
      ],
      ingredients: 'UV-resistant polymer blend',
      specifications: {
        volume: '15ml',
        type: 'Top Coat',
        finish: 'High-Gloss',
        application: 'Brush applicator',
        madeIn: 'South Africa',
        certifications: ['UV Protection', 'Professional Grade']
      }
    },
    'fairy-dust-top-coat': {
      id: '5',
      name: 'Fairy Dust Top Coat',
      subtitle: 'Sparkling glitter finish',
      price: 170,
      comparePrice: null,
      rating: 4.8,
      reviewCount: 89,
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
        { title: 'Versatile', description: 'Use over any color or clear' },
        { title: 'Long-Lasting', description: 'Sparkle stays brilliant' }
      ],
      howToUse: [
        'Apply over cured color coat',
        'Use thin to thick layers as desired',
        'Cure in LED lamp for 60 seconds',
        'Seal with clear top coat if desired'
      ],
      ingredients: 'UV polymer, fine glitter particles',
      specifications: {
        volume: '15ml',
        type: 'Glitter Top Coat',
        finish: 'Sparkle',
        application: 'Brush applicator',
        madeIn: 'South Africa',
        certifications: ['Professional Grade']
      }
    },
    'nail-file': {
      id: '6',
      name: 'Nail File (80/80 Grit)',
      subtitle: 'Professional nail file',
      price: 35,
      comparePrice: null,
      rating: 4.7,
      reviewCount: 201,
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
        { title: '80/80 Grit', description: 'Perfect grit for acrylic shaping' },
        { title: 'Durable', description: 'Long-lasting construction' },
        { title: 'Professional Quality', description: 'Salon-grade performance' },
        { title: 'Ergonomic', description: 'Comfortable to hold and use' }
      ],
      howToUse: [
        'File in one direction for best results',
        'Use for shaping and refining',
        'Clean after each use',
        'Replace when worn'
      ],
      ingredients: 'Abrasive paper, wooden core',
      specifications: {
        grit: '80/80',
        type: 'Nail File',
        length: 'Standard',
        material: 'Paper/Wood',
        madeIn: 'South Africa',
        certifications: ['Professional Grade']
      }
    },
    'nail-forms': {
      id: '7',
      name: 'Nail Forms',
      subtitle: 'Professional nail forms with holographic guide',
      price: 220,
      comparePrice: null,
      rating: 4.9,
      reviewCount: 178,
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
        { title: 'Durable Paper', description: 'High-quality construction' },
        { title: 'Easy Removal', description: 'Tears away cleanly' }
      ],
      howToUse: [
        'Fit form to natural nail',
        'Ensure snug fit at apex',
        'Apply product over form',
        'Remove when cured'
      ],
      ingredients: 'Paper, adhesive backing',
      specifications: {
        quantity: '300 forms',
        type: 'Nail Forms',
        material: 'Paper',
        adhesive: 'Strong hold',
        madeIn: 'South Africa',
        certifications: ['Professional Grade']
      }
    },
    'acetone-remover': {
      id: '8',
      name: 'Acetone (Remover)',
      subtitle: 'Professional-grade acetone for removal',
      price: 120,
      comparePrice: null,
      rating: 4.6,
      reviewCount: 87,
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
        { title: 'Large Size', description: '1L bottle for extended use' },
        { title: 'Versatile', description: 'Works on all nail products' }
      ],
      howToUse: [
        'Soak cotton pad with acetone',
        'Place on nail for 10-15 minutes',
        'Gently remove product',
        'Moisturize after use'
      ],
      ingredients: '100% Pure Acetone',
      specifications: {
        volume: '1L',
        type: 'Nail Remover',
        concentration: '100% Acetone',
        application: 'Soak-off',
        madeIn: 'South Africa',
        certifications: ['Professional Grade']
      }
    },
    'core-acrylics': {
      id: '9',
      name: 'Core Acrylics (56 g)',
      subtitle: 'Professional strength acrylic powders',
      price: 280,
      comparePrice: null,
      rating: 4.9,
      reviewCount: 167,
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
        'Smooth application',
        'Excellent coverage',
        'Available in 13 beautiful color variants',
        '56g jar'
      ],
      features: [
        { title: 'Professional Strength', description: 'High-quality formula for professionals' },
        { title: 'Smooth Application', description: 'Easy to work with' },
        { title: 'Excellent Coverage', description: 'Vibrant, opaque colors' },
        { title: 'Versatile', description: 'Perfect for nail art and full sets' }
      ],
      howToUse: [
        'Pick up product with brush',
        'Apply to prepared nail',
        'Shape and file when dry',
        'Finish with top coat'
      ],
      ingredients: 'Acrylic polymer, pigments',
      specifications: {
        weight: '56g',
        type: 'Acrylic Powder',
        colors: '13 variants',
        application: 'Brush application',
        madeIn: 'South Africa',
        certifications: ['Professional Grade']
      }
    },
    // HIDDEN - Coming Soon Products
    // 'crystal-clear-acrylic': {
    //   id: '10',
    //   name: 'Crystal Clear Acrylic',
    //   subtitle: 'Professional grade acrylic powder',
    //   price: -1,
    //   comparePrice: null,
    //   rating: 4.9,
    //   reviewCount: 203,
    //   inStock: false,
    //   stockCount: 20,
    //   description: 'High-quality acrylic powder perfect for creating stunning nail enhancements. Available in 13 gorgeous colors with excellent coverage and smooth application.',
    //   images: ['/crystal-clear-acrylic-colorful.webp', '/crystal-clear-acrylic-white.webp'],
    //   variants: [
    //     { id: 'baby-blue', name: 'Baby Blue', inStock: true, image: '/acrylic-powder-baby-blue.webp' },
    //     { id: 'lilac-mist', name: 'Lilac Mist', inStock: true, image: '/acrylic-powder-baby-ligt-purple.webp' },
    //     { id: 'blush-pink', name: 'Blush Pink', inStock: true, image: '/acrylic-powder-baby-pink.webp' },
    //     { id: 'ballet-pink', name: 'Ballet Pink', inStock: true, image: '/acrylic-powder-ballet-pink.webp' },
    //     { id: 'fuchsia-pink', name: 'Fuchsia Pink', inStock: true, image: '/acrylic-powder-hot-pink.webp' },
    //     { id: 'cloud-grey', name: 'Cloud Grey', inStock: true, image: '/acrylic-powder-light-grey.webp' },
    //     { id: 'mint-mist', name: 'Mint Mist', inStock: true, image: '/acrylic-powder-light-mint.webp' },
    //     { id: 'rose-pink', name: 'Rose Pink', inStock: true, image: '/acrylic-powder-light-pink.webp' },
    //     { id: 'fresh-mint', name: 'Fresh Mint', inStock: true, image: '/acrylic-powder-mint.webp' },
    //     { id: 'soft-nude', name: 'Soft Nude', inStock: true, image: '/acrylic-powder-nude.webp' },
    //     { id: 'petal-pink', name: 'Petal Pink', inStock: true, image: '/acrylic-powder-pink.webp' },
    //     { id: 'sky-blue', name: 'Sky Blue', inStock: true, image: '/acrylic-powder-sky-blue.webp' },
    //     { id: 'lemon-glow', name: 'Lemon Glow', inStock: true, image: '/acrylic-powder-yellow.webp' }
    //   ],
    //   overview: [
    //     'Professional grade formula',
    //     'Smooth, easy application',
    //     '13 beautiful color variants',
    //     'Excellent coverage',
    //     'Long-lasting results'
    //   ],
    //   features: [
    //     { title: 'Professional Grade', description: 'Salon-quality formula' },
    //     { title: 'Smooth Application', description: 'Easy to work with' },
    //     { title: 'Vibrant Colors', description: 'Rich, pigmented hues' },
    //     { title: 'Durable', description: 'Long-lasting wear' }
    //   ],
    //   howToUse: [
    //     'Select your desired color',
    //     'Pick up product with wet brush',
    //     'Apply to prepared nail or form',
    //     'Shape and file when dry'
    //   ],
    //   ingredients: 'Acrylic polymer, pigments',
    //   specifications: {
    //     weight: '56g',
    //     type: 'Acrylic Powder',
    //     colors: '13 variants',
    //     application: 'Brush application',
    //     madeIn: 'South Africa',
    //     certifications: ['Professional Grade']
    //   }
    // },
    // 'snow-white-acrylic': {
    //   id: '11',
    //   name: 'Snow White Acrylic',
    //   subtitle: 'Coming Soon',
    //   price: -1,
    //   comparePrice: null,
    //   rating: 4.8,
    //   reviewCount: 134,
    //   inStock: false,
    //   stockCount: 30,
    //   description: 'Creates a long-lasting bond for gels and acrylics while protecting the natural nail.',
    //   images: ['/vitamin-primer-colorful.webp', '/vitamin-primer-white.webp'],
    //   variants: [],
    //   overview: [
    //     'Acid-free formula protects natural nails',
    //     'Vitamin enriched for nail health',
    //     'Strong adhesion for long-lasting results',
    //     'Professional grade quality',
    //     'Suitable for all nail types'
    //   ],
    //   features: [
    //     { title: 'Acid-Free', description: 'Gentle formula that protects your natural nails' },
    //     { title: 'Vitamin Enriched', description: 'Nourishes nails while providing strong adhesion' },
    //     { title: 'Long-Lasting', description: 'Creates a durable bond for extended wear' },
    //     { title: 'Professional Grade', description: 'Salon-quality results at home' }
    //   ],
    //   howToUse: [
    //     'Apply a thin layer to prepared nails',
    //     'Allow to air dry completely',
    //     'Proceed with your nail enhancement',
    //     'Do not cure in lamp'
    //   ],
    //   ingredients: 'Proprietary vitamin-enriched formula',
    //   specifications: {
    //     volume: '15ml',
    //     type: 'Nail Primer',
    //     finish: 'Matte',
    //     application: 'Brush applicator',
    //     madeIn: 'South Africa',
    //     certifications: ['Professional Grade', 'Acid-Free']
    //   }
    // },
    // 'colour-acrylics': {
    //   id: '12',
    //   name: 'Colour Acrylics',
    //   subtitle: 'Coming Soon',
    //   price: -1,
    //   comparePrice: null,
    //   rating: 4.7,
    //   reviewCount: 99,
    //   inStock: false,
    //   stockCount: 20,
    //   description: 'Prepares natural nails by dehydrating the plate, preventing lifting.',
    //   images: ['/prep-solution-colorful.webp', '/prep-solution-white.webp'],
    //   variants: [],
    //   overview: [
    //     'Removes surface oils and moisture',
    //     'Prevents lifting and improves adhesion',
    //     'Quick drying formula',
    //     'Essential prep step',
    //     'Professional results'
    //   ],
    //   features: [
    //     { title: 'Oil Removal', description: 'Effectively removes surface oils from nail plate' },
    //     { title: 'Moisture Control', description: 'Dehydrates nail plate for better adhesion' },
    //     { title: 'Quick Drying', description: 'Fast-acting formula saves time' },
    //     { title: 'Professional Results', description: 'Ensures long-lasting nail enhancements' }
    //   ],
    //   howToUse: [
    //     'Apply to clean, dry nails',
    //     'Allow to air dry completely',
    //     'Proceed with primer and enhancement',
    //     'Use before each application'
    //   ],
    //   ingredients: 'Isopropyl Alcohol, Proprietary blend',
    //   specifications: {
    //     volume: '15ml',
    //     type: 'Nail Prep',
    //     finish: 'Clear',
    //     application: 'Brush applicator',
    //     madeIn: 'South Africa',
    //     certifications: ['Professional Grade']
    //   }
    // },
    'glitter-acrylics': {
      id: '13',
      name: 'Glitter Acrylics',
      subtitle: 'Coming Soon',
      price: -1,
      comparePrice: null,
      rating: 4.9,
      reviewCount: 146,
      inStock: false,
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
        { title: 'UV Protection', description: 'Prevents yellowing and fading' },
        { title: 'Quick Dry', description: 'Fast-drying formula for convenience' }
      ],
      howToUse: [
        'Apply thin layer over cured color',
        'Cure in LED lamp for 60 seconds',
        'Wipe with alcohol if needed',
        'Apply cuticle oil to finish'
      ],
      ingredients: 'UV-resistant polymer blend',
      specifications: {
        volume: '15ml',
        type: 'Top Coat',
        finish: 'High-Gloss',
        application: 'Brush applicator',
        madeIn: 'South Africa',
        certifications: ['UV Protection', 'Professional Grade']
      }
    },
    'nail-liquid-monomer': {
      id: '14',
      name: 'Nail Liquid (Monomer)',
      subtitle: 'Coming Soon',
      price: -1,
      comparePrice: null,
      rating: 4.8,
      reviewCount: 87,
      inStock: false,
      stockCount: 25,
      description: 'Professional-grade monomer for acrylic nail application.',
      images: ['/nail-liquid-monomer-white.webp', '/nail-liquid-monomer-colorful.webp'],
      variants: [
        { id: '250ml', name: '250ml', inStock: false, price: -1 },
        { id: '500ml', name: '500ml', inStock: false, price: -1 }
      ],
      overview: [
        'Professional-grade formula',
        'Fast acting',
        'Effective removal',
        'Available in 250ml and 500ml',
        'Professional results'
      ],
      features: [
        { title: 'Professional Grade', description: 'High-quality formula for professionals' },
        { title: 'Fast Acting', description: 'Quick and effective removal' },
        { title: 'Large Size', description: '1L bottle for extended use' },
        { title: 'Versatile', description: 'Works on all nail products' }
      ],
      howToUse: [
        'Soak cotton pad with acetone',
        'Place on nail for 10-15 minutes',
        'Gently remove product',
        'Moisturize after use'
      ],
      ingredients: '100% Pure Acetone',
      specifications: {
        volume: '250ml/500ml',
        type: 'Monomer',
        concentration: '100% Pure',
        application: 'Acrylic application',
        madeIn: 'South Africa',
        certifications: ['Professional Grade']
      }
    },
    'crystal-kolinsky-sculpting-brush': {
      id: '15',
      name: 'Crystal Kolinsky Sculpting Brush',
      subtitle: 'Coming Soon',
      price: -1,
      comparePrice: null,
      rating: 4.9,
      reviewCount: 178,
      inStock: false,
      stockCount: 50,
      description: 'Professional acrylic brush for sculpting and shaping.',
      images: ['/acrylic-sculpture-brush-white.webp', '/acrylic-sculpture-brush-colorful.webp'],
      variants: [],
      overview: [
        'Professional quality bristles',
        'Perfect for sculpting',
        'Ergonomic handle',
        'Easy to clean',
        'Long-lasting'
      ],
      features: [
        { title: 'Quality Bristles', description: 'Professional-grade bristles for smooth application' },
        { title: 'Ergonomic', description: 'Comfortable grip for extended use' },
        { title: 'Versatile', description: 'Perfect for all acrylic techniques' },
        { title: 'Durable', description: 'Long-lasting construction' }
      ],
      howToUse: [
        'Dip brush in monomer',
        'Pick up acrylic powder',
        'Apply to nail or form',
        'Clean thoroughly after use'
      ],
      ingredients: 'Professional bristles, ergonomic handle',
      specifications: {
        size: 'Professional',
        type: 'Acrylic Brush',
        bristles: 'Synthetic',
        handle: 'Ergonomic',
        madeIn: 'South Africa',
        certifications: ['Professional Grade']
      }
    },
    'diamond-precision-nail-art-brush': {
      id: '16',
      name: 'Diamond Precision Nail Art Brush',
      subtitle: 'Coming Soon',
      price: -1,
      comparePrice: null,
      rating: 4.9,
      reviewCount: 178,
      inStock: false,
      stockCount: 50,
      description: 'Professional acrylic brush for sculpting and shaping.',
      images: ['/acrylic-sculpture-brush-white-2.webp', '/acrylic-sculpture-brush-colorful-2.webp'],
      variants: [],
      overview: [
        'Professional quality bristles',
        'Perfect for sculpting',
        'Ergonomic handle',
        'Easy to clean',
        'Long-lasting'
      ],
      features: [
        { title: 'Quality Bristles', description: 'Professional-grade bristles for smooth application' },
        { title: 'Ergonomic', description: 'Comfortable grip for extended use' },
        { title: 'Versatile', description: 'Perfect for all acrylic techniques' },
        { title: 'Durable', description: 'Long-lasting construction' }
      ],
      howToUse: [
        'Dip brush in monomer',
        'Pick up acrylic powder',
        'Apply to nail or form',
        'Clean thoroughly after use'
      ],
      ingredients: 'Professional bristles, ergonomic handle',
      specifications: {
        size: 'Professional',
        type: 'Acrylic Brush',
        bristles: 'Synthetic',
        handle: 'Ergonomic',
        madeIn: 'South Africa',
        certifications: ['Professional Grade']
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
      name: 'Emma Johnson',
      rating: 4,
      title: 'Great product',
      comment: 'Very happy with this purchase. Does exactly what it says. Would buy again.',
      date: '2024-01-10',
      verified: true,
      helpful: 8
    },
    {
      id: '3',
      name: 'Jessica Williams',
      rating: 5,
      title: 'Love it!',
      comment: 'Absolutely love this product! The quality is amazing and it lasts so long. Worth every penny.',
      date: '2024-01-05',
      verified: false,
      helpful: 6
    }
  ];

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
      price: 160,
      image: '/top-coat-01.webp',
      rating: 4.9,
      slug: 'top-coat'
    },
    {
      id: 'rec4',
      name: 'Nail File',
      price: 35,
      image: '/nail-file-01.webp',
      rating: 4.5,
      slug: 'nail-file'
    }
  ];


  const handleVariantSelect = (variantId: string) => {
    setSelectedVariant(variantId);
    // Update the main image to show the selected variant
    const variant = product.variants.find(v => v.id === variantId);
    if (variant && variant.image) {
      const imageIndex = product.images.findIndex(img => img === variant.image);
      if (imageIndex !== -1) {
        setSelectedImage(imageIndex);
      } else {
        // If variant image not in main images array, add it temporarily
        const tempImages = [...product.images, variant.image];
        const newIndex = tempImages.length - 1;
        setSelectedImage(newIndex);
      }
    }
  };

  // Handle carousel navigation and sync with variant selection
  const nextImage = () => {
    const newIndex = (selectedImage + 1) % product.images.length;
    setSelectedImage(newIndex);
    // Sync with variant selection if this image corresponds to a variant
    syncVariantWithImage(newIndex);
  };

  const prevImage = () => {
    const newIndex = (selectedImage - 1 + product.images.length) % product.images.length;
    setSelectedImage(newIndex);
    // Sync with variant selection if this image corresponds to a variant
    syncVariantWithImage(newIndex);
  };

  // Helper function to sync variant selection with image index
  const syncVariantWithImage = (imageIndex: number) => {
    const currentImage = product.images[imageIndex];
    if (currentImage) {
      // Find variant that matches this image
      const matchingVariant = product.variants.find(v => v.image === currentImage);
      if (matchingVariant) {
        setSelectedVariant(matchingVariant.id);
      } else {
        // Check if it's the first image (usually white background)
        if (imageIndex === 0) {
          setSelectedVariant(null);
        }
      }
    }
  };

  // Get current price based on selected variant
  const getCurrentPrice = () => {
    if (selectedVariant) {
      const variant = product.variants.find(v => v.id === selectedVariant);
      if (variant && variant.price !== undefined) {
        return variant.price;
      }
    }
    return product.price;
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    // TODO: Add actual wishlist functionality
  };

  const handleAddToCart = () => {
    // TODO: Add actual cart functionality
    console.log('Adding to cart:', { 
      product: product.name, 
      quantity,
      variant: selectedVariant 
    });
  };

  const handleReviewSubmit = (review: any) => {
    console.log('New review:', review);
    // TODO: Add actual review submission functionality
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
    <div className="min-h-screen bg-white">
      <Header showMobileMenu={true} />

      <main>
        <section className="section-padding">
          <Container>
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Product Media */}
              <div>
                {/* Main Image */}
                <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={product.images[selectedImage] || product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = product.images[0] || '/placeholder.webp';
                    }}
                  />
                  
                  {/* Navigation Arrows */}
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          prevImage();
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          nextImage();
                        }}
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
                  <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedImage(index);
                        syncVariantWithImage(index);
                      }}
                        className={`w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                        selectedImage === index ? 'border-pink-400' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = product.images[0] || '/placeholder.webp';
                        }}
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
                
                {product.subtitle && (
                  <p className="text-lg text-gray-600 mb-4">{product.subtitle}</p>
                )}

                {/* Rating */}
                <div className="flex items-center gap-3 mb-6">
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
                  {product.price === -1 ? (
                    <span className="text-3xl font-bold text-gray-600">Coming Soon</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-gray-900">
                        R{getCurrentPrice().toFixed(2)}
                      </span>
                      {product.comparePrice && (
                        <span className="text-xl text-gray-500 line-through">
                          R{product.comparePrice.toFixed(2)}
                        </span>
                      )}
                    </>
                  )}
                </div>
                {product.comparePrice && product.price !== -1 && (
                  <div className="text-sm text-green-600 font-medium">
                    Save R{(product.comparePrice - getCurrentPrice()).toFixed(2)}
                  </div>
                )}
              </div>

                {/* Variant Selection */}
                {product.variants.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {product.price === -1 ? 'Available Variants (Coming Soon)' : 'Options'}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleVariantSelect(variant.id);
                          }}
                          className={`px-4 py-2 rounded-full border transition-all ${
                            selectedVariant === variant.id
                              ? 'bg-pink-400 text-white border-pink-400'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <span className="text-sm font-medium">{variant.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <p className="text-gray-700 mb-6">{product.description}</p>

                {/* Stock Status */}
                <div className="flex items-center gap-2 mb-6">
                  {product.price === -1 ? (
                    <>
                      <X className="h-5 w-5 text-blue-600" />
                      <span className="text-blue-600 font-medium">Coming Soon - Browse variants and details</span>
                    </>
                  ) : product.inStock ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-green-600 font-medium">In Stock ({product.stockCount} available)</span>
                    </>
                  ) : (
                    <>
                      <X className="h-5 w-5 text-red-600" />
                      <span className="text-red-600 font-medium">Out of Stock</span>
                    </>
                  )}
                </div>

                {/* Quantity Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={!product.inStock || product.price === -1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stockCount}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(product.stockCount, parseInt(e.target.value) || 1)))}
                      className="w-20 text-center border border-gray-300 rounded-lg py-2"
                      disabled={!product.inStock || product.price === -1}
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={!product.inStock || product.price === -1}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Button 
                  size="lg" 
                  className="w-full mb-4"
                  onClick={handleAddToCart}
                  disabled={!product.inStock || product.price === -1}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {product.price === -1 ? 'Coming Soon' : 'Add to Cart'}
                </Button>

                {/* Product Benefits */}
                <div className="space-y-3 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-700">Free shipping on orders over R500</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-700">30-day return policy</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-700">Professional quality guarantee</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details Tabs */}
            <div className="mt-16">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
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
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="mt-8">
                {activeTab === 'overview' && (
                  <div className="prose max-w-none">
                    <ul className="space-y-2">
                      {product.overview.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === 'features' && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {product.features.map((feature, index) => (
                      <div key={index} className="p-6 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'how-to-use' && (
                  <div className="prose max-w-none">
                    <ol className="space-y-3">
                      {product.howToUse.map((step, index) => (
                        <li key={index} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-400 text-white flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {activeTab === 'ingredients' && (
                  <div className="prose max-w-none">
                    <p className="text-gray-700">{product.ingredients}</p>
                    <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-4">Specifications</h4>
                      <dl className="grid grid-cols-2 gap-4">
                        {Object.entries(product.specifications).map(([key, value]) => (
                          <div key={key}>
                            <dt className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</dt>
                            <dd className="text-sm font-medium text-gray-900">
                              {Array.isArray(value) ? value.join(', ') : value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
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
