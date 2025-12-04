import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { cartStore } from '../lib/cart';
import { Download, CheckCircle, Clock, Package, User, MapPin, Mail, Phone, CreditCard } from 'lucide-react';

interface OrderDetails {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  m_payment_id?: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone?: string;
  subtotal_cents: number;
  shipping_cents: number;
  discount_cents: number;
  tax_cents: number;
  total_cents: number;
  total: number;
  placed_at: string;
  fulfillment_method?: string;
  delivery_address?: any;
  collection_location?: string;
  items?: OrderItem[];
}

interface OrderItem {
  id: string;
  product_name: string;
  sku?: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export default function CheckoutSuccess() {
  const [status, setStatus] = useState<'checking' | 'paid' | 'pending' | 'not-found'>('checking');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0); // Add this to track manual retries

  // Extract the check logic into a reusable function
  const checkOrderStatus = async (orderId: string) => {
    setStatus('checking');
    
    // Poll for 30 seconds (20 attempts x 1.5s) instead of 10s
    for (let i = 0; i < 20; i++) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();
      
      if (!error && data) {
        // Check for ANY positive status
        if (data.status === 'paid' || data.payment_status === 'paid' || data.payment_status === 'complete') {
          setStatus('paid');
          setOrderDetails(data);
          cartStore.clearCart();
          
          // SAFETY NET: Ensure n8n gets notified even if ITN missed it
          try {
            console.log('🚀 Triggering Safety Net Webhook...');
            await fetch('/.netlify/functions/order-status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                m_payment_id: data.m_payment_id || orderId,
                status: 'paid',
                buyer_name: data.buyer_name || '',
                buyer_email: data.buyer_email || '',
                buyer_phone: data.buyer_phone || '',
                site_url: window.location.origin
              })
            });
            console.log('✅ Safety Net Webhook Sent');
          } catch (e) {
            console.warn('⚠️ Safety Net Webhook failed (non-critical):', e);
          }
          
