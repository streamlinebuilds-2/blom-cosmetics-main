import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';

type OrderItem = {
  id: string;
  product_name: string | null;
  sku: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
};

type Order = {
  id: string;
  m_payment_id: string | null;
  order_number: string | null;
  status: string;
  total: number;
  created_at: string;
  buyer_name: string | null;
  buyer_email: string | null;
  fulfillment_method: string | null;
  delivery_address: any;
  items: OrderItem[];
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = id || '';
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = `Order ${orderId} - BLOM Cosmetics`;
    (async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Try orders_account_v1 view first, fallback to orders table
        let orderQuery = supabase
          .from('orders_account_v1')
          .select('id, m_payment_id, order_number, status, total, created_at, buyer_name, buyer_email, fulfillment_method, delivery_address')
          .eq('id', orderId)
          .maybeSingle();

        let { data: orderData, error: orderError } = await orderQuery;

        // Fallback to orders table if view doesn't exist
        if (orderError && (orderError.code === '42P01' || orderError.message?.includes('does not exist'))) {
          orderQuery = supabase
            .from('orders')
            .select('id, m_payment_id, order_number, status, total, created_at, buyer_name, buyer_email, fulfillment_method, delivery_address')
            .eq('id', orderId)
            .maybeSingle();
          
          const result = await orderQuery;
          orderData = result.data;
          orderError = result.error;
        }

        if (orderError) {
          setError(orderError.message);
          setOrder(null);
          setLoading(false);
          return;
        }

        if (!orderData) {
          setOrder(null);
          setLoading(false);
          return;
        }

        // Fetch order items from order_items_account_v1 or order_items
        let itemsQuery = supabase
          .from('order_items_account_v1')
          .select('id, product_name, sku, quantity, unit_price, line_total')
          .eq('order_id', orderId);

        let { data: itemsData, error: itemsError } = await itemsQuery;

        // Fallback to order_items table
        if (itemsError && (itemsError.code === '42P01' || itemsError.message?.includes('does not exist'))) {
          itemsQuery = supabase
            .from('order_items')
            .select('id, product_name, sku, quantity, unit_price, line_total')
            .eq('order_id', orderId);
          
          const result = await itemsQuery;
          itemsData = result.data;
        }

        setOrder({
          id: String(orderData.id),
          m_payment_id: orderData.m_payment_id || null,
          order_number: orderData.order_number || null,
          status: String(orderData.status || 'unknown'),
          total: Number(orderData.total || 0),
          created_at: String(orderData.created_at || new Date().toISOString()),
          buyer_name: orderData.buyer_name || null,
          buyer_email: orderData.buyer_email || null,
          fulfillment_method: orderData.fulfillment_method || null,
          delivery_address: orderData.delivery_address || null,
          items: (itemsData || []).map((item: any) => {
            const qty = Number(item.quantity || 0);
            const unit = Number(item.unit_price || 0);
            const lineTotal = item.line_total ? Number(item.line_total) : (qty * unit);
            return {
              id: String(item.id),
              product_name: item.product_name || null,
              sku: item.sku || null,
              quantity: qty,
              unit_price: unit,
              line_total: lineTotal,
            };
          }),
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load order');
        setOrder(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showMobileMenu={true} />
      <main className="section-padding">
        <Container>
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading order…</p>
            </div>
          ) : error ? (
            <div className="max-w-3xl mx-auto bg-white rounded-xl border p-6">
              <h1 className="text-2xl font-bold mb-2">Order not available</h1>
              <p className="text-red-600 mb-4">{error}</p>
              <Button variant="outline" onClick={() => (window.location.href = '/account?full=1&tab=orders')}>Back to orders</Button>
            </div>
          ) : !order ? (
            <div className="max-w-3xl mx-auto bg-white rounded-xl border p-6">
              <h1 className="text-2xl font-bold mb-2">Order not found</h1>
              <p className="text-gray-600 mb-4">We couldn't find this order.</p>
              <Button variant="outline" onClick={() => (window.location.href = '/account?full=1&tab=orders')}>Back to orders</Button>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto bg-white rounded-xl border p-8 space-y-6">
              {/* Header section matching PDF layout */}
              <div className="flex items-start justify-between pb-6 border-b">
                {/* Left: Receipt title and details */}
                <div>
                  <h1 className="text-3xl font-bold mb-3">RECEIPT</h1>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Receipt #: {order.m_payment_id || order.order_number || order.id}</div>
                    <div>Date: {new Date(order.created_at).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                  </div>
                </div>
                
                {/* Right: Logo */}
                <div className="flex-shrink-0">
                  <img 
                    src="https://yvmnedjybrpvlupygusf.supabase.co/storage/v1/object/public/assets/blom_logo.png" 
                    alt="BLOM Cosmetics" 
                    className="h-20 w-auto object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Customer / Fulfillment section matching PDF */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b">
                <div>
                  <h2 className="font-bold text-base mb-3">Customer</h2>
                  <div className="space-y-1.5 text-sm">
                    <div className="font-medium">{order.buyer_name || "-"}</div>
                    <div className="text-gray-600">{order.buyer_email || "-"}</div>
                    {order.buyer_phone && <div className="text-gray-600">{order.buyer_phone}</div>}
                  </div>
                </div>
                <div>
                  <h2 className="font-bold text-base mb-3">Fulfillment</h2>
                  <div className="space-y-1.5 text-sm">
                    <div className="font-medium uppercase">{order.fulfillment_method || "-"}</div>
                    {order.delivery_address && order.fulfillment_method === 'delivery' && (
                      <div className="text-gray-600 space-y-0.5">
                        {order.delivery_address.line1 || order.delivery_address.street_address ? (
                          <>
                            <div>{order.delivery_address.line1 || order.delivery_address.street_address}</div>
                            <div>{[order.delivery_address.city, order.delivery_address.postal_code || order.delivery_address.code].filter(Boolean).join(' ')}</div>
                            <div>{[order.delivery_address.province, order.delivery_address.country].filter(Boolean).join(', ')}</div>
                          </>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items table matching PDF */}
              <div className="pb-6 border-b">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b pb-2">
                      <th className="text-left py-2.5 px-3 text-sm font-bold">Item</th>
                      <th className="text-right py-2.5 px-3 text-sm font-bold">Qty</th>
                      <th className="text-right py-2.5 px-3 text-sm font-bold">Unit</th>
                      <th className="text-right py-2.5 px-3 text-sm font-bold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="py-3 px-3 text-sm">
                            <div className="font-medium">{item.product_name || item.sku || 'Unknown Item'}</div>
                          </td>
                          <td className="text-right py-3 px-3 text-sm">{item.quantity}</td>
                          <td className="text-right py-3 px-3 text-sm">R {item.unit_price.toFixed(2)}</td>
                          <td className="text-right py-3 px-3 text-sm font-medium">R {item.line_total.toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-gray-600 text-sm">No items found for this order.</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2">
                      <td colSpan={2} className="py-3 px-3"></td>
                      <td className="text-right py-3 px-3 text-base font-bold">Total</td>
                      <td className="text-right py-3 px-3 text-base font-bold">R {order.total.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Footer with contact info matching PDF */}
              <div className="pt-6 border-t space-y-4">
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="font-medium">Thank you for your purchase!</div>
                  <div>Questions? Contact us:</div>
                  <div>Email: support@blom-cosmetics.co.za</div>
                  <div>Phone: +27 (0) 82 000 0000</div>
                </div>
                <div className="text-right text-sm text-gray-600">blom-cosmetics.co.za</div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-6">
                <Button variant="outline" onClick={() => (window.location.href = '/account?full=1&tab=orders')}>
                  Back to orders
                </Button>
                {order.m_payment_id && (
                  <Button 
                    variant="outline"
                    onClick={async () => {
                      const url = `/.netlify/functions/invoice-pdf?m_payment_id=${encodeURIComponent(order.m_payment_id)}&download=1`;
                      
                      // Fetch and trigger download
                      try {
                        const response = await fetch(url);
                        if (response.ok) {
                          const blob = await response.blob();
                          const downloadUrl = window.URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = downloadUrl;
                          link.download = `BLOM-Receipt-${order.m_payment_id}.pdf`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          window.URL.revokeObjectURL(downloadUrl);
                        } else {
                          // Fallback to opening in new tab
                          window.open(url, '_blank');
                        }
                      } catch (error) {
                        console.error('Download failed:', error);
                        // Fallback to opening in new tab
                        window.open(url, '_blank');
                      }
                    }}
                  >
                    Download Receipt
                  </Button>
                )}
              </div>
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
}


