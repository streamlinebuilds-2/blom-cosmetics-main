import React, { useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { ClickableContact } from '../components/ui/ClickableContact';

export const ReturnsPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Returns & Refunds - BLOM Cosmetics';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Returns and Refunds Policy for BLOM Cosmetics');
    }
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        <Container>
          <div className="py-16">
            <h1 className="text-3xl font-bold mb-8">Returns & Refunds Policy</h1>
            
            <div className="prose max-w-none">
              <p className="mb-6">Last updated: 1 January 2024</p>
              
              <h2 className="text-2xl font-semibold mb-4">1. Return Policy</h2>
              <p className="mb-4">We offer a 30-day return policy for all products purchased from BLOM Cosmetics. Products must be returned in their original condition, unopened, and with all original packaging.</p>
              
              <h3 className="text-xl font-semibold mb-3">1.1 Eligible Items</h3>
              <p className="mb-4">The following items are eligible for return:</p>
              <ul className="list-disc pl-6 mb-6">
                <li>Unopened nail polish bottles</li>
                <li>Unused nail art tools</li>
                <li>Unopened training materials</li>
                <li>Defective products (with proof of defect)</li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-3">1.2 Non-Eligible Items</h3>
              <p className="mb-4">The following items cannot be returned:</p>
              <ul className="list-disc pl-6 mb-6">
                <li>Opened nail polish bottles</li>
                <li>Used nail art tools</li>
                <li>Digital products and courses</li>
                <li>Personalized or custom items</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mb-4">2. Return Process</h2>
              <p className="mb-4">To initiate a return, please follow these steps:</p>
              <ol className="list-decimal pl-6 mb-6">
                <li>Contact our customer service team within 30 days of purchase</li>
                <li>Provide your order number and reason for return</li>
                <li>Receive return authorization and instructions</li>
                <li>Package items securely in original packaging</li>
                <li>Ship items to our designated return address</li>
              </ol>
              
              <h2 className="text-2xl font-semibold mb-4">3. Refund Policy</h2>
              <p className="mb-4">Refunds will be processed within 5-10 business days after we receive and inspect the returned items.</p>
              
              <h3 className="text-xl font-semibold mb-3">3.1 Refund Methods</h3>
              <p className="mb-4">Refunds will be issued using the same payment method used for the original purchase. Processing times may vary depending on your financial institution.</p>
              
              <h3 className="text-xl font-semibold mb-3">3.2 Partial Refunds</h3>
              <p className="mb-6">Partial refunds may be issued for items that are returned in less than perfect condition, subject to our inspection.</p>
              
              <h2 className="text-2xl font-semibold mb-4">4. Shipping Costs</h2>
              <p className="mb-4">Return shipping costs are the responsibility of the customer, unless the return is due to a defect or error on our part.</p>
              
              <h2 className="text-2xl font-semibold mb-4">5. Damaged or Defective Items</h2>
              <p className="mb-4">If you receive a damaged or defective item, please contact us immediately. We will provide a prepaid return label and process a full refund or replacement.</p>
              
              <h2 className="text-2xl font-semibold mb-4">6. Exchange Policy</h2>
              <p className="mb-4">We do not offer direct exchanges. If you wish to exchange an item, please return the original item and place a new order for the desired item.</p>
              
              <h2 className="text-2xl font-semibold mb-4">7. International Returns</h2>
              <p className="mb-4">International customers are responsible for all return shipping costs and any applicable customs duties or taxes.</p>
              
              <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
              <p className="mb-4">For questions about returns or refunds, please contact us at:</p>
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
