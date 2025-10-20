export interface BundleProduct {
  productId: string;
  productName: string;
  quantity: number;
}

export interface Bundle {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number; // Original total price
  shortDescription: string;
  description: string;
  images: string[];
  category: 'bundle-deals';
  includedProducts: BundleProduct[];
  badges: string[];
  inStock: boolean;
  savings: number; // Calculated: compareAtPrice - price
  savingsPercentage: number; // Calculated percentage
}

