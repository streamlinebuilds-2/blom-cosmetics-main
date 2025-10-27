import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';

type Order = {
  id: string;
  status: string;
  total: number;
  created_at: string;
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
      const { data, error } = await supabase
        .from('orders')
        .select('id,status,total,created_at')
        .eq('id', orderId)
        .maybeSingle();
      if (error) {
        setError(error.message);
        setOrder(null);
      } else if (data) {
        setOrder({
          id: String(data.id),
          status: String(data.status || 'unknown'),
          total: Number(data.total || 0),
          created_at: String(data.created_at || new Date().toISOString()),
        });
      } else {
        setOrder(null);
      }
      setLoading(false);
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
            <div className="max-w-3xl mx-auto bg-white rounded-xl border p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Order {order.id}</h1>
                <div className="text-right">
                  <div className="font-semibold">R{order.total.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</div>
                </div>
              </div>
              <div className="text-sm text-gray-600">Status: <span className="capitalize">{order.status}</span></div>
              <div className="border-t pt-4">
                <p className="text-gray-600">Order details will appear here (items, quantities, shipping). Coming soon.</p>
              </div>
              <div className="pt-2">
                <Button variant="outline" onClick={() => (window.location.href = '/account?full=1&tab=orders')}>Back to orders</Button>
              </div>
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
}


