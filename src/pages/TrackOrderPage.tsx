import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';

export const TrackOrderPage: React.FC = () => {
  const [orderId, setOrderId] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [order, setOrder] = React.useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const res = await fetch(`/.netlify/functions/track-order?m_payment_id=${encodeURIComponent(orderId)}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'Unable to fetch order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showMobileMenu={true} />
      <main className="section-padding">
        <Container>
          <h1 className="text-3xl font-bold mb-6">Track Your Order</h1>
          <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter your Order ID (m_payment_id)"
              className="flex-1 border rounded-md px-3 py-2"
              required
            />
            <button type="submit" className="px-4 py-2 rounded-md bg-pink-400 text-white" disabled={loading}>
              {loading ? 'Checking…' : 'Track'}
            </button>
          </form>
          {error && <p className="text-red-600 mb-4">{error}</p>}
          {order && (
            <div className="bg-white border rounded-lg p-4 space-y-2">
              <div className="flex justify-between"><span className="text-sm text-gray-600">Order ID</span><span className="font-medium">{order.merchant_payment_id}</span></div>
              <div className="flex justify-between"><span className="text-sm text-gray-600">Status</span><span className="font-medium">{String(order.status || '').toUpperCase()}</span></div>
              <div className="flex justify-between"><span className="text-sm text-gray-600">Total</span><span className="font-medium">R{Number(order.total_amount || 0).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-sm text-gray-600">Date</span><span className="font-medium">{new Date(order.created_at).toLocaleString()}</span></div>
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
};


