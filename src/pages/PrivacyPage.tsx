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
              <p className="mb-6">Last updated: {new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              <p className="mb-4">BLOM Cosmetics collects information to provide you with our nail care products and services. We collect the following types of information:</p>
              
              <h3 className="text-xl font-semibold mb-3">1.1 Personal Information</h3>
              <p className="mb-4">When you create an account, make a purchase, or contact us, we collect:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Name</strong> - To personalize your experience and process orders</li>
                <li><strong>Email address</strong> - To send order confirmations, updates, and marketing communications (with your consent)</li>
                <li><strong>Phone number</strong> - For order updates and customer support</li>
                <li><strong>Billing and shipping addresses</strong> - To fulfill and deliver your orders</li>
                <li><strong>Payment information</strong> - Processed securely through PayFast (we never store your full card details)</li>
                <li><strong>Order history</strong> - Including products purchased, quantities, prices, and delivery status</li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-3">1.2 Account Information</h3>
              <p className="mb-4">When you create an account with us, we store your login credentials securely and maintain your order history, wishlist, and preferences.</p>
              
              <h3 className="text-xl font-semibold mb-3">1.3 Usage and Technical Information</h3>
              <p className="mb-6">We automatically collect technical information including your IP address, browser type, device information, and how you interact with our website to improve our services.</p>
              
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
              <p className="mb-4">We use your information for the following purposes:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Order Processing</strong> - To process, fulfill, and deliver your nail care product orders</li>
                <li><strong>Customer Support</strong> - To respond to your inquiries and provide assistance</li>
                <li><strong>Account Management</strong> - To manage your account, track orders, and maintain your wishlist</li>
                <li><strong>Marketing</strong> - With your consent, to send you promotional emails about new products and special offers</li>
                <li><strong>Website Improvement</strong> - To analyze usage patterns and enhance user experience</li>
                <li><strong>Legal Compliance</strong> - To comply with South African laws and regulations</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mb-4">3. Who We Share Your Information With</h2>
              <p className="mb-4">We share your information with trusted third parties only as necessary to provide our services:</p>
              
              <h3 className="text-xl font-semibold mb-3">3.1 Payment Processors</h3>
              <p className="mb-4">We use <strong>PayFast</strong> to process payments securely. They handle your payment information according to their own privacy policy and PCI DSS compliance standards.</p>
              
              <h3 className="text-xl font-semibold mb-3">3.2 Shipping Providers</h3>
              <p className="mb-4">We share your name, address, and phone number with <strong>courier services</strong> to deliver your orders.</p>
              
              <h3 className="text-xl font-semibold mb-3">3.3 Analytics</h3>
              <p className="mb-4">We use <strong>analytics services</strong> (such as Google Analytics) to understand website usage patterns and improve our services.</p>
              
              <h3 className="text-xl font-semibold mb-3">3.4 Marketing Platforms</h3>
              <p className="mb-6">If you consent to marketing, we may share your email address with <strong>Meta (Facebook/Instagram)</strong> for targeted advertising campaigns, in compliance with Meta's requirements.</p>
              
              <h2 className="text-2xl font-semibold mb-4">4. Data Retention</h2>
              <p className="mb-4">We retain your personal information for as long as necessary to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Fulfill your orders and provide customer support</li>
                <li>Comply with legal and tax obligations (minimum 5 years for financial records in South Africa)</li>
                <li>Maintain your account and order history</li>
              </ul>
              <p className="mb-6">You can request deletion of your account and personal data at any time by contacting us.</p>
              
              <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
              <p className="mb-4">Under South African data protection laws (POPI Act), you have the right to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Access</strong> - Request a copy of your personal information we hold</li>
                <li><strong>Correction</strong> - Request correction of inaccurate information</li>
                <li><strong>Deletion</strong> - Request deletion of your personal information (subject to legal requirements)</li>
                <li><strong>Objection</strong> - Object to processing of your information for marketing purposes</li>
                <li><strong>Portability</strong> - Request your data in a portable format</li>
              </ul>
              <p className="mb-6">To exercise these rights, please contact us using the details provided below.</p>
              
              <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
              <p className="mb-6">We implement industry-standard security measures to protect your personal information, including SSL encryption, secure payment processing, and regular security audits. However, no method of transmission over the internet is 100% secure.</p>
              
              <h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking</h2>
              <p className="mb-4">We use cookies and similar tracking technologies to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Remember your preferences and shopping cart</li>
                <li>Analyze website traffic and user behavior</li>
                <li>Provide targeted advertising (with your consent)</li>
              </ul>
              <p className="mb-6">You can control cookie settings through your browser preferences.</p>
              
              <h2 className="text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
              <p className="mb-4">We may update this privacy policy from time to time. Material changes will be communicated to you via email or a notice on our website. Your continued use of our services constitutes acceptance of the updated policy.</p>
              
              <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
              <p className="mb-4">If you have any questions, concerns, or wish to exercise your rights regarding your personal information, please contact us:</p>
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
