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
 */
export function matchesScope(item: ProductItem, discount: Discount): boolean {
  const { scope } = discount;
  
  // Check product-specific scope
  if (scope.products && scope.products.length > 0) {
    if (!scope.products.includes(item.slug)) {
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
 */
export async function loadDiscounts(): Promise<Discount[]> {
  try {
    // Try to load from static imports first
    const discountModules = await Promise.allSettled([
      import('../../content/discounts/weekly-specials.json'),
      import('../../content/discounts/seasonal.json'),
      import('../../content/discounts/coupons.json')
    ]);
    
    const discounts: Discount[] = [];
    
    discountModules.forEach(result => {
      if (result.status === 'fulfilled' && result.value.default) {
        discounts.push(...result.value.default);
      }
    });
    
    return discounts;
  } catch (error) {
    console.warn('Could not load discounts from static imports, trying fetch:', error);
    
    // Fallback to fetch if static imports fail
    try {
      const responses = await Promise.allSettled([
        fetch('/content/discounts/weekly-specials.json'),
        fetch('/content/discounts/seasonal.json'),
        fetch('/content/discounts/coupons.json')
      ]);
      
      const discounts: Discount[] = [];
      
      for (const response of responses) {
        if (response.status === 'fulfilled' && response.value.ok) {
          const data = await response.value.json();
          discounts.push(...data);
        }
      }
      
      return discounts;
    } catch (fetchError) {
      console.error('Failed to load discounts:', fetchError);
      return [];
    }
  }
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
