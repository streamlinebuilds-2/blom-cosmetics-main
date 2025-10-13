import React, { useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { ClickableContact } from '../components/ui/ClickableContact';

export const PrivacyPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Privacy Policy - BLOM Cosmetics';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Privacy Policy for BLOM Cosmetics');
    }
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        <Container>
          <div className="py-16">
            <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
            
            <div className="prose max-w-none">
              <p className="mb-6">Last updated: 1 January 2024</p>
              
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              <p className="mb-4">We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.</p>
              
              <h3 className="text-xl font-semibold mb-3">1.1 Personal Information</h3>
              <p className="mb-4">This includes your name, email address, phone number, billing address, and payment information.</p>
              
              <h3 className="text-xl font-semibold mb-3">1.2 Usage Information</h3>
              <p className="mb-4">We collect information about how you use our website, including pages visited, time spent, and interactions with our content.</p>
              
              <h3 className="text-xl font-semibold mb-3">1.3 Technical Information</h3>
              <p className="mb-6">We automatically collect certain technical information, including your IP address, browser type, operating system, and device information.</p>
              
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
              <p className="mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 mb-6">
                <li>Process and fulfill your orders</li>
                <li>Provide customer support</li>
                <li>Send you important updates about your account or orders</li>
                <li>Improve our website and services</li>
                <li>Comply with legal obligations</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
              <p className="mb-4">We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
              
              <h3 className="text-xl font-semibold mb-3">3.1 Service Providers</h3>
              <p className="mb-4">We may share your information with trusted third-party service providers who assist us in operating our website, conducting our business, or servicing you.</p>
              
              <h3 className="text-xl font-semibold mb-3">3.2 Legal Requirements</h3>
              <p className="mb-6">We may disclose your information if required to do so by law or in response to valid requests by public authorities.</p>
              
              <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
              <p className="mb-4">We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
              
              <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 mb-6">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Object to processing of your information</li>
                <li>Data portability</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mb-4">6. Cookies</h2>
              <p className="mb-4">We use cookies and similar technologies to enhance your experience on our website. You can control cookie settings through your browser preferences.</p>
              
              <h2 className="text-2xl font-semibold mb-4">7. Changes to This Policy</h2>
              <p className="mb-4">We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
              
              <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
              <p className="mb-4">If you have any questions about this privacy policy, please contact us at:</p>
              <div className="space-y-2">
                <ClickableContact 
                  type="email" 
                  value="shopblomcosmetics@gmail.com" 
                  className="mb-2"
                >
                  Email: shopblomcosmetics@gmail.com
                </ClickableContact>
                <ClickableContact 
                  type="phone" 
                  value="+27 79 548 3317" 
                  className="mb-2"
                >
                  Phone: +27 79 548 3317
                </ClickableContact>
                <ClickableContact 
                  type="address" 
                  value="34 Horingbek St, Randfontein 1759, South Africa"
                >
                  Address: 34 Horingbek St, Randfontein 1759, South Africa
                </ClickableContact>
              </div>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
};
