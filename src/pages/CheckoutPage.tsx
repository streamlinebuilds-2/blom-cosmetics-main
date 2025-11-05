import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { cartStore, CartState, formatPrice } from '../lib/cart';
import { CreditCard, Truck, Shield, Lock, MapPin, Phone, Mail, CreditCard as Edit, Plus, Minus, ArrowLeft, Heart, Trash2 } from 'lucide-react';
import { wishlistStore } from '../lib/wishlist';
import { AddressAutocomplete } from '../components/checkout/AddressAutocomplete';
import { validateMobileNumber, validateAddress, formatMobileNumber } from '../lib/validation';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export const CheckoutPage: React.FC = () => {
  const [cartState, setCartState] = useState<CartState>(cartStore.getState());
  const [step, setStep] = useState<'shipping' | 'payment' | 'review'>(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get('step');
    return s === 'payment' ? 'payment' : 'shipping';
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState<{[key: string]: boolean}>({});
  
  const [shippingMethod, setShippingMethod] = useState<'store-pickup' | 'door-to-door'>('door-to-door');
  
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'South Africa',
    lockerLocation: ''
  });

  // New address fields for door-to-door delivery
  const [deliveryAddress, setDeliveryAddress] = useState({
    street_address: '',
    local_area: '',
    city: '',
    zone: '',
    code: '',
    country: 'ZA',
    lat: undefined as number | undefined,
    lng: undefined as number | undefined
  });

  // Address input for autocomplete
  const [addressInput, setAddressInput] = useState('');


  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ id: string; code: string } | null>(null);
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<{
    mobile?: string;
    address?: string[];
    pickupPoint?: string[];
  }>({});

  const [paymentInfo, setPaymentInfo] = useState({
    method: 'payfast',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });

  const [userId, setUserId] = useState<string | null>(null);

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

  // Check wishlist status for recommended products
  useEffect(() => {
    const recommendedProducts = ['nail-file', 'cuticle-oil', 'top-coat'];
    const wishlistStatus: {[key: string]: boolean} = {};
    recommendedProducts.forEach(productId => {
      wishlistStatus[productId] = wishlistStore.isInWishlist(productId);
    });
    setIsWishlisted(wishlistStatus);
  }, []);

  const handleWishlistToggle = (productId: string, productName: string, productPrice: number, productImage: string) => {
    const wishlistItem = {
      id: productId,
      productId: productId,
      name: productName,
      price: productPrice,
      image: productImage,
      slug: productId
    };
    wishlistStore.toggleItem(wishlistItem);
    setIsWishlisted(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    cartStore.updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId: string) => {
    cartStore.removeItem(itemId);
  };

  // Handle address selection from autocomplete
  const handleAddressSelect = (suggestion: any) => {
    const { properties, geometry } = suggestion;
    
    setDeliveryAddress({
      street_address: properties.address_line1 || '',
      local_area: properties.city || '',
      city: properties.city || '',
      zone: properties.state || '',
      code: properties.postcode || '',
      country: 'ZA',
      lat: geometry.coordinates[1], // lat
      lng: geometry.coordinates[0]  // lon
    });
  };

  const validateShippingForm = () => {
    const errors: { mobile?: string; address?: string[]; pickupPoint?: string[] } = {};

    // Validate mobile number (required for all methods)
    const mobileValidation = validateMobileNumber(shippingInfo.phone);
    if (!mobileValidation.isValid) {
      errors.mobile = mobileValidation.error;
    }

    // Validate based on shipping method
    if (shippingMethod === 'door-to-door') {
      const addressValidation = validateAddress(deliveryAddress);
      if (!addressValidation.isValid) {
        errors.address = addressValidation.errors;
      }
    } else if (shippingMethod === 'store-pickup') {
      return validateAddress(deliveryAddress);
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateShippingForm()) {
      return;
    }

    setStep('payment');
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch { window.scrollTo(0, 0); }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('review');
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    // Client-side check: block if cart < R500
    const productSubtotalCents = Math.round(cartState.subtotal * 100);
    if (productSubtotalCents < 50000) {
      setCouponError('Order must be over R500 (product total, excl. shipping).');
      return;
    }

    setIsApplyingCoupon(true);
    setCouponError('');

    try {
      // Calculate product subtotal in cents (excluding shipping)
      const productSubtotal = Math.round(cartState.subtotal * 100);
      
      // Get Supabase URL and key
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || (import.meta as any).env.SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || (import.meta as any).env.SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        setCouponError('Configuration error. Please try again.');
        return;
      }

      // Call RPC directly
      const res = await fetch(`${supabaseUrl}/rest/v1/rpc/redeem_coupon`, {
        method: 'POST',
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          p_code: couponCode.trim().toUpperCase(),
          p_email: shippingInfo.email || '',
          p_product_subtotal_cents: productSubtotal, // EXCLUDE shipping
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Coupon RPC error:', errorText);
        setCouponError('Failed to validate coupon. Please try again.');
        return;
      }

      const data = await res.json();
      
      // RPC returns array with single row
      const result = Array.isArray(data) ? data[0] : data;
      
      if (!result.valid) {
        setCouponError(result.message || 'Invalid coupon code');
        setDiscount(0);
        setAppliedCoupon(null);
      } else {
        // Convert discount_cents to rands
        const discountAmount = result.discount_cents / 100;
        setDiscount(discountAmount);
        setAppliedCoupon({ 
          id: couponCode.trim().toUpperCase(), // Store code as ID for now
          code: couponCode.trim().toUpperCase() 
        });
        setCouponError('');
      }

    } catch (error) {
      console.error('Coupon application error:', error);
      setCouponError('Failed to apply coupon. Please try again.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setDiscount(0);
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    try {
      // Step 1: Create order in Supabase (new payload)
      const createOrderRes = await fetch('/.netlify/functions/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyer: {
            email: shippingInfo.email,
            name: `${shippingInfo.firstName} ${shippingInfo.lastName}`.trim(),
            phone: shippingInfo.phone
          },
          shipping: {
            method: shippingMethod,
            address: shippingMethod === 'door-to-door' ? deliveryAddress : null
          },
          items: cartState.items.map((it) => ({
            product_id: it.productId || it.id,
            name: it.name,
            unit_price: it.price,
            quantity: it.quantity,
          })),
          totals: {
            subtotal_cents: Math.round(cartState.subtotal * 100),
            shipping_cents: Math.round(shippingCost * 100),
            tax_cents: 0
          },
          coupon: appliedCoupon ? { code: appliedCoupon.code } : null
        })
      });

      if (!createOrderRes.ok) {
        let errorMessage = 'Failed to create order';
        try {
          const errData = await createOrderRes.json();
          errorMessage = errData.error || errData.details?.message || errorMessage;
          console.error('Create order error:', errData);
        } catch (e) {
          console.error('Failed to parse error response:', e);
          errorMessage = `Server error: ${createOrderRes.status} ${createOrderRes.statusText}`;
        }
        alert(`Checkout Error: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      const orderData = await createOrderRes.json();
      const orderId = orderData.order_id;
      const totalCents = orderData.total_cents;

      // Store order locally before redirecting
      localStorage.setItem('blom_pending_order', JSON.stringify({
        orderId,
        cartItems: cartState.items,
        total: totalCents / 100,
        shipping: shippingCost,
        shippingMethod,
        shippingInfo,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        couponDiscount: orderData.discount_cents ? orderData.discount_cents / 100 : discount,
        timestamp: new Date().toISOString()
      }));

      // Step 2: Prepare PayFast payment with order ID
      const paymentData = {
        m_payment_id: orderId,
        amount: (totalCents / 100).toFixed(2),
        item_name: `BLOM Order (${cartState.items.length} items)`,
        name_first: shippingInfo.firstName,
        name_last: shippingInfo.lastName,
        email_address: shippingInfo.email,
        cell_number: formatMobileNumber(shippingInfo.phone),
        items: cartState.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        coupon: appliedCoupon ? { code: appliedCoupon.code } : null,
        shippingInfo: {
          ...shippingInfo,
          method: shippingMethod,
          cost: shippingCost,
          // Door-to-door delivery fields
          ...(shippingMethod === 'door-to-door' && {
            ship_to_street: deliveryAddress.street_address,
            ship_to_suburb: deliveryAddress.local_area,
            ship_to_city: deliveryAddress.city,
            ship_to_zone: deliveryAddress.zone,
            ship_to_postal_code: deliveryAddress.code,
            ship_to_country: deliveryAddress.country,
            ship_to_lat: deliveryAddress.lat,
            ship_to_lng: deliveryAddress.lng
          })
        }
      };

      // Step 3: Use PayFast checkout function to get signed form data
      // Send in the format backend expects: m_payment_id, amount, name_first, etc.
      const pfRequestBody = {
        m_payment_id: orderData.merchant_payment_id,
        amount: (totalCents / 100).toFixed(2),
        name_first: shippingInfo.firstName,
        name_last: shippingInfo.lastName,
        email_address: shippingInfo.email,
        item_name: `BLOM Order ${orderData.merchant_payment_id}`,
        order_id: orderId,
        coupon: appliedCoupon ? { code: appliedCoupon.code } : null
      };
      
      console.log('🔍 PayFast request:', pfRequestBody);
      
      const pfResponse = await fetch('/.netlify/functions/payfast-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pfRequestBody)
      });

      if (!pfResponse.ok) {
        const pfError = await pfResponse.json().catch(() => ({ error: 'PayFast initiation failed' }));
        console.error('❌ PayFast checkout error:', pfError);
        alert(`PayFast Error: ${JSON.stringify(pfError, null, 2)}`);
        throw new Error(pfError.error || 'Payment initiation failed');
      }

      const pfData = await pfResponse.json();
      console.log('✅ PayFast response:', pfData);
      
      // New format: backend returns a redirect URL with all params already encoded
      const redirectUrl = pfData.redirect || pfData.url;
      
      if (!redirectUrl) {
        // Fallback: if old format (endpoint + fields), build form as before
        const pfUrl = pfData.endpoint || 'https://www.payfast.co.za/eng/process';
        const pfFields = pfData.fields || {};
        
        console.log('🚀 Submitting to (fallback):', pfUrl);
        
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = pfUrl;
        
        Object.entries(pfFields).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = String(value);
            form.appendChild(input);
          }
        });
        
        document.body.appendChild(form);
        form.submit();
      } else {
        // New format: simple redirect to pre-built URL
        console.log('🚀 Redirecting to PayFast:', redirectUrl);
        window.location.href = redirectUrl;
      }
      
    } catch (error: any) {
      console.error('Order processing failed:', error);
      alert(error.message || 'Payment initiation failed. Please try again.');
      setIsProcessing(false);
    }
  };

  // Calculate shipping cost
  const calculateShipping = () => {
    if (shippingMethod === 'store-pickup') return 0;
    // Door-to-door: Free over R1500, otherwise R120 (use items subtotal)
    return cartState.subtotal >= 1500 ? 0 : 120;
  };

  const shippingCost = calculateShipping();
  const orderTotal = cartState.subtotal + shippingCost - discount;

  const paymentMethods = [
    {
      id: 'payfast',
      name: 'PayFast',
      description: 'Secure payment via PayFast (Cards, EFT, etc.)',
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
              <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-gray-900' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'shipping' ? 'bg-pink-400 text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <span>Shipping</span>
              </div>
              <div className="w-8 h-px bg-gray-300"></div>
              <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-gray-900' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-pink-400 text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <span>Payment</span>
              </div>
              <div className="w-8 h-px bg-gray-300"></div>
              <div className={`flex items-center gap-2 ${step === 'review' ? 'text-gray-900' : 'text-gray-400'}`}>
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
                      
                      {/* Shipping Method Selection */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Truck className="h-5 w-5 text-gray-500" />
                          Choose Your Delivery Option
                        </h3>
                        <div className="space-y-3">
                          
                          {/* Store Pickup */}
                          <label 
                            className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              shippingMethod === 'store-pickup'
                                ? 'border-gray-900 bg-gray-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="radio"
                                name="shippingMethod"
                                value="store-pickup"
                                checked={shippingMethod === 'store-pickup'}
                                onChange={(e) => setShippingMethod(e.target.value as any)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-semibold text-gray-900">Collect from BLOM HQ, Randfontein</span>
                                  <span className="text-lg font-bold text-gray-900">FREE</span>
                                </div>
                                <p className="text-sm text-gray-600">Ready within 24 hours. We'll WhatsApp you when it's ready.</p>
                                <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Free Pickup</span>
                              </div>
                            </div>
                          </label>

                          {/* Door-to-Door */}
                          <label 
                            className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              shippingMethod === 'door-to-door'
                                ? 'border-gray-900 bg-gray-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="radio"
                                name="shippingMethod"
                                value="door-to-door"
                                checked={shippingMethod === 'door-to-door'}
                                onChange={(e) => setShippingMethod(e.target.value as any)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-semibold text-gray-900">Door-to-Door Delivery</span>
                                  <span className="text-lg font-bold text-gray-900">
                                    {cartState.subtotal >= 1500 ? 'FREE' : 'R120'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">Delivered to your address. 2–5 business days.</p>
                                {cartState.subtotal >= 1500 && (
                                  <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Free over R1500</span>
                                )}
                                {cartState.subtotal < 1500 && (
                                  <p className="text-xs text-gray-500 mt-1">Add R{(1500 - cartState.subtotal).toFixed(2)} more for free delivery!</p>
                                )}
                              </div>
                            </div>
                          </label>
                          
                        </div>
                      </div>


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
                            Mobile Number * <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            value={shippingInfo.phone}
                            onChange={(e) => {
                              setShippingInfo({...shippingInfo, phone: e.target.value});
                              // Clear mobile validation error when user types
                              if (validationErrors.mobile) {
                                setValidationErrors({...validationErrors, mobile: undefined});
                              }
                            }}
                            className={`input-field ${validationErrors.mobile ? 'border-red-500 focus:ring-red-500' : ''}`}
                            placeholder="+27 XX XXX XXXX or 0XX XXX XXXX"
                          />
                          {validationErrors.mobile && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.mobile}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Required for delivery notifications and pickup PIN/OTP
                          </p>
                        </div>
                      </div>

                      {/* Smart Address (only for door-to-door) */}
                      {shippingMethod === 'door-to-door' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Delivery Address <span className="text-red-500">*</span>
                            </label>
                            <AddressAutocomplete
                              value={addressInput}
                              onChange={setAddressInput}
                              onAddressSelect={handleAddressSelect}
                              placeholder="Start typing your address..."
                              className="mb-4"
                            />
                          </div>

                          {/* Auto-filled Fields */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                              <input
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none"
                                value={deliveryAddress.street_address}
                                onChange={(e) => setDeliveryAddress({...deliveryAddress, street_address: e.target.value})}
                                placeholder="Auto-filled"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                              <input
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none"
                                value={deliveryAddress.city}
                                onChange={(e) => setDeliveryAddress({...deliveryAddress, city: e.target.value})}
                                placeholder="Auto-filled"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                              <input
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none"
                                value={deliveryAddress.zone}
                                onChange={(e) => setDeliveryAddress({...deliveryAddress, zone: e.target.value})}
                                placeholder="Auto-filled"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                              <input
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none"
                                value={deliveryAddress.code}
                                onChange={(e) => setDeliveryAddress({...deliveryAddress, code: e.target.value})}
                                placeholder="Auto-filled"
                                maxLength={4}
                              />
                            </div>
                          </div>

                          <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-800">Address Tip</span>
                            </div>
                            <p className="text-xs text-gray-700">
                              Start typing your address above to get suggestions. This will auto-fill all the fields below for accurate delivery.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Validation Errors */}
                      {validationErrors.address && validationErrors.address.length > 0 && (
                        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                          <p className="text-gray-800 text-sm font-medium mb-1">Please fix the following address issues:</p>
                          <ul className="text-gray-700 text-sm list-disc list-inside">
                            {validationErrors.address.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {validationErrors.pickupPoint && validationErrors.pickupPoint.length > 0 && (
                        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                          <p className="text-gray-800 text-sm font-medium mb-1">Please fix the following pickup point issues:</p>
                          <ul className="text-gray-700 text-sm list-disc list-inside">
                            {validationErrors.pickupPoint.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row justify-between gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full sm:w-auto"
                          onClick={() => window.location.href = '/shop'}
                        >
                          <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                          <span className="text-xs sm:text-sm">Continue Shopping</span>
                        </Button>
                        <Button type="submit" size="lg" className="w-full sm:w-auto">
                          <span className="text-xs sm:text-sm">Continue to Payment</span>
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
                                ? 'border-gray-400 bg-gray-50'
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
                                className="text-gray-400"
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
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-5 w-5 text-gray-500" />
                          <h3 className="font-medium text-gray-900">Secure Payment</h3>
                        </div>
                        <p className="text-sm text-gray-700">
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
                    {/* Fulfillment summary */}
                    {shippingMethod === 'store-pickup' ? (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium">Collection</h3>
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
                          <p className="font-medium">Collect from BLOM HQ, Randfontein</p>
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
                    ) : (
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
                          <p>{deliveryAddress.street_address}</p>
                          <p>{deliveryAddress.city}, {deliveryAddress.zone} {deliveryAddress.code}</p>
                          <p>{deliveryAddress.country}</p>
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
                    )}

                    {/* Payment Method */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">Payment Method</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setStep('payment'); try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch { window.scrollTo(0, 0); } }}
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
                              <p className="text-gray-900 font-bold">{formatPrice(item.price)}</p>
                            </div>
                            <div className="text-right">
                              <div className="inline-flex items-center gap-2 mb-1">
                                <button
                                  type="button"
                                  aria-label="Decrease quantity"
                                  onClick={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                                  className="p-1.5 rounded-full border border-gray-200 hover:bg-gray-100 active:scale-95 transition"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <button
                                  type="button"
                                  aria-label="Increase quantity"
                                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                  className="p-1.5 rounded-full border border-gray-200 hover:bg-gray-100 active:scale-95 transition"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                              <p className="text-gray-900 font-bold">
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
                        onClick={() => { setStep('payment'); try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch { window.scrollTo(0, 0); } }}
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
                        {isProcessing ? 'Processing...' : `Place Order - ${formatPrice(orderTotal)}`}
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
                          <div className="flex items-center justify-between mt-1">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                aria-label="Decrease quantity"
                                onClick={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                                className="p-1 rounded-full border border-gray-200 hover:bg-gray-100 active:scale-95 transition"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
                              <button
                                type="button"
                                aria-label="Increase quantity"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="p-1 rounded-full border border-gray-200 hover:bg-gray-100 active:scale-95 transition"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-900 font-bold text-sm">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                              <button
                                type="button"
                                aria-label="Remove item"
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-1 rounded-full hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Coupon Code */}
                  <div className="border-t pt-4">
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Coupon Code</h4>
                      {!appliedCoupon ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            placeholder="Enter code"
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
                            disabled={isApplyingCoupon}
                          />
                          <button
                            type="button"
                            onClick={handleApplyCoupon}
                            disabled={isApplyingCoupon || !couponCode.trim()}
                            className="px-4 py-2 bg-pink-400 text-white rounded-lg text-sm font-medium hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {isApplyingCoupon ? 'Applying...' : 'Apply'}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-green-800">
                              Coupon Applied: {appliedCoupon.code}
                            </p>
                            <p className="text-xs text-green-600">
                              Discount: -{formatPrice(discount)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      {couponError && (
                        <p className="text-red-600 text-xs">{couponError}</p>
                      )}
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>{formatPrice(cartState.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping:</span>
                      <span className={shippingCost === 0 ? 'text-green-600 font-medium' : ''}>
                        {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
                      </span>
                    </div>
                    {shippingMethod === 'door-to-door' && cartState.subtotal >= 1500 && (
                      <div className="flex justify-between text-xs text-green-600">
                        <span>✨ Free shipping applied!</span>
                        <span>-R120</span>
                      </div>
                    )}
                    {appliedCoupon && discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Coupon Discount:</span>
                        <span>-{formatPrice(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{formatPrice(orderTotal)}</span>
                    </div>
                  </div>

                  {/* Shipping Notice */}
                  {cartState.subtotal < 1500 && (
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

          {/* Recommended Products */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6">Recommended for you</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Nail File Set */}
              <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <img
                      src="/nail-file-white.webp"
                      alt="Nail File Set"
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">Nail File (80/80 Grit)</h4>
                      <p className="text-gray-900 font-bold">R35.00</p>
                    </div>
                  </div>
                  
                  {/* Wishlist Heart */}
                  <button
                    onClick={() => handleWishlistToggle('nail-file', 'Nail File (80/80 Grit)', 35, '/nail-file-white.webp')}
                    className={`p-2 rounded-full transition-colors ${
                      isWishlisted['nail-file']
                        ? 'text-pink-500 bg-pink-50'
                        : 'text-gray-400 hover:text-pink-500 hover:bg-pink-50'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${isWishlisted['nail-file'] ? 'fill-current' : ''}`} />
                  </button>
                </div>
                
                <button
                  onClick={() => {
                    cartStore.addItem({
                      id: `item_${Date.now()}`,
                      productId: 'nail-file',
                      name: 'Nail File (80/80 Grit)',
                      price: 35,
                      image: '/nail-file-white.webp'
                    });
                  }}
                  className="w-full bg-pink-400 hover:bg-pink-500 text-white px-6 py-2 rounded-md font-medium transition-colors"
                >
                  Add to Cart
                </button>
              </div>

              {/* Cuticle Oil */}
              <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <img
                      src="/cuticle-oil-white.webp"
                      alt="Cuticle Oil"
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">Cuticle Oil</h4>
                      <p className="text-gray-900 font-bold">R140.00</p>
                    </div>
                  </div>
                  
                  {/* Wishlist Heart */}
                  <button
                    onClick={() => handleWishlistToggle('cuticle-oil', 'Cuticle Oil', 140, '/cuticle-oil-white.webp')}
                    className={`p-2 rounded-full transition-colors ${
                      isWishlisted['cuticle-oil']
                        ? 'text-pink-500 bg-pink-50'
                        : 'text-gray-400 hover:text-pink-500 hover:bg-pink-50'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${isWishlisted['cuticle-oil'] ? 'fill-current' : ''}`} />
                  </button>
                </div>
                
                <button
                  onClick={() => {
                    cartStore.addItem({
                      id: `item_${Date.now()}`,
                      productId: 'cuticle-oil',
                      name: 'Cuticle Oil',
                      price: 140,
                      image: '/cuticle-oil-white.webp'
                    });
                  }}
                  className="w-full bg-pink-400 hover:bg-pink-500 text-white px-6 py-2 rounded-md font-medium transition-colors"
                >
                  Add to Cart
                </button>
              </div>

              {/* Top Coat */}
              <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <img
                      src="/top-coat-white.webp"
                      alt="Top Coat"
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">Top Coat</h4>
                      <p className="text-gray-900 font-bold">R190.00</p>
                    </div>
                  </div>
                  
                  {/* Wishlist Heart */}
                  <button
                    onClick={() => handleWishlistToggle('top-coat', 'Top Coat', 190, '/top-coat-white.webp')}
                    className={`p-2 rounded-full transition-colors ${
                      isWishlisted['top-coat']
                        ? 'text-pink-500 bg-pink-50'
                        : 'text-gray-400 hover:text-pink-500 hover:bg-pink-50'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${isWishlisted['top-coat'] ? 'fill-current' : ''}`} />
                  </button>
                </div>
                
                <button
                  onClick={() => {
                    cartStore.addItem({
                      id: `item_${Date.now()}`,
                      productId: 'top-coat',
                      name: 'Top Coat',
                      price: 190,
                      image: '/top-coat-white.webp'
                    });
                  }}
                  className="w-full bg-pink-400 hover:bg-pink-500 text-white px-6 py-2 rounded-md font-medium transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
};
