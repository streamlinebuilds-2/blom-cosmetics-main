import React, { useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';

export const ReturnsPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header showMobileMenu={true} />
      <main className="section-padding animate-fade-in">
        <Container>
          <h1 className="text-4xl font-bold mb-6">Returns Policy</h1>
          <p className="text-gray-600 max-w-3xl mb-8">
            Learn how to return or exchange your items.
          </p>
          <div className="space-y-6 max-w-3xl">
            <section>
              <h2 className="text-2xl font-semibold mb-2">Eligibility</h2>
              <p className="text-gray-600">Returns accepted within 30 days in original condition.</p>
            </section>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default ReturnsPage;


