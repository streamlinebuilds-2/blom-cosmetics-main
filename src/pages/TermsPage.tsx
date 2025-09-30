import React, { useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';

export const TermsPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header showMobileMenu={true} />
      <main className="section-padding animate-fade-in">
        <Container>
          <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
          <p className="text-gray-600 max-w-3xl mb-8">
            By using this site, you agree to the following terms and conditions.
          </p>
          <div className="space-y-6 max-w-3xl">
            <section>
              <h2 className="text-2xl font-semibold mb-2">Use of Service</h2>
              <p className="text-gray-600">You agree not to misuse the services or assist others in doing so.</p>
            </section>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default TermsPage;


