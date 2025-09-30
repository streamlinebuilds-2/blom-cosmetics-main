import React, { useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  FileText, 
  ShoppingCart, 
  CreditCard, 
  Truck, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Mail,
  Phone,
  Scale,
  Users,
  Globe,
  Lock
} from 'lucide-react';

export const TermsPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Terms of Service - BLOM Cosmetics';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Read BLOM Cosmetics terms of service covering orders, payments, shipping, and user responsibilities.');
    }
    window.scrollTo({ top: 0 });
  }, []);

  const keyTerms = [
    {
      icon: ShoppingCart,
      title: 'Orders & Products',
      description: 'Terms for placing orders and product availability'
    },
    {
      icon: CreditCard,
      title: 'Payment & Pricing',
      description: 'Payment methods, pricing, and billing policies'
    },
    {
      icon: Truck,
      title: 'Shipping & Delivery',
      description: 'Delivery terms, shipping costs, and timelines'
    },
    {
      icon: Shield,
      title: 'User Responsibilities',
      description: 'Your obligations when using our services'
    }
  ];

  const prohibitedUses = [
    'Using our services for any unlawful purpose',
    'Attempting to gain unauthorized access to our systems',
    'Transmitting viruses or malicious code',
    'Harassing or abusing other users or staff',
    'Violating intellectual property rights',
    'Creating false or misleading accounts'
  ];

  const userRights = [
    'Access to accurate product information',
    'Secure payment processing',
    'Privacy protection of personal data',
    'Customer support and assistance',
    'Fair return and refund policies',
    'Transparent pricing and fees'
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header showMobileMenu={true} />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-pink-50 to-blue-50 section-padding">
          <Container>
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl font-bold mb-6">Terms of Service</h1>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                These terms govern your use of BLOM Cosmetics services. By using our website 
                and purchasing our products, you agree to these terms and conditions.
              </p>
              <p className="text-sm text-gray-500">Last updated: January 2025</p>
            </div>

            {/* Key Terms Overview */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              {keyTerms.map((term, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-blue-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <term.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{term.title}</h3>
                    <p className="text-gray-600 text-sm">{term.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        {/* Acceptance of Terms */}
        <section className="section-padding">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-8">1. Acceptance of Terms</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-600 leading-relaxed mb-6">
                  By accessing and using the BLOM Cosmetics website, mobile application, or any of our services, 
                  you accept and agree to be bound by the terms and provision of this agreement. If you do not 
                  agree to abide by the above, please do not use this service.
                </p>
                <p className="text-gray-600 leading-relaxed mb-6">
                  These Terms of Service constitute a legally binding agreement between you and BLOM Cosmetics. 
                  We reserve the right to update these terms at any time without prior notice. Your continued 
                  use of our services after any changes indicates your acceptance of the new terms.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Important Note</h4>
                      <p className="text-blue-800 text-sm">
                        By placing an order or creating an account, you confirm that you are at least 18 years old 
                        or have parental consent to use our services.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Orders and Products */}
        <section className="section-padding bg-gray-50">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-8 flex items-center gap-3">
                <ShoppingCart className="h-8 w-8 text-pink-400" />
                2. Orders and Products
              </h2>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-semibold mb-4">Order Placement</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      All orders are subject to acceptance and availability
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      We reserve the right to refuse or cancel orders
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      Order confirmation does not guarantee product availability
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      Bulk orders may require additional processing time
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold mb-4">Product Information</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      Product descriptions and images are for reference only
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      Colors may vary due to monitor settings
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      We strive for accuracy but cannot guarantee perfection
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      Product formulations may change without notice
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Payment Terms */}
        <section className="section-padding">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-8 flex items-center gap-3">
                <CreditCard className="h-8 w-8 text-blue-400" />
                3. Payment Terms
              </h2>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-semibold mb-4">Payment Methods</h3>
                  <p className="text-gray-600 mb-4">
                    We accept various payment methods including credit cards, debit cards, 
                    and electronic fund transfers through our secure payment processors.
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Credit and debit cards (Visa, Mastercard)</li>
                    <li>• PayFast secure payment gateway</li>
                    <li>• Electronic fund transfers (EFT)</li>
                    <li>• Bank deposits (with proof of payment)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold mb-4">Pricing and Billing</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      All prices are in South African Rand (ZAR)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      Prices include VAT where applicable
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      Payment is required before order processing
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      We reserve the right to change prices without notice
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-yellow-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-2">Payment Security</h4>
                    <p className="text-yellow-800 text-sm">
                      All payment information is processed securely through encrypted connections. 
                      We do not store credit card information on our servers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Shipping and Delivery */}
        <section className="section-padding bg-gray-50">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-8 flex items-center gap-3">
                <Truck className="h-8 w-8 text-green-400" />
                4. Shipping and Delivery
              </h2>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-semibold mb-4">Delivery Areas</h3>
                  <p className="text-gray-600 mb-4">
                    We currently deliver within South Africa and selected international locations. 
                    Delivery times and costs vary by location.
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Major cities: 2-3 business days</li>
                    <li>• Regional areas: 3-5 business days</li>
                    <li>• Remote areas: 5-7 business days</li>
                    <li>• International: 7-14 business days</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold mb-4">Shipping Terms</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      Free shipping on orders over R500
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      Shipping costs calculated at checkout
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      Risk of loss passes to buyer upon delivery
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      Delivery delays may occur due to circumstances beyond our control
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* User Responsibilities */}
        <section className="section-padding">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-8 flex items-center gap-3">
                <Users className="h-8 w-8 text-purple-400" />
                5. User Responsibilities
              </h2>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <h3 className="text-2xl font-semibold text-green-600">Your Rights</h3>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {userRights.map((right, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-600">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          {right}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="text-2xl font-semibold text-red-600">Prohibited Uses</h3>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {prohibitedUses.map((use, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-600">
                          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                          {use}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="h-6 w-6 text-red-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-red-900 mb-2">Account Termination</h4>
                    <p className="text-red-800 text-sm">
                      We reserve the right to terminate or suspend accounts that violate these terms. 
                      Repeated violations may result in permanent bans from our services.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Intellectual Property */}
        <section className="section-padding bg-gray-50">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-8 flex items-center gap-3">
                <Lock className="h-8 w-8 text-indigo-400" />
                6. Intellectual Property
              </h2>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-600 leading-relaxed mb-6">
                  All content on this website, including but not limited to text, graphics, logos, 
                  images, audio clips, digital downloads, data compilations, and software, is the 
                  property of BLOM Cosmetics or its content suppliers and is protected by South African 
                  and international copyright laws.
                </p>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Our Rights</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• BLOM trademark and logo</li>
                      <li>• Product names and descriptions</li>
                      <li>• Website design and layout</li>
                      <li>• Educational content and tutorials</li>
                      <li>• Photography and imagery</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Your License</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Personal, non-commercial use only</li>
                      <li>• No reproduction without permission</li>
                      <li>• No modification of content</li>
                      <li>• No reverse engineering</li>
                      <li>• Respect third-party rights</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Limitation of Liability */}
        <section className="section-padding">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-8 flex items-center gap-3">
                <Scale className="h-8 w-8 text-orange-400" />
                7. Limitation of Liability
              </h2>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-600 leading-relaxed mb-6">
                  BLOM Cosmetics shall not be liable for any direct, indirect, incidental, special, 
                  consequential, or punitive damages, including without limitation, loss of profits, 
                  data, use, goodwill, or other intangible losses, resulting from your use of our services.
                </p>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-6 w-6 text-orange-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-orange-900 mb-2">Important Disclaimer</h4>
                      <p className="text-orange-800 text-sm mb-4">
                        Our products are intended for professional use by trained nail technicians. 
                        We are not responsible for damages resulting from improper use or application.
                      </p>
                      <ul className="text-orange-800 text-sm space-y-1">
                        <li>• Always read product instructions carefully</li>
                        <li>• Perform patch tests before use</li>
                        <li>• Seek professional training when needed</li>
                        <li>• Discontinue use if adverse reactions occur</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Contact Information */}
        <section className="section-padding bg-gradient-to-r from-pink-400 to-blue-300 text-white">
          <Container>
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-6">Questions About These Terms?</h2>
              <p className="text-xl text-pink-100 mb-8">
                If you have any questions about these Terms of Service, please contact us. 
                We're here to help clarify any concerns you may have.
              </p>

              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="text-center">
                  <Mail className="h-8 w-8 mx-auto mb-3 text-pink-200" />
                  <h4 className="font-semibold mb-2">Email</h4>
                  <p className="text-pink-100">shopblomcosmetics@gmail.com</p>
                </div>
                <div className="text-center">
                  <Phone className="h-8 w-8 mx-auto mb-3 text-pink-200" />
                  <h4 className="font-semibold mb-2">Phone</h4>
                  <p className="text-pink-100">+27 79 548 3317</p>
                </div>
                <div className="text-center">
                  <Globe className="h-8 w-8 mx-auto mb-3 text-pink-200" />
                  <h4 className="font-semibold mb-2">Address</h4>
                  <p className="text-pink-100">34 Horingbek St, Randfontein 1759</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Legal Team
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-pink-400">
                  <FileText className="h-4 w-4 mr-2" />
                  Download Terms
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
};