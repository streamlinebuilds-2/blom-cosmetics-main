# Bundle Template - Easy Copy & Paste

Use this template to quickly add new bundle deals to your shop.

## Instructions
1. Copy the "Shop Page Bundle" section and paste into `src/pages/ShopPage.tsx` in the `allProducts` array
2. Copy the "Product Detail Bundle" section and paste into `src/pages/ProductDetailPage.tsx` in the `productDatabase` object
3. Replace all placeholders with your bundle information
4. Add your bundle images to the `public` folder

---

## Shop Page Bundle (ShopPage.tsx)

```typescript
{
  id: 'bundle-X', // Change X to next number
  name: '[BUNDLE NAME]', // e.g., 'Gel Essentials Bundle'
  slug: '[bundle-slug]', // e.g., 'gel-essentials-bundle'
  price: [BUNDLE_PRICE], // e.g., 500
  compareAtPrice: [ORIGINAL_TOTAL], // e.g., 650
  short_description: '[SHORT DESCRIPTION]', // e.g., 'Complete gel system - save R150!'
  shortDescription: '[SHORT DESCRIPTION]',
  description: '[FULL DESCRIPTION]',
  images: ['/[bundle-image-white].webp', '/[bundle-image-colorful].webp'],
  category: 'bundle-deals',
  rating: 0,
  reviews: 0,
  badges: ['Bundle', 'Save [X]%'], // Calculate percentage: ((compareAtPrice - price) / compareAtPrice) * 100
  inStock: true,
  includedProducts: [
    { productId: '[PRODUCT_ID]', productName: '[PRODUCT NAME]', quantity: [QTY] },
    // Add more products as needed
  ],
  variants: []
},
```

## Product Detail Bundle (ProductDetailPage.tsx)

```typescript
'[bundle-slug]': {
  id: 'bundle-X',
  name: '[BUNDLE NAME]',
  slug: '[bundle-slug]',
  category: 'Bundle Deals',
  shortDescription: '[SHORT DESCRIPTION]',
  overview: '[DETAILED OVERVIEW - 2-3 sentences about the bundle]',
  price: [BUNDLE_PRICE],
  compareAtPrice: [ORIGINAL_TOTAL],
  stock: 'In Stock',
  images: ['/[bundle-image-white].webp', '/[bundle-image-colorful].webp'],
  features: [
    '[Feature 1]',
    '[Feature 2]',
    '[Feature 3]',
    'Save R[AMOUNT] compared to buying individually'
  ],
  howToUse: [
    '[Step 1]',
    '[Step 2]',
    '[Step 3]',
    '[Step 4]'
  ],
  ingredients: {
    inci: ['See individual product pages for full ingredient lists'],
    key: [
      '[Product 1] – [Description]',
      '[Product 2] – [Description]',
      '[Product 3] – [Description]'
    ]
  },
  includedProducts: [
    { id: '[PRODUCT_ID]', name: '[PRODUCT NAME]', quantity: [QTY], price: [PRICE] },
    // Add more products as needed
  ],
  details: {
    bundleValue: 'R[ORIGINAL_TOTAL]',
    bundlePrice: 'R[BUNDLE_PRICE]',
    savings: 'R[SAVINGS] ([X]% off)',
    totalItems: '[X] products included'
  },
  variants: [],
  rating: 0,
  reviewCount: 0,
  reviews: []
}
```

---

## Example Bundle (Fully Filled Out)

### Shop Page:
```typescript
{
  id: 'bundle-3',
  name: 'Professional Tools Bundle',
  slug: 'professional-tools-bundle',
  price: 350,
  compareAtPrice: 415,
  short_description: 'Essential tools for every nail tech - save R65!',
  shortDescription: 'Essential tools for every nail tech - save R65!',
  description: 'Complete set of professional nail tools for perfect manicures every time.',
  images: ['/bundle-tools-white.webp', '/bundle-tools-colorful.webp'],
  category: 'bundle-deals',
  rating: 0,
  reviews: 0,
  badges: ['Bundle', 'Save 16%'],
  inStock: true,
  includedProducts: [
    { productId: '6', productName: 'Nail File (80/80 Grit)', quantity: 2 },
    { productId: '7', productName: 'Nail Forms', quantity: 1 },
    { productId: '8', productName: 'Crystal Kolinsky Sculpting Brush', quantity: 1 }
  ],
  variants: []
},
```

