import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Shield, Mail, Phone, MapPin } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  React.useEffect(() => {
    document.title = 'Privacy Policy – BLOM Cosmetics';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Learn how BLOM Cosmetics protects your privacy and handles your personal information. Our comprehensive privacy policy covers data collection, usage, and your rights.');
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
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
              <p className="text-lg text-gray-600 mb-4">
                Your privacy is important to us. This policy explains how we collect, use, and protect your information.
              </p>
              <p className="text-sm text-gray-500">
                <strong>Last Updated:</strong> January 1, 2024
              </p>
            </div>
          </Container>
        </section>

        {/* Privacy Policy Content */}
        <section className="section-padding">
          <Container>
            <div className="max-w-4xl mx-auto prose prose-lg">
              
              {/* Information We Collect */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Information We Collect</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    We collect information you provide directly to us, such as when you create an account, 
                    make a purchase, enroll in courses, or contact us for support.
                  </p>
                  <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Personal Information:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Name, email address, phone number</li>
                    <li>Billing and shipping addresses</li>
                    <li>Payment information (processed securely by third-party providers)</li>
                    <li>Course enrollment and progress data</li>
                    <li>Communication preferences</li>
                  </ul>
                  <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Automatically Collected Information:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Device information and browser type</li>
                    <li>IP address and location data</li>
                    <li>Website usage patterns and analytics</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </section>

              {/* How We Use Your Information */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">How We Use Your Information</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>We use the information we collect to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Process and fulfill your orders and course enrollments</li>
                    <li>Provide customer support and respond to inquiries</li>
                    <li>Send important updates about your orders and account</li>
                    <li>Improve our products, services, and website experience</li>
                    <li>Send marketing communications (with your consent)</li>
                    <li>Prevent fraud and ensure platform security</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </div>
              </section>

              {/* Legal Basis */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Legal Basis for Processing</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>We process your personal information based on:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Contract Performance:</strong> To fulfill orders and provide services</li>
                    <li><strong>Legitimate Interest:</strong> To improve our services and prevent fraud</li>
                    <li><strong>Consent:</strong> For marketing communications and optional features</li>
                    <li><strong>Legal Compliance:</strong> To meet regulatory requirements</li>
                  </ul>
                </div>
              </section>

              {/* Cookies & Tracking */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Cookies & Tracking Technologies</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    We use cookies and similar technologies to enhance your browsing experience, 
                    analyze website traffic, and personalize content.
                  </p>
                  <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Types of Cookies:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Essential Cookies:</strong> Required for website functionality</li>
                    <li><strong>Analytics Cookies:</strong> Help us understand website usage</li>
                    <li><strong>Marketing Cookies:</strong> Used for targeted advertising</li>
                    <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                  </ul>
                  <p className="mt-4">
                    You can control cookies through your browser settings, though some features may not work properly if disabled.
                  </p>
                </div>
              </section>

              {/* Data Sharing */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Data Sharing and Disclosure</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>We may share your information with:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Service Providers:</strong> Payment processors, shipping companies, email services</li>
                    <li><strong>Business Partners:</strong> Course instructors and educational content providers</li>
                    <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                    <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
                  </ul>
                  <p className="mt-4">
                    We never sell your personal information to third parties for their marketing purposes.
                  </p>
                </div>
              </section>

              {/* Data Retention */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Data Retention</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    We retain your personal information for as long as necessary to provide our services 
                    and comply with legal obligations:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Account Information:</strong> Until account deletion or 3 years of inactivity</li>
                    <li><strong>Order History:</strong> 7 years for tax and accounting purposes</li>
                    <li><strong>Course Progress:</strong> Lifetime access as part of our service</li>
                    <li><strong>Marketing Data:</strong> Until you unsubscribe or object</li>
                  </ul>
                </div>
              </section>

              {/* Security */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Data Security</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    We implement appropriate technical and organizational measures to protect your personal information:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>SSL encryption for data transmission</li>
                    <li>Secure payment processing through certified providers</li>
                    <li>Regular security audits and updates</li>
                    <li>Access controls and employee training</li>
                    <li>Data backup and recovery procedures</li>
                  </ul>
                  <p className="mt-4">
                    While we strive to protect your information, no method of transmission over the internet 
                    is 100% secure. We cannot guarantee absolute security.
                  </p>
                </div>
              </section>

              {/* Your Rights */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Your Privacy Rights</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>Depending on your location, you may have the following rights:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Access:</strong> Request a copy of your personal information</li>
                    <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                    <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                    <li><strong>Portability:</strong> Receive your data in a structured format</li>
                    <li><strong>Objection:</strong> Object to processing for marketing purposes</li>
                    <li><strong>Restriction:</strong> Limit how we process your information</li>
                  </ul>
                  <p className="mt-4">
                    To exercise these rights, please contact us using the information provided below.
                  </p>
                </div>
              </section>

              {/* Children's Privacy */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Children's Privacy</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    Our services are not intended for children under 16 years of age. We do not knowingly 
                    collect personal information from children under 16. If we become aware that we have 
                    collected personal information from a child under 16, we will take steps to delete such information.
                  </p>
                  <p>
                    If you are a parent or guardian and believe your child has provided us with personal 
                    information, please contact us immediately.
                  </p>
                </div>
              </section>

              {/* International Transfers */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">International Data Transfers</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    Your information may be transferred to and processed in countries other than your own. 
                    We ensure appropriate safeguards are in place to protect your information in accordance 
                    with applicable data protection laws.
                  </p>
                  <p>
                    For transfers outside the European Economic Area, we rely on adequacy decisions, 
                    standard contractual clauses, or other approved transfer mechanisms.
                  </p>
                </div>
              </section>

              {/* Changes to Policy */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Changes to This Privacy Policy</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    We may update this Privacy Policy from time to time to reflect changes in our practices 
                    or applicable laws. We will notify you of any material changes by:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Posting the updated policy on our website</li>
                    <li>Sending an email notification to registered users</li>
                    <li>Displaying a prominent notice on our website</li>
                  </ul>
                  <p className="mt-4">
                    Your continued use of our services after any changes indicates your acceptance of the updated policy.
                  </p>
                </div>
              </section>

              {/* Contact Information */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Contact Us</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    If you have any questions about this Privacy Policy or our privacy practices, 
                    please contact us:
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