import React, { useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';

export const AccountPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header showMobileMenu={true} />
      <main className="section-padding animate-fade-in">
        <Container>
          <h1 className="text-4xl font-bold mb-6">Your Account</h1>
          <p className="text-gray-600 max-w-3xl mb-8">Manage your details, orders, and preferences.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            <div className="p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-2">Profile</h2>
              <p className="text-gray-600 text-sm">Update your name, email and password.</p>
            </div>
            <div className="p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-2">Orders</h2>
              <p className="text-gray-600 text-sm">View your order history and status.</p>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default AccountPage;


