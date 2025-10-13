import React, { useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { ClickableContact } from '../components/ui/ClickableContact';

export const TermsPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Terms & Conditions - BLOM Cosmetics';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Terms and Conditions for BLOM Cosmetics');
    }
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        <Container>
          <div className="py-16">
            <h1 className="text-3xl font-bold mb-8">Terms & Conditions</h1>
            
            <div className="prose max-w-none">
              <p className="mb-6">Last updated: 1 January 2024</p>
              
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>
              
              <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
              <p className="mb-4">Permission is granted to temporarily download one copy of the materials on BLOM Cosmetics' website for personal, non-commercial transitory viewing only.</p>
              
              <h3 className="text-xl font-semibold mb-3">2.1 Restrictions</h3>
              <p className="mb-4">You may not:</p>
              <ul className="list-disc pl-6 mb-6">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on the website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mb-4">3. Disclaimer</h2>
              <p className="mb-4">The materials on BLOM Cosmetics' website are provided on an 'as is' basis. BLOM Cosmetics makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
              
              <h2 className="text-2xl font-semibold mb-4">4. Limitations</h2>
              <p className="mb-4">In no event shall BLOM Cosmetics or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on BLOM Cosmetics' website, even if BLOM Cosmetics or a BLOM Cosmetics authorized representative has been notified orally or in writing of the possibility of such damage.</p>
              
              <h2 className="text-2xl font-semibold mb-4">5. Accuracy of Materials</h2>
              <p className="mb-4">The materials appearing on BLOM Cosmetics' website could include technical, typographical, or photographic errors. BLOM Cosmetics does not warrant that any of the materials on its website are accurate, complete or current.</p>
              
              <h2 className="text-2xl font-semibold mb-4">6. Links</h2>
              <p className="mb-4">BLOM Cosmetics has not reviewed all of the sites linked to our website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by BLOM Cosmetics of the site.</p>
              
              <h2 className="text-2xl font-semibold mb-4">7. Modifications</h2>
              <p className="mb-4">BLOM Cosmetics may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.</p>
              
              <h2 className="text-2xl font-semibold mb-4">8. Governing Law</h2>
              <p className="mb-4">These terms and conditions are governed by and construed in accordance with the laws of South Africa and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.</p>
              
              <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
              <p className="mb-4">If you have any questions about these Terms & Conditions, please contact us at:</p>
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
