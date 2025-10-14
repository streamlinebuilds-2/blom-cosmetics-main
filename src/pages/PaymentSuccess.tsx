import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { cartStore } from '../lib/cart';

export default function PaymentSuccess() {
  const [orderInfo, setOrderInfo] = useState<any>(null);

  useEffect(() => {
    // Get pending order from localStorage
    const pendingOrder = localStorage.getItem('blom_pending_order');
    if (pendingOrder) {
      setOrderInfo(JSON.parse(pendingOrder));
      localStorage.removeItem('blom_pending_order');
    }
    
    // Clear cart on successful payment
    cartStore.clearCart();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      <Header showMobileMenu={true} />
      <main className="section-padding">
        <Container>
          {/* Confetti / Glow */}
          <div className="pointer-events-none fixed inset-0 opacity-60 mix-blend-screen" aria-hidden>
            <div className="absolute -top-10 left-1/4 w-40 h-40 rounded-full bg-pink-200 blur-3xl" />
            <div className="absolute top-10 right-1/4 w-40 h-40 rounded-full bg-blue-200 blur-3xl" />
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 sm:p-8">
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg">
                  <span className="text-2xl">✅</span>
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-2">Payment Successful</h1>
                <p className="text-gray-600 mb-6">Thank you for your order! A confirmation email has been sent to you.</p>

                {/* Order summary */}
                {orderInfo && (
                  <div className="text-left bg-gray-50 border rounded-xl p-4 sm:p-5 mb-6">
                    <h2 className="font-semibold text-gray-900 mb-3">Order Summary</h2>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <span>Order ID</span><span className="text-right font-mono">#{orderInfo.orderId}</span>
                      <span>Subtotal</span><span className="text-right">R{(orderInfo.total - orderInfo.shipping).toFixed(2)}</span>
                      <span>Shipping</span><span className="text-right">{orderInfo.shipping === 0 ? 'FREE' : `R${orderInfo.shipping.toFixed(2)}`}</span>
                      <span className="font-semibold">Total</span><span className="text-right font-semibold">R{orderInfo.total.toFixed(2)}</span>
                      <span>Status</span><span className="text-right text-green-600 font-medium">✅ Paid</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {orderInfo && (
                    <>
                      <a
                        href={`/.netlify/functions/invoice-pdf?inline=1&m_payment_id=${encodeURIComponent(orderInfo.orderId)}`}
                        target="_blank" rel="noopener"
                        className="inline-flex justify-center rounded-full border border-gray-300 px-6 py-3 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                      >
                        View Invoice
                      </a>
                      <a
                        href={`/.netlify/functions/invoice-pdf?m_payment_id=${encodeURIComponent(orderInfo.orderId)}`}
                        className="inline-flex justify-center rounded-full border border-gray-300 px-6 py-3 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Download PDF
                      </a>
                    </>
                  )}
                  <a href="/track-order" className="inline-flex justify-center rounded-full bg-pink-500 px-6 py-3 text-white font-semibold shadow hover:bg-pink-600 transition-colors">Track My Order</a>
                  <a href="/shop" className="inline-flex justify-center rounded-full border border-gray-300 px-6 py-3 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">Continue Shopping</a>
                </div>

                <p className="mt-6 text-xs text-gray-500">If you don’t receive a confirmation email within 5 minutes, contact <a className="underline" href="mailto:support@blom-cosmetics.co.za">support@blom-cosmetics.co.za</a>.</p>
              </div>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}


