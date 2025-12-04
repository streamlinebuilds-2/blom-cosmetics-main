import React, { useEffect, useState, useCallback } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { cartStore } from '../lib/cart';
import { Download, CheckCircle, Clock, Package, User, MapPin, RefreshCw } from 'lucide-react';

export default function CheckoutSuccess() {
  const [status, setStatus] = useState<'checking' | 'paid' | 'pending' | 'not-found'>('checking');
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const checkStatus = useCallback(async (orderId: string) => {
    setStatus('checking');
    
    // 🚀 BACKUP TRIGGER: Force order confirmation on success page
    try {
      console.log('🚀 Backup Trigger: Calling confirm-payment-success for:', orderId);
      await fetch('/.netlify/functions/confirm-payment-success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId })
      });
      console.log('✅ Backup trigger completed');
    } catch (err) {
      console.error('❌ Backup trigger failed:', err);
    }
    
    // Poll for 45 seconds (30 attempts x 1.5s)
    for (let i = 0; i < 30; i++) {
      const { data } = await supabase.from('orders').select('*').eq('id', orderId).maybeSingle();
      
      if (data && (data.status === 'paid' || data.payment_status === 'paid' || data.payment_status === 'complete')) {
        setStatus('paid');
        setOrderDetails(data);
        cartStore.clearCart();
        
        // Fetch order items for detailed breakdown
        fetchOrderItems(orderId);
        
        return;
      }
      await new Promise((r) => setTimeout(r, 1500));
    }
    setStatus('pending');
  }, [retryCount]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order');
    if (orderId) checkStatus(orderId);
    else setStatus('not-found');
  }, [checkStatus]);

  const formatCurrency = (cents: number) => `R${(cents / 100).toFixed(2)}`;

  const downloadReceipt = async () => {
    if (!orderDetails) return;
    setLoading(true);
    try {
        const res = await fetch('/.netlify/functions/invoice-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: orderDetails.id, download: true })
        });
        if (res.ok) {
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `Invoice-${orderDetails.order_number}.pdf`;
            document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url);
        }
    } catch (e) { alert('Download failed. Please try again.'); }
    setLoading(false);
  };

  const fetchOrderItems = async (orderId: string) => {
    const { data } = await supabase.from('order_items').select('*').eq('order_id', orderId);
    if (data) setOrderDetails((prev: any) => prev ? { ...prev, items: data } : null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showMobileMenu={true} />
      <main className="section-padding py-12">
        <Container>
          <div className="max-w-3xl mx-auto space-y-8">
            <Card className="text-center shadow-lg border-t-4 border-t-pink-400">
              <CardContent className="pt-10 pb-10">
                {status === 'paid' ? (
                  <>
                    <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                    <p className="text-gray-600">Your payment was successful.</p>
                    <Button onClick={downloadReceipt} disabled={loading} variant="outline" className="mt-6 gap-2">
                        <Download className="h-4 w-4" /> {loading ? 'Generating...' : 'Download Receipt'}
                    </Button>
                  </>
                ) : status === 'pending' ? (
                  <>
                    <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                      <Clock className="h-10 w-10 text-yellow-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Pending</h1>
                    <p className="text-gray-600 mb-6">We are waiting for the bank confirmation.</p>
                    <Button onClick={() => setRetryCount(c => c + 1)} variant="outline" className="gap-2">
                      <RefreshCw className="h-4 w-4" /> Check Again
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="mx-auto w-16 h-16 border-4 border-gray-200 border-t-pink-500 rounded-full animate-spin mb-6"></div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment...</h1>
                  </>
                )}
              </CardContent>
            </Card>

            {/* ORDER DETAILS - Only show when paid */}
            {status === 'paid' && orderDetails && (
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-semibold">Order Details</h3>
                </CardHeader>
                <CardContent>
                  {/* Items Table */}
                  <div className="border rounded-lg overflow-hidden mb-6">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-600 font-medium">
                        <tr>
                          <th className="px-4 py-3 text-left">Item</th>
                          <th className="px-4 py-3 text-center">Qty</th>
                          <th className="px-4 py-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {orderDetails.items?.map((item: any) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3">{item.product_name}</td>
                            <td className="px-4 py-3 text-center">{item.quantity}</td>
                            <td className="px-4 py-3 text-right font-medium">
                              R {(item.line_total || (item.quantity * item.unit_price)).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      
                      {/* SMART FOOTER with calculated total */}
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={2} className="px-4 py-2 text-right text-gray-600">Subtotal</td>
                          <td className="px-4 py-2 text-right">
                            {formatCurrency(orderDetails.subtotal_cents || 0)}
                          </td>
                        </tr>
                        
                        {orderDetails.shipping_cents > 0 && (
                          <tr>
                            <td colSpan={2} className="px-4 py-2 text-right text-gray-600">Shipping</td>
                            <td className="px-4 py-2 text-right">
                              {formatCurrency(orderDetails.shipping_cents)}
                            </td>
                          </tr>
                        )}

                        {orderDetails.discount_cents > 0 && (
                          <tr>
                            <td colSpan={2} className="px-4 py-2 text-right text-green-600 font-medium">
                              Coupon {orderDetails.coupon_code ? `(${orderDetails.coupon_code})` : ''}
                            </td>
                            <td className="px-4 py-2 text-right text-green-600 font-medium">
                              -{formatCurrency(orderDetails.discount_cents)}
                            </td>
                          </tr>
                        )}

                        <tr>
                          <td colSpan={2} className="px-4 py-3 text-right font-bold text-lg border-t border-gray-200">Total:</td>
                          <td className="px-4 py-3 text-right font-bold text-lg border-t border-gray-200">
                            {/* SMART TOTAL CALCULATION: Subtotal + Shipping - Discount */}
                            {formatCurrency(
                              Math.max(0, 
                                (orderDetails.subtotal_cents || 0) + 
                                (orderDetails.shipping_cents || 0) - 
                                (orderDetails.discount_cents || 0)
                              )
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
