import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ReviewSection } from '../components/review/ReviewSection';
import { PaymentMethods } from '../components/payment/PaymentMethods';
import { cartStore, showNotification } from '../lib/cart';
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
  Zap,
  Award,
  Clock
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
    'vitamin-primer': {
      id: '2',
      name: 'Vitamin Primer',
      subtitle: 'Vitamin-infused, acid-free primer for strong adhesion',
      price: 299,
      comparePrice: 350,
      rating: 4.8,
      reviewCount: 124,
      inStock: true,
      stockCount: 15,
      description: 'Creates a long-lasting bond for gels and acrylics while protecting the natural nail.',
      images: [
        'https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
        'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
        'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop'
      ],
      variants: [],
      overview: [
        'Acid-free formula; gentle but effective',
        'Boosts adhesion; reduces lifting',
        'Infused with Vitamin complex',
        'HEMA-Free formulation',
        'Professional salon quality'
      ],
      features: [
        { title: 'Acid-Free', description: 'Gentle on natural nails while providing strong adhesion' },
        { title: 'Vitamin Complex', description: 'Nourishes nails during application process' },
        { title: 'HEMA-Free', description: 'Reduces risk of allergic reactions' },
        { title: 'Long-Lasting', description: 'Prevents lifting for extended wear' }
      ],
      howToUse: [
        'Prep nails by pushing back cuticles',
        'Apply thin coat of primer to natural nail',
        'Allow to air dry for 30 seconds',
        'Continue with gel or acrylic application'
      ],
      ingredients: [
        'Methacrylate Esters',
        'Vitamin E Complex',
        'Vitamin B5 (Panthenol)',
        'UV Stabilizers'
      ],
      specifications: {
        size: '15ml',
        shelfLife: '24 months',
        origin: 'Professional Grade',
        certifications: ['Vegan', 'Cruelty-Free', 'HEMA-Free']
      }
    },
    'prep-solution': {
      id: '3',
      name: 'Prep Solution (Nail Dehydrator)',
      subtitle: 'Removes oils & moisture for better adhesion',
      price: 189,
      comparePrice: null,
      rating: 4.7,
      reviewCount: 89,
      inStock: true,
      stockCount: 20,
      description: 'Prepares natural nails by dehydrating the plate, preventing lifting under acrylic and gel.',
      images: [
        '/public/prep-solution.webp',
        'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
        'https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop'
      ],
      variants: [
        { id: '15ml', name: '15ml', inStock: true }
      ],
      overview: [
        'Fast-evaporating formula with no residue',
        'Improves adhesion under acrylic & gel systems',
        'Prevents lifting and extends wear time',
        'Professional salon quality',
        'Easy application with precision brush'
      ],
      features: [
        { title: 'Fast-Evaporating', description: 'Quick-drying formula that leaves no residue' },
        { title: 'Improved Adhesion', description: 'Creates optimal surface for gel and acrylic application' },
        { title: 'Prevents Lifting', description: 'Removes oils and moisture that cause product failure' },
        { title: 'Professional Grade', description: 'Salon-quality results for long-lasting manicures' }
      ],
      howToUse: [
        'Push back cuticles and shape nails',
        'Apply thin coat to natural nail surface',
        'Allow to air dry for approximately 30 seconds',
        'Continue with primer and nail enhancement application'
      ],
      ingredients: [
        'Ethyl Acetate',
        'Isopropyl Alcohol',
        'Dehydrating Agents'
      ],
      specifications: {
        size: '15ml',
        shelfLife: '24 months',
        origin: 'Professional Grade',
        certifications: ['Vegan', 'Cruelty-Free']
      }
    },
    'top-coat': {
      id: '4',
      name: 'Top Coat',
      subtitle: 'Strong, protective top coat with mirror shine',
      price: 249,
      comparePrice: 299,
      rating: 4.9,
      reviewCount: 201,
      inStock: true,
      stockCount: 35,
      description: 'High-gloss, chip-resistant finish for both gels and acrylics.',
      images: [
        '/public/top-coat.webp',
        'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
        'https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop'
      ],
      variants: [
        { id: '15ml', name: '15ml', inStock: true }
      ],
      overview: [
        'Seals and protects color underneath',
        'Scratch and chip resistant formula',
        'Glossy, professional mirror finish',
        'Compatible with gel and acrylic systems',
        'Long-lasting durability'
      ],
      features: [
        { title: 'Protective Seal', description: 'Creates a barrier that protects underlying color and design' },
        { title: 'Chip Resistant', description: 'Advanced formula resists chipping and scratching' },
        { title: 'Mirror Shine', description: 'Delivers a high-gloss, professional finish' },
        { title: 'Universal Compatibility', description: 'Works with both gel and acrylic nail systems' }
      ],
      howToUse: [
        'Ensure base color is completely cured/dry',
        'Apply thin, even coat over entire nail',
        'Cure under LED/UV lamp if using with gel system',
        'Apply second coat if extra durability is desired'
      ],
      ingredients: [
        'Acrylate Polymers',
        'UV Stabilizers',
        'Gloss Enhancers',
        'Protective Resins'
      ],
      specifications: {
        size: '15ml',
        shelfLife: '24 months',
        origin: 'Professional Grade',
        certifications: ['Vegan', 'Cruelty-Free', 'HEMA-Free']
      }
    },
    'fairy-dust-top-coat': {
      id: '5',
      name: 'Fairy Dust Top Coat',
      subtitle: 'Glitter-infused top coat with smooth shine',
      price: 279,
      comparePrice: null,
      rating: 4.6,
      reviewCount: 73,
      inStock: true,
      stockCount: 18,
      description: 'Adds a sparkling finish to any gel or acrylic set.',
      images: [
        '/public/fairy-dust-top-coat.webp',
        'https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
        'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop'
      ],
      variants: [
        { id: '15ml', name: '15ml', inStock: true }
      ],
      overview: [
        'Subtle glitter shimmer for elegant sparkle',
        'Long-lasting shine that won\'t fade',
        'Smooth finish that\'s non-gritty to touch',
        'Perfect for special occasions or everyday glamour',
        'Easy application with built-in precision brush'
      ],
      features: [
        { title: 'Subtle Shimmer', description: 'Fine glitter particles create elegant sparkle without being overwhelming' },
        { title: 'Smooth Finish', description: 'Non-gritty texture feels smooth to the touch' },
        { title: 'Long-Lasting', description: 'Maintains sparkle and shine for extended wear' },
        { title: 'Versatile Use', description: 'Perfect as final coat or mixed with other colors' }
      ],
      howToUse: [
        'Apply over cured base color or design',
        'Use as final coat for subtle sparkle effect',
        'Cure under LED/UV lamp if using with gel system',
        'Can be layered for more intense shimmer'
      ],
      ingredients: [
        'Acrylate Polymers',
        'Cosmetic Grade Glitter',
        'UV Stabilizers',
        'Shine Enhancers'
      ],
      specifications: {
        size: '15ml',
        shelfLife: '24 months',
        origin: 'Professional Grade',
        certifications: ['Vegan', 'Cruelty-Free', 'HEMA-Free']
      }
    },
    'nail-file-80-80': {
      id: '6',
      name: 'Nail File (80/80 Grit)',
      subtitle: 'Durable file with eco-friendly sponge core',
      price: 0, // Price to be updated
      comparePrice: null,
      rating: 4.5,
      reviewCount: 45,
      inStock: true,
      stockCount: 50,
      description: 'Double-sided professional nail file for shaping and refinements.',
      images: [
        '/public/nail-file-80-80.webp',
        'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
        'https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop'
      ],
      variants: [
        { id: 'single', name: 'Single', inStock: true }
      ],
      overview: [
        '80/80 grit for heavy shaping and refinements',
        'Floral design that won\'t fade or transfer',
        'Long-lasting performance with eco-friendly sponge core',
        'Double-sided for versatile use',
        'Professional quality for salon and home use'
      ],
      features: [
        { title: '80/80 Grit', description: 'Perfect grit level for heavy shaping and refinements' },
        { title: 'Fade-Resistant Design', description: 'Floral pattern won\'t fade or transfer during use' },
        { title: 'Eco-Friendly Core', description: 'Sustainable sponge core for environmental responsibility' },
        { title: 'Long-Lasting', description: 'Durable construction for extended professional use' }
      ],
      howToUse: [
        'Use gently on acrylic or gel nails to refine shape',
        'File in one direction for best results',
        'Clean file regularly during use',
        'Store in dry place to maintain quality'
      ],
      ingredients: [
        'Abrasive Coating',
        'Eco-Friendly Sponge Core',
        'Protective Surface Layer'
      ],
      specifications: {
        size: 'Standard nail file size',
        shelfLife: 'Long-lasting with proper care',
        origin: 'Professional Grade',
        certifications: ['Cruelty-Free']
      }
    },
    'nail-forms': {
      id: '7',
      name: 'Nail Forms',
      subtitle: 'Sculpting forms with holographic guide for precision',
      price: 0, // Price to be updated
      comparePrice: null,
      rating: 4.5,
      reviewCount: 32,
      inStock: true,
      stockCount: 25,
      description: 'Luxury nail forms designed for short to extreme lengths.',
      images: [
        '/public/nail-forms.webp',
        'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
        'https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop'
      ],
      variants: [
        { id: 'roll-300', name: 'Roll of 300', inStock: true }
      ],
      overview: [
        '300 forms per roll for professional use',
        'Strong adhesive that stays in place during application',
        'Holographic grid for perfect structure and alignment',
        'Detachable section for extreme length extensions',
        'Luxury design for professional nail technicians'
      ],
      features: [
        { title: '300 Forms Per Roll', description: 'Generous quantity for professional salon use' },
        { title: 'Strong Adhesive', description: 'Stays securely in place during sculpting process' },
        { title: 'Holographic Grid', description: 'Precision guide lines for perfect structure and symmetry' },
        { title: 'Detachable Section', description: 'Special feature for creating extreme length extensions' }
      ],
      howToUse: [
        'Apply form under free edge of natural nail',
        'Ensure secure adhesion and proper alignment',
        'Sculpt with acrylic or gel over the form',
        'Remove form after curing and refine shape'
      ],
      ingredients: [
        'High-Quality Adhesive',
        'Durable Form Material',
        'Holographic Guide Elements'
      ],
      specifications: {
        size: '300 forms per roll',
        shelfLife: 'Long-lasting with proper storage',
        origin: 'Professional Grade',
        certifications: ['Vegan', 'Cruelty-Free']
      }
    },
    'crystal-clear-acrylic': {
      id: '9',
      name: 'Crystal Clear Acrylic (56 g)',
      subtitle: 'Glass-clear powder for encapsulation & overlays',
      price: 0, // Price to be updated
      comparePrice: null,
      rating: 4.9,
      reviewCount: 156,
      inStock: true,
      stockCount: 25,
      description: 'Ultra-clear, non-yellowing acrylic powder for professional results.',
      images: [
        '/public/crystal-clear-acrylic.webp',
        'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
        'https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop'
      ],
      variants: [
        { id: '56g', name: '56 g', inStock: true }
      ],
      overview: [
        'Bubble-free, crystal clarity',
        'Smooth self-leveling formula',
        'Ideal for encapsulating designs',
        'Non-yellowing formula maintains clarity',
        'Professional salon quality'
      ],
      features: [
        { title: 'Crystal Clarity', description: 'Bubble-free formula provides perfect transparency' },
        { title: 'Self-Leveling', description: 'Smooth application with professional results' },
        { title: 'Encapsulation Ready', description: 'Perfect for encapsulating nail art designs' },
        { title: 'Non-Yellowing', description: 'Maintains clarity over time without discoloration' }
      ],
      howToUse: [
        'Use with EMA monomer for best results',
        'Sculpt as usual with proper bead consistency',
        'File and finish to desired shape',
        'Seal with top coat for lasting shine'
      ],
      ingredients: [
        'PMMA (Polymethyl Methacrylate)',
        'Benzoyl Peroxide'
      ],
      specifications: {
        size: '56 g',
        shelfLife: '24 months',
        origin: 'Professional Grade',
        certifications: ['Vegan', 'Cruelty-Free']
      }
    },
    'snow-white-acrylic': {
      id: '10',
      name: 'Snow White Acrylic (56 g)',
      subtitle: 'Opaque white acrylic for French & design work',
      price: 0, // Price to be updated
      comparePrice: null,
      rating: 4.7,
      reviewCount: 94,
      inStock: true,
      stockCount: 30,
      description: 'Buttery application, strong coverage for smile lines and full sets.',
      images: [
        '/public/snow-white-acrylic.webp',
        'https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
        'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop'
      ],
      variants: [
        { id: '56g', name: '56 g', inStock: true }
      ],
      overview: [
        'Bright, clean white coverage',
        'Strength powder; no clear cap required',
        'Smooth, buttery application',
        'Perfect for French manicures',
        'Professional salon quality'
      ],
      features: [
        { title: 'Bright White', description: 'Clean, opaque white coverage for perfect smile lines' },
        { title: 'Strength Formula', description: 'No clear cap required - strong on its own' },
        { title: 'Smooth Application', description: 'Buttery consistency for easy sculpting' },
        { title: 'Versatile Use', description: 'Perfect for French tips and full coverage sets' }
      ],
      howToUse: [
        'Apply beads for smiles or full coverage',
        'Sculpt to desired shape and thickness',
        'File and refine the enhancement',
        'Seal with top coat for protection'
      ],
      ingredients: [
        'PMMA (Polymethyl Methacrylate)',
        'Benzoyl Peroxide',
        'Titanium Dioxide'
      ],
      specifications: {
        size: '56 g',
        shelfLife: '24 months',
        origin: 'Professional Grade',
        certifications: ['Vegan', 'Cruelty-Free']
      }
    },
    'colour-acrylic': {
      id: '11',
      name: 'Colour Acrylic (15 g)',
      subtitle: 'High-pigment acrylic powders for bold designs',
      price: 0, // Price to be updated
      comparePrice: null,
      rating: 4.6,
      reviewCount: 73,
      inStock: true,
      stockCount: 20,
      description: 'Buttery, smooth powders for ombré, fades, and 3D work.',
      images: [
        '/public/colour-acrylic.webp',
        'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
        'https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop'
      ],
      variants: [
        { id: '15g', name: '15 g', inStock: true }
      ],
      overview: [
        'Rich, consistent pigments',
        'Easy blending for gradients',
        'Requires encapsulation in clear',
        'Perfect for ombré and fade effects',
        'Professional quality pigments'
      ],
      features: [
        { title: 'Rich Pigments', description: 'Consistent, vibrant colors for bold nail designs' },
        { title: 'Easy Blending', description: 'Perfect for creating smooth gradients and ombré effects' },
        { title: 'Encapsulation Ready', description: 'Designed to be encapsulated with clear acrylic' },
        { title: '3D Work', description: 'Ideal for dimensional nail art and sculptural designs' }
      ],
      howToUse: [
        'Apply thin color layer over base',
        'Blend colors for gradient effects',
        'Encapsulate with clear acrylic',
        'File and finish to perfection'
      ],
      ingredients: [
        'PMMA (Polymethyl Methacrylate)',
        'Benzoyl Peroxide',
        'Cosmetic Grade Pigments'
      ],
      specifications: {
        size: '15 g',
        shelfLife: '24 months',
        origin: 'Professional Grade',
        certifications: ['Vegan', 'Cruelty-Free']
      }
    },
    'glitter-acrylic': {
      id: '12',
      name: 'Glitter Acrylic (15 g)',
      subtitle: 'Sparkle acrylics for encapsulated effects',
      price: 0, // Price to be updated
      comparePrice: null,
      rating: 4.6,
      reviewCount: 73,
      inStock: true,
      stockCount: 20,
      description: 'Glitter particles suspended in clear/colored acrylic for high-impact shine.',
      images: [
        '/public/glitter-acrylic.webp',
        'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
        'https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop'
      ],
      variants: [
        { id: '15g', name: '15 g', inStock: true }
      ],
      overview: [
        'Vibrant glitter distribution',
        'Encapsulate for long wear',
        'Smooth application for fades',
        'High-impact shine effects',
        'Professional quality sparkle'
      ],
      features: [
        { title: 'Vibrant Glitter', description: 'Even distribution of sparkle particles for consistent shine' },
        { title: 'Long Wear', description: 'Designed to be encapsulated for extended durability' },
        { title: 'Smooth Application', description: 'Perfect for creating gradient and fade effects' },
        { title: 'High Impact', description: 'Maximum sparkle for dramatic nail art designs' }
      ],
      howToUse: [
        'Apply thin glitter coat',
        'Encapsulate with clear core',
        'File & top coat',
        'Layer for more intense sparkle'
      ],
      ingredients: [
        'PMMA (Polymethyl Methacrylate)',
        'Benzoyl Peroxide',
        'Cosmetic-grade PET glitter'
      ],
      specifications: {
        size: '15 g',
        shelfLife: '24 months',
        origin: 'Professional Grade',
        certifications: ['Vegan', 'Cruelty-Free']
      }
    },
    'core-acrylics': {
      id: '13',
      name: 'Core Acrylics (56 g)',
      subtitle: 'Strength powders in clear, white, and natural tones',
      price: 0, // Price to be updated
      comparePrice: null,
      rating: 4.8,
      reviewCount: 94,
      inStock: true,
      stockCount: 30,
      description: 'Core range designed as structural powders; often don\'t require capping.',
      images: [
        '/public/core-acrylics.webp',
        'https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
        'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop'
      ],
      variants: [
        { id: '56g', name: '56 g', inStock: true }
      ],
      overview: [
        'Strength formula for reliable wear',
        'Non-yellowing',
        'Smooth, self-leveling application',
        'No clear cap required',
        'Professional structural powders'
      ],
      features: [
        { title: 'Strength Formula', description: 'Reliable wear without requiring clear capping' },
        { title: 'Non-Yellowing', description: 'Maintains color integrity over time' },
        { title: 'Self-Leveling', description: 'Smooth application for professional results' },
        { title: 'Structural Design', description: 'Perfect for building strong nail extensions' }
      ],
      howToUse: [
        'Build extension/base and apex directly',
        'Refine shape',
        'Finish file & top coat',
        'No clear cap needed'
      ],
      ingredients: [
        'PMMA (Polymethyl Methacrylate)',
        'Benzoyl Peroxide',
        'Cosmetic pigments'
      ],
      specifications: {
        size: '56 g',
        shelfLife: '24 months',
        origin: 'Professional Grade',
        certifications: ['Vegan', 'Cruelty-Free']
      }
    },
    'nail-liquid-monomer': {
      id: '8',
      name: 'Nail Liquid (Monomer)',
      subtitle: 'Low-odor EMA monomer. MMA-free, HEMA-free',
      price: 0, // Price to be updated
      comparePrice: null,
      rating: 4.8,
      reviewCount: 87,
      inStock: true,
      stockCount: 15,
      description: 'Professional-grade acrylic monomer for strength, clarity, and long-lasting wear.',
      images: [
        '/public/nail-liquid-monomer.webp',
        'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
        'https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop'
      ],
      variants: [
        { id: '250ml', name: '250ml', inStock: true },
        { id: '550ml', name: '550ml', inStock: true }
      ],
      overview: [
        'Low odor formula for comfortable application',
        'Self-leveling for smooth, professional results',
        'Non-yellowing formula maintains clarity over time',
        'Bubble-free application for flawless finish',
        'MMA-free and HEMA-free for safety'
      ],
      features: [
        { title: 'Low Odor Formula', description: 'Comfortable to work with, reduced chemical smell' },
        { title: 'Self-Leveling', description: 'Flows smoothly for even application and professional results' },
        { title: 'Non-Yellowing', description: 'Maintains crystal clarity and doesn\'t discolor over time' },
        { title: 'Bubble-Free', description: 'Advanced formula prevents air bubbles for flawless finish' }
      ],
      howToUse: [
        'Dampen brush in monomer liquid',
        'Pick up appropriate acrylic bead size',
        'Sculpt nail extension or overlay',
        'Allow to set completely, then file and finish'
      ],
      ingredients: [
        'Ethyl Methacrylate (EMA)',
        'Hydroquinone',
        'UV Stabilizers',
        'Performance Enhancers'
      ],
      specifications: {
        size: 'Available in 250ml and 550ml',
        shelfLife: '24 months',
        origin: 'Professional Grade',
        certifications: ['Vegan', 'Cruelty-Free', 'HEMA-Free', 'MMA-Free']
      }
    }
  };

  const product = allProductsData[productSlug as keyof typeof allProductsData] || allProductsData['cuticle-oil'];

  React.useEffect(() => {
    if (product.variants.length > 0) {
      const firstAvailable = product.variants.find(v => v.inStock);
      if (firstAvailable) {
        setSelectedVariant(firstAvailable.id);
      }
    }
  }, [product]);

  const handleAddToCart = () => {
    const variant = selectedVariant ? product.variants.find(v => v.id === selectedVariant) : null;
    
    cartStore.addItem({
      id: `item_${Date.now()}`,
      productId: product.id,
      variantId: variant?.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      variant: variant ? { title: variant.name } : undefined
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

  const relatedProducts = [
    {
      id: '2',
      name: 'Vitamin Primer',
      price: 299,
      image: 'https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
      rating: 4.8
    },
    {
      id: '3',
      name: 'Prep Solution',
      price: 189,
      image: 'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
      rating: 4.7
    },
    {
      id: '4',
      name: 'Top Coat',
      price: 249,
      image: 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
      rating: 4.9
    }
  ];

  const reviews = [
    {
      id: 1,
      name: 'Sarah M.',
      rating: 5,
      date: '2024-01-15',
      title: 'Amazing product!',
      comment: 'This cuticle oil has transformed my nails. They\'ve never looked healthier!',
      verified: true,
      helpful: 12
    },
    {
      id: 2,
      name: 'Jessica L.',
      rating: 5,
      date: '2024-01-10',
      title: 'Professional quality',
      comment: 'I use this in my salon and clients love the results. Fast absorbing and smells amazing.',
      verified: true,
      helpful: 8
    },
    {
      id: 3,
      name: 'Michelle R.',
      rating: 4,
      date: '2024-01-05',
      title: 'Great value',
      comment: 'Good product for the price. The vanilla scent is my favorite!',
      verified: true,
      helpful: 5
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

                  {/* Sale Badge */}
                  {product.comparePrice && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Save R{product.comparePrice - product.price}
                    </div>
                  )}
                </div>

                {/* Thumbnail Images */}
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
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Buy Box */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 mb-3">{product.name}</h1>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">{product.subtitle}</p>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(product.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      {product.rating} out of 5
                    </span>
                    <span className="text-gray-500">({product.reviewCount} reviews)</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-4xl font-bold text-pink-500">R{product.price}</span>
                    {product.comparePrice && (
                      <span className="text-2xl text-gray-400 line-through">R{product.comparePrice}</span>
                    )}
                    {product.comparePrice && (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                      </span>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className="flex items-center gap-2 mb-6">
                    {product.inStock ? (
                      <>
                        <Check className="h-5 w-5 text-green-500" />
                        <span className="text-green-600 font-semibold text-lg">In Stock</span>
                        {product.stockCount <= 10 && (
                          <span className="text-orange-600 text-sm font-medium">
                            (Only {product.stockCount} left!)
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-red-600 font-semibold text-lg">Out of Stock</span>
                    )}
                  </div>

                  {/* Product Benefits */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <p className="text-gray-700 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Variants */}
                {product.variants.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Scent:</h3>
                    <div className="flex flex-wrap gap-3">
                      {product.variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant.id)}
                          disabled={!variant.inStock}
                          className={`px-6 py-3 border-2 rounded-xl font-semibold text-base transition-all duration-200 ${
                            selectedVariant === variant.id
                              ? 'border-pink-400 bg-pink-500 text-white shadow-lg'
                              : variant.inStock
                              ? 'border-gray-300 bg-white text-gray-700 hover:border-pink-300 hover:bg-pink-50'
                              : 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-100'
                          }`}
                        >
                          {variant.name}
                          {!variant.inStock && (
                            <span className="block text-xs mt-1">Out of Stock</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quantity:</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border-2 border-gray-200 rounded-xl bg-white">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-3 hover:bg-gray-50 transition-colors rounded-l-xl"
                      >
                        <Minus className="h-5 w-5 text-gray-600" />
                      </button>
                      <span className="px-6 py-3 font-bold text-lg text-gray-900 min-w-[60px] text-center">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-3 hover:bg-gray-50 transition-colors rounded-r-xl"
                      >
                        <Plus className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      Total: <span className="text-pink-500">R{(product.price * quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4 mb-8">
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg"
                  >
                    <ShoppingCart className="h-6 w-6" />
                    ADD TO CART
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={!product.inStock}
                    className="w-full bg-pink-400 hover:bg-pink-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none shadow-lg hover:shadow-xl text-lg"
                  >
                    BUY NOW
                  </button>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setIsWishlisted(!isWishlisted)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border-2 border-gray-200 rounded-xl hover:border-pink-300 hover:bg-pink-50 transition-all duration-200 font-semibold text-gray-700"
                    >
                      <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current text-pink-400' : ''}`} />
                      {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border-2 border-gray-200 rounded-xl hover:border-pink-300 hover:bg-pink-50 transition-all duration-200 font-semibold text-gray-700">
                      <Share2 className="h-5 w-5" />
                      Share
                    </button>
                  </div>
                </div>

                {/* Trust Row */}
                <div className="grid grid-cols-3 gap-4 mb-8 text-center">
                  <div className="flex flex-col items-center gap-2 p-4 bg-green-50 rounded-xl">
                    <Truck className="h-6 w-6 text-green-500" />
                    <span className="font-semibold text-green-700">Free shipping over R500</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-xl">
                    <Shield className="h-6 w-6 text-blue-500" />
                    <span className="font-semibold text-blue-700">100% authentic</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-xl">
                    <RotateCcw className="h-6 w-6 text-purple-500" />
                    <span className="font-semibold text-purple-700">30-day returns</span>
                  </div>
                </div>

                {/* Payment Methods */}
                <PaymentMethods />
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
                    <div className="flex items-center gap-3">
                      <Zap className="h-5 w-5 text-pink-400" />
                      <h3 className="font-semibold text-lg">Overview</h3>
                    </div>
                    {expandedAccordion === 'overview' ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {expandedAccordion === 'overview' && (
                    <div className="px-6 pb-6">
                      <ul className="space-y-2">
                        {product.overview.map((item, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>

                {/* Features */}
                <Card>
                  <button
                    onClick={() => toggleAccordion('features')}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-pink-400" />
                      <h3 className="font-semibold text-lg">Key Features</h3>
                    </div>
                    {expandedAccordion === 'features' ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {expandedAccordion === 'features' && (
                    <div className="px-6 pb-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        {product.features.map((feature, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium mb-2">{feature.title}</h4>
                            <p className="text-gray-600 text-sm">{feature.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>

                {/* How to Use */}
                <Card>
                  <button
                    onClick={() => toggleAccordion('how-to-use')}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-pink-400" />
                      <h3 className="font-semibold text-lg">How to Use</h3>
                    </div>
                    {expandedAccordion === 'how-to-use' ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
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
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-pink-400" />
                      <h3 className="font-semibold text-lg">Ingredients & Specifications</h3>
                    </div>
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
                          <h4 className="font-medium mb-3">Key Ingredients:</h4>
                          <ul className="space-y-2">
                            {product.ingredients.map((ingredient, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                                <span className="text-sm">{ingredient}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-3">Specifications:</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Size:</span>
                              <span>{product.specifications.size}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Shelf Life:</span>
                              <span>{product.specifications.shelfLife}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Origin:</span>
                              <span>{product.specifications.origin}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Certifications:</span>
                              <span>{product.specifications.certifications.join(', ')}</span>
                            </div>
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

        {/* Reviews Section */}
        <ReviewSection
          productName={product.name}
          productImage={product.images[0]}
          productSlug={product.slug}
          averageRating={product.rating}
          reviewCount={product.reviewCount}
          reviews={reviews}
          onReviewSubmit={(reviewData) => {
            // In a real app, this would submit to your backend
            console.log('New review submitted:', reviewData);
            showNotification('Thank you for your review! It will be published after moderation.');
          }}
        />

        {/* Related Products */}
        <section className="section-padding bg-gray-50">
          <Container>
            <h2 className="text-3xl font-bold text-center mb-12">You May Also Like</h2>
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
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{relatedProduct.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-pink-400">R{relatedProduct.price}</span>
                      <Button size="sm">Add to Cart</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        {/* Sticky Cart (Mobile Only) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
          <div className="p-4">
            <div className="flex items-center gap-4">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-12 h-12 object-cover rounded"
              />
              <div className="flex-1">
                <h4 className="font-medium text-sm">{product.name}</h4>
                <p className="text-pink-400 font-bold">R{product.price}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center border rounded">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-2 text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <Button size="sm" onClick={handleAddToCart}>
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};