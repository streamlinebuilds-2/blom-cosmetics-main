import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { authService, AuthState } from '../lib/auth';

export default function DebugAccountPage() {
  console.log('DebugAccountPage rendering...');
  
  const [step, setStep] = useState(1);
  const [authState, setAuthState] = useState<AuthState>({ user: null, loading: true, error: null });
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    console.log('DebugAccountPage useEffect running...');
    setStep(2);
    
    // Test auth service
    const unsubscribe = authService.subscribe((newState) => {
      console.log('Auth state changed:', newState);
      setAuthState(newState);
      setStep(3);
    });

    // Check environment variables
    const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || (import.meta as any).env.SUPABASE_URL || (import.meta as any).env.SUPABASE_DATABASE_URL;
    const supabaseKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || (import.meta as any).env.SUPABASE_ANON_KEY;
    const hasEnvVars = !!(supabaseUrl && supabaseKey);
    setDebugInfo(`Env: ${hasEnvVars ? 'YES' : 'NO'} | URL set: ${!!supabaseUrl} | KEY set: ${!!supabaseKey}`);
    setStep(4);

    return unsubscribe;
  }, []);

  const getStepColor = (stepNum: number) => {
    return step >= stepNum ? 'bg-green-500' : 'bg-gray-300';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showMobileMenu={true} />
      
      <main className="section-padding">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">🔍 Debug Account Page</h1>
            
            {/* Step Progress */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Debug Steps:</h2>
              <div className="space-y-2">
                <div className={`px-4 py-2 rounded ${getStepColor(1)}`}>
                  Step 1: Component renders ✅
                </div>
                <div className={`px-4 py-2 rounded ${getStepColor(2)}`}>
                  Step 2: useEffect runs ✅
                </div>
                <div className={`px-4 py-2 rounded ${getStepColor(3)}`}>
                  Step 3: Auth service responds ✅
                </div>
                <div className={`px-4 py-2 rounded ${getStepColor(4)}`}>
                  Step 4: Environment variables checked ✅
                </div>
              </div>
            </div>

            {/* Auth State */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Auth State:</h2>
              <div className="bg-gray-100 p-4 rounded font-mono text-sm">
                <div>Loading: {authState.loading ? 'YES' : 'NO'}</div>
                <div>User: {authState.user ? 'YES' : 'NO'}</div>
                <div>Error: {authState.error || 'None'}</div>
                {authState.user && (
                  <div>User ID: {authState.user.id}</div>
                )}
              </div>
            </div>

            {/* Debug Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Debug Info:</h2>
              <div className="bg-gray-100 p-4 rounded font-mono text-sm">
                {debugInfo}
              </div>
            </div>

            {/* Test Buttons */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Test Actions:</h2>
              <div className="space-y-4">
                <button
                  onClick={() => window.location.href = '/auth-test'}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Go to Auth Test Page
                </button>
                <button
                  onClick={() => window.location.href = '/account'}
                  className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Try Original Account Page
                </button>
                <button
                  onClick={() => window.location.href = '/simple-account'}
                  className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Back to Simple Test
                </button>
              </div>
            </div>
          </div>
        </Container>
      </main>
      
      <Footer />
    </div>
  );
}
