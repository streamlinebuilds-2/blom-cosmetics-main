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
          items: (itemsData || []).map((item: any) => ({
            id: String(item.id),
            product_name: item.product_name || null,
            sku: item.sku || null,
            quantity: Number(item.quantity || 0),
            unit_price: Number(item.unit_price || 0),
            line_total: Number(item.line_total || 0),
          })),
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
            <div className="max-w-4xl mx-auto bg-white rounded-xl border p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">
                    Order {order.order_number || order.m_payment_id || order.id}
                  </h1>
                  <div className="text-sm text-gray-500 mt-1">{new Date(order.created_at).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-lg">R{order.total.toFixed(2)}</div>
                  <div className="text-sm text-gray-500 capitalize">{order.status}</div>
                </div>
              </div>

              {(order.buyer_name || order.buyer_email) && (
                <div className="border-t pt-4">
                  <h2 className="font-semibold mb-2">Customer Information</h2>
                  <div className="text-sm text-gray-600 space-y-1">
                    {order.buyer_name && <div><strong>Name:</strong> {order.buyer_name}</div>}
                    {order.buyer_email && <div><strong>Email:</strong> {order.buyer_email}</div>}
                    {order.fulfillment_method && <div><strong>Fulfillment:</strong> {order.fulfillment_method}</div>}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <h2 className="font-semibold mb-4">Order Items</h2>
                {order.items && order.items.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3 font-semibold">Item</th>
                          <th className="text-right py-2 px-3 font-semibold">Qty</th>
                          <th className="text-right py-2 px-3 font-semibold">Unit</th>
                          <th className="text-right py-2 px-3 font-semibold">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item) => (
                          <tr key={item.id} className="border-b">
                            <td className="py-2 px-3">
                              <div className="font-medium">{item.product_name || item.sku || 'Unknown Item'}</div>
                              {item.sku && <div className="text-xs text-gray-500">SKU: {item.sku}</div>}
                            </td>
                            <td className="text-right py-2 px-3">{item.quantity}</td>
                            <td className="text-right py-2 px-3">R{item.unit_price.toFixed(2)}</td>
                            <td className="text-right py-2 px-3 font-medium">R{item.line_total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2">
                          <td colSpan={3} className="text-right py-2 px-3 font-semibold">Total</td>
                          <td className="text-right py-2 px-3 font-bold text-lg">R{order.total.toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-600">No items found for this order.</p>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => (window.location.href = '/account?full=1&tab=orders')}>
                  Back to orders
                </Button>
                {(order.m_payment_id || order.order_number) && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const orderRef = order.m_payment_id || order.order_number;
                      const url = `/.netlify/functions/invoice-pdf?m_payment_id=${encodeURIComponent(orderRef!)}`;
                      window.open(url, '_blank');
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


