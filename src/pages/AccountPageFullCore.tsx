import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Button } from '../components/ui/Button';
import { User, Mail, Phone, Calendar, Package, Heart, Settings } from 'lucide-react';
import { authService, AuthState } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { wishlistStore } from '../lib/wishlist';
import { fetchMyOrders } from '../lib/fetchMyOrders';

export default function AccountPageFullCore() {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'settings'>('profile');
  const [authState, setAuthState] = useState<AuthState>({ user: null, loading: true, error: null });
  const [profile, setProfile] = useState<{ id: string; email: string | null; name: string | null; phone: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [orders, setOrders] = useState<Array<{ id: string; m_payment_id?: string | null; order_number?: string | null; order_display?: string | null; status: string; total: number; created_at: string; invoice_url?: string | null; buyer_name?: string | null; buyer_email?: string | null }>>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [wishlistItems, setWishlistItems] = useState(wishlistStore.getItems());

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

  // Fetch orders for stats and Orders tab
  useEffect(() => {
    (async () => {
      if (!authState.user) return;
      setOrdersLoading(true);
      setOrdersError(null);
      
      try {
        const data = await fetchMyOrders();
        // Normalize totals to numbers (use total_cents if total is null)
        const normalized = (data || []).map((o: any) => ({
          id: String(o.id),
          m_payment_id: o.m_payment_id || null,
          order_number: o.order_number || null,
          order_display: o.order_display || null,
          status: String(o.status || 'unknown'),
          total: Number(o.total || (o.total_cents ? o.total_cents / 100 : 0)),
          created_at: String(o.created_at || new Date().toISOString()),
          invoice_url: o.invoice_url || null,
          buyer_name: o.buyer_name || null,
          buyer_email: o.buyer_email || null
        }));
        setOrders(normalized);
      } catch (error: any) {
        setOrdersError(error.message);
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    })();
  }, [authState.user?.id]);

  // Subscribe to wishlist changes (local store)
  useEffect(() => {
    const unsub = wishlistStore.subscribe(() => {
      setWishlistItems(wishlistStore.getItems());
    });
    return unsub;
  }, []);

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
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + (Number.isFinite(o.total) ? o.total : 0), 0);
  const points = Math.floor(totalSpent / 10);

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
              {/* Stats strip (live from orders) */}
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold">{totalOrders}</div>
                  <div className="text-pink-100 text-sm">Orders</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">R{totalSpent.toFixed(2)}</div>
                  <div className="text-pink-100 text-sm">Total Spent</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{points}</div>
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
                  {ordersLoading ? (
                    <div className="text-gray-600">Loading orders…</div>
                  ) : ordersError ? (
                    <div className="text-red-600">{ordersError}</div>
                  ) : orders.length === 0 ? (
                    <div className="text-gray-600">No orders yet.</div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((o) => {
                        const orderRef = (o as any).order_display || (o as any).m_payment_id || (o as any).order_number || o.id;
                        return (
                          <div key={o.id} className="border rounded-lg p-5">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                              <div>
                                <div className="font-semibold">Order {orderRef}</div>
                                <div className="text-sm text-gray-500">Placed on {new Date(o.created_at).toLocaleDateString()}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold">R{o.total.toFixed(2)}</div>
                                <div className="text-sm text-gray-500 capitalize">{o.status}</div>
                              </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button variant="outline" size="sm" onClick={() => (window.location.href = `/orders/${o.id}`)}>View Details</Button>
                              {orderRef && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => {
                                    const url = `/.netlify/functions/invoice-pdf?m_payment_id=${encodeURIComponent(orderRef)}`;
                                    window.open(url, '_blank');
                                  }}
                                >
                                  Download Receipt
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'wishlist' && (
                <div className="rounded-xl border p-6 bg-white">
                  <h2 className="text-2xl font-bold mb-6">My Wishlist</h2>
                  {wishlistItems.length === 0 ? (
                    <div className="text-gray-600">Your wishlist is empty.</div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {wishlistItems.map(item => (
                        <div key={item.id} className="border rounded-lg overflow-hidden">
                          <div className="aspect-square bg-gray-100">
                            {item.image && (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="p-4">
                            <div className="font-medium line-clamp-2">{item.name}</div>
                            <div className="text-sm text-gray-500">R{item.price.toFixed(2)}</div>
                            <div className="mt-3 flex gap-2">
                              <Button size="sm" className="flex-1" onClick={() => (window.location.href = `/products/${item.slug}`)}>View</Button>
                              <Button size="sm" variant="outline" onClick={() => wishlistStore.removeItem(item.productId)}>Remove</Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="rounded-xl border p-6 bg-white">
                  <h2 className="text-2xl font-bold mb-6">Settings</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        className="w-full border rounded-md px-3 py-2"
                        value={profile?.name ?? ''}
                        onChange={(e) => setProfile(p => p ? { ...p, name: e.target.value } : p)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        className="w-full border rounded-md px-3 py-2"
                        value={profile?.phone ?? ''}
                        onChange={(e) => setProfile(p => p ? { ...p, phone: e.target.value } : p)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input className="w-full border rounded-md px-3 py-2 bg-gray-100" value={profile?.email ?? email} disabled />
                      <p className="text-xs text-gray-500 mt-1">Email changes require re-verification (coming soon).</p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-3">
                    <Button
                      onClick={async () => {
                        if (!authState.user || !profile) return;
                        setSaving(true); setStatus(null);
                        const { error } = await supabase
                          .from('profiles')
                          .update({ name: profile.name, phone: profile.phone })
                          .eq('id', authState.user.id);
                        setSaving(false);
                        setStatus(error ? `Error: ${error.message}` : 'Saved');
                      }}
                      disabled={saving}
                    >
                      {saving ? 'Saving…' : 'Save Changes'}
                    </Button>
                    {status && <span className="text-sm text-gray-600">{status}</span>}
                  </div>
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


