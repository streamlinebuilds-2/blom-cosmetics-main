import React, { useState, useEffect } from 'react';
import { Cookie, X, Settings, Check } from 'lucide-react';
import { Button } from './Button';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always required
    analytics: false,
    marketing: false,
    preferences: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('blom_cookie_consent');
    if (!cookieConsent) {
      // Show banner after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('blom_cookie_consent', JSON.stringify(allAccepted));
    setIsVisible(false);
    
    // Here you would typically initialize analytics, marketing scripts, etc.
    console.log('All cookies accepted');
  };

  const handleAcceptSelected = () => {
    const selectedPreferences = {
      ...preferences,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('blom_cookie_consent', JSON.stringify(selectedPreferences));
    setIsVisible(false);
    
    // Initialize only selected cookie types
    console.log('Selected cookies accepted:', selectedPreferences);
  };

  const handleRejectAll = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('blom_cookie_consent', JSON.stringify(essentialOnly));
    setIsVisible(false);
    
    console.log('Only essential cookies accepted');
  };

  const handlePreferenceChange = (type: keyof CookiePreferences) => {
    if (type === 'essential') return; // Essential cookies cannot be disabled
    
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-auto" />
      
      {/* Banner */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl pointer-events-auto transform transition-all duration-300 ease-out">
        {/* Close Button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close cookie banner"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-blue-300 rounded-full flex items-center justify-center flex-shrink-0">
              <Cookie className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">We Value Your Privacy</h3>
              <p className="text-gray-600 leading-relaxed">
                We use cookies to enhance your browsing experience, provide personalized content, 
                and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
              </p>
            </div>
          </div>

          {/* Cookie Settings */}
          {showSettings && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-4">Cookie Preferences</h4>
              <div className="space-y-4">
                {/* Essential Cookies */}
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900">Essential Cookies</h5>
                    <p className="text-sm text-gray-600">Required for basic site functionality</p>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm text-gray-500">Always Active</span>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900">Analytics Cookies</h5>
                    <p className="text-sm text-gray-600">Help us understand how visitors use our site</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={() => handlePreferenceChange('analytics')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-400"></div>
                  </label>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900">Marketing Cookies</h5>
                    <p className="text-sm text-gray-600">Used to deliver relevant advertisements</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={() => handlePreferenceChange('marketing')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-400"></div>
                  </label>
                </div>

                {/* Preference Cookies */}
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900">Preference Cookies</h5>
                    <p className="text-sm text-gray-600">Remember your settings and preferences</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.preferences}
                      onChange={() => handlePreferenceChange('preferences')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-400"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAcceptAll}
              className="flex-1 bg-pink-400 hover:bg-pink-500 text-white"
            >
              Accept All Cookies
            </Button>
            
            {showSettings ? (
              <Button
                onClick={handleAcceptSelected}
                variant="outline"
                className="flex-1"
              >
                Save Preferences
              </Button>
            ) : (
              <Button
                onClick={() => setShowSettings(true)}
                variant="outline"
                className="flex-1"
              >
                <Settings className="h-4 w-4 mr-2" />
                Customize
              </Button>
            )}
            
            <Button
              onClick={handleRejectAll}
              variant="ghost"
              className="flex-1 text-gray-600 hover:text-gray-800"
            >
              Reject All
            </Button>
          </div>

          {/* Footer Links */}
          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Learn more about our{' '}
              <a href="/cookie-policy" className="text-pink-400 hover:text-pink-500 underline">
                Cookie Policy
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-pink-400 hover:text-pink-500 underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};