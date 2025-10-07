import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Button } from '../components/ui/Button';
import { User, Mail, Phone, Calendar } from 'lucide-react';
import { authService, AuthState } from '../lib/auth';
import { supabase } from '../lib/supabase';

export default function AccountPageFullCore() {
  const [authState, setAuthState] = useState<AuthState>({ user: null, loading: true, error: null });
  const [profile, setProfile] = useState<{ id: string; email: string | null; name: string | null; phone: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'My Account - BLOM Cosmetics';
    const unsub = authService.subscribe((s) => setAuthState(s));
    return unsub;
  }, []);

  useEffect(() => {
    (async () => {
      if (!authState.user) { setLoading(false); return; }
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authState.user.id)
          .maybeSingle();
        if (data) {
          setProfile(data as any);
        } else {
          await supabase.from('profiles').upsert({ id: authState.user.id, email: authState.user.email ?? null, name: authState.user.user_metadata?.name ?? null, phone: authState.user.user_metadata?.phone ?? null }, { onConflict: 'id' });
          setProfile({ id: authState.user.id, email: authState.user.email ?? null, name: authState.user.user_metadata?.name ?? null, phone: authState.user.user_metadata?.phone ?? null });
        }
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

  const name = profile?.name || authState.user.user_metadata?.full_name || authState.user.email?.split('@')[0] || 'User';
  const email = profile?.email || authState.user.email || '—';
  const phone = profile?.phone || '—';
  const memberSince = authService.formatMemberSince(authState.user.created_at || '');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showMobileMenu={true} />
      <main className="section-padding">
        <Container>
          <div className="bg-gradient-to-r from-pink-400 to-blue-300 rounded-2xl p-8 text-white mb-8">
            <h1 className="text-3xl font-bold">Welcome back, {name}!</h1>
            <p className="text-pink-100">Member since {memberSince}</p>
          </div>

          <div className="rounded-xl border p-6 bg-white max-w-3xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Personal Information</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium">{name}</div>
                    <div className="text-sm text-gray-500">Full Name</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium">{email}</div>
                    <div className="text-sm text-gray-500">Email Address</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium">{phone}</div>
                    <div className="text-sm text-gray-500">Phone Number</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium">{memberSince}</div>
                    <div className="text-sm text-gray-500">Member Since</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Button onClick={async () => { await authService.signOut(); window.location.href = '/'; }}>Log Out</Button>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}


