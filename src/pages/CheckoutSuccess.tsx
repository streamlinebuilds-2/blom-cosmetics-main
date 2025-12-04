import React, { useEffect, useState, useCallback } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { cartStore } from '../lib/cart';
import { Download, CheckCircle, Clock, Package, User, MapPin, Mail, Phone, RefreshCw } from 'lucide-react';

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
  items?: any[];
}

export default function CheckoutSuccess() {
  const [status, setStatus] = useState<'checking' | 'paid' | 'pending' | 'not-found'>('checking');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Function to poll the database for payment status
  const checkStatus = useCallback(async (orderId: string) => {
    setStatus('checking');
    console.log(`🔍 Checking status for order ${orderId} (Attempt ${retryCount + 1})...`);

    // Poll for 30 seconds (20 attempts x 1.5s)
    for (let i = 0; i < 20; i++) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();
      
      if (data) {
        // SUCCESS CONDITION: Check for 'paid' or 'complete'
        if (data.status === 'paid' || data.payment_status === 'paid' || data.payment_status === 'complete') {
          console.log('✅ Payment confirmed!');
          setStatus('paid');
          setOrderDetails(data);
          cartStore.clearCart();
          
          // SAFETY NET: Trigger n8n webhook manually to ensure emails are sent
          triggerSafetyWebhook(data);
          
          // Fetch items for the receipt
          fetchOrderItems(orderId);
          return;
        }
      }
      // Wait 1.5s before next check
      await new Promise((r) => setTimeout(r, 1500));
    }
    
    // If loop finishes without success
    setStatus('pending');
  }, [retryCount]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order');
    if (!orderId) {
      setStatus('not-found');
      return;
    }
    checkStatus(orderId);
  }, [checkStatus]);

  // Safety Net: Ensures your admin workflow runs even if PayFast ITN failed
  const triggerSafetyWebhook = async (orderData: any) => {
    try {
      await fetch('/.netlify/functions/order-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          m_payment_id: orderData.m_payment_id || orderData.id,
          status: 'paid',
          buyer_name: orderData.buyer_name || '',
          buyer_email: orderData.buyer_email || '',
          buyer_phone: orderData.buyer_phone || '',
          site_url: window.location.origin
        })
      });
      console.log('🚀 Safety webhook triggered successfully');
    } catch (e) {
      console.warn('Safety webhook failed (non-critical):', e);
    }
  };

  const fetchOrderItems = async (orderId: string) => {
    const { data } = await supabase.from('order_items').select('*').eq('order_id', orderId);
    if (data) setOrderDetails(prev => prev ? { ...prev, items: data } : null);
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
          format: 'pdf',
          download: true 
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BLOM-Receipt-${orderDetails.order_number}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Could not download receipt. Please check your email.');
      }
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => `R${(cents / 100).toFixed(2)}`;
  const formatDate = (d: string) => new Date(d).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showMobileMenu={true} />
      <main className="section-padding py-12">
        <Container>
          <div className="max-w-3xl mx-auto space-y-8">
            
            {/* STATUS CARD */}
            <Card className="text-center shadow-lg border-t-4 border-t-pink-400">
              <CardContent className="pt-10 pb-10">
                {status === 'paid' ? (
                  <>
                    <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                    <p className="text-gray-600 text-lg">Thank you for your purchase. Your payment was successful.</p>
                  </>
                ) : status === 'pending' ? (
                  <>
                    <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                      <Clock className="h-10 w-10 text-yellow-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Pending</h1>
                    <p className="text-gray-600 mb-6">
                      We haven't received the confirmation from the bank yet. This can take a few moments.
                    </p>
                    <Button 
                      onClick={() => setRetryCount(c => c + 1)} 
                      variant="outline"
                      className="gap-2 border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                    >
                      <RefreshCw className="h-4 w-4" /> Check Status Again
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="mx-auto w-16 h-16 border-4 border-gray-200 border-t-pink-500 rounded-full animate-spin mb-6"></div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment...</h1>
                    <p className="text-gray-600">Please do not close this window.</p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* ORDER DETAILS (Only Show if Paid) */}
            {status === 'paid' && orderDetails && (
              <>
                <Card>
                  <CardHeader className="border-b bg-gray-50/50">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Order Reference</p>
                        <p className="font-mono font-bold text-lg">{orderDetails.order_number}</p>
                      </div>
                      <Button onClick={downloadReceipt} disabled={loading} variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        {loading ? 'Generating...' : 'Download Receipt'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    {/* Customer Info */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold flex items-center gap-2 mb-3">
                          <User className="h-4 w-4 text-gray-400" /> Customer
                        </h3>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p className="font-medium text-gray-900">{orderDetails.buyer_name}</p>
                          <p>{orderDetails.buyer_email}</p>
                          <p>{orderDetails.buyer_phone}</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold flex items-center gap-2 mb-3">
                          {orderDetails.fulfillment_method === 'collection' ? <Package className="h-4 w-4 text-gray-400"/> : <MapPin className="h-4 w-4 text-gray-400"/>}
                          {orderDetails.fulfillment_method === 'collection' ? 'Collection' : 'Delivery'}
                        </h3>
                        <div className="text-sm text-gray-600">
                          {orderDetails.fulfillment_method === 'collection' ? (
                            <p>BLOM HQ, Randfontein</p>
                          ) : (
                            orderDetails.delivery_address && (
                              <>
                                <p>{orderDetails.delivery_address.street_address}</p>
                                <p>{orderDetails.delivery_address.city}, {orderDetails.delivery_address.code}</p>
                              </>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Items Table */}
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600 font-medium">
                          <tr>
                            <th className="px-4 py-3 text-left">Item</th>
                            <th className="px-4 py-3 text-center">Qty</th>
                            <th className="px-4 py-3 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {orderDetails.items?.map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 py-3">{item.product_name}</td>
                              <td className="px-4 py-3 text-center">{item.quantity}</td>
                              <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.line_total || item.unit_price * item.quantity * 100)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td colSpan={2} className="px-4 py-2 text-right text-gray-600">Subtotal</td>
                            <td className="px-4 py-2 text-right">{formatCurrency(orderDetails.subtotal_cents)}</td>
                          </tr>
                          {orderDetails.shipping_cents > 0 && (
                            <tr>
                              <td colSpan={2} className="px-4 py-2 text-right text-gray-600">Shipping</td>
                              <td className="px-4 py-2 text-right">{formatCurrency(orderDetails.shipping_cents)}</td>
                            </tr>
                          )}
                          {orderDetails.discount_cents > 0 && (
                            <tr>
                              <td colSpan={2} className="px-4 py-2 text-right text-green-600">Discount</td>
                              <td className="px-4 py-2 text-right text-green-600">-{formatCurrency(orderDetails.discount_cents)}</td>
                            </tr>
                          )}
                          <tr>
                            <td colSpan={2} className="px-4 py-3 text-right font-bold text-gray-900 border-t">Total</td>
                            <td className="px-4 py-3 text-right font-bold text-gray-900 border-t">{formatCurrency(orderDetails.total_cents)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-center gap-4">
                  <Button onClick={() => window.location.href = '/shop'} variant="outline">
                    Continue Shopping
                  </Button>
                  <Button onClick={() => window.location.href = '/account'}>
                    View All Orders
                  </Button>
                </div>
              </>
            )}
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
