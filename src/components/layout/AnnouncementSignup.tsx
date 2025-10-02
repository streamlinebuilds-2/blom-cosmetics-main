import React, { useEffect, useRef, useState } from 'react';
import { Container } from './Container';
import { Button } from '../ui/Button';
import { X } from 'lucide-react';

declare global {
  interface Window {
    __blomSignup?: {
      popupClosed?: boolean;
      bannerClosed?: boolean;
      hasShown?: boolean;
    };
  }
}

const getSessionState = () => {
  if (!window.__blomSignup) window.__blomSignup = {};
  return window.__blomSignup;
};

export const AnnouncementSignup: React.FC = () => {
  const session = getSessionState();
  
  // Check if user has already signed up
  const hasSignedUp = (() => {
    try {
      return localStorage.getItem('blom_user_signed_up') === 'true';
    } catch {
      return false;
    }
  })();
  
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [isBannerVisible, setIsBannerVisible] = useState<boolean>(() => {
    if (hasSignedUp) return false;
    try { return sessionStorage.getItem('signup_banner_closed') === '1' ? false : true; } catch { return !session.bannerClosed; }
  });
  const timerRef = useRef<number | null>(null);

  // Auto show popup once after 7s on first page load in this tab
  useEffect(() => {
    // Don't show popup if user has already signed up
    if (hasSignedUp) return;
    
    // If this is a reload, allow popup again by clearing the session flag
    try {
      const nav = (performance.getEntriesByType('navigation')[0] as any);
      if (nav && nav.type === 'reload') {
        sessionStorage.removeItem('signup_popup_closed');
      }
    } catch {}

    const closedInThisTab = (() => { try { return sessionStorage.getItem('signup_popup_closed') === '1'; } catch { return false; } })();
    if (closedInThisTab || session.hasShown || session.popupClosed) return;
    timerRef.current = window.setTimeout(() => {
      setIsPopupOpen(true);
      session.hasShown = true;
    }, 7000);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [hasSignedUp]);

  // Lock body scroll when popup is open
  useEffect(() => {
    const html = document.documentElement;
    if (isPopupOpen) {
      html.classList.add('no-scroll');
      document.body.classList.add('no-scroll');
    } else {
      html.classList.remove('no-scroll');
      document.body.classList.remove('no-scroll');
    }
    return () => {
      html.classList.remove('no-scroll');
      document.body.classList.remove('no-scroll');
    };
  }, [isPopupOpen]);

  const closePopup = () => {
    // Preserve current scroll position
    const currentScrollY = window.scrollY;
    
    setIsPopupOpen(false);
    session.popupClosed = true;
    session.hasShown = true;
    if (!session.bannerClosed) setIsBannerVisible(true);
    try { sessionStorage.setItem('signup_popup_closed', '1'); } catch {}
    
    // Restore scroll position after a brief delay to ensure DOM updates are complete
    setTimeout(() => {
      window.scrollTo(0, currentScrollY);
    }, 0);
  };

  const closeBanner = () => {
    setIsBannerVisible(false);
    session.bannerClosed = true;
    try { sessionStorage.setItem('signup_banner_closed', '1'); } catch {}
  };

  const openPopup = () => {
    // Mark as shown so auto-timer never retriggers after manual interaction
    session.hasShown = true;
    setIsPopupOpen(true);
    // User intent overrides previous close. Do not set closed flag here.
  };

  // Don't render anything if user has already signed up
  if (hasSignedUp) {
    return null;
  }

  return (
    <>
      {isBannerVisible && (
        <div className="bg-blue-100 text-gray-900">
          <Container className="py-2 px-4">
            <div className="relative flex items-center justify-center gap-3">
              <p className="text-sm font-medium text-center announcement-text">
                ✨ Join the BLOM Beauty Club & Get 15% Off Your First Order ✨
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="!py-1 !px-3 uppercase font-sans bg-white text-gray-900 border border-gray-900 hover:bg-gray-100"
                onClick={openPopup}
              >
                JOIN NOW
              </Button>
              <button
                aria-label="Close announcement"
                className="absolute right-0 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200"
                onClick={closeBanner}
              >
                <X className="h-4 w-4 md:h-5 md:w-5" />
              </button>
            </div>
          </Container>
        </div>
      )}

      {isPopupOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Join the Beauty Club"
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closePopup();
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-[min(900px,95vw)] max-h-[95vh] overflow-hidden grid grid-cols-1 md:grid-cols-2">
            {/* Visual Panel - Desktop Only (Image) */}
            <div className="hidden md:block relative overflow-hidden" aria-hidden="true">
              <img
                src="/sign-up-image.webp"
                alt="BLOM signup visual"
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Form Panel */}
            <div className="relative p-4 md:p-6 overflow-y-auto">
              <button
                aria-label="Close"
                className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
                onClick={closePopup}
              >
                <X className="h-4 w-4 md:h-5 md:w-5 text-gray-500" />
              </button>

              <div className="max-w-md mx-auto">
                {/* Logo */}
                <div className="text-center mb-4">
                  <img src="/blom_logo.webp" alt="BLOM Cosmetics" className="h-16 mx-auto mb-2" />
                  <div className="w-12 h-0.5 bg-pink-400 mx-auto"></div>
                </div>

                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1 text-center">Join Our Blom Beauty Club</h3>
                  <p className="text-pink-500 font-semibold text-center text-base">Get 15% off + exclusive drops</p>
                </div>

                <ul className="mb-4 space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-pink-100 rounded-full flex items-center justify-center">
                      <span className="text-pink-500 font-bold text-xs">✓</span>
                    </div>
                    <span>Instant 15% welcome code</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-pink-100 rounded-full flex items-center justify-center">
                      <span className="text-pink-500 font-bold text-xs">✓</span>
                    </div>
                    <span>Early access to launches</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-pink-100 rounded-full flex items-center justify-center">
                      <span className="text-pink-500 font-bold text-xs">✓</span>
                    </div>
                    <span>Member-only promos</span>
                  </li>
                </ul>

                <SignupForm onSuccess={closePopup} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const SignupForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const isValidPhone = /^[\+]?[0-9\s\-\(\)]{10,}$/.test(phone.trim());
    
    if (!isValidEmail || !isValidPhone || !consent) {
      setError('Please enter a valid email, phone number, and accept the privacy terms.');
      return;
    }

    setSubmitting(true);
    try {
      // Replace with your provider (Mailchimp, Supabase, API route, etc.)
      await new Promise((res) => setTimeout(res, 800));
      setSuccess(true);
      
      // Mark user as signed up to hide popup and banner permanently
      try {
        localStorage.setItem('blom_user_signed_up', 'true');
        sessionStorage.setItem('signup_popup_closed', '1');
        sessionStorage.setItem('signup_banner_closed', '1');
      } catch (error) {
        console.warn('Could not save signup status:', error);
      }
      
      setTimeout(() => {
        onSuccess();
      }, 900);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="beautyclub-email" className="block text-sm font-semibold text-gray-800 mb-2">
          Email address
        </label>
        <input
          id="beautyclub-email"
          type="email"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none transition-all text-base"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <div>
        <label htmlFor="beautyclub-phone" className="block text-sm font-semibold text-gray-800 mb-2">
          Phone number
        </label>
        <input
          id="beautyclub-phone"
          type="tel"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none transition-all text-base"
          placeholder="Enter your phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
          required
        />
      </div>

      <label className="flex items-start gap-3 text-sm text-gray-600 leading-relaxed">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 rounded border-gray-300 text-pink-400 focus:ring-pink-300 w-4 h-4"
          required
        />
        <span>I agree to receive marketing emails and accept the <a href="/privacy" className="text-pink-500 hover:text-pink-600 underline">Privacy Policy</a>.</span>
      </label>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm font-semibold text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
          Thanks! Check your inbox for your code.
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-pink-400 hover:bg-pink-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {submitting ? 'Joining...' : 'Join Now & Save 15%'}
      </button>
    </form>
  );
};


