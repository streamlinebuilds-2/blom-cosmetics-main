import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  User, 
  Package, 
  MapPin, 
  ShoppingBag, 
  MessageCircle, 
  LogOut,
  Calendar,
  Mail,
  Settings,
  Heart,
  CreditCard,
  Bell
} from 'lucide-react';

export const AccountPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('account');

  useEffect(() => {
    document.title = 'My Account – BLOM Cosmetics';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Update your account details, view orders, manage addresses, and more.');
    }

    // Simulate user data - in real app, this would come from Supabase
    const mockUser = {
      email: 'user@example.com',
      memberSince: '2023-06-15',
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '+27 82 123 4567'
    };

    setUser(mockUser);
    setLoading(false);
  }, []);

  const handleSignOut = () => {
    // In real app, this would call Supabase auth signOut
    console.log('Signing out...');
    window.location.href = '/login';
  };

  const formatMemberSince = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const navigationTabs = [
    { id: 'account', label: 'Account', icon: User, active: true },
    { id: 'orders', label: 'Orders', icon: Package, href: '/account/orders' },
    { id: 'addresses', label: 'Addresses', icon: MapPin, href: '/account/addresses' },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, href: '/account/wishlist' }
  ];

  const quickActions = [
    {
      title: 'View Orders',
      description: 'Track your recent purchases',
      icon: Package,
      href: '/account/orders',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Manage Addresses',
      description: 'Update shipping & billing info',
      icon: MapPin,
      href: '/account/addresses',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Continue Shopping',
      description: 'Browse our latest products',
      icon: ShoppingBag,
      href: '/shop',
      color: 'bg-pink-100 text-pink-600'
    },
    {
      title: 'Contact Support',
      description: 'Get help from our team',
      icon: MessageCircle,
      href: '/contact',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showMobileMenu={true} />
        <main className="section-padding">
          <Container>
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
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
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Account</h1>
            <p className="text-lg text-gray-600">Manage your account settings and preferences</p>
          </div>

          {/* Account Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {navigationTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => tab.href ? window.location.href = tab.href : setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'border-pink-400 text-pink-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Account Information */}
            <div className="lg:col-span-2">
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Account Information</h2>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <p className="text-gray-900 font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <p id="accountEmail" className="text-gray-900 font-medium">
                        {user.email}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <p className="text-gray-900 font-medium">
                        {user.phone}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Member Since
                      </label>
                      <p id="memberSince" className="text-gray-900 font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {formatMemberSince(user.memberSince)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {quickActions.map((action, index) => (
                    <Card key={index} className="group cursor-pointer hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${action.color}`}>
                            <action.icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1 group-hover:text-pink-400 transition-colors">
                              {action.title}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {action.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Account Stats */}
              <Card className="mb-6">
                <CardHeader>
                  <h3 className="text-lg font-bold">Account Summary</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Orders</span>
                      <span className="font-bold text-pink-400">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Wishlist Items</span>
                      <span className="font-bold text-pink-400">5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Loyalty Points</span>
                      <span className="font-bold text-pink-400">2,450</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Actions */}
              <Card className="mb-6">
                <CardHeader>
                  <h3 className="text-lg font-bold">Account Actions</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Payment Methods
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Privacy Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Sign Out */}
              <Card>
                <CardContent className="p-4">
                  <Button
                    variant="outline"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
};