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
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [isBannerVisible, setIsBannerVisible] = useState<boolean>(() => {
    try { return sessionStorage.getItem('signup_banner_closed') === '1' ? false : true; } catch { return !session.bannerClosed; }
  });
  const timerRef = useRef<number | null>(null);

  // Auto show popup once after 7s on first page load in this tab
  useEffect(() => {
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
  }, []);

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
    setIsPopupOpen(false);
    session.popupClosed = true;
    session.hasShown = true;
    if (!session.bannerClosed) setIsBannerVisible(true);
    try { sessionStorage.setItem('signup_popup_closed', '1'); } catch {}
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
                <X className="h-5 w-5" />
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
          <div className="bg-white rounded-xl shadow-2xl w-[min(880px,95vw)] max-h-[90vh] overflow-hidden grid grid-cols-1 md:grid-cols-2">
            <div className="hidden md:block bg-pink-400" aria-hidden="true" />
            <div className="relative p-6 md:p-8 overflow-auto">
              <button
                aria-label="Close"
                className="absolute top-4 right-4 p-1 rounded hover:bg-gray-100"
                onClick={closePopup}
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>

              <div className="max-w-md mx-auto">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">Join the Beauty Club</h3>
                  <p className="text-pink-400 font-semibold">Get 15% off + exclusive drops</p>
                </div>

                <ul className="mb-5 space-y-2 text-sm text-gray-600">
                  <li className="flex gap-2"><span className="text-pink-400 font-bold">✓</span> Instant 15% welcome code</li>
                  <li className="flex gap-2"><span className="text-pink-400 font-bold">✓</span> Early access to launches</li>
                  <li className="flex gap-2"><span className="text-pink-400 font-bold">✓</span> Member-only promos</li>
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
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!isValid || !consent) {
      setError('Please enter a valid email and accept the privacy terms.');
      return;
    }

    setSubmitting(true);
    try {
      // Replace with your provider (Mailchimp, Supabase, API route, etc.)
      await new Promise((res) => setTimeout(res, 800));
      setSuccess(true);
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
          className="input-field"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <label className="flex items-start gap-3 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 rounded border-gray-300 text-pink-400 focus:ring-pink-300"
          required
        />
        <span>I agree to receive marketing emails and accept the Privacy Policy.</span>
      </label>

      {error && <div className="text-sm text-red-600">{error}</div>}
      {success && (
        <div className="text-sm font-semibold text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
          Thanks! Check your inbox for your code.
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" loading={submitting} disabled={submitting}>
        Join Now & Save 15%
      </Button>
    </form>
  );
};


