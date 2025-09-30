<<<<<<< HEAD
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


=======
import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { RotateCcw, Mail, Phone, MapPin, Package, Clock, Shield, AlertCircle } from 'lucide-react';

export const ReturnsPage: React.FC = () => {
  React.useEffect(() => {
    document.title = 'Returns & Refund Policy – BLOM Cosmetics';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Learn about BLOM Cosmetics returns and refund policy. 7-day return window, exchange process, and how to start a return for nail products.');
    }
  }, []);

  const returnSteps = [
    {
      step: 1,
      title: 'Contact Us',
      description: 'Email our support team within 7 days of delivery',
      icon: Mail
    },
    {
      step: 2,
      title: 'Provide Details',
      description: 'Include order number, photos (if applicable), and reason for return',
      icon: Package
    },
    {
      step: 3,
      title: 'Get Instructions',
      description: 'Our team will provide return instructions and authorization',
      icon: Shield
    },
    {
      step: 4,
      title: 'Ship & Refund',
      description: 'Send item back and receive refund within 7-10 business days',
      icon: RotateCcw
    }
  ];

  const eligibleItems = [
    'Unopened products in original packaging',
    'Items with intact safety seals',
    'Products received within 7 days',
    'Damaged or defective items',
    'Incorrect items received'
  ];

  const nonReturnableItems = [
    'Opened or used products (gels, powders, primers, liquids, brushes)',
    'Items without original packaging or safety seals',
    'Clearance or promotional sale items',
    'Products returned after 7-day window',
    'Items damaged by customer use'
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header showMobileMenu={true} />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-pink-50 to-blue-50 section-padding">
          <Container>
            <div className="text-center max-w-4xl mx-auto">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-blue-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <RotateCcw className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Returns & Refund Policy</h1>
              <p className="text-lg text-gray-600 mb-4">
                We want you to be completely satisfied with your BLOM Cosmetics purchase. 
                Learn about our return process and refund policy.
              </p>
              <p className="text-sm text-gray-500">
                <strong>Last Updated:</strong> January 2025
              </p>
            </div>
          </Container>
        </section>

        {/* Quick Overview */}
        <section className="section-padding">
          <Container>
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">7-Day Window</h3>
                <p className="text-gray-600">Returns accepted within 7 days of delivery for unopened items</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Quality Guarantee</h3>
                <p className="text-gray-600">Damaged or defective items replaced at no additional cost</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RotateCcw className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Fast Processing</h3>
                <p className="text-gray-600">Refunds processed within 7-10 business days</p>
              </div>
            </div>
          </Container>
        </section>

        {/* Return Process */}
        <section className="section-padding bg-gray-50">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How to Start a Return</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Follow these simple steps to return your BLOM Cosmetics products
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {returnSteps.map((step) => (
                <div key={step.step} className="text-center">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-blue-300 rounded-full flex items-center justify-center mx-auto">
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
              ))}
            </div>

            {/* Contact Information */}
            <div className="mt-12 bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-center mb-6">Start Your Return</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Mail className="h-8 w-8 text-pink-400 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Email Support</h4>
                  <p className="text-gray-600 text-sm mb-2">For returns and exchanges</p>
                  <a 
                    href="mailto:shopblomcosmetics@gmail.com" 
                    className="text-pink-400 hover:text-pink-500 font-medium"
                  >
                    shopblomcosmetics@gmail.com
                  </a>
                </div>
                <div className="text-center">
                  <Phone className="h-8 w-8 text-pink-400 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Phone Support</h4>
                  <p className="text-gray-600 text-sm mb-2">Speak with our team</p>
                  <a 
                    href="tel:+27795483317" 
                    className="text-pink-400 hover:text-pink-500 font-medium"
                  >
                    +27 79 548 3317
                  </a>
                </div>
                <div className="text-center">
                  <MapPin className="h-8 w-8 text-pink-400 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Studio Address</h4>
                  <p className="text-gray-600 text-sm mb-2">For in-person support</p>
                  <p className="text-gray-600 text-sm">
                    34 Horingbek St<br />
                    Randfontein 1759
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Eligible vs Non-Returnable Items */}
        <section className="section-padding">
          <Container>
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Eligible Items */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold">Eligible for Return</h2>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Items that can be returned within 7 days of delivery:
                </p>
                <ul className="space-y-3">
                  {eligibleItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Non-Returnable Items */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <h2 className="text-3xl font-bold">Non-Returnable Items</h2>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  For hygiene and safety reasons, these items cannot be returned:
                </p>
                <ul className="space-y-3">
                  {nonReturnableItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      </div>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Container>
        </section>

        {/* Detailed Policies */}
        <section className="section-padding bg-gray-50">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Detailed Return Policies</h2>
              
              <div className="space-y-8">
                {/* Return Window */}
                <div className="bg-white rounded-lg p-8 shadow-sm">
                  <h3 className="text-2xl font-bold mb-4">Return Window</h3>
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p>
                      <strong>7-Day Policy:</strong> Returns or exchanges are accepted within 7 days of delivery 
                      if the product is unopened, unused, and in its original packaging with all safety seals intact.
                    </p>
                    <p>
                      <strong>Damaged/Defective Items:</strong> Returns are accepted regardless of the 7-day window 
                      if the item was received damaged, defective, or incorrect. Contact us within 48 hours of 
                      delivery with photos for fastest resolution.
                    </p>
                  </div>
                </div>

                {/* Exchanges */}
                <div className="bg-white rounded-lg p-8 shadow-sm">
                  <h3 className="text-2xl font-bold mb-4">Exchanges</h3>
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p>
                      If you received a damaged, defective, or incorrect product, we'll provide a replacement 
                      at no additional cost. Simply contact our support team within 48 hours of delivery with:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Your order number</li>
                      <li>Clear photos of the damaged/incorrect item</li>
                      <li>Description of the issue</li>
                    </ul>
                    <p>
                      We'll arrange for a replacement to be sent immediately upon verification.
                    </p>
                  </div>
                </div>

                {/* Refunds */}
                <div className="bg-white rounded-lg p-8 shadow-sm">
                  <h3 className="text-2xl font-bold mb-4">Refunds</h3>
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p>
                      <strong>Processing Time:</strong> Approved refunds are processed to the original payment 
                      method within 7–10 business days after we receive the returned item.
                    </p>
                    <p>
                      <strong>Shipping Fees:</strong> Original shipping fees are non-refundable unless the 
                      error was on BLOM Cosmetics' side (wrong item sent, damaged in transit, etc.).
                    </p>
                    <p>
                      <strong>Return Shipping:</strong> Customers are responsible for return shipping costs 
                      unless the return is due to our error.
                    </p>
                  </div>
                </div>

                {/* Hygiene Policy */}
                <div className="bg-white rounded-lg p-8 shadow-sm">
                  <h3 className="text-2xl font-bold mb-4">Hygiene & Safety Policy</h3>
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p>
                      For the health and safety of all our customers, we cannot accept returns on:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Any opened or used nail products (gels, powders, primers, liquids)</li>
                      <li>Brushes or tools that have been used</li>
                      <li>Items with broken or missing safety seals</li>
                      <li>Products without original packaging</li>
                    </ul>
                    <p>
                      This policy helps us maintain the highest standards of product safety and quality 
                      for all our customers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* FAQ Section */}
        <section className="section-padding">
          <Container>
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-bold text-lg mb-3">What if I'm not satisfied with my purchase?</h4>
                  <p className="text-gray-600">
                    If you're not completely satisfied with an unopened product, you can return it within 
                    7 days of delivery for a full refund. Contact our support team to start the process.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-bold text-lg mb-3">How long does the refund process take?</h4>
                  <p className="text-gray-600">
                    Once we receive your returned item, refunds are processed within 7-10 business days. 
                    The time it takes to appear in your account depends on your payment provider.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-bold text-lg mb-3">Can I exchange a product for a different color or size?</h4>
                  <p className="text-gray-600">
                    Yes, as long as the original item is unopened and within the 7-day return window. 
                    Contact us to arrange an exchange, and we'll provide instructions.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-bold text-lg mb-3">What if my package arrives damaged?</h4>
                  <p className="text-gray-600">
                    Contact us immediately with photos of the damaged package and items. We'll arrange 
                    for a replacement to be sent at no cost to you.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Contact CTA */}
        <section className="section-padding bg-gradient-to-r from-pink-400 to-blue-300 text-white">
          <Container>
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold mb-6">Need Help with a Return?</h2>
              <p className="text-xl text-pink-100 mb-8 leading-relaxed">
                Our customer support team is here to help make your return process as smooth as possible. 
                Don't hesitate to reach out with any questions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:shopblomcosmetics@gmail.com"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-pink-400 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Email Support
                </a>
                <a 
                  href="tel:+27795483317"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-lg font-medium hover:bg-white hover:text-pink-400 transition-colors"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Call Us
                </a>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
};
>>>>>>> 9b8fef6eb26a955659f83bf0b0a7f9514274e249
