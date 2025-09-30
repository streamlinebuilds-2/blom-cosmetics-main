import React, { useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';

export const CookiesPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header showMobileMenu={true} />
      <main className="section-padding animate-fade-in">
        <Container>
          <h1 className="text-4xl font-bold mb-6">Cookie Policy</h1>
          <p className="text-gray-600 max-w-3xl mb-8">
            This page explains how and why we use cookies and similar technologies.
          </p>
          <div className="space-y-6 max-w-3xl">
            <section>
              <h2 className="text-2xl font-semibold mb-2">What Are Cookies?</h2>
              <p className="text-gray-600">Small text files stored on your device to improve your experience.</p>
            </section>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default CookiesPage;


