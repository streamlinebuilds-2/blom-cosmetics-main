import React, { useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';

export const PrivacyPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header showMobileMenu={true} />
      <main className="section-padding animate-fade-in">
        <Container>
          <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-gray-600 max-w-3xl mb-8">
            We respect your privacy. This policy explains what information we collect, how we use it, and your rights.
          </p>
          <div className="space-y-6 max-w-3xl">
            <section>
              <h2 className="text-2xl font-semibold mb-2">Information We Collect</h2>
              <p className="text-gray-600">Contact details, order information, and usage data to improve your experience.</p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-2">How We Use Information</h2>
              <p className="text-gray-600">To process orders, provide support, and personalize content.</p>
            </section>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPage;


