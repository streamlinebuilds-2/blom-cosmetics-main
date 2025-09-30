import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  User,
  Shield,
  Heart
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  React.useEffect(() => {
    document.title = 'Sign In – BLOM Cosmetics';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Sign in to your BLOM Cosmetics account to access your orders, wishlist, and exclusive member benefits.');
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Simulate login - in real app, this would call Supabase auth
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect to account page on success
      window.location.href = '/account';
    } catch (error) {
      setErrors({ general: 'Invalid email or password. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    {
      icon: User,
      title: 'Personal Dashboard',
      description: 'Track orders, manage addresses, and view purchase history'
    },
    {
      icon: Heart,
      title: 'Wishlist & Favorites',
      description: 'Save products for later and get notified of sales'
    },
    {
      icon: Shield,
      title: 'Exclusive Access',
      description: 'Early access to new products and member-only discounts'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showMobileMenu={true} />

      <main className="section-padding">
        <Container>
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Benefits */}
              <div className="order-2 lg:order-1">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Welcome Back to BLOM
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Sign in to access your account and enjoy exclusive member benefits
                </p>

                <div className="space-y-6">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-blue-300 rounded-lg flex items-center justify-center flex-shrink-0">
                        <benefit.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{benefit.title}</h3>
                        <p className="text-gray-600">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-pink-50 to-blue-50 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">New to BLOM?</h3>
                  <p className="text-gray-600 mb-4">
                    Create an account to start your nail artistry journey with us
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/signup'}
                  >
                    Create Account
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>

              {/* Right Side - Login Form */}
              <div className="order-1 lg:order-2">
                <Card className="shadow-xl">
                  <CardHeader>
                    <h2 className="text-2xl font-bold text-center">Sign In</h2>
                    <p className="text-gray-600 text-center">
                      Enter your credentials to access your account
                    </p>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {errors.general && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="text-red-600 text-sm">{errors.general}</p>
                        </div>
                      )}

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`input-field pl-12 ${errors.email ? 'border-red-300 focus:border-red-400 focus:ring-red-300' : ''}`}
                            placeholder="your@email.com"
                          />
                        </div>
                        {errors.email && (
                          <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className={`input-field pl-12 pr-12 ${errors.password ? 'border-red-300 focus:border-red-400 focus:ring-red-300' : ''}`}
                            placeholder="Enter your password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-pink-400 focus:ring-pink-300"
                          />
                          <span className="ml-2 text-sm text-gray-600">Remember me</span>
                        </label>
                        <a
                          href="/forgot-password"
                          className="text-sm text-pink-400 hover:text-pink-500 transition-colors"
                        >
                          Forgot password?
                        </a>
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        loading={isLoading}
                      >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                      </Button>

                      <div className="text-center">
                        <p className="text-gray-600">
                          Don't have an account?{' '}
                          <a
                            href="/signup"
                            className="text-pink-400 hover:text-pink-500 font-medium transition-colors"
                          >
                            Create one here
                          </a>
                        </p>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
};