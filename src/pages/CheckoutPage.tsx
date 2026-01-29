import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { cartStore, CartState, formatPrice } from '../lib/cart';
import { CreditCard, Truck, Shield, Lock, MapPin, Phone, Mail, CreditCard as Edit, Plus, Minus, ArrowLeft, Heart, Trash2, AlertCircle } from 'lucide-react';
import { wishlistStore } from '../lib/wishlist';
import { AddressAutocomplete } from '../components/checkout/AddressAutocomplete';
import { validateMobileNumber, validateAddress, formatMobileNumber } from '../lib/validation';
import { supabase } from '../lib/supabase';
import { ProductVariantModal } from '../components/product/ProductVariantModal';
// --- Simple Coupon Data (Memory for Recalculation) ---
let simpleCouponData = {
  couponCode: '',
  discountType: null as 'percent' | 'fixed' | null,
  discountValue: 0,
  originalDiscountCents: 0,
  maxDiscountCents: null as number | null // <--- Stores the limit
};

const setSimpleCouponData = (data: any) => {
  console.log('💾 Storing Coupon Rules:', data);
  
  // Extract Max Discount carefully
  let maxCap = null;
  if (data.max_discount_cents) maxCap = Number(data.max_discount_cents);
  else if (data.coupon?.max_discount_cents) maxCap = Number(data.coupon.max_discount_cents);

  simpleCouponData = {
    couponCode: data.code || 'UNKNOWN',
    discountType: (data.discount_type === 'fixed_amount' || data.type === 'fixed' || data.discount_type === 'fixed') ? 'fixed' : 'percent',
    discountValue: Number(data.discount_value || data.value || 0),
    originalDiscountCents: Number(data.discount_cents || 0),
    maxDiscountCents: maxCap
  };
};

const recalculateSimpleDiscount = (cartSubtotal: number): number => {
  const { discountType, discountValue, originalDiscountCents, maxDiscountCents } = simpleCouponData;
  
  if (!discountType || discountValue <= 0) return 0;

  // Fixed Discount: Can't exceed cart total
  if (discountType === 'fixed') {
    const rands = originalDiscountCents / 100;
    return Math.min(rands, cartSubtotal);
  }

  // Percentage Discount: Recalculate & Enforce Cap
  if (discountType === 'percent') {
    const subtotalCents = Math.round(cartSubtotal * 100);
    let newDiscountCents = Math.round(subtotalCents * (discountValue / 100));

    // 1. Enforce Max Cap (If exists)
    if (maxDiscountCents !== null && maxDiscountCents > 0) {
      if (newDiscountCents > maxDiscountCents) {
        console.log(`🛑 Discount Capped! R${newDiscountCents/100} -> R${maxDiscountCents/100}`);
        newDiscountCents = maxDiscountCents;
      }
    }

    // 2. Enforce Subtotal Cap (Can't be free+)
    if (newDiscountCents > subtotalCents) {
      newDiscountCents = subtotalCents;
    }
    
    return newDiscountCents / 100;
  }

  return 0;
};

const clearSimpleCouponData = () => {
  simpleCouponData = {
    couponCode: '',
    discountType: null,
    discountValue: 0,
    originalDiscountCents: 0,
    maxDiscountCents: null
  };
};

