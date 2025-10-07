import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Button } from '../components/ui/Button';
import { User, Mail, Phone, Calendar, Package, Heart, Settings } from 'lucide-react';
import { authService, AuthState } from '../lib/auth';
import { supabase } from '../lib/supabase';

export default function AccountPageFullCore() {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'settings'>('profile');
  const [authState, setAuthState] = useState<AuthState>({ user: null, loading: true, error: null });
  const [profile, setProfile] = useState<{ id: string; email: string | null; name: string | null; phone: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'My Account - BLOM Cosmetics';
    const unsub = authService.subscribe((s) => setAuthState(s));
    return unsub;
  }, []);

  useEffect(() => {
    (async () => {
      if (!authState.user) { setLoading(false); return; }
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authState.user.id)
          .maybeSingle();
        if (data) {
          setProfile(data as any);
        } else {
          await supabase.from('profiles').upsert({ id: authState.user.id, email: authState.user.email ?? null, name: authState.user.user_metadata?.name ?? null, phone: authState.user.user_metadata?.phone ?? null }, { onConflict: 'id' });
          setProfile({ id: authState.user.id, email: authState.user.email ?? null, name: authState.user.user_metadata?.name ?? null, phone: authState.user.user_metadata?.phone ?? null });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [authState.user?.id]);

  if (authState.loading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showMobileMenu={true} />
        <main className="section-padding">
          <Container>
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your account…</p>
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
              <Button onClick={() => (window.location.href = '/login?redirect=/account')}>Log In</Button>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  const name = profile?.name || authState.user.user_metadata?.full_name || authState.user.email?.split('@')[0] || 'User';
  const email = profile?.email || authState.user.email || '—';
  const phone = profile?.phone || '—';
  const memberSince = authService.formatMemberSince(authState.user.created_at || '');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showMobileMenu={true} />
      <main className="section-padding">
        <Container>
          <div className="bg-gradient-to-r from-pink-400 to-blue-300 rounded-2xl p-8 text-white mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold">Welcome back, {name}!</h1>
                <p className="text-pink-100">Member since {memberSince}</p>
              </div>
              {/* Stats strip (static placeholders for now) */}
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-pink-100 text-sm">Orders</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">R0.00</div>
                  <div className="text-pink-100 text-sm">Total Spent</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-pink-100 text-sm">Points</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar (plain divs, no effects) */}
            <aside className="lg:col-span-1">
              <nav className="rounded-xl border bg-white divide-y">
                <button
                  className={`w-full text-left px-5 py-4 flex items-center gap-3 ${activeTab==='profile' ? 'bg-pink-50 text-pink-600' : 'hover:bg-gray-50'}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <User className="h-5 w-5" /> Profile
                </button>
                <button
                  className={`w-full text-left px-5 py-4 flex items-center gap-3 ${activeTab==='orders' ? 'bg-pink-50 text-pink-600' : 'hover:bg-gray-50'}`}
                  onClick={() => setActiveTab('orders')}
                >
                  <Package className="h-5 w-5" /> Orders
                </button>
                <button
                  className={`w-full text-left px-5 py-4 flex items-center gap-3 ${activeTab==='wishlist' ? 'bg-pink-50 text-pink-600' : 'hover:bg-gray-50'}`}
                  onClick={() => setActiveTab('wishlist')}
                >
                  <Heart className="h-5 w-5" /> Wishlist
                </button>
                <button
                  className={`w-full text-left px-5 py-4 flex items-center gap-3 ${activeTab==='settings' ? 'bg-pink-50 text-pink-600' : 'hover:bg-gray-50'}`}
                  onClick={() => setActiveTab('settings')}
                >
                  <Settings className="h-5 w-5" /> Settings
                </button>
              </nav>
            </aside>

            {/* Main content */}
            <section className="lg:col-span-3 space-y-8">
              {activeTab === 'profile' && (
                <div className="rounded-xl border p-6 bg-white">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold">Personal Information</h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium">{name}</div>
                          <div className="text-sm text-gray-500">Full Name</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium">{email}</div>
                          <div className="text-sm text-gray-500">Email Address</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium">{phone}</div>
                          <div className="text-sm text-gray-500">Phone Number</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium">{memberSince}</div>
                          <div className="text-sm text-gray-500">Member Since</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button onClick={async () => { await authService.signOut(); window.location.href = '/'; }}>Log Out</Button>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="rounded-xl border p-6 bg-white">
                  <h2 className="text-2xl font-bold mb-6">Order History</h2>
                  <div className="space-y-4">
                    {[1,2,3].map((i) => (
                      <div key={i} className="border rounded-lg p-5">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div>
                            <div className="font-semibold">Order BLOM-2024-00{i}</div>
                            <div className="text-sm text-gray-500">Placed on 2024-01-0{i}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">R{(i*199).toFixed(2)}</div>
                            <div className="text-sm text-gray-500">{i+1} items</div>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button variant="outline" size="sm">View Details</Button>
                          <Button variant="outline" size="sm">Download Invoice</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'wishlist' && (
                <div className="rounded-xl border p-6 bg-white">
                  <h2 className="text-2xl font-bold mb-4">My Wishlist</h2>
                  <p className="text-gray-600">Wishlist items will appear here.</p>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="rounded-xl border p-6 bg-white">
                  <h2 className="text-2xl font-bold mb-4">Settings</h2>
                  <p className="text-gray-600">Profile and account settings will appear here.</p>
                </div>
              )}
            </section>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}


