// PayFast integration utilities
import MD5 from 'crypto-js/md5';

export interface PayFastPaymentData {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first: string;
  name_last: string;
  email_address: string;
  cell_number?: string;
  m_payment_id: string;
  amount: string;
  item_name: string;
  item_description?: string;
  custom_str1?: string;
  custom_str2?: string;
  custom_str3?: string;
  custom_str4?: string;
  custom_str5?: string;
  email_confirmation?: '1' | '0';
  confirmation_address?: string;
}

export interface PayFastConfig {
  merchantId: string;
  merchantKey: string;
  passphrase?: string;
  sandbox: boolean;
}

class PayFastService {
  private config: PayFastConfig;
  private readonly sandboxUrl = 'https://sandbox.payfast.co.za/eng/process';
  private readonly liveUrl = 'https://www.payfast.co.za/eng/process';

  constructor(config: PayFastConfig) {
    this.config = config;
  }

  /**
   * Generate PayFast payment form data
   */
  generatePaymentData(orderData: {
    orderId: string;
    amount: number;
    customerInfo: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
    };
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  }): PayFastPaymentData {
    const baseUrl = window.location.origin;
    
    const paymentData: PayFastPaymentData = {
      merchant_id: this.config.merchantId,
      merchant_key: this.config.merchantKey,
      return_url: `${baseUrl}/order-confirmation`,
      cancel_url: `${baseUrl}/checkout`,
      notify_url: `${baseUrl}/api/payfast/itn`,
      name_first: orderData.customerInfo.firstName,
      name_last: orderData.customerInfo.lastName,
      email_address: orderData.customerInfo.email,
      cell_number: orderData.customerInfo.phone,
      m_payment_id: orderData.orderId,
      amount: orderData.amount.toFixed(2),
      item_name: this.generateItemName(orderData.items),
      item_description: this.generateItemDescription(orderData.items),
      custom_str1: orderData.orderId,
      email_confirmation: '1',
      confirmation_address: orderData.customerInfo.email
    };

    return paymentData;
  }

  /**
   * Generate signature for PayFast
   */
  generateSignature(data: PayFastPaymentData): string {
    // Remove signature and hash from data
    const { ...signatureData } = data;
    
    // Create parameter string - PayFast specific encoding
    const paramString = Object.keys(signatureData)
      .sort()
      .map(key => {
        const value = signatureData[key as keyof PayFastPaymentData] || '';
        return `${key}=${encodeURIComponent(value).replace(/%20/g, '+')}`;
      })
      .join('&');

    // Add passphrase if provided
    const stringToHash = this.config.passphrase 
      ? `${paramString}&passphrase=${encodeURIComponent(this.config.passphrase).replace(/%20/g, '+')}`
      : paramString;

    // Generate MD5 hash using crypto-js
    return MD5(stringToHash).toString();
  }

  /**
   * Create PayFast payment form
   */
  createPaymentForm(paymentData: PayFastPaymentData): HTMLFormElement {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = this.config.sandbox ? this.sandboxUrl : this.liveUrl;

    // Add signature
    const dataWithSignature = {
      ...paymentData,
      signature: this.generateSignature(paymentData)
    };

    // Create hidden inputs
    Object.entries(dataWithSignature).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      }
    });

    return form;
  }

  /**
   * Redirect to PayFast payment page
   */
  redirectToPayment(orderData: {
    orderId: string;
    amount: number;
    customerInfo: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
    };
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  }): void {
    const paymentData = this.generatePaymentData(orderData);
    const form = this.createPaymentForm(paymentData);
    
    // Add form to document and submit
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }

  /**
   * Validate PayFast ITN (Instant Transaction Notification)
   */
  async validateITN(itnData: Record<string, string>): Promise<boolean> {
    try {
      // Verify signature
      const { signature, ...dataToVerify } = itnData;
      const calculatedSignature = this.generateSignature(dataToVerify as PayFastPaymentData);
      
      if (signature !== calculatedSignature) {
        console.error('PayFast ITN signature mismatch');
        return false;
      }

      // Verify with PayFast servers
      const verifyUrl = this.config.sandbox 
        ? 'https://sandbox.payfast.co.za/eng/query/validate'
        : 'https://www.payfast.co.za/eng/query/validate';

      const response = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(itnData).toString()
      });

      const result = await response.text();
      return result === 'VALID';
    } catch (error) {
      console.error('PayFast ITN validation error:', error);
      return false;
    }
  }

  private generateItemName(items: Array<{ name: string; quantity: number }>): string {
    if (items.length === 1) {
      return `${items[0].name} (x${items[0].quantity})`;
    }
    return `BLOM Order (${items.length} items)`;
  }

  private generateItemDescription(items: Array<{ name: string; quantity: number; price: number }>): string {
    return items
      .map(item => `${item.name} (x${item.quantity}) - R${item.price.toFixed(2)}`)
      .join(', ');
  }

}

// PayFast configuration
const payfastConfig: PayFastConfig = {
  merchantId: process.env.PAYFAST_MERCHANT_ID || '10000100',
  merchantKey: process.env.PAYFAST_MERCHANT_KEY || '46f0cd694581a',
  passphrase: process.env.PAYFAST_PASSPHRASE,
  sandbox: process.env.NODE_ENV !== 'production'
};

export const payfast = new PayFastService(payfastConfig);

// Order storage utilities
export interface StoredOrder {
  orderId: string;
  cartId: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
  };
  items: Array<{
    id: string;
    productId: string;
    variantId?: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
  paymentMethod: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

class OrderStore {
  private storageKey = 'blom_orders';

  storeOrder(order: StoredOrder): void {
    try {
      const orders = this.getOrders();
      orders[order.orderId] = order;
      localStorage.setItem(this.storageKey, JSON.stringify(orders));
    } catch (error) {
      console.error('Error storing order:', error);
    }
  }

  getOrder(orderId: string): StoredOrder | null {
    try {
      const orders = this.getOrders();
      return orders[orderId] || null;
    } catch (error) {
      console.error('Error retrieving order:', error);
      return null;
    }
  }

  getOrders(): Record<string, StoredOrder> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading orders:', error);
      return {};
    }
  }

  updateOrderStatus(orderId: string, status: StoredOrder['status']): void {
    try {
      const order = this.getOrder(orderId);
      if (order) {
        order.status = status;
        order.updatedAt = new Date().toISOString();
        this.storeOrder(order);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  }

  generateOrderId(): string {
    return 'BLOM-' + Date.now().toString() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
}

export const orderStore = new OrderStore();