          fetchOrderItems(orderId);
          return;
        }
      }
      // Wait 1.5s between checks
      await new Promise((r) => setTimeout(r, 1500));
    }
    setStatus('pending');
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order');
    if (!orderId) {
      setStatus('not-found');
      return;
    }
    checkOrderStatus(orderId);
  }, [retryCount]); // Re-run if user clicks retry

  const fetchOrderItems = async (orderId: string) => {
    try {
      const { data: items, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)
        .order('id');
      
      if (!error && items) {
        setOrderDetails(prev => prev ? { ...prev, items } : null);
      }
    } catch (error) {
      console.error('Error fetching order items:', error);
    }
  };

  const downloadReceipt = async () => {
    if (!orderDetails) return;
    
    setLoading(true);
    try {
      const response = await fetch('/.netlify/functions/invoice-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          order_id: orderDetails.id,
          format: 'pdf' 
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BLOM-Order-${orderDetails.order_number}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('Unable to download receipt at this time. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return `R${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOrderStatusIcon = () => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-16 w-16 text-green-500 mb-4" />;
      case 'pending':
        return <Clock className="h-16 w-16 text-yellow-500 mb-4" />;
      case 'not-found':
        return <Package className="h-16 w-16 text-red-500 mb-4" />;
      default:
        return <Clock className="h-16 w-16 text-blue-500 mb-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showMobileMenu={true} />
      <main className="section-padding">
        <Container>
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Status Card */}
            <Card className="text-center">
              <CardContent className="pt-8 pb-6">
                {getOrderStatusIcon()}
                
                {status === 'paid' && orderDetails ? (
                  <div>
                    <h2 className="text-3xl font-bold text-green-600 mb-2">Thank you for your purchase!</h2>
                    <p className="text-gray-700 text-lg mb-4">
                      Your order has been confirmed and payment received.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      Order #{orderDetails.order_number}
                    </p>
                  </div>
                ) : status === 'pending' ? (
                  <div>
                    <h2 className="text-3xl font-bold text-yellow-600 mb-2">Payment Pending</h2>
                    <p className="text-gray-700 text-lg mb-4">
                      We're confirming your payment. This may take a few minutes.
                    </p>
                    
                    {/* NEW MANUAL CHECK BUTTON */}
                    <Button 
                      onClick={() => setRetryCount(c => c + 1)} 
                      variant="outline"
                      className="mt-4 border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Check Again
                    </Button>
                    
                    <p className="text-sm text-gray-500 mt-4">
                      If this doesn't update automatically, we'll email you once confirmed.
                    </p>
                  </div>
                ) : status === 'not-found' ? (
                  <div>
                    <h2 className="text-3xl font-bold text-red-600 mb-2">Order Not Found</h2>
                    <p className="text-gray-700 text-lg mb-4">
                      We couldn't find the order you're looking for.
                    </p>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-3xl font-bold text-blue-600 mb-2">Verifying Payment</h2>
                    <p className="text-gray-700 text-lg">
                      Please wait while we confirm your payment...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Details */}
            {status === 'paid' && orderDetails && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Order Summary */}
                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Order Summary
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Order Number:</span>
                        <p className="font-medium">{orderDetails.order_number}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Order Date:</span>
                        <p className="font-medium">{formatDate(orderDetails.placed_at)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Payment Status:</span>
                        <p className="font-medium text-green-600 capitalize">{orderDetails.payment_status}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Order Status:</span>
                        <p className="font-medium capitalize">{orderDetails.status}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Customer Information */}
                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Customer Information
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{orderDetails.buyer_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{orderDetails.buyer_email}</span>
                    </div>
                    {orderDetails.buyer_phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{orderDetails.buyer_phone}</span>
                      </div>
                    )}
                    
                    {orderDetails.fulfillment_method === 'delivery' && orderDetails.delivery_address && (
                      <div className="flex items-start gap-2 text-sm mt-4">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Delivery Address:</p>
                          <div className="text-gray-600">
                            <p>{orderDetails.delivery_address.street_address}</p>
                            <p>{orderDetails.delivery_address.suburb}, {orderDetails.delivery_address.city}</p>
                            <p>{orderDetails.delivery_address.province}, {orderDetails.delivery_address.postal_code}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {orderDetails.fulfillment_method === 'collection' && orderDetails.collection_location && (
                      <div className="flex items-start gap-2 text-sm mt-4">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Collection Location:</p>
                          <p className="text-gray-600">{orderDetails.collection_location}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Order Items and Receipt */}
            {status === 'paid' && orderDetails && orderDetails.items && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Order Items
                    </h3>
                    <Button 
                      onClick={downloadReceipt} 
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      {loading ? 'Generating...' : 'Download Receipt'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orderDetails.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product_name}</h4>
                          {item.sku && (
                            <p className="sm text-gray-500">SKU: {item.sku}</p>
                          )}
                          <p className="sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">R{item.line_total.toFixed(2)}</p>
                          <p className="sm text-gray-500">R{item.unit_price.toFixed(2)} each</p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Pricing Breakdown */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(orderDetails.subtotal_cents)}</span>
                        </div>
                        {orderDetails.shipping_cents > 0 && (
                          <div className="flex justify-between">
                            <span>Shipping:</span>
                            <span>{formatCurrency(orderDetails.shipping_cents)}</span>
                          </div>
                        )}
                        {orderDetails.tax_cents > 0 && (
                          <div className="flex justify-between">
                            <span>Tax:</span>
                            <span>{formatCurrency(orderDetails.tax_cents)}</span>
                          </div>
                        )}
                        {orderDetails.discount_cents > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount:</span>
                            <span>-{formatCurrency(orderDetails.discount_cents)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                          <span>Total:</span>
                          <span>{formatCurrency(orderDetails.total_cents)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {status === 'paid' && (
                    <Button onClick={() => window.location.href = '/account'} className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      View My Orders
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/shop'}
                  >
                    Continue Shopping
                  </Button>
                  {status === 'not-found' && (
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.href = '/cart'}
                    >
                      Back to Cart
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
