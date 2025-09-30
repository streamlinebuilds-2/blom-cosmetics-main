import React, { useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  Package, 
  Clock, 
  Shield, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Mail, 
  Phone, 
  MapPin,
  RefreshCw,
  CreditCard,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

export const ReturnsPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Returns & Refund Policy - BLOM Cosmetics';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Learn about BLOM Cosmetics returns and refund policy. 7-day return window for unopened products with easy exchange process.');
    }
    window.scrollTo({ top: 0 });
  }, []);

  const eligibleItems = [
    'Unopened products in original packaging',
    'Items with intact safety seals',
    'Products received within 7 days',
    'Damaged or defective items',
    'Incorrect items received'
  ];

  const nonReturnableItems = [
    'Opened or used products (gels, powders, primers, liquids)',
    'Brushes that have been used',
    'Items without original packaging',
    'Products with broken safety seals',
    'Clearance or promotional sale items'
  ];

  const returnSteps = [
    {
      step: 1,
      title: 'Contact Us',
      description: 'Email us within 7 days of delivery',
      icon: Mail
    },
    {
      step: 2,
      title: 'Provide Details',
      description: 'Include order number, photos, and reason',
      icon: Package
    },
    {
      step: 3,
      title: 'Get Instructions',
      description: 'We\'ll provide return shipping details',
      icon: ArrowRight
    },
    {
      step: 4,
      title: 'Ship Back',
      description: 'Send item using provided instructions',
      icon: RefreshCw
    }
  ];

  const faqs = [
    {
      question: 'How long do I have to return an item?',
      answer: 'You have 7 days from the delivery date to initiate a return for eligible items.'
    },
    {
      question: 'Can I return opened products?',
      answer: 'No, for hygiene and safety reasons, opened or used products cannot be returned. This includes gels, powders, primers, liquids, and brushes.'
    },
    {
      question: 'What if I received a damaged item?',
      answer: 'Contact us within 48 hours of delivery with photos of the damaged item. We\'ll provide a replacement at no additional cost.'
    },
    {
      question: 'How long do refunds take?',
      answer: 'Approved refunds are processed within 7-10 business days to your original payment method.'
    },
    {
      question: 'Are shipping fees refundable?',
      answer: 'Shipping fees are only refundable if the error was on our side (wrong item sent, damaged product, etc.).'
    },
    {
      question: 'Can I exchange an item instead of returning it?',
      answer: 'Yes, if you received a damaged or incorrect product, we offer exchanges. Contact us within 48 hours with photos.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header showMobileMenu={true} />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-pink-50 to-blue-50 section-padding">
          <Container>
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl font-bold mb-6">Returns & Refund Policy</h1>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                We want you to be completely satisfied with your BLOM Cosmetics purchase. 
                Learn about our return policy and how to process returns or exchanges.
              </p>
              <p className="text-sm text-gray-500">Last updated: January 2025</p>
            </div>

            {/* Quick Overview */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card className="text-center">
                <CardContent className="p-6">
                  <Clock className="h-12 w-12 text-pink-400 mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">7-Day Window</h3>
                  <p className="text-gray-600 text-sm">Returns accepted within 7 days of delivery</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Shield className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">Hygiene First</h3>
                  <p className="text-gray-600 text-sm">Unopened products only for safety reasons</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <CreditCard className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">Quick Refunds</h3>
                  <p className="text-gray-600 text-sm">Processed within 7-10 business days</p>
                </CardContent>
              </Card>
            </div>
          </Container>
        </section>

        {/* Eligible Returns */}
        <section className="section-padding">
          <Container>
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  Eligible Returns
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Returns or exchanges are accepted within 7 days of delivery if the product 
                  meets our eligibility criteria. We prioritize hygiene and safety for all customers.
                </p>
                <ul className="space-y-3">
                  {eligibleItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <XCircle className="h-8 w-8 text-red-500" />
                  Non-Returnable Items
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  For hygiene and safety reasons, the following items cannot be returned once 
                  opened or used. This policy protects all our customers.
                </p>
                <ul className="space-y-3">
                  {nonReturnableItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Container>
        </section>

        {/* Return Process */}
        <section className="section-padding bg-gray-50">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">How to Start a Return</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Follow these simple steps to process your return quickly and efficiently
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {returnSteps.map((step) => (
                <Card key={step.step} className="text-center relative">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-blue-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <step.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-pink-400 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {step.step}
                    </div>
                    <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Contact Information */}
            <Card className="mt-12 max-w-2xl mx-auto">
              <CardHeader>
                <h3 className="text-2xl font-bold text-center">Contact Information for Returns</h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-gray-600 mb-6">
                    To start a return, contact our support team with your order number, 
                    photos (if applicable), and reason for return.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div className="flex flex-col items-center">
                    <Mail className="h-8 w-8 text-pink-400 mb-3" />
                    <h4 className="font-semibold mb-2">Email</h4>
                    <a 
                      href="mailto:shopblomcosmetics@gmail.com" 
                      className="text-pink-400 hover:text-pink-500 transition-colors"
                    >
                      shopblomcosmetics@gmail.com
                    </a>
                  </div>
                  <div className="flex flex-col items-center">
                    <Phone className="h-8 w-8 text-blue-400 mb-3" />
                    <h4 className="font-semibold mb-2">Phone</h4>
                    <a 
                      href="tel:+27795483317" 
                      className="text-blue-400 hover:text-blue-500 transition-colors"
                    >
                      +27 79 548 3317
                    </a>
                  </div>
                  <div className="flex flex-col items-center">
                    <MapPin className="h-8 w-8 text-green-400 mb-3" />
                    <h4 className="font-semibold mb-2">Studio</h4>
                    <p className="text-gray-600 text-sm">
                      34 Horingbek St<br />
                      Randfontein 1759
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Container>
        </section>

        {/* Refund Information */}
        <section className="section-padding">
          <Container>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6">Refund Process</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CreditCard className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Original Payment Method</h4>
                      <p className="text-gray-600">Approved refunds are processed to your original payment method within 7-10 business days.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Shipping Fees</h4>
                      <p className="text-gray-600">Shipping fees are non-refundable unless the error was on BLOM Cosmetics' side.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <RefreshCw className="h-6 w-6 text-pink-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Exchanges</h4>
                      <p className="text-gray-600">For damaged or incorrect products, contact us within 48 hours with photos for a replacement at no additional cost.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop"
                  alt="Customer service"
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-pink-400 mb-1">7-10</div>
                    <div className="text-sm text-gray-600">Business Days</div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* FAQ Section */}
        <section className="section-padding bg-gray-50">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Find quick answers to common questions about returns and refunds
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <HelpCircle className="h-4 w-4 text-pink-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-gray-600 mb-4">Still have questions about returns?</p>
              <a href="/contact" onClick={(e) => {
                e.preventDefault();
                try {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  const overlay = document.createElement('div');
                  overlay.className = 'page-transition-overlay';
                  document.body.appendChild(overlay);
                  window.setTimeout(() => { window.location.assign('/contact'); }, 400);
                } catch { window.location.assign('/contact'); }
              }}>
                <Button size="lg">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </a>
            </div>
          </Container>
        </section>

      </main>

      <Footer />
    </div>
  );
};