export const CheckoutPage: React.FC = () => {
  const [cartState, setCartState] = useState<CartState>(cartStore.getState());
  const [step, setStep] = useState<'shipping' | 'review'>(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get('step');
    return s === 'review' ? 'review' : 'shipping';
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
  const [couponDetails, setCouponDetails] = useState<any>(null);

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

  // Saved addresses state
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [saveThisAddress, setSaveThisAddress] = useState(false);
  const [userSession, setUserSession] = useState<any>(null);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProductForVariant, setSelectedProductForVariant] = useState<any>(null);

  // --- FURNITURE DETECTION LOGIC ---
  const isFurnitureItem = (itemName: string) => {
    const furnitureKeywords = ['table', 'station', 'desk', 'dresser', 'bed', 'chair', 'rack'];
    return furnitureKeywords.some(keyword => itemName.toLowerCase().includes(keyword));
  };

  const hasFurniture = cartState.items.some(item => isFurnitureItem(item.name));

  useEffect(() => {
    const unsubscribe = cartStore.subscribe(setCartState);
    return unsubscribe;
  }, []);

  // Dynamically recalculate coupon discount when cart changes
  useEffect(() => {
    if (appliedCoupon && couponDetails && cartState.subtotal > 0) {
      recalculateCouponDiscount();
    }
  }, [cartState.subtotal]); // Only depend on cartState.subtotal to prevent infinite loops

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

  // Fetch user session and saved addresses
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error fetching session:', error);
          return;
        }

        if (session?.user) {
          setUserSession(session);
          setUserId(session.user.id);

          // Autofill contact information from user metadata
          const firstName = session.user.user_metadata?.full_name?.split(' ')[0] || '';
          const lastName = session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '';
          const email = session.user.email || '';
          const phone = session.user.user_metadata?.phone || '';

          setShippingInfo(prev => ({
            ...prev,
            firstName: firstName || prev.firstName,
            lastName: lastName || prev.lastName,
            email: email || prev.email,
            phone: phone || prev.phone,
          }));

          // Fetch saved addresses
          const { data: addresses, error: addressError } = await supabase
            .from('user_addresses')
            .select('*')
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: false });

          if (addressError) {
            console.error('Error fetching addresses:', addressError);
            return;
          }

          setSavedAddresses(addresses || []);
        }
      } catch (error) {
        console.error('Error in fetchUserData:', error);
      }
    };

    fetchUserData();
  }, []);

  // Handle saved address selection
  const handleSavedAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);

    const address = savedAddresses.find(addr => addr.id === addressId);
    if (address) {
      // Populate contact info
      setShippingInfo(prev => ({
        ...prev,
        firstName: address.recipient_name?.split(' ')[0] || prev.firstName,
        lastName: address.recipient_name?.split(' ').slice(1).join(' ') || prev.lastName,
        phone: address.recipient_phone || prev.phone,
      }));

      // Populate delivery address
      setDeliveryAddress({
        street_address: address.address_line_1 || '',
        local_area: address.address_line_2 || '',
        city: address.city || '',
        zone: address.province || '',
        code: address.postal_code || '',
        country: 'ZA',
        lat: undefined,
        lng: undefined,
      });

      // Update address input field
      setAddressInput(address.address_line_1 || '');
    }
  };

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

  const handleAddRecommendedProduct = (productData: any) => {
    // Check if product has variants
    if (productData.variants && productData.variants.length > 0) {
      setSelectedProductForVariant(productData);
      setShowVariantModal(true);
      return;
    }
    
    // Add directly to cart if no variants
    cartStore.addItem({
      id: `item_${Date.now()}`,
      productId: productData.id,
      name: productData.name,
      price: productData.price,
      image: productData.image,
      variant: { title: 'Default' }
    });
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

    // Skip payment step, go directly to review
    setStep('review');
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch { window.scrollTo(0, 0); }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setIsApplyingCoupon(true);
    setCouponError('');

    try {
      // 1. Calculate Subtotal
      const productSubtotal = Math.round(cartState.subtotal * 100);
      
      // 2. PREPARE CART ITEMS FOR BACKEND (The Fix)
      // This makes your products "visible" to the database logic
      const cartPayload = cartState.items.map(item => ({
        product_id: item.productId || item.id, 
        name: item.name, // <--- CRITICAL ADDITION
        quantity: item.quantity,
        unit_price_cents: Math.round(item.price * 100)
      }));

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || (import.meta as any).env.SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || (import.meta as any).env.SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        setCouponError('Configuration error. Please try again.');
        return;
      }

      console.log('🔍 Applying coupon with items:', {
        code: couponCode.trim().toUpperCase(),
        email: shippingInfo.email,
        subtotal: productSubtotal,
        item_count: cartPayload.length
      });

      // 3. Call the RPC with the Items
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
          p_order_total_cents: productSubtotal,
          p_cart_items: cartPayload // <--- PASSING ITEMS HERE
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Coupon RPC error:', errorText);
        setCouponError('Failed to validate coupon. Please try again.');
        return;
      }

      const data = await res.json();
      const result = Array.isArray(data) ? data[0] : data;
      
      if (!result.valid) {
        console.log('❌ Coupon validation failed:', result.message);
        setCouponError(result.message || 'Invalid coupon code');
        setDiscount(0);
        setAppliedCoupon(null);
        setCouponDetails(null);
        clearSimpleCouponData();
      } else {
        const discountAmount = result.discount_cents / 100;
        console.log('✅ Coupon applied successfully:', result);
        
        setDiscount(discountAmount);
        setAppliedCoupon({ 
          id: result.coupon_id || couponCode.trim().toUpperCase(),
          code: couponCode.trim().toUpperCase() 
        });
        setCouponDetails(result);
        setSimpleCouponData(result); // Store for fallback
        setCouponError('');
      }

    } catch (error) {
      console.error('❌ Coupon application error:', error);
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
    setCouponDetails(null);
    clearSimpleCouponData();
    console.log('🗑️ Coupon removed and simple data cleared');
  };

  const recalculateCouponDiscount = async () => {
    if (!appliedCoupon || !couponDetails) {
      console.log('❌ Missing data for recalculation:', { hasAppliedCoupon: !!appliedCoupon, hasCouponDetails: !!couponDetails });
      return;
    }

    try {
      console.log('🔄 RECALCULATION DEBUG - Start');
      console.log('📊 Full couponDetails object:', couponDetails);
      console.log('🔍 couponDetails keys:', Object.keys(couponDetails));
      console.log('🎯 appliedCoupon:', appliedCoupon);
      console.log('🛒 cartState.subtotal:', cartState.subtotal);

      console.log('🔄 SECURE BACKEND RECALCULATION - Using backend for max discount enforcement...', { 
        couponCode: appliedCoupon.code, 
        originalDiscount: couponDetails.discount_cents,
        cartSubtotal: cartState.subtotal
      });

      // Calculate product subtotal in cents (excluding shipping)
      const productSubtotal = Math.round(cartState.subtotal * 100);
      
      // Get Supabase URL and key
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || (import.meta as any).env.SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || (import.meta as any).env.SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.log('❌ Supabase configuration missing, using fallback');
        // Fallback to original discount if config missing
        const originalDiscount = Number(couponDetails.discount_cents || 0);
        setDiscount(originalDiscount / 100);
        return;
      }

      console.log('🔄 Calling backend recalculate_coupon_discount for secure max discount enforcement...');

      // Call the backend function for secure recalculation (enforces max discount)
      const res = await fetch(`${supabaseUrl}/rest/v1/rpc/recalculate_coupon_discount`, {
        method: 'POST',
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          p_code: appliedCoupon.code,
          p_email: shippingInfo.email || '',
          p_order_total_cents: productSubtotal,
          p_cart_items: cartState.items.map(item => ({
            product_id: item.productId || item.id, 
            name: item.name, // <--- CRITICAL ADDITION
            quantity: item.quantity,
            unit_price_cents: Math.round(item.price * 100)
          }))
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Backend recalculation failed:', errorText);
        // Fallback to original discount
        const originalDiscount = Number(couponDetails.discount_cents || 0);
        console.log('🔄 Using original discount as fallback:', originalDiscount / 100, 'Rands');
        setDiscount(originalDiscount / 100);
        return;
      }

      const data = await res.json();
      const result = Array.isArray(data) ? data[0] : data;
      
      if (!result.valid) {
        console.log('❌ Backend validation failed:', result.message);
        // If backend says it's invalid, remove the coupon
        setCouponError(result.message || 'Coupon no longer valid');
        handleRemoveCoupon();
        return;
      }

      // Use the backend's calculation (which includes max discount enforcement)
      const backendDiscount = result.discount_cents / 100;
      console.log('✅ Backend recalculated:', {
        newDiscount: backendDiscount,
        message: result.message,
        originalMessage: couponDetails.message
      });

      // Update with backend's secure calculation
      setDiscount(backendDiscount);
      setCouponError('');
      
      // Update coupon details with the latest backend response
      setCouponDetails({
        ...couponDetails,
        discount_cents: result.discount_cents,
        message: result.message
      });

    } catch (error) {
      console.error('❌ Error in secure backend recalculation:', error);
      // FALLBACK: Use original discount if backend fails
      const originalDiscount = Number(couponDetails.discount_cents || 0);
      console.log('🔄 Using original discount due to error:', originalDiscount / 100, 'Rands');
      setDiscount(originalDiscount / 100);
      setCouponError('Unable to verify discount. Current discount may be incorrect.');
    }
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
            unit_price: Math.round(it.price * 100), // <--- FIXED: Convert to Cents
            quantity: it.quantity,
            variant: it.variant
          })),
          totals: {
            subtotal_cents: Math.round(cartState.subtotal * 100),
            shipping_cents: Math.round(shippingCost * 100),
            discount_cents: Math.round(discount * 100),
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

      // Save address to user_addresses if requested and user is logged in
      if (saveThisAddress && userSession?.user && shippingMethod === 'door-to-door') {
        try {
          await supabase.from('user_addresses').insert({
            user_id: userSession.user.id,
            address_name: null,
            recipient_name: `${shippingInfo.firstName} ${shippingInfo.lastName}`.trim(),
            recipient_phone: shippingInfo.phone,
            address_line_1: deliveryAddress.street_address,
            address_line_2: deliveryAddress.local_area,
            city: deliveryAddress.city,
            province: deliveryAddress.zone,
            postal_code: deliveryAddress.code,
            is_default: false,
          });
        } catch (err) {
          console.error('Failed to save address:', err);
          // Don't block checkout if address save fails
        }
      }

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

      // Step 2: Redirect to PayFast with minimal payload
      // All customer/delivery data already saved to Supabase via create-order above
      const pfRequestBody = {
        order_id: orderData.order_id, // Pass the actual order ID for proper redirect
        m_payment_id: orderData.merchant_payment_id,
        amount: (totalCents / 100).toFixed(2),
        item_name: `BLOM Order ${orderData.merchant_payment_id}`
      };

      console.log('🔍 PayFast request:', pfRequestBody);

      const pfResponse = await fetch('/.netlify/functions/payfast-redirect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pfRequestBody)
      });

      if (!pfResponse.ok) {
        const pfError = await pfResponse.json().catch(() => ({ error: 'PayFast initiation failed' }));
        console.error('❌ PayFast redirect error:', pfError);
        alert(`PayFast Error: ${JSON.stringify(pfError, null, 2)}`);
        throw new Error(pfError.error || 'Payment initiation failed');
      }

      // payfast-redirect returns HTML with auto-submit form
      const contentType = pfResponse.headers.get('content-type') || '';

      if (contentType.includes('text/html')) {
        // HTML response: inject and let it auto-submit
        const html = await pfResponse.text();
        console.log('🚀 Redirecting to PayFast via auto-submit form');

        // Replace current page with the PayFast redirect form
        document.open();
        document.write(html);
        document.close();
      } else {
        // JSON fallback (for backward compatibility)
        const pfData = await pfResponse.json();
        console.log('✅ PayFast response:', pfData);

        const redirectUrl = pfData.redirect || pfData.url;
        if (redirectUrl) {
          console.log('🚀 Redirecting to PayFast:', redirectUrl);
          window.location.href = redirectUrl;
        } else {
          throw new Error('No redirect URL received from PayFast');
        }
      }
      
    } catch (error: any) {
      console.error('Order processing failed:', error);
      alert(error.message || 'Payment initiation failed. Please try again.');
      setIsProcessing(false);
    }
  };

  // --- UPDATED SHIPPING CALCULATION ---
  const calculateShipping = () => {
    // 1. Collection Handling
    if (shippingMethod === 'store-pickup') {
      // If ANY furniture is present, charge R500
      if (hasFurniture) return 500;
      // Normal products = FREE collection
      return 0;
    }
    
    // 2. Furniture Delivery Handling
    if (hasFurniture) {
      // Furniture shipping is calculated separately, so we charge R0 now
      // and invoice them later.
      return 0;
    }

    // 3. Standard Delivery Rules
    return cartState.subtotal >= 2000 ? 0 : 120;
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
            <h1 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">Checkout</h1>
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-gray-900' : 'text-gray-400'}`}>
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm sm:text-base ${step === 'shipping' ? 'bg-pink-400 text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <span className="text-sm sm:text-base">Shipping</span>
              </div>
              <div className="w-6 sm:w-8 h-px bg-gray-300"></div>
              <div className={`flex items-center gap-2 ${step === 'review' ? 'text-gray-900' : 'text-gray-400'}`}>
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm sm:text-base ${step === 'review' ? 'bg-pink-400 text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <span className="text-sm sm:text-base">Review</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Shipping Information */}
              {step === 'shipping' && (
                <Card>
                  <CardHeader className="p-4 sm:p-6 pb-4 sm:pb-4">
                    <h2 className="text-xl sm:text-2xl font-bold">Shipping Information</h2>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <form onSubmit={handleShippingSubmit} className="space-y-6">
                      
                      {/* Shipping Method Selection */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Truck className="h-5 w-5 text-gray-500" />
                          Choose Your Delivery Option
                        </h3>
                        
                        {/* Furniture Warning Alert */}
                        {hasFurniture && (
                          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-yellow-800 text-sm">Furniture Shipping Notice</h4>
                              <p className="text-sm text-yellow-700 mt-1">
                                Your cart contains furniture items. Shipping costs for furniture will be <strong>calculated separately</strong> after your order is placed. We will contact you with a shipping invoice.
                              </p>
                            </div>
                          </div>
                        )}

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
                                  <span className="text-lg font-bold text-gray-900">
                                    {hasFurniture ? 'R 500.00' : 'FREE'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">Ready within 24 hours. We'll WhatsApp you when it's ready.</p>
                                {hasFurniture && (
                                  <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Furniture Collection Fee</span>
                                )}
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
                                    {hasFurniture ? 'Calculated Later' : (cartState.subtotal >= 2000 ? 'FREE' : 'R120')}
                                  </span>
                                </div>
                                
                                {hasFurniture ? (
                                  <>
                                    <p className="text-sm text-gray-600">Shipping calculated separately for furniture items.</p>
                                    <span className="inline-block mt-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Invoice to follow</span>
                                  </>
                                ) : (
                                  <>
                                    <p className="text-sm text-gray-600">Delivered to your address. 2–5 business days.</p>
                                    {cartState.subtotal >= 2000 && (
                                      <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Free over R2000</span>
                                    )}
                                    {cartState.subtotal < 2000 && (
                                      <p className="text-xs text-gray-500 mt-1">Add R{(2000 - cartState.subtotal).toFixed(2)} more for free delivery!</p>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </label>
                          
                        </div>
                      </div>

                      {/* Saved Address Dropdown */}
                      {userSession && savedAddresses.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Use a saved address
                          </label>
                          <select
                            value={selectedAddressId}
                            onChange={(e) => handleSavedAddressSelect(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
                          >
                            <option value="">Select a saved address...</option>
                            {savedAddresses.map((addr) => (
                              <option key={addr.id} value={addr.id}>
                                {addr.address_name || 'Unnamed'} - {addr.address_line_1}, {addr.city}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

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

                          {/* Save Address Checkbox */}
                          {userSession && (
                            <div className="flex items-center gap-2 bg-pink-50 border border-pink-200 rounded-lg p-3">
                              <input
                                type="checkbox"
                                id="save_address"
                                checked={saveThisAddress}
                                onChange={(e) => setSaveThisAddress(e.target.checked)}
                                className="rounded border-gray-300 text-pink-500 focus:ring-pink-400"
                              />
                              <label htmlFor="save_address" className="text-sm text-gray-700 cursor-pointer">
                                Save this address to my account for faster checkout next time
                              </label>
                            </div>
                          )}
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
                        <Button type="submit" size="lg" className="w-full sm:w-auto">
                          <span className="text-xs sm:text-sm">Continue to Review</span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full sm:w-auto"
                          onClick={() => window.location.href = '/shop'}
                        >
                          <span className="text-xs sm:text-sm">Continue Shopping</span>
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Order Review */}
              {step === 'review' && (
                <Card>
                  <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-6">
                    <h2 className="text-xl sm:text-2xl font-bold">Review Your Order</h2>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
                    {/* Fulfillment summary */}
                    {shippingMethod === 'store-pickup' ? (
                      <div>
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <h3 className="font-medium text-sm sm:text-base">Collection</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setStep('shipping')}
                            className="text-xs sm:text-sm"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                          <p className="font-medium text-sm sm:text-base">Collect from BLOM HQ, Randfontein</p>
                          <p className="mt-2 text-xs sm:text-sm text-gray-600">
                            <Mail className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                            {shippingInfo.email}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            <Phone className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                            {shippingInfo.phone}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <h3 className="font-medium text-sm sm:text-base">Shipping Address</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setStep('shipping')}
                            className="text-xs sm:text-sm"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                          <p className="font-medium text-sm sm:text-base">{shippingInfo.firstName} {shippingInfo.lastName}</p>
                          <p className="text-xs sm:text-sm">{deliveryAddress.street_address}</p>
                          <p className="text-xs sm:text-sm">{deliveryAddress.city}, {deliveryAddress.zone} {deliveryAddress.code}</p>
                          <p className="text-xs sm:text-sm">{deliveryAddress.country}</p>
                          <p className="mt-2 text-xs sm:text-sm text-gray-600">
                            <Mail className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                            {shippingInfo.email}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            <Phone className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                            {shippingInfo.phone}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Payment Method */}
                    <div>
                      <h3 className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">Payment Method</h3>
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <p className="font-medium text-sm sm:text-base">
                          {paymentMethods.find(m => m.id === paymentInfo.method)?.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {paymentMethods.find(m => m.id === paymentInfo.method)?.description}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h3 className="font-medium mb-3 text-base sm:text-lg">Order Items</h3>
                      <div className="space-y-2 sm:space-y-3">
                        {cartState.items.map((item) => (
                          <div key={item.id} className="flex gap-3 sm:gap-4 p-2.5 sm:p-4 border rounded-lg">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 sm:w-16 sm:h-16 object-cover rounded flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm sm:text-base truncate">{item.name}</h4>
                              {item.variant && (
                                <p className="text-xs sm:text-sm text-gray-500">{item.variant.title}</p>
                              )}
                              <p className="text-gray-900 font-bold text-sm sm:text-base">{formatPrice(item.price)}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="inline-flex items-center gap-1.5 sm:gap-2 mb-1">
                                <button
                                  type="button"
                                  aria-label="Decrease quantity"
                                  onClick={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                                  className="p-1 sm:p-1.5 rounded-full border border-gray-200 hover:bg-gray-100 active:scale-95 transition"
                                >
                                  <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </button>
                                <span className="w-6 sm:w-8 text-center font-medium text-sm sm:text-base">{item.quantity}</span>
                                <button
                                  type="button"
                                  aria-label="Increase quantity"
                                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                  className="p-1 sm:p-1.5 rounded-full border border-gray-200 hover:bg-gray-100 active:scale-95 transition"
                                >
                                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </button>
                              </div>
                              <p className="text-gray-900 font-bold text-sm sm:text-base">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => { setStep('shipping'); try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch { window.scrollTo(0, 0); } }}
                        className="w-full sm:w-auto checkout-review-action"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Shipping
                      </Button>
                      <Button
                        size="lg"
                        onClick={handlePlaceOrder}
                        loading={isProcessing}
                        className="w-full sm:w-auto checkout-review-action"
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
                  {/* Coupon Code */}
                  <div className="border-t pt-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">Coupon Code</h4>
                        {appliedCoupon && (
                          <button
                            type="button"
                            onClick={() => {
                              console.log('🧪 TEST BUTTON: Forcing recalculation...');
                              recalculateCouponDiscount();
                            }}
                            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                          >
                            Test Recalc
                          </button>
                        )}
                      </div>
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
                            {/* Debug info */}
                            {process.env.NODE_ENV === 'development' && (
                              <details className="mt-2 text-xs text-gray-600">
                                <summary>Debug Info</summary>
                                <div className="mt-1 p-2 bg-gray-100 rounded">
                                  <p>Simple Data: {JSON.stringify(simpleCouponData, null, 2)}</p>
                                  <p>Coupon Details: {couponDetails ? `Type: ${couponDetails.discount_type}, Value: ${couponDetails.discount_value}` : 'null'}</p>
                                </div>
                              </details>
                            )}
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
                        {hasFurniture && shippingMethod === 'door-to-door'
                          ? 'Calculated Later'
                          : (shippingCost === 0 ? 'FREE' : formatPrice(shippingCost))}
                      </span>
                    </div>
                    {shippingMethod === 'door-to-door' && cartState.subtotal >= 2000 && !hasFurniture && (
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
                  {!hasFurniture && cartState.subtotal < 2000 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        Add {formatPrice(2000 - cartState.subtotal)} more for free shipping!
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
                  onClick={() => handleAddRecommendedProduct({
                    id: 'nail-file',
                    name: 'Nail File (80/80 Grit)',
                    price: 35,
                    image: '/nail-file-white.webp',
                    variants: [
                      { name: 'Single File', price: 35, image: '/nail-file-colorful.webp' },
                      { name: '5-Pack Bundle', price: 160, image: '/nail-file-white.webp' }
                    ]
                  })}
                  className="w-full bg-pink-500 text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-lg shadow-pink-200 hover:bg-pink-600 hover:shadow-xl hover:shadow-pink-300 hover:scale-[1.02] active:scale-95"
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
                  onClick={() => handleAddRecommendedProduct({
                    id: 'cuticle-oil',
                    name: 'Cuticle Oil',
                    price: 140,
                    image: '/cuticle-oil-white.webp',
                    variants: [
                      { name: 'Cotton Candy', image: '/cuticle-oil-cotton-candy.webp' },
                      { name: 'Vanilla', image: '/cuticle-oil-vanilla.webp' },
                      { name: 'Tiny Touch', image: '/cuticle-oil-tiny-touch.webp' },
                      { name: 'Dragon Fruit Lotus', image: '/cuticle-oil-dragon-fruit-lotus.webp' },
                      { name: 'Watermelon', image: '/cuticle-oil-watermelon.webp' }
                    ]
                  })}
                  className="w-full bg-pink-500 text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-lg shadow-pink-200 hover:bg-pink-600 hover:shadow-xl hover:shadow-pink-300 hover:scale-[1.02] active:scale-95"
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
                  onClick={() => handleAddRecommendedProduct({
                    id: 'top-coat',
                    name: 'Top Coat',
                    price: 190,
                    image: '/top-coat-white.webp',
                    variants: []
                  })}
                  className="w-full bg-pink-500 text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-lg shadow-pink-200 hover:bg-pink-600 hover:shadow-xl hover:shadow-pink-300 hover:scale-[1.02] active:scale-95"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </Container>
      </main>

      <Footer />

      {/* Product Variant Selection Modal for Recommended Products */}
      <ProductVariantModal
        isOpen={showVariantModal}
        onClose={() => {
          setShowVariantModal(false);
          setSelectedProductForVariant(null);
        }}
        product={selectedProductForVariant ? {
          id: selectedProductForVariant.id,
          name: selectedProductForVariant.name,
          slug: selectedProductForVariant.id,
          price: selectedProductForVariant.price,
          images: [selectedProductForVariant.image],
          variants: selectedProductForVariant.variants || []
        } : {
          id: '',
          name: '',
          slug: '',
          price: 0,
          images: [],
          variants: []
        }}
      />
    </div>
  );
};
