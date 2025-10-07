import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Button } from '../components/ui/Button';
import { authService } from '../lib/auth';
import { supabase } from '../lib/supabase';

export default function AccountPageMinimal() {
  const [authState, setAuthState] = useState(authService.getState());
  const [profile, setProfile] = useState<{ id: string; email: string | null; name: string | null; phone: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = authService.subscribe((s) => setAuthState(s));
    return unsub;
  }, []);

  useEffect(() => {
    (async () => {
      if (!authState.user) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authState.user.id)
          .maybeSingle();
        if (error) {
          setError(error.message);
        } else if (data) {
          setProfile(data as any);
        } else {
          // create minimal profile
          await supabase.from('profiles').upsert({ id: authState.user.id, email: authState.user.email ?? null, name: authState.user.user_metadata?.name ?? null, phone: authState.user.user_metadata?.phone ?? null }, { onConflict: 'id' });
          setProfile({ id: authState.user.id, email: authState.user.email ?? null, name: authState.user.user_metadata?.name ?? null, phone: authState.user.user_metadata?.phone ?? null });
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, [authState.user?.id]);

  if (authState.loading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showMobileMenu={true} />
        <main className="section-padding">
          <Container>
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your account…</p>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  if (!authState.user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showMobileMenu={true} />
        <main className="section-padding">
          <Container>
            <div className="text-center py-16">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h1>
              <Button onClick={() => (window.location.href = '/login?redirect=/account')}>Log In</Button>
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
          <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold mb-4">My Account (Minimal)</h1>
            {error && <div className="text-red-600 mb-3">{error}</div>}
            <div className="space-y-3">
              <div><span className="font-medium">Name:</span> {profile?.name || '—'}</div>
              <div><span className="font-medium">Email:</span> {profile?.email || authState.user?.email || '—'}</div>
              <div><span className="font-medium">Phone:</span> {profile?.phone || '—'}</div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button onClick={() => (window.location.href = '/')}>Continue Shopping</Button>
              <Button variant="outline" onClick={async () => { await authService.signOut(); window.location.href = '/'; }}>Log Out</Button>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
