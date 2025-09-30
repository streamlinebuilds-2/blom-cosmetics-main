import React, { useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  Shield, 
  Eye, 
  Lock, 
  Users, 
  Mail, 
  Phone, 
  Globe,
  Database,
  UserCheck,
  Settings,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Privacy Policy - BLOM Cosmetics';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Learn how BLOM Cosmetics protects your privacy and handles your personal information. Transparent data practices and user rights.');
    }
    window.scrollTo({ top: 0 });
  }, []);

  const dataTypes = [
    {
      icon: UserCheck,
      title: 'Personal Information',
      description: 'Name, email, phone number, and billing address',
      examples: ['Account registration', 'Order processing', 'Customer support']
    },
    {
      icon: Database,
      title: 'Usage Data',
      description: 'How you interact with our website and services',
      examples: ['Page views', 'Click patterns', 'Device information']
    },
    {
      icon: Globe,
      title: 'Technical Data',
      description: 'IP address, browser type, and device information',
      examples: ['Security monitoring', 'Performance optimization', 'Analytics']
    }
  ];

  const userRights = [
    {
      icon: Eye,
      title: 'Right to Access',
      description: 'Request a copy of your personal data we hold'
    },
    {
      icon: Settings,
      title: 'Right to Rectification',
      description: 'Correct inaccurate or incomplete information'
    },
    {
      icon: Lock,
      title: 'Right to Erasure',
      description: 'Request deletion of your personal data'
    },
    {
      icon: Shield,
      title: 'Right to Portability',
      description: 'Transfer your data to another service provider'
    }
  ];

  const securityMeasures = [
    'SSL encryption for all data transmission',
    'Secure payment processing with industry standards',
    'Regular security audits and updates',
    'Access controls and authentication systems',
    'Data backup and recovery procedures',
    'Staff training on data protection'
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header showMobileMenu={true} />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-pink-50 to-blue-50 section-padding">
          <Container>
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl font-bold mb-6">Privacy Policy</h1>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                At BLOM Cosmetics, we respect your privacy and are committed to protecting 
                your personal information. This policy explains how we collect, use, and 
                safeguard your data.
              </p>
              <p className="text-sm text-gray-500">Last updated: January 2025</p>
            </div>

            {/* Privacy Principles */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card className="text-center">
                <CardContent className="p-6">
                  <Shield className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">Data Protection</h3>
                  <p className="text-gray-600 text-sm">Your information is encrypted and securely stored</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Eye className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">Transparency</h3>
                  <p className="text-gray-600 text-sm">Clear information about data collection and use</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Users className="h-12 w-12 text-pink-400 mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">User Control</h3>
                  <p className="text-gray-600 text-sm">You control your data and privacy settings</p>
                </CardContent>
              </Card>
            </div>
          </Container>
        </section>

        {/* Information We Collect */}
        <section className="section-padding">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Information We Collect</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We collect information to provide better services and improve your experience
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {dataTypes.map((type, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-blue-300 rounded-lg flex items-center justify-center mb-4">
                      <type.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold">{type.title}</h3>
                    <p className="text-gray-600">{type.description}</p>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-semibold mb-3">Used for:</h4>
                    <ul className="space-y-2">
                      {type.examples.map((example, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          {example}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        {/* How We Use Information */}
        <section className="section-padding bg-gray-50">
          <Container>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6">How We Use Your Information</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <UserCheck className="h-6 w-6 text-pink-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Order Processing</h4>
                      <p className="text-gray-600">To process your orders, handle payments, and provide customer support.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Communication</h4>
                      <p className="text-gray-600">To send order updates, newsletters, and respond to your inquiries.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Settings className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Service Improvement</h4>
                      <p className="text-gray-600">To analyze usage patterns and improve our website and services.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Security & Fraud Prevention</h4>
                      <p className="text-gray-600">To protect against fraud and ensure the security of our platform.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop"
                  alt="Data security"
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -right-6 bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-center">
                    <Lock className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <div className="font-bold">Secure</div>
                    <div className="text-sm text-gray-600">SSL Encrypted</div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Your Rights */}
        <section className="section-padding">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Your Privacy Rights</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                You have control over your personal information and how it's used
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {userRights.map((right, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-blue-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <right.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-3">{right.title}</h3>
                    <p className="text-gray-600 text-sm">{right.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-gray-600 mb-6">
                To exercise any of these rights, please contact us using the information below.
              </p>
              <Button size="lg">
                <Mail className="h-4 w-4 mr-2" />
                Contact Privacy Team
              </Button>
            </div>
          </Container>
        </section>

        {/* Data Security */}
        <section className="section-padding bg-gray-50">
          <Container>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop"
                  alt="Security measures"
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute -top-6 -left-6 bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-center">
                    <Shield className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <div className="font-bold">Protected</div>
                    <div className="text-sm text-gray-600">24/7 Monitoring</div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-4xl font-bold mb-6">Data Security Measures</h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  We implement comprehensive security measures to protect your personal 
                  information from unauthorized access, alteration, disclosure, or destruction.
                </p>

                <div className="space-y-4">
                  {securityMeasures.map((measure, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{measure}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Data Breach Notification</h4>
                      <p className="text-blue-800 text-sm">
                        In the unlikely event of a data breach, we will notify affected users 
                        within 72 hours and take immediate action to secure the data.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Third-Party Services */}
        <section className="section-padding">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Third-Party Services</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We work with trusted partners to provide better services while maintaining your privacy
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-bold">Payment Processors</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    We use secure payment processors like PayFast to handle transactions. 
                    Your payment information is encrypted and never stored on our servers.
                  </p>
                  <div className="text-sm text-gray-500">
                    <strong>Data shared:</strong> Transaction details, billing information
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-xl font-bold">Analytics Services</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    We use analytics tools to understand how visitors use our website 
                    and improve user experience.
                  </p>
                  <div className="text-sm text-gray-500">
                    <strong>Data shared:</strong> Usage patterns, device information (anonymized)
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-xl font-bold">Email Services</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    We use email service providers to send order confirmations, 
                    newsletters, and customer communications.
                  </p>
                  <div className="text-sm text-gray-500">
                    <strong>Data shared:</strong> Email address, name, communication preferences
                  </div>
                </CardContent>
              </Card>
            </div>
          </Container>
        </section>

      </main>

      <Footer />
    </div>
  );
};