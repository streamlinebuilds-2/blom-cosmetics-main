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
              <p className="mb-6">Last updated: {new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              
              <h2 className="text-2xl font-semibold mb-4">1. Who We Are</h2>
              <p className="mb-4">BLOM Cosmetics ("we," "us," or "our") is a nail care and beauty products retailer operating online in South Africa. Our registered business address is 34 Horingbek Street, Randfontein, 1759, South Africa.</p>
              
              <h2 className="text-2xl font-semibold mb-4">2. Products and Services</h2>
              <p className="mb-4">We offer professional nail care products including acrylic systems, brushes, top coats, primers, and related beauty products for nail technicians and enthusiasts. We also provide educational courses on nail techniques.</p>
              
              <h2 className="text-2xl font-semibold mb-4">3. Pricing</h2>
              <p className="mb-4">All prices on our website are displayed in South African Rand (ZAR) and are subject to change without notice. We strive to ensure pricing accuracy, but errors may occur. If we discover a pricing error, we reserve the right to refuse or cancel any orders placed at the incorrect price.</p>
              <p className="mb-6">Prices include VAT where applicable but exclude shipping costs, which are calculated at checkout based on your delivery location.</p>
              
              <h2 className="text-2xl font-semibold mb-4">4. Orders</h2>
              <p className="mb-4">When you place an order with us:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>You are making an offer to purchase products subject to these terms</li>
                <li>We will send you an order confirmation email once we receive your payment</li>
                <li>Order acceptance occurs when we dispatch your products</li>
                <li>If a product becomes unavailable, we will notify you and refund any payment made</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mb-4">5. Refunds and Returns</h2>
              <p className="mb-4">We want you to be completely satisfied with your purchase. Our returns policy is as follows:</p>
              
              <h3 className="text-xl font-semibold mb-3">5.1 Return Period</h3>
              <p className="mb-4">You may return unopened, unused products in their original packaging within <strong>14 days</strong> of delivery.</p>
              
              <h3 className="text-xl font-semibold mb-3">5.2 Refund Conditions</h3>
              <p className="mb-4">To be eligible for a refund, products must be:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>In original, unopened packaging</li>
                <li>In saleable condition</li>
                <li>Not damaged or tampered with</li>
                <li>Returned via traceable courier service</li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-3">5.3 Refund Process</h3>
              <p className="mb-6">Contact us at <strong>shopblomcosmetics@gmail.com</strong> or <strong>+27 79 548 3317</strong> to initiate a return. Once approved, we will provide a return address and instructions. Refunds will be processed to the original payment method within 14 business days of receiving the returned items.</p>
              
              <h3 className="text-xl font-semibold mb-3">5.4 Non-Refundable Items</h3>
              <p className="mb-6">Items that are opened, used, or without original packaging cannot be refunded unless the product is defective or not as described. Digital products (courses) are non-refundable once accessed.</p>
              
              <h2 className="text-2xl font-semibold mb-4">6. Shipping and Delivery</h2>
              <p className="mb-4">We deliver throughout South Africa using reputable courier services.</p>
              
              <h3 className="text-xl font-semibold mb-3">6.1 Shipping Costs</h3>
              <p className="mb-4">Shipping costs are calculated at checkout based on your delivery address. Orders over <strong>R1,500</strong> qualify for free shipping. Standard delivery costs are <strong>R120</strong> for orders under R1,500.</p>
              
              <h3 className="text-xl font-semibold mb-3">6.2 Delivery Times</h3>
              <p className="mb-4">Standard delivery takes 5-10 business days. Processing time is 1-3 business days from order confirmation. You will receive a tracking number via email once your order is dispatched.</p>
              
              <h3 className="text-xl font-semibold mb-3">6.3 Delivery Failure</h3>
              <p className="mb-6">If delivery fails due to incorrect address information provided by you, return shipping costs will be deducted from any refund. We are not responsible for delays caused by courier services or circumstances beyond our control.</p>
              
              <h2 className="text-2xl font-semibold mb-4">7. Payment</h2>
              <p className="mb-4">We accept payments through <strong>PayFast</strong>, which supports major credit cards, debit cards, and instant EFT. All payments are processed securely. We never store your full payment card details.</p>
              
              <h3 className="text-xl font-semibold mb-3">7.1 Payment Authorization</h3>
              <p className="mb-6">By providing payment information, you authorize us to charge the specified amount to your payment method. If payment fails, your order will not be processed.</p>
              
              <h2 className="text-2xl font-semibold mb-4">8. Product Disclaimer</h2>
              <p className="mb-4">While we ensure all products are stored and handled properly, nail care products should be used according to manufacturer instructions. We are not liable for:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Allergic reactions or skin sensitivities</li>
                <li>Improper use of products</li>
                <li>Personal injury resulting from product misuse</li>
              </ul>
              <p className="mb-6">Always patch-test new products and discontinue use if irritation occurs. Professional products should be used by trained individuals or under proper supervision.</p>
              
              <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
              <p className="mb-6">To the maximum extent permitted by South African law, BLOM Cosmetics shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of our products or services.</p>
              
              <h2 className="text-2xl font-semibold mb-4">10. Intellectual Property</h2>
              <p className="mb-6">All content on this website, including images, text, logos, and product descriptions, is the property of BLOM Cosmetics and is protected by copyright laws. You may not reproduce, distribute, or create derivative works from our content without written permission.</p>
              
              <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
              <p className="mb-6">We reserve the right to modify these terms and conditions at any time. Material changes will be communicated via email or a notice on our website. Your continued use of our services constitutes acceptance of updated terms.</p>
              
              <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
              <p className="mb-6">These terms and conditions are governed by and construed in accordance with the laws of the Republic of South Africa. Any disputes will be subject to the exclusive jurisdiction of the South African courts.</p>
              
              <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
              <p className="mb-4">If you have any questions about these Terms & Conditions, or need to make an inquiry about your order, please contact us:</p>
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
