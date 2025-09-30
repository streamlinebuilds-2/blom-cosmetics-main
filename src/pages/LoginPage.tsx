import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { authService } from '../lib/auth';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'error' | 'success' | null; message: string }>({
    type: null,
    message: ''
  });
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    document.title = 'Login – BLOM Cosmetics';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Log in to your BLOM Cosmetics account to view orders and manage your profile.');
    }
    window.scrollTo({ top: 0 });

    // Check if user is already logged in
    const authState = authService.getState();
    if (authState.user && !authState.loading) {
      window.location.href = '/account';
    }
  }, []);

  useEffect(() => {
    // Validate form
    const isValid = formData.email.includes('@') && 
                   formData.email.includes('.') && 
                   formData.password.length >= 6;
    setIsFormValid(isValid);
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear status when user starts typing
    if (status.type) {
      setStatus({ type: null, message: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setStatus({ type: null, message: '' });

    try {
      const result = await authService.signInWithEmail(
        formData.email, 
        formData.password, 
        { remember: formData.remember }
      );

      if (result.success) {
        setStatus({ type: 'success', message: 'Login successful! Redirecting...' });
        setTimeout(() => {
          window.location.href = '/account';
        }, 1000);
      } else {
        setStatus({ 
          type: 'error', 
          message: result.error || 'Login failed. Please check your credentials.' 
        });
      }
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: 'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setStatus({ 
        type: 'error', 
        message: 'Please enter your email address first.' 
      });
      return;
    }

    try {
      const result = await authService.resetPassword(formData.email);
      if (result.success) {
        setStatus({ 
          type: 'success', 
          message: 'Password reset email sent! Check your inbox.' 
        });
      } else {
        setStatus({ 
          type: 'error', 
          message: result.error || 'Failed to send reset email.' 
        });
      }
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: 'An error occurred. Please try again.' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showMobileMenu={true} />

      <main className="section-padding">
        <Container>
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
              <p className="text-xl text-gray-600">
                Log in to manage your orders and account
              </p>
            </div>

            {/* Login Form */}
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold text-center">Sign In</h2>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div>
                    <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        id="loginEmail"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="input-field pl-12"
                        placeholder="your@email.com"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="loginPassword"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="input-field pl-12 pr-12"
                        placeholder="Enter your password"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                        aria-pressed={showPassword}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="loginRemember"
                        name="remember"
                        checked={formData.remember}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-pink-400 focus:ring-pink-300"
                      />
                      <span className="text-sm text-gray-600">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-pink-400 hover:text-pink-500 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Status Message */}
                  {status.type && (
                    <div 
                      id="loginStatus" 
                      className={`form-status p-4 rounded-lg flex items-center gap-2 ${
                        status.type === 'error' 
                          ? 'bg-red-50 text-red-700 border border-red-200' 
                          : 'bg-green-50 text-green-700 border border-green-200'
                      }`}
                      aria-live="polite"
                    >
                      {status.type === 'error' ? (
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      ) : (
                        <CheckCircle className="h-5 w-5 flex-shrink-0" />
                      )}
                      <span>{status.message}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    id="loginSubmit"
                    className="w-full"
                    size="lg"
                    disabled={!isFormValid || isSubmitting}
                    loading={isSubmitting}
                  >
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>

                {/* Sign Up Link */}
                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    Don't have an account?{' '}
                    <a 
                      href="/signup" 
                      className="text-pink-400 hover:text-pink-500 font-medium transition-colors"
                    >
                      Sign up
                    </a>
                  </p>
                </div>

                {/* Legal Text */}
                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-500">
                    By continuing, you agree to our{' '}
                    <a href="/terms" className="text-pink-400 hover:text-pink-500 transition-colors">
                      Terms
                    </a>{' '}
                    and acknowledge our{' '}
                    <a href="/privacy" className="text-pink-400 hover:text-pink-500 transition-colors">
                      Privacy Policy
                    </a>
                    .
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
};