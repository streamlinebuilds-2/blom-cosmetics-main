export interface Discount {
  id: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'bogo' | 'threshold';
  value: number; // percentage (0-100) or fixed amount
  currency?: string;
  scope: {
    products?: string[]; // product slugs
    categories?: string[]; // category slugs
    minQuantity?: number;
    minSubtotal?: number;
  };
  conditions: {
    startDate: string; // ISO string
    endDate: string; // ISO string
    couponCode?: string; // optional coupon requirement
    maxUses?: number;
    userLimit?: number;
  };
  badge?: {
    text: string;
    color: string;
  };
}

export interface DiscountContext {
  nowISO: string;
  couponCode?: string;
  subtotal?: number;
  userId?: string;
}

export interface ProductItem {
  id: string; // Simple product ID or variant ID
  productId?: string; // Parent product ID for variants
  slug: string;
  category: string;
  type: 'product' | 'bundle';
  price: number;
  currency: string;
  quantity?: number;
}

/**
 * Check if a discount is currently active
 */
export function isActive(nowISO: string, discount: Discount): boolean {
  const now = new Date(nowISO);
  const startDate = new Date(discount.conditions.startDate);
  const endDate = new Date(discount.conditions.endDate);
  
  return now >= startDate && now <= endDate;
}

/**
 * Check if a discount applies to a specific item
 * Updated to handle both simple products and variants
 */
export function matchesScope(item: ProductItem, discount: Discount): boolean {
  const { scope } = discount;
  
  // Check product-specific scope
  if (scope.products && scope.products.length > 0) {
    // Check if discount applies to this item's slug (simple product)
    // OR to this item's productId (parent product for variants)
    const itemSlug = item.slug;
    const parentProductId = item.productId;
    
    const matchesSlug = scope.products.includes(itemSlug);
    const matchesParent = parentProductId ? scope.products.includes(parentProductId) : false;
    
    if (!matchesSlug && !matchesParent) {
      return false;
    }
  }
  
  // Check category scope
  if (scope.categories && scope.categories.length > 0) {
    if (!scope.categories.includes(item.category)) {
      return false;
    }
  }
  
  // Check minimum quantity
  if (scope.minQuantity && (item.quantity || 1) < scope.minQuantity) {
    return false;
  }
  
  return true;
}

/**
 * Apply a discount to a price
 */
export function applyDiscount(price: number, discount: Discount): number {
  switch (discount.type) {
    case 'percentage':
      return price * (1 - discount.value / 100);
    case 'fixed':
      return Math.max(0, price - discount.value);
    case 'bogo':
      // Buy one get one free - for now, treat as 50% off
      return price * 0.5;
    case 'threshold':
      // Threshold discounts are handled at cart level
      return price;
    default:
      return price;
  }
}

/**
 * Compute the final price for an item considering all applicable discounts
 */
export function computeFinalPrice(
  item: ProductItem, 
  discounts: Discount[], 
  context: DiscountContext
): {
  originalPrice: number;
  finalPrice: number;
  discount?: Discount;
  savings: number;
} {
  const activeDiscounts = discounts.filter(d => isActive(context.nowISO, d));
  
  // Find the best applicable discount
  let bestDiscount: Discount | undefined;
  let bestPrice = item.price;
  
  for (const discount of activeDiscounts) {
    // Check coupon code requirement
    if (discount.conditions.couponCode && discount.conditions.couponCode !== context.couponCode) {
      continue;
    }
    
    // Check if discount applies to this item
    if (!matchesScope(item, discount)) {
      continue;
    }
    
    // Check subtotal requirement for threshold discounts
    if (discount.type === 'threshold' && discount.scope.minSubtotal) {
      if (!context.subtotal || context.subtotal < discount.scope.minSubtotal) {
        continue;
      }
    }
    
    const discountedPrice = applyDiscount(item.price, discount);
    
    // Take the best discount (lowest price)
    if (discountedPrice < bestPrice) {
      bestPrice = discountedPrice;
      bestDiscount = discount;
    }
  }
  
  return {
    originalPrice: item.price,
    finalPrice: bestPrice,
    discount: bestDiscount,
    savings: item.price - bestPrice
  };
}

/**
 * Load discounts from content directory
 * Discount system is currently disabled
 */
export async function loadDiscounts(): Promise<Discount[]> {
  // Discount system is disabled - return empty array
  return [];
}

/**
 * Format discount badge text
 */
export function formatDiscountBadge(discount: Discount): string {
  switch (discount.type) {
    case 'percentage':
      return `${discount.value}% OFF`;
    case 'fixed':
      return `R${discount.value} OFF`;
    case 'bogo':
      return 'BOGO';
    case 'threshold':
      return 'SPECIAL';
    default:
      return 'SALE';
  }
}

/**
 * Get discount badge color
 */
export function getDiscountBadgeColor(discount: Discount): string {
  return discount.badge?.color || 'bg-red-500';
}
