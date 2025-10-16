// Cart state management and utilities
import { Product, ProductVariant } from './supabase';

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: {
    title: string;
    option1?: string;
    option2?: string;
    option3?: string;
  };
}

export interface CartState {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  cartId: string;
}

class CartStore {
  private static instance: CartStore;
  private state: CartState;
  private listeners: ((state: CartState) => void)[] = [];
  private storageKey = 'blom_cart';

  private constructor() {
    this.state = this.loadFromStorage();
    this.normalizeState();
    this.updateTotals();
  }

  static getInstance(): CartStore {
    if (!CartStore.instance) {
      CartStore.instance = new CartStore();
    }
    return CartStore.instance;
  }

  private loadFromStorage(): CartState {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          cartId: parsed.cartId || this.generateCartId()
        };
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
    }

    return {
      items: [],
      subtotal: 0,
      shipping: 0,
      tax: 0,
      total: 0,
      cartId: this.generateCartId()
    };
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }

  // Ensure legacy/invalid items are fixed so actions like delete work reliably
  private normalizeState(): void {
    let didChange = false;
    if (!Array.isArray(this.state.items)) {
      this.state.items = [];
      didChange = true;
    }

    this.state.items = this.state.items.map((item, index) => {
      const normalized = { ...item } as CartItem;
      if (!normalized.id || typeof normalized.id !== 'string') {
        normalized.id = `item_${Date.now()}_${index}`;
        didChange = true;
      }
      if (!normalized.quantity || normalized.quantity < 1) {
        normalized.quantity = 1;
        didChange = true;
      }
      return normalized;
    });

    if (didChange) {
      this.saveToStorage();
    }
  }

  private generateCartId(): string {
    return 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private updateTotals(): void {
    this.state.subtotal = this.state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Free shipping over R1500
    this.state.shipping = this.state.subtotal >= 500 ? 0 : 50;
    
    // 15% VAT
    this.state.tax = Math.round((this.state.subtotal + this.state.shipping) * 0.15);
    
    this.state.total = this.state.subtotal + this.state.shipping + this.state.tax;
    
    this.saveToStorage();
    this.notifyListeners();
  }

  private notifyListeners(): void {
    // Emit a fresh snapshot so React state updates always detect changes
    const snapshot: CartState = {
      ...this.state,
      items: this.state.items.map(item => ({ ...item }))
    };
    this.listeners.forEach(listener => listener(snapshot));
  }

  subscribe(listener: (state: CartState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getState(): CartState {
    return { ...this.state };
  }

  addItem(item: Omit<CartItem, 'quantity'>, quantity: number = 1): void {
    const existingIndex = this.state.items.findIndex(
      cartItem => cartItem.productId === item.productId && cartItem.variantId === item.variantId
    );

    if (existingIndex >= 0) {
      this.state.items[existingIndex].quantity += quantity;
    } else {
      this.state.items.push({ ...item, quantity });
    }

    // Track Google Analytics event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'add_to_cart', {
        currency: 'ZAR',
        value: item.price * quantity,
        items: [{
          item_id: item.productId,
          item_name: item.name,
          category: 'Nail Care Products',
          quantity: quantity,
          price: item.price
        }]
      });
    }

    this.updateTotals();
  }

  updateQuantity(itemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(itemId);
      return;
    }

    const item = this.state.items.find(item => item.id === itemId);
    if (item) {
      item.quantity = quantity;
      this.updateTotals();
    }
  }

  removeItem(itemIdOrProductId: string): void {
    const beforeLength = this.state.items.length;
    this.state.items = this.state.items.filter(
      item => item.id !== itemIdOrProductId && item.productId !== itemIdOrProductId
    );
    if (this.state.items.length !== beforeLength) {
      this.updateTotals();
    } else {
      // No change detected; still notify to refresh UI if needed
      this.notifyListeners();
    }
  }

  clearCart(): void {
    this.state.items = [];
    this.state.cartId = this.generateCartId();
    this.updateTotals();
  }

  getItemCount(): number {
    return this.state.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}

export const cartStore = CartStore.getInstance();

// Utility functions
export const formatPrice = (price: number): string => {
  return `R${price.toFixed(2)}`;
};

export const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success'): void => {
  // Don't show notification on mobile
  if (window.innerWidth < 768) {
    return;
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.className = `cart-notification ${type === 'success' ? 'show' : ''}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 400);
  }, 3000);
};