### Product Detail:
```typescript
'professional-tools-bundle': {
  id: 'bundle-3',
  name: 'Professional Tools Bundle',
  slug: 'professional-tools-bundle',
  category: 'Bundle Deals',
  shortDescription: 'Essential tools for every nail tech - save R65!',
  overview: 'Our Professional Tools Bundle includes everything you need to create flawless nail art. Perfect for both salon professionals and home enthusiasts, this bundle combines quality tools at an unbeatable price.',
  price: 350,
  compareAtPrice: 415,
  stock: 'In Stock',
  images: ['/bundle-tools-white.webp', '/bundle-tools-colorful.webp'],
  features: [
    'Professional-grade nail tools',
    'Perfect for salon or home use',
    'Save R65 compared to buying individually',
    'Everything needed for perfect nail prep and application',
    'Durable and long-lasting construction'
  ],
  howToUse: [
    'Use nail files to shape and smooth nail edges',
    'Apply nail forms for perfect extension placement',
    'Use sculpting brush with acrylic for precise application',
    'Clean and sanitize all tools after each use',
    'Store in a clean, dry place for longevity'
  ],
  ingredients: {
    inci: ['See individual product pages for full product specifications'],
    key: [
      'Nail File – 80/80 grit for shaping and finishing',
      'Nail Forms – 300 forms per roll with holographic guide',
      'Sculpting Brush – Professional Kolinsky bristles'
    ]
  },
  includedProducts: [
    { id: '6', name: 'Nail File (80/80 Grit)', quantity: 2, price: 70 },
    { id: '7', name: 'Nail Forms', quantity: 1, price: 290 },
    { id: '8', name: 'Crystal Kolinsky Sculpting Brush', quantity: 1, price: 55 }
  ],
  details: {
    bundleValue: 'R415',
    bundlePrice: 'R350',
    savings: 'R65 (16% off)',
    totalItems: '4 items included (2 files + 1 forms + 1 brush)'
  },
  variants: [],
  rating: 0,
  reviewCount: 0,
  reviews: []
}
```

---

## Quick Reference

### Product IDs (from ShopPage.tsx)
- '1' = Cuticle Oil (R140)
- '2' = Vitamin Primer (R210)
- '3' = Prep Solution (R200)
- '4' = Top Coat (R190)
- '5' = Fairy Dust Top Coat (R195)
- '6' = Nail File (R35)
- '7' = Nail Forms (R290)
- '8' = Crystal Kolinsky Sculpting Brush (R450)
- '9' = Core Acrylics (R280)
- '10' = Nail Liquid/Monomer (R380)

### Tips for Creating Bundles
1. **Pricing**: Aim for 10-25% discount to make bundles attractive
2. **Product Selection**: Group complementary products that are often used together
3. **Images**: Create custom bundle images showing all products together
4. **Descriptions**: Clearly explain the value proposition and what customers get
5. **Badge**: Always include both "Bundle" and "Save X%" badges for visibility

### Calculating Savings
```javascript
// Original total price
const originalTotal = product1Price + product2Price + product3Price;

// Your bundle price (discounted)
const bundlePrice = 500; // Your chosen price

// Calculate savings
const savings = originalTotal - bundlePrice;
const savingsPercentage = Math.round((savings / originalTotal) * 100);

// Use in badges: ['Bundle', `Save ${savingsPercentage}%`]
```

---

## Image Requirements

### Bundle Images Needed:
- White background version (e.g., `/bundle-name-white.webp`)
- Colorful/styled version (e.g., `/bundle-name-colorful.webp`)

### Image Specifications:
- Format: WebP (recommended) or JPG/PNG
- Dimensions: 800x800px minimum (square aspect ratio)
- Background: White for first image, creative for second
- Content: Show all products in the bundle arranged attractively
- File size: Keep under 200KB for fast loading

---

## Testing Checklist

After adding a new bundle:
- [ ] Bundle appears in "Bundle Deals" category on shop page
- [ ] Bundle displays correctly in grid and list view
- [ ] Clicking bundle card navigates to bundle detail page
- [ ] Bundle detail page shows all included products
- [ ] Savings percentage displays correctly
- [ ] "Add to Cart" button works
- [ ] Price comparison shows strikethrough original price
- [ ] All images load properly
- [ ] Mobile responsive layout looks good
- [ ] "What's Included" accordion expands/collapses correctly

---

## Support

For questions or help with bundle creation:
- Review existing bundles in `ShopPage.tsx` for reference
- Check `ProductDetailPage.tsx` for bundle structure
- Ensure all product IDs match existing products
- Test thoroughly on both desktop and mobile

Happy bundling! 🎉

