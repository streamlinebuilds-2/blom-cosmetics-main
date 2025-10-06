import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';

export default function CheckoutSuccess() {
  const [status, setStatus] = useState<'checking' | 'paid' | 'pending' | 'not-found'>('checking');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order');
    if (!orderId) {
      setStatus('not-found');
      return;
    }

    (async () => {
      // Poll a few times in case ITN takes a second to update the order
      for (let i = 0; i < 8; i++) {
        const { data, error } = await supabase
          .from('orders')
          .select('status, payment_status')
          .eq('id', orderId)
          .maybeSingle();
        if (!error && data) {
          if (data.status === 'paid' || data.payment_status === 'paid') {
            setStatus('paid');
            return;
          }
        }
        await new Promise((r) => setTimeout(r, 1200));
      }
      setStatus('pending');
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showMobileMenu={true} />
      <main className="section-padding">
        <Container>
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <h2 className="text-2xl font-bold">Checkout Status</h2>
            </CardHeader>
            <CardContent>
              {status === 'checking' && (
                <p className="text-gray-700">Verifying payment…</p>
              )}
              {status === 'paid' && (
                <div>
                  <h3 className="text-xl font-semibold mb-2">Payment received 🎉</h3>
                  <p className="text-gray-700 mb-6">Your order is confirmed. You’ll get an email shortly.</p>
                  <Button onClick={() => (window.location.href = '/orders')}>View my orders</Button>
                </div>
              )}
              {status === 'pending' && (
                <div>
                  <h3 className="text-xl font-semibold mb-2">We’re confirming your payment…</h3>
                  <p className="text-gray-700">If this page doesn’t update, we’ll email you once it’s confirmed.</p>
                </div>
              )}
              {status === 'not-found' && (
                <div>
                  <h3 className="text-xl font-semibold mb-2">Order not found</h3>
                  <Button variant="outline" onClick={() => (window.location.href = '/cart')}>Back to cart</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </Container>
      </main>
      <Footer />
    </div>
  );
}


