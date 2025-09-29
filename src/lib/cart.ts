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

  private generateCartId(): string {
    return 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private updateTotals(): void {
    this.state.subtotal = this.state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Free shipping over R500
    this.state.shipping = this.state.subtotal >= 500 ? 0 : 50;
    
    // 15% VAT
    this.state.tax = Math.round((this.state.subtotal + this.state.shipping) * 0.15);
    
    this.state.total = this.state.subtotal + this.state.shipping + this.state.tax;
    
    this.saveToStorage();
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
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

  removeItem(itemId: string): void {
    this.state.items = this.state.items.filter(item => item.id !== itemId);
    this.updateTotals();
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
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-x-full ${
    type === 'success' ? 'bg-green-500' : 
    type === 'error' ? 'bg-red-500' : 
    'bg-blue-500'
  }`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.classList.remove('translate-x-full');
  }, 100);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.add('translate-x-full');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
};