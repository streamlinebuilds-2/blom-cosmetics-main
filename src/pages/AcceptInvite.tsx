import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { useCourseInvites } from '../hooks/useCourseInvites';
import { authService } from '../lib/auth';
import { CheckCircle, AlertCircle, Loader2, Gift, LogIn } from 'lucide-react';

export const AcceptInvite: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const { claimCourseInvite, loading: claiming } = useCourseInvites();

  const [session, setSession] = useState(authService.getState().user);
  const [authLoading, setAuthLoading] = useState(authService.getState().loading);
  const [status, setStatus] = useState<'idle' | 'claiming' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [courseSlug, setCourseSlug] = useState<string | null>(null);

  // Track if we've already attempted to claim
  const claimAttempted = useRef(false);

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = authService.subscribe((state) => {
      setSession(state.user);
      setAuthLoading(state.loading);
    });

    return () => unsubscribe();
  }, []);

  // Claim the invite when user is logged in
  useEffect(() => {
    const handleClaim = async () => {
      // If we have a token AND a session, and we are not already claiming
      if (token && session && !claiming && !claimAttempted.current && status === 'idle') {
        claimAttempted.current = true;
        console.log('User is logged in. Attempting to claim invite...');
        setStatus('claiming');

        // Call the claim function
        const { courseSlug: slug, error } = await claimCourseInvite(token);

        if (error) {
          console.error('Failed to claim invite for existing user:', error);
          setErrorMessage(error);
          setStatus('error');
        } else if (slug) {
          console.log('Invite claimed, redirecting to course:', slug);
          setCourseSlug(slug);
          setStatus('success');
          // Redirect to the course page after a short delay
          setTimeout(() => {
            navigate(`/courses/${slug}`);
          }, 2000);
        }
      }
    };

    handleClaim();
  }, [token, session, claiming, claimCourseInvite, navigate, status]);

  // Show error if no token provided
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header showMobileMenu={true} />
        <main className="flex-1 flex items-center justify-center py-12">
          <Container>
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Invite Link</h1>
              <p className="text-gray-600 mb-6">
                This invite link appears to be invalid or incomplete. Please check the link and try again.
              </p>
              <Link
                to="/"
                className="inline-block bg-pink-400 hover:bg-pink-500 text-white font-semibold py-3 px-6 rounded-full transition-colors"
              >
                Go to Homepage
              </Link>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header showMobileMenu={true} />
        <main className="flex-1 flex items-center justify-center py-12">
          <Container>
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
              <Loader2 className="h-16 w-16 text-pink-400 mx-auto mb-4 animate-spin" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
              <p className="text-gray-600">Please wait while we check your session.</p>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  // Show claiming status
  if (status === 'claiming') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header showMobileMenu={true} />
        <main className="flex-1 flex items-center justify-center py-12">
          <Container>
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
              <Loader2 className="h-16 w-16 text-pink-400 mx-auto mb-4 animate-spin" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Claiming Your Course Access</h1>
              <p className="text-gray-600">Please wait while we set up your enrollment...</p>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  // Show success status
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header showMobileMenu={true} />
        <main className="flex-1 flex items-center justify-center py-12">
          <Container>
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Access Granted!</h1>
              <p className="text-gray-600 mb-6">
                You now have access to your course. Redirecting you to the course page...
              </p>
              <Link
                to={`/courses/${courseSlug}`}
                className="inline-block bg-pink-400 hover:bg-pink-500 text-white font-semibold py-3 px-6 rounded-full transition-colors"
              >
                Go to Course Now
              </Link>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  // Show error status
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header showMobileMenu={true} />
        <main className="flex-1 flex items-center justify-center py-12">
          <Container>
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Failed to Claim Invite</h1>
              <p className="text-gray-600 mb-6">{errorMessage}</p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    claimAttempted.current = false;
                    setStatus('idle');
                    setErrorMessage(null);
                  }}
                  className="w-full bg-pink-400 hover:bg-pink-500 text-white font-semibold py-3 px-6 rounded-full transition-colors"
                >
                  Try Again
                </button>
                <Link
                  to="/contact"
                  className="block text-pink-500 hover:text-pink-600 underline"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  // Show login/signup options if not logged in
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header showMobileMenu={true} />
        <main className="flex-1 flex items-center justify-center py-12">
          <Container>
            <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
              <Gift className="h-16 w-16 text-pink-400 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">You've Been Invited!</h1>
              <p className="text-gray-600 mb-8">
                Someone has granted you access to a course. Please log in or create an account to claim your course access.
              </p>

              <div className="space-y-4">
                <Link
                  to={`/login?redirect=/accept-invite?token=${token}`}
                  className="flex items-center justify-center gap-2 w-full bg-pink-400 hover:bg-pink-500 text-white font-semibold py-4 px-6 rounded-full transition-colors"
                >
                  <LogIn className="h-5 w-5" />
                  Log In to Claim Access
                </Link>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-4 text-gray-500">or</span>
                  </div>
                </div>

                <Link
                  to={`/signup?redirect=/accept-invite?token=${token}`}
                  className="flex items-center justify-center gap-2 w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-4 px-6 rounded-full transition-colors border-2 border-gray-300"
                >
                  Create New Account
                </Link>
              </div>

              <p className="text-sm text-gray-500 mt-6">
                Your invite link will remain valid after you log in or sign up.
              </p>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  // Default state (shouldn't normally be seen)
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header showMobileMenu={true} />
      <main className="flex-1 flex items-center justify-center py-12">
        <Container>
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
            <Loader2 className="h-16 w-16 text-pink-400 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Processing...</h1>
            <p className="text-gray-600">Please wait...</p>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default AcceptInvite;
