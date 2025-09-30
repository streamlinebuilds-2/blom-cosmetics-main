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
  User,
  Phone,
  ArrowRight,
  CheckCircle,
  Gift,
  Star
} from 'lucide-react';

export const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    subscribeNewsletter: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  React.useEffect(() => {
    document.title = 'Create Account – BLOM Cosmetics';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Join BLOM Cosmetics and get exclusive access to premium nail products, expert courses, and member-only benefits.');
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Simulate signup - in real app, this would call Supabase auth
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to account page on success
      window.location.href = '/account';
    } catch (error) {
      setErrors({ general: 'Failed to create account. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    {
      icon: Gift,
      title: '15% Off First Order',
      description: 'Welcome discount on your first purchase'
    },
    {
      icon: Star,
      title: 'Exclusive Access',
      description: 'Early access to new products and sales'
    },
    {
      icon: CheckCircle,
      title: 'Expert Support',
      description: 'Priority customer service and nail advice'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showMobileMenu={true} />

      <main className="section-padding">
        <Container>
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left Side - Benefits */}
              <div className="order-2 lg:order-1">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Join the BLOM Family
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Create your account and unlock exclusive benefits, expert courses, 
                  and premium nail products designed for professionals.
                </p>

                <div className="space-y-6 mb-8">
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

                <div className="p-6 bg-gradient-to-r from-pink-50 to-blue-50 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Already have an account?</h3>
                  <p className="text-gray-600 mb-4">
                    Sign in to access your dashboard and continue your nail artistry journey
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/login'}
                  >
                    Sign In
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>

              {/* Right Side - Signup Form */}
              <div className="order-1 lg:order-2">
                <Card className="shadow-xl">
                  <CardHeader>
                    <h2 className="text-2xl font-bold text-center">Create Account</h2>
                    <p className="text-gray-600 text-center">
                      Join thousands of nail professionals worldwide
                    </p>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {errors.general && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="text-red-600 text-sm">{errors.general}</p>
                        </div>
                      )}

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                            First Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="text"
                              id="firstName"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              className={`input-field pl-12 ${errors.firstName ? 'border-red-300 focus:border-red-400 focus:ring-red-300' : ''}`}
                              placeholder="John"
                            />
                          </div>
                          {errors.firstName && (
                            <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name
                          </label>
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className={`input-field ${errors.lastName ? 'border-red-300 focus:border-red-400 focus:ring-red-300' : ''}`}
                            placeholder="Doe"
                          />
                          {errors.lastName && (
                            <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>
                          )}
                        </div>
                      </div>

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
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number (Optional)
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="input-field pl-12"
                            placeholder="+27 XX XXX XXXX"
                          />
                        </div>
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
                            placeholder="Create a strong password"
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
                        <p className="text-xs text-gray-500 mt-1">
                          Must be 8+ characters with uppercase, lowercase, and number
                        </p>
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className={`input-field pl-12 pr-12 ${errors.confirmPassword ? 'border-red-300 focus:border-red-400 focus:ring-red-300' : ''}`}
                            placeholder="Confirm your password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            name="agreeToTerms"
                            checked={formData.agreeToTerms}
                            onChange={handleInputChange}
                            className="mt-1 rounded border-gray-300 text-pink-400 focus:ring-pink-300"
                          />
                          <span className="text-sm text-gray-600">
                            I agree to the{' '}
                            <a href="/terms" className="text-pink-400 hover:text-pink-500 transition-colors">
                              Terms of Service
                            </a>{' '}
                            and{' '}
                            <a href="/privacy" className="text-pink-400 hover:text-pink-500 transition-colors">
                              Privacy Policy
                            </a>
                          </span>
                        </label>
                        {errors.agreeToTerms && (
                          <p className="text-red-600 text-sm">{errors.agreeToTerms}</p>
                        )}

                        <label className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            name="subscribeNewsletter"
                            checked={formData.subscribeNewsletter}
                            onChange={handleInputChange}
                            className="mt-1 rounded border-gray-300 text-pink-400 focus:ring-pink-300"
                          />
                          <span className="text-sm text-gray-600">
                            Subscribe to our newsletter for exclusive offers and nail art tips
                          </span>
                        </label>
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        loading={isLoading}
                      >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                      </Button>

                      <div className="text-center">
                        <p className="text-gray-600">
                          Already have an account?{' '}
                          <a
                            href="/login"
                            className="text-pink-400 hover:text-pink-500 font-medium transition-colors"
                          >
                            Sign in here
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