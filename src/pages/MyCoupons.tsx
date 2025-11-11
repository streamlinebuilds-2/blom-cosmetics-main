import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Button } from '../components/ui/Button';
import { Ticket, Calendar, Percent } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { authService, AuthState } from '../lib/auth';

interface Coupon {
  id: string;
  code: string;
  percent: number;
  valid_until: string;
  used_count: number;
  max_uses: number;
  min_order_cents: number | null;
  email_locked: string | null;
  active: boolean;
  created_at: string;
}

export default function MyCoupons() {
  const [authState, setAuthState] = useState<AuthState>({ user: null, loading: true, error: null });
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'My Coupons - BLOM Cosmetics';
    const unsub = authService.subscribe((s) => setAuthState(s));
    return unsub;
  }, []);

  useEffect(() => {
    const fetchCoupons = async () => {
      if (!authState.user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: rpcError } = await supabase.rpc('get_my_active_coupons');

        if (rpcError) {
          throw rpcError;
        }

        setCoupons(data || []);
      } catch (err: any) {
        console.error('Error fetching coupons:', err);
        setError(err.message || 'Failed to load coupons');
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, [authState.user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    // Could add a toast notification here
    alert(`Coupon code "${code}" copied to clipboard!`);
  };

  if (authState.loading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showMobileMenu={true} />
        <main className="section-padding">
          <Container>
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your coupons…</p>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  if (!authState.user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showMobileMenu={true} />
        <main className="section-padding">
          <Container>
            <div className="text-center py-16">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h1>
              <p className="text-gray-600 mb-6">You need to be logged in to view your coupons.</p>
              <Button onClick={() => (window.location.href = '/login?redirect=/account/coupons')}>
                Log In
              </Button>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showMobileMenu={true} />
      <main className="section-padding">
        <Container>
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Ticket className="h-8 w-8 text-pink-500" />
              <h1 className="text-3xl font-bold text-gray-900">My Coupons</h1>
            </div>
            <p className="text-gray-600">Active coupons available for your account</p>
          </div>

          {/* Back to Account */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/account')}
            >
              ← Back to Account
            </Button>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Coupons List */}
          {coupons.length === 0 ? (
            <div className="bg-white rounded-xl border p-12 text-center">
              <Ticket className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No active coupons</h2>
              <p className="text-gray-600">
                You don't have any active coupons at the moment. Check back later for exclusive deals!
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="bg-gradient-to-br from-pink-50 to-blue-50 rounded-xl border-2 border-pink-200 p-6 hover:shadow-lg transition-shadow"
                >
                  {/* Coupon Code */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Ticket className="h-5 w-5 text-pink-500" />
                      <span className="text-sm font-medium text-gray-600">Coupon Code</span>
                    </div>
                    <div className="bg-white rounded-lg px-4 py-3 border-2 border-dashed border-pink-300">
                      <code className="text-2xl font-bold text-pink-600">{coupon.code}</code>
                    </div>
                  </div>

                  {/* Discount Amount */}
                  <div className="mb-4 flex items-center gap-3">
                    <Percent className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="text-3xl font-bold text-gray-900">{coupon.percent}% OFF</div>
                      {coupon.min_order_cents && (
                        <div className="text-sm text-gray-600">
                          Min. order: R{(coupon.min_order_cents / 100).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Valid Until */}
                  <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Valid until {formatDate(coupon.valid_until)}</span>
                  </div>

                  {/* Usage Info */}
                  <div className="mb-4 text-sm text-gray-600">
                    <span>
                      {coupon.max_uses - coupon.used_count} use
                      {coupon.max_uses - coupon.used_count !== 1 ? 's' : ''} remaining
                    </span>
                  </div>

                  {/* Copy Button */}
                  <Button
                    className="w-full"
                    onClick={() => copyToClipboard(coupon.code)}
                  >
                    Copy Code
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
}
