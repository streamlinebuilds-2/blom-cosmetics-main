import React from 'react';
import { ProductPageTemplate } from '../components/product/ProductPageTemplate';

// Example usage of the ProductPageTemplate
export const ProductTemplateExample: React.FC = () => {
  const exampleProduct = {
    name: "Crystal Clear Acrylic",
    slug: "crystal-clear-acrylic",
    category: "Acrylic System",
    shortDescription: "Ultra-clear acrylic powder for encapsulation & overlays.",
    overview: "Glass-like clear powder with bubble-free clarity. Perfect for encapsulation work, French manicures, and creating crystal-clear overlays. Our premium formula ensures no yellowing and maintains perfect transparency for professional results.",
    price: "R250",
    compareAtPrice: "R300",
    stock: "In Stock",
    images: [
      "https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop",
      "https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop",
      "https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop"
    ],
    features: [
      "Bubble-free clarity",
      "Non-yellowing formula",
      "Self-leveling consistency",
      "Superior strength",
      "Easy to work with"
    ],
    howToUse: [
      "Prep nails with primer and dehydrator",
      "Pick up bead with monomer using size 8 brush",
      "Sculpt and refine the enhancement",
      "File, buff and finish with top coat"
    ],
    ingredients: {
      inci: [
        "Polymethyl Methacrylate",
        "Polyethyl Methacrylate",
        "Benzoyl Peroxide",
        "Titanium Dioxide"
      ],
      key: [
        "PMMA – provides strength and durability",
        "Benzoyl Peroxide – curing activator",
        "Polyethyl Methacrylate – flexibility enhancer"
      ]
    },
    details: {
      size: "56g",
      shelfLife: "24 months",
      claims: ["Vegan", "Cruelty-Free", "HEMA-Free"]
    },
    variants: ["56g", "28g"],
    related: ["snow-white-acrylic", "core-acrylics"],
    seo: {
      title: "Crystal Clear Acrylic – BLOM Cosmetics",
      description: "Ultra-clear, bubble-free acrylic powder for professional nail enhancements. Perfect for encapsulation and overlays."
    }
  };

  return <ProductPageTemplate product={exampleProduct} />;
};