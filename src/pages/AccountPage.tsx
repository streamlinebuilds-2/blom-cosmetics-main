import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { User, Mail, Phone, MapPin, Package, Heart, Settings, CreditCard, Truck, Star, CreditCard as Edit, Eye, Download, Calendar, ShoppingBag, Award, Bell, Lock, HelpCircle, LogOut, AlertCircle } from 'lucide-react';
import { authService, AuthState } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { wishlistStore } from '../lib/wishlist';

export const AccountPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'settings'>('profile');

  // Check URL parameters for initial tab
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab && ['profile', 'orders', 'wishlist', 'settings'].includes(tab)) {
      setActiveTab(tab as 'profile' | 'orders' | 'wishlist' | 'settings');
    }
  }, []);
  const [authState, setAuthState] = useState<AuthState>({ user: null, loading: true, error: null });
  const [profile, setProfile] = useState<{ id: string; email: string | null; name: string | null; phone: string | null } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [wishlistItems, setWishlistItems] = useState(wishlistStore.getItems());

  useEffect(() => {
    document.title = 'My Account - BLOM Cosmetics';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Manage your BLOM Cosmetics account, view orders, update profile, and track your nail artistry journey.');
    }
    window.scrollTo({ top: 0 });

    // Subscribe to auth state changes
    const unsubscribe = authService.subscribe((newState) => {
      console.log('Auth state changed:', newState); // Debug log
      setAuthState(newState);
      
      // Only check auth after loading is complete
      if (!newState.loading && !newState.user) {
        // User is not authenticated, redirect to login
        console.log('Redirecting to login - no user found');
        setTimeout(() => {
          window.location.href = '/login?redirect=/account';
        }, 100);
      }
    });

    // Also check immediately in case auth is already initialized
    const currentState = authService.getState();
    console.log('Initial auth state:', currentState);
    if (!currentState.loading && !currentState.user) {
      console.log('Redirecting to login immediately - no user found');
      setTimeout(() => {
        window.location.href = '/login?redirect=/account';
      }, 100);
    }

    return unsubscribe;
  }, []);

  // Load profile when user is present
  useEffect(() => {
    (async () => {
      if (!authState.user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authState.user.id)
        .maybeSingle();
      if (!error && data) setProfile(data as any);
    })();
  }, [authState.user]);

  const saveProfile = async () => {
    if (!profile) return;
    setSavingProfile(true);
    const { error } = await supabase
      .from('profiles')
      .update({ name: profile.name, phone: profile.phone, email: profile.email })
      .eq('id', profile.id);
    setSavingProfile(false);
    if (!error) alert('Profile updated');
  };

  // Handle sign out
  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const result = await authService.signOut();
      if (result.success) {
        window.location.href = '/';
      } else {
        console.error('Sign out failed:', result.error);
        setIsSigningOut(false);
      }
    } catch (error) {
      console.error('Sign out error:', error);
      setIsSigningOut(false);
    }
  };

  // Show loading state (and also show if user exists but profile not fetched yet)
  if (authState.loading || (authState.user && profile === null)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showMobileMenu={true} />
        <main className="section-padding">
          <Container>
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your account...</p>
              <p className="text-xs text-gray-400 mt-2">If this takes too long, you'll be redirected to login</p>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  // If not loading and no user, show login prompt (fallback if redirect fails)
  if (!authState.loading && !authState.user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showMobileMenu={true} />
        <main className="section-padding">
          <Container>
            <div className="text-center py-16">
              <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Account Access Required</h2>
              <p className="text-gray-600 mb-6">Please sign in to view your account</p>
              <Button onClick={() => window.location.href = '/login?redirect=/account'}>
                Go to Login
              </Button>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (authState.error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showMobileMenu={true} />
        <main className="section-padding">
          <Container>
            <div className="text-center py-16">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Authentication Error</h2>
              <p className="text-gray-600 mb-6">{authState.error}</p>
              <Button onClick={() => window.location.href = '/login'}>
                Go to Login
              </Button>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  // User data from auth state
  const userData = {
    name: profile?.name || authState.user?.user_metadata?.full_name || authState.user?.email?.split('@')[0] || 'User',
    email: profile?.email || authState.user?.email || '',
    phone: profile?.phone || '',
    address: '—',
    memberSince: authService.formatMemberSince(authState.user?.created_at || ''),
    totalOrders: 0,
    totalSpent: 0,
    loyaltyPoints: 0
  };

  const recentOrders = [
    {
      id: 'BLOM-2024-001',
      date: '2024-01-15',
      status: 'Delivered',
      total: 450,
      items: 3,
      trackingNumber: 'TN123456789'
    },
    {
      id: 'BLOM-2024-002',
      date: '2024-01-10',
      status: 'Processing',
      total: 299,
      items: 2,
      trackingNumber: 'TN987654321'
    },
    {
      id: 'BLOM-2024-003',
      date: '2024-01-05',
      status: 'Shipped',
      total: 680,
      items: 5,
      trackingNumber: 'TN456789123'
    }
  ];

  // Subscribe to wishlist changes
  useEffect(() => {
    const unsubscribe = wishlistStore.subscribe(() => {
      setWishlistItems(wishlistStore.getItems());
    });

    return unsubscribe;
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'text-green-600 bg-green-100';
      case 'Shipped':
        return 'text-blue-600 bg-blue-100';
      case 'Processing':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatPrice = (price: number) => `R${price.toFixed(2)}`;

  const tabItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'signout', label: 'Sign Out', icon: LogOut, action: handleSignOut }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showMobileMenu={true} />

      <main className="section-padding">
        <Container>
          {/* Account Header */}
          <div className="bg-gradient-to-r from-pink-400 to-blue-300 rounded-2xl p-8 text-white mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="flex items-center gap-6 mb-6 md:mb-0">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">Welcome back, {userData.name}!</h1>
                  <p className="text-pink-100">Member since {userData.memberSince}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold">{userData.totalOrders}</div>
                  <div className="text-pink-100 text-sm">Orders</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{formatPrice(userData.totalSpent)}</div>
                  <div className="text-pink-100 text-sm">Total Spent</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{userData.loyaltyPoints}</div>
                  <div className="text-pink-100 text-sm">Points</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-0">
                  <nav className="space-y-1">
                    {tabItems.map((item) => (
                      item.action ? (
                        <button
                          key={item.id}
                          onClick={item.action}
                          disabled={isSigningOut}
                          className="w-full flex items-center gap-3 px-6 py-4 text-left transition-colors text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <item.icon className="h-5 w-5" />
                          {isSigningOut ? 'Signing Out...' : item.label}
                        </button>
                      ) : (
                        <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-colors ${
                          activeTab === item.id
                            ? 'bg-pink-50 text-pink-600 border-r-2 border-pink-400'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </button>
                      )
                    ))}
                  </nav>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="mt-6">
                <CardHeader>
                  <h3 className="font-bold">Quick Actions</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Continue Shopping
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Award className="h-4 w-4 mr-2" />
                    View Courses
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Personal Information</h2>
                        <Button variant="outline" size="sm" onClick={() => setActiveTab('profile')}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-gray-400" />
                            <div>
                              <div className="font-medium" id="accountEmail">{userData.name}</div>
                              <div className="text-sm text-gray-500">Full Name</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-gray-400" />
                            <div>
                              <div className="font-medium">{userData.email}</div>
                              <div className="text-sm text-gray-500">Email Address</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-gray-400" />
                            <div>
                              <div className="font-medium">{userData.phone || '—'}</div>
                              <div className="text-sm text-gray-500">Phone Number</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                            <div>
                              <div className="font-medium">{userData.address}</div>
                              <div className="text-sm text-gray-500">Billing Address</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <div>
                              <div className="font-medium" id="memberSince">{userData.memberSince}</div>
                              <div className="text-sm text-gray-500">Member Since</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Account Stats */}
                  <div className="grid md:grid-cols-3 gap-6">
                    <Card className="text-center">
                      <CardContent className="p-6">
                        <Package className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                        <div className="text-3xl font-bold text-blue-600 mb-2">{userData.totalOrders}</div>
                        <div className="text-gray-600">Total Orders</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="text-center">
                      <CardContent className="p-6">
                        <CreditCard className="h-12 w-12 text-green-400 mx-auto mb-4" />
                        <div className="text-3xl font-bold text-green-600 mb-2">{formatPrice(userData.totalSpent)}</div>
                        <div className="text-gray-600">Total Spent</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="text-center">
                      <CardContent className="p-6">
                        <Star className="h-12 w-12 text-primary-blue mx-auto mb-4" />
                        <div className="text-3xl font-bold text-yellow-600 mb-2">{userData.loyaltyPoints}</div>
                        <div className="text-gray-600">Loyalty Points</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <h2 className="text-2xl font-bold">Order History</h2>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentOrders.map((order) => (
                          <div key={order.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                              <div>
                                <h3 className="font-bold text-lg">Order {order.id}</h3>
                                <p className="text-gray-600">Placed on {new Date(order.date).toLocaleDateString()}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                  {order.status}
                                </span>
                                <div className="text-right">
                                  <div className="font-bold">{formatPrice(order.total)}</div>
                                  <div className="text-sm text-gray-500">{order.items} items</div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-3">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                              {order.status === 'Shipped' && (
                                <Button variant="outline" size="sm">
                                  <Truck className="h-4 w-4 mr-2" />
                                  Track Package
                                </Button>
                              )}
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Download Invoice
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="text-center mt-8">
                        <Button variant="outline">View All Orders</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <h2 className="text-2xl font-bold">My Wishlist</h2>
                    </CardHeader>
                    <CardContent>
                      {wishlistItems.length === 0 ? (
                        <div className="text-center py-12">
                          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
                          <p className="text-gray-500 mb-6">Save items you love to buy them later</p>
                          <Button>Continue Shopping</Button>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {wishlistItems.map((item) => (
                            <Card key={item.id} className="group">
                              <div className="aspect-square overflow-hidden">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <CardContent className="p-4">
                                <h3 className="font-semibold mb-2">{item.name}</h3>
                                <div className="flex items-center justify-between mb-4">
                                  <span className="text-xl font-bold text-pink-400">{formatPrice(item.price)}</span>
                                  <span className={`text-sm ${item.inStock ? 'text-green-600' : 'text-red-600'}`}>
                                    {item.inStock ? 'In Stock' : 'Out of Stock'}
                                  </span>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" className="flex-1" disabled={!item.inStock}>
                                    Add to Cart
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Heart className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <h2 className="text-2xl font-bold">Edit Profile</h2>
                    </CardHeader>
                    <CardContent>
                      {profile ? (
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <input className="input-field" value={profile.name ?? ''} onChange={e => setProfile(p => ({ ...p!, name: e.target.value }))} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                            <input className="input-field" value={profile.phone ?? ''} onChange={e => setProfile(p => ({ ...p!, phone: e.target.value }))} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input className="input-field" value={profile.email ?? ''} onChange={e => setProfile(p => ({ ...p!, email: e.target.value }))} />
                          </div>
                          <div className="flex items-end">
                            <Button onClick={saveProfile} disabled={savingProfile}>{savingProfile ? 'Saving...' : 'Save Profile'}</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500">Loading profile…</div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <h2 className="text-2xl font-bold">Account Settings</h2>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg">Notifications</h3>
                          <div className="space-y-3">
                            <label className="flex items-center gap-3">
                              <input type="checkbox" className="rounded" defaultChecked />
                              <span>Order updates</span>
                            </label>
                            <label className="flex items-center gap-3">
                              <input type="checkbox" className="rounded" defaultChecked />
                              <span>New product announcements</span>
                            </label>
                            <label className="flex items-center gap-3">
                              <input type="checkbox" className="rounded" />
                              <span>Marketing emails</span>
                            </label>
                            <label className="flex items-center gap-3">
                              <input type="checkbox" className="rounded" defaultChecked />
                              <span>Course updates</span>
                            </label>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg">Privacy</h3>
                          <div className="space-y-3">
                            <label className="flex items-center gap-3">
                              <input type="checkbox" className="rounded" defaultChecked />
                              <span>Profile visibility</span>
                            </label>
                            <label className="flex items-center gap-3">
                              <input type="checkbox" className="rounded" />
                              <span>Share purchase history</span>
                            </label>
                            <label className="flex items-center gap-3">
                              <input type="checkbox" className="rounded" defaultChecked />
                              <span>Analytics cookies</span>
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t pt-6">
                        <h3 className="font-semibold text-lg mb-4">Account Actions</h3>
                        <div className="flex flex-wrap gap-4">
                          <Button variant="outline">
                            <Lock className="h-4 w-4 mr-2" />
                            Change Password
                          </Button>
                          <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Download Data
                          </Button>
                          <Button variant="outline">
                            <Bell className="h-4 w-4 mr-2" />
                            Notification Settings
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
};