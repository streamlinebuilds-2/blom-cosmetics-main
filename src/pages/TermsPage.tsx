import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { FileText, Mail, Phone, MapPin } from 'lucide-react';

export const TermsPage: React.FC = () => {
  React.useEffect(() => {
    document.title = 'Terms of Service – BLOM Cosmetics';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Read BLOM Cosmetics Terms of Service covering orders, payments, shipping, intellectual property, and user responsibilities for our nail products and courses.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header showMobileMenu={true} />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-pink-50 to-blue-50 section-padding">
          <Container>
            <div className="text-center max-w-4xl mx-auto">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-blue-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
              <p className="text-lg text-gray-600 mb-4">
                These terms govern your use of BLOM Cosmetics services, products, and educational content.
              </p>
              <p className="text-sm text-gray-500">
                <strong>Last Updated:</strong> January 1, 2024
              </p>
            </div>
          </Container>
        </section>

        {/* Terms of Service Content */}
        <section className="section-padding">
          <Container>
            <div className="max-w-4xl mx-auto prose prose-lg">
              
              {/* Acceptance of Terms */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Acceptance of Terms</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    By accessing or using BLOM Cosmetics' website, products, or services, you agree to be bound 
                    by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our services.
                  </p>
                  <p>
                    These Terms constitute a legally binding agreement between you and BLOM Cosmetics. 
                    We may modify these Terms at any time, and such modifications will be effective immediately 
                    upon posting on our website.
                  </p>
                  <p>
                    Your continued use of our services after any changes indicates your acceptance of the modified Terms.
                  </p>
                </div>
              </section>

              {/* Eligibility & Accounts */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Eligibility and User Accounts</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Eligibility:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>You must be at least 16 years old to use our services</li>
                    <li>You must provide accurate and complete information</li>
                    <li>You must comply with all applicable laws and regulations</li>
                    <li>You may not use our services if prohibited by law</li>
                  </ul>
                  <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Account Responsibilities:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Maintain the confidentiality of your account credentials</li>
                    <li>Notify us immediately of any unauthorized access</li>
                    <li>Accept responsibility for all activities under your account</li>
                    <li>Provide accurate billing and contact information</li>
                  </ul>
                </div>
              </section>

              {/* Orders & Payments */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Orders and Payments</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Order Process:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>All orders are subject to acceptance and availability</li>
                    <li>We reserve the right to refuse or cancel orders at our discretion</li>
                    <li>Prices are subject to change without notice</li>
                    <li>Order confirmation does not guarantee product availability</li>
                  </ul>
                  <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Payment Terms:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Payment is required at the time of order placement</li>
                    <li>We accept major credit cards and approved payment methods</li>
                    <li>All prices are in South African Rand (ZAR) unless otherwise stated</li>
                    <li>You are responsible for all applicable taxes and fees</li>
                    <li>Refunds are processed according to our return policy</li>
                  </ul>
                </div>
              </section>

              {/* Shipping & Delivery */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Shipping and Delivery</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    We strive to process and ship orders promptly, but delivery times may vary based on 
                    location, product availability, and shipping method selected.
                  </p>
                  <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Shipping Terms:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Shipping costs are calculated at checkout</li>
                    <li>Free shipping available on orders over R500 (South Africa)</li>
                    <li>International shipping rates and restrictions apply</li>
                    <li>Risk of loss transfers to you upon delivery</li>
                    <li>Delivery times are estimates and not guaranteed</li>
                  </ul>
                  <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Returns and Exchanges:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>30-day return policy on unopened products</li>
                    <li>Products must be in original condition and packaging</li>
                    <li>Return shipping costs may apply</li>
                    <li>Certain products may be non-returnable for hygiene reasons</li>
                  </ul>
                </div>
              </section>

              {/* Intellectual Property */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Intellectual Property Rights</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    All content on our website, including but not limited to text, graphics, logos, images, 
                    videos, and course materials, is the property of BLOM Cosmetics and is protected by 
                    copyright, trademark, and other intellectual property laws.
                  </p>
                  <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Your License:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Limited, non-exclusive license to access and use our services</li>
                    <li>Personal, non-commercial use only</li>
                    <li>No right to modify, distribute, or create derivative works</li>
                    <li>Course materials are for enrolled students only</li>
                  </ul>
                  <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Prohibited Uses:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Reproducing or distributing our content without permission</li>
                    <li>Using our trademarks or branding without authorization</li>
                    <li>Sharing course access credentials with others</li>
                    <li>Recording or redistributing course content</li>
                  </ul>
                </div>
              </section>

              {/* Prohibited Activities */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Prohibited Activities</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>You agree not to engage in any of the following prohibited activities:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Violating any applicable laws or regulations</li>
                    <li>Infringing on intellectual property rights</li>
                    <li>Transmitting harmful or malicious code</li>
                    <li>Attempting to gain unauthorized access to our systems</li>
                    <li>Interfering with the proper functioning of our services</li>
                    <li>Impersonating others or providing false information</li>
                    <li>Engaging in fraudulent or deceptive practices</li>
                    <li>Harassing, threatening, or abusing other users</li>
                    <li>Spamming or sending unsolicited communications</li>
                  </ul>
                </div>
              </section>

              {/* Disclaimers & Limitation of Liability */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Disclaimers and Limitation of Liability</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Service Disclaimers:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Services are provided "as is" without warranties of any kind</li>
                    <li>We do not guarantee uninterrupted or error-free service</li>
                    <li>Product results may vary based on individual use and application</li>
                    <li>Course outcomes depend on individual effort and practice</li>
                  </ul>
                  <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Limitation of Liability:</h3>
                  <p>
                    To the maximum extent permitted by law, BLOM Cosmetics shall not be liable for any 
                    indirect, incidental, special, consequential, or punitive damages, including but not 
                    limited to loss of profits, data, or business opportunities.
                  </p>
                  <p>
                    Our total liability for any claim shall not exceed the amount you paid for the 
                    specific product or service giving rise to the claim.
                  </p>
                </div>
              </section>

              {/* Indemnification */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Indemnification</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    You agree to indemnify, defend, and hold harmless BLOM Cosmetics, its officers, 
                    directors, employees, and agents from and against any claims, liabilities, damages, 
                    losses, and expenses arising out of or in any way connected with:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Your use of our services or products</li>
                    <li>Your violation of these Terms</li>
                    <li>Your violation of any rights of another party</li>
                    <li>Your negligent or wrongful conduct</li>
                  </ul>
                </div>
              </section>

              {/* Governing Law & Dispute Resolution */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Governing Law and Dispute Resolution</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    These Terms shall be governed by and construed in accordance with the laws of South Africa, 
                    without regard to its conflict of law provisions.
                  </p>
                  <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Dispute Resolution:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>We encourage resolving disputes through direct communication</li>
                    <li>Any legal disputes shall be subject to the exclusive jurisdiction of South African courts</li>
                    <li>You waive any right to participate in class action lawsuits</li>
                    <li>Claims must be brought within one year of the cause of action arising</li>
                  </ul>
                </div>
              </section>

              {/* Changes to Terms */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Changes to These Terms</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    We reserve the right to modify these Terms at any time. Changes will be effective 
                    immediately upon posting on our website. We will notify users of material changes through:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Email notification to registered users</li>
                    <li>Prominent notice on our website</li>
                    <li>In-app notifications where applicable</li>
                  </ul>
                  <p className="mt-4">
                    Your continued use of our services after any changes constitutes acceptance of the new Terms. 
                    If you do not agree to the modified Terms, you must discontinue use of our services.
                  </p>
                </div>
              </section>

              {/* Contact Information */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Contact Information</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    If you have any questions about these Terms of Service, please contact us:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-6 mt-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-pink-400" />
                        <div>
                          <p className="font-medium text-gray-900">Email</p>
                          <p className="text-sm">shopblomcosmetics@gmail.com</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-pink-400" />
                        <div>
                          <p className="font-medium text-gray-900">Phone</p>
                          <p className="text-sm">+27 79 548 3317</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-pink-400" />
                        <div>
                          <p className="font-medium text-gray-900">Address</p>
                          <p className="text-sm">South Africa</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-6 text-sm text-gray-500">
                    For legal notices and formal communications, please use our email address above.
                  </p>
                </div>
              </section>

            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
};