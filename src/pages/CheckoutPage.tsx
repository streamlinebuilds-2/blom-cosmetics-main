import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { cartStore, CartState, formatPrice } from '../lib/cart';
import { CreditCard, Truck, Shield, Lock, MapPin, Phone, Mail, User, CreditCard as Edit, Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const [cartState, setCartState] = useState<CartState>(cartStore.getState());
  const [step, setStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'South Africa'
  });

  const [paymentInfo, setPaymentInfo] = useState({
    method: 'payfast',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });

  useEffect(() => {
    const unsubscribe = cartStore.subscribe(setCartState);
    return unsubscribe;
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartState.items.length === 0) {
      window.location.href = '/shop';
    }
  }, [cartState.items.length]);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    cartStore.updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId: string) => {
    cartStore.removeItem(itemId);
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('review');
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear cart and redirect to confirmation
      cartStore.clearCart();
      window.location.href = '/order-confirmation';
    } catch (error) {
      console.error('Order processing failed:', error);
      setIsProcessing(false);
    }
  };

  const provinces = [
    'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
    'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
  ];

  const paymentMethods = [
    {
      id: 'payfast',
      name: 'PayFast',
      description: 'Secure payment via PayFast (Cards, EFT, etc.)',
      icon: CreditCard
    },
    {
      id: 'eft',
      name: 'Direct EFT',
      description: 'Electronic Funds Transfer',
      icon: CreditCard
    }
  ];

  if (cartState.items.length === 0) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showMobileMenu={true} />

      <main className="section-padding">
        <Container>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Checkout</h1>
            <div className="flex items-center justify-center gap-4">
              <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-pink-400' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'shipping' ? 'bg-pink-400 text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <span>Shipping</span>
              </div>
              <div className="w-8 h-px bg-gray-300"></div>
              <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-pink-400' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-pink-400 text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <span>Payment</span>
              </div>
              <div className="w-8 h-px bg-gray-300"></div>
              <div className={`flex items-center gap-2 ${step === 'review' ? 'text-pink-400' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'review' ? 'bg-pink-400 text-white' : 'bg-gray-200'}`}>
                  3
                </div>
                <span>Review</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Shipping Information */}
              {step === 'shipping' && (
                <Card>
                  <CardHeader>
                    <h2 className="text-2xl font-bold">Shipping Information</h2>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleShippingSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={shippingInfo.firstName}
                            onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})}
                            className="input-field"
                            placeholder="John"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={shippingInfo.lastName}
                            onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})}
                            className="input-field"
                            placeholder="Doe"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            value={shippingInfo.email}
                            onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                            className="input-field"
                            placeholder="john@example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            required
                            value={shippingInfo.phone}
                            onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                            className="input-field"
                            placeholder="+27 XX XXX XXXX"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          required
                          value={shippingInfo.address}
                          onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                          className="input-field"
                          placeholder="123 Main Street"
                        />
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City *
                          </label>
                          <input
                            type="text"
                            required
                            value={shippingInfo.city}
                            onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                            className="input-field"
                            placeholder="Cape Town"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Province *
                          </label>
                          <select
                            required
                            value={shippingInfo.province}
                            onChange={(e) => setShippingInfo({...shippingInfo, province: e.target.value})}
                            className="input-field"
                          >
                            <option value="">Select Province</option>
                            {provinces.map((province) => (
                              <option key={province} value={province}>
                                {province}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Postal Code *
                          </label>
                          <input
                            type="text"
                            required
                            value={shippingInfo.postalCode}
                            onChange={(e) => setShippingInfo({...shippingInfo, postalCode: e.target.value})}
                            className="input-field"
                            placeholder="8001"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => window.location.href = '/shop'}
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Continue Shopping
                        </Button>
                        <Button type="submit" size="lg">
                          Continue to Payment
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Payment Information */}
              {step === 'payment' && (
                <Card>
                  <CardHeader>
                    <h2 className="text-2xl font-bold">Payment Method</h2>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePaymentSubmit} className="space-y-6">
                      {/* Payment Methods */}
                      <div className="space-y-4">
                        {paymentMethods.map((method) => (
                          <div
                            key={method.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                              paymentInfo.method === method.id
                                ? 'border-pink-400 bg-pink-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setPaymentInfo({...paymentInfo, method: method.id})}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="paymentMethod"
                                value={method.id}
                                checked={paymentInfo.method === method.id}
                                onChange={(e) => setPaymentInfo({...paymentInfo, method: e.target.value})}
                                className="text-pink-400"
                              />
                              <method.icon className="h-5 w-5 text-gray-600" />
                              <div>
                                <h3 className="font-medium">{method.name}</h3>
                                <p className="text-sm text-gray-600">{method.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Security Notice */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-5 w-5 text-blue-500" />
                          <h3 className="font-medium text-blue-900">Secure Payment</h3>
                        </div>
                        <p className="text-sm text-blue-800">
                          Your payment information is encrypted and secure. We use industry-standard 
                          SSL encryption to protect your data.
                        </p>
                      </div>

                      <div className="flex justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStep('shipping')}
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Back to Shipping
                        </Button>
                        <Button type="submit" size="lg">
                          Review Order
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Order Review */}
              {step === 'review' && (
                <Card>
                  <CardHeader>
                    <h2 className="text-2xl font-bold">Review Your Order</h2>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Shipping Address */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">Shipping Address</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setStep('shipping')}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="font-medium">{shippingInfo.firstName} {shippingInfo.lastName}</p>
                        <p>{shippingInfo.address}</p>
                        <p>{shippingInfo.city}, {shippingInfo.province} {shippingInfo.postalCode}</p>
                        <p>{shippingInfo.country}</p>
                        <p className="mt-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4 inline mr-1" />
                          {shippingInfo.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          <Phone className="h-4 w-4 inline mr-1" />
                          {shippingInfo.phone}
                        </p>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">Payment Method</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setStep('payment')}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="font-medium">
                          {paymentMethods.find(m => m.id === paymentInfo.method)?.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {paymentMethods.find(m => m.id === paymentInfo.method)?.description}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h3 className="font-medium mb-3">Order Items</h3>
                      <div className="space-y-3">
                        {cartState.items.map((item) => (
                          <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium">{item.name}</h4>
                              {item.variant && (
                                <p className="text-sm text-gray-500">{item.variant.title}</p>
                              )}
                              <p className="text-pink-400 font-bold">{formatPrice(item.price)}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">Qty: {item.quantity}</p>
                              <p className="text-pink-400 font-bold">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep('payment')}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Payment
                      </Button>
                      <Button
                        size="lg"
                        onClick={handlePlaceOrder}
                        loading={isProcessing}
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        {isProcessing ? 'Processing...' : `Place Order - ${formatPrice(cartState.total)}`}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <h3 className="text-xl font-bold">Order Summary</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cartState.items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{item.name}</h4>
                          {item.variant && (
                            <p className="text-xs text-gray-500">{item.variant.title}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Qty: {item.quantity}</span>
                            <span className="text-pink-400 font-bold text-sm">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>{formatPrice(cartState.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping:</span>
                      <span>{cartState.shipping === 0 ? 'Free' : formatPrice(cartState.shipping)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax (VAT):</span>
                      <span>{formatPrice(cartState.tax)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{formatPrice(cartState.total)}</span>
                    </div>
                  </div>

                  {/* Shipping Notice */}
                  {cartState.subtotal < 500 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        Add {formatPrice(1500 - cartState.subtotal)} more for free shipping!
                      </p>
                    </div>
                  )}

                  {/* Security Badges */}
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span>Secure checkout</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Truck className="h-4 w-4 text-blue-500" />
                      <span>Fast delivery</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Lock className="h-4 w-4 text-purple-500" />
                      <span>SSL encrypted</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
};
