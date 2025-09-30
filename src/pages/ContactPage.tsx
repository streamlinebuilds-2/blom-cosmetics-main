import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Send,
  Facebook,
  Instagram,
  Twitter,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  User,
  Building,
  ShoppingCart,
  BookOpen,
  Award,
  Heart,
  CheckCircle
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Us',
      description: 'Send us a message anytime',
      contact: 'shopblomcosmetics@gmail.com',
      action: 'mailto:shopblomcosmetics@gmail.com',
      available: '24/7 - We respond within 24 hours'
    },
    {
      icon: Phone,
      title: 'Call Us',
      description: 'Speak directly with our team',
      contact: '+27 79 548 3317',
      action: 'tel:+27795483317',
      available: 'Mon-Fri: 9:00 AM - 6:00 PM (SAST)'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Get instant support',
      contact: 'Chat with us now',
      action: '#',
      available: 'Mon-Fri: 9:00 AM - 5:00 PM (SAST)'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      description: 'Come see us in person',
      contact: 'South Africa',
      action: '#',
      available: 'By appointment only'
    }
  ];

  const socialLinks = [
    {
      icon: Facebook,
      name: 'Facebook',
      href: '#',
      followers: '12.5K'
    },
    {
      icon: Instagram,
      name: 'Instagram',
      href: '#',
      followers: '25.8K'
    },
    {
      icon: Twitter,
      name: 'Twitter',
      href: '#',
      followers: '8.2K'
    }
  ];

  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'products', label: 'Product Information' },
    { value: 'courses', label: 'Course Enrollment' },
    { value: 'support', label: 'Technical Support' },
    { value: 'business', label: 'Business Partnership' },
    { value: 'media', label: 'Media & Press' }
  ];

  const helpLinks = [
    {
      icon: ShoppingCart,
      title: 'Order Support',
      description: 'Track orders, returns, and shipping',
      links: [
        { name: 'Track Your Order', href: '/order-tracking' },
        { name: 'Returns & Exchanges', href: '/returns' },
        { name: 'Shipping Information', href: '/shipping' }
      ]
    },
    {
      icon: BookOpen,
      title: 'Course Support',
      description: 'Enrollment, access, and certification',
      links: [
        { name: 'Course Enrollment', href: '/courses' },
        { name: 'Access Your Courses', href: '/student-portal' },
        { name: 'Certification Help', href: '/certification' }
      ]
    },
    {
      icon: User,
      title: 'Account Help',
      description: 'Login, profile, and account settings',
      links: [
        { name: 'Account Login', href: '/login' },
        { name: 'Reset Password', href: '/reset-password' },
        { name: 'Update Profile', href: '/profile' }
      ]
    },
    {
      icon: Award,
      title: 'Professional Services',
      description: 'Certification, training, and partnerships',
      links: [
        { name: 'Become an Instructor', href: '/instructor-application' },
        { name: 'Wholesale Inquiries', href: '/wholesale' },
        { name: 'Partnership Opportunities', href: '/partnerships' }
      ]
    }
  ];

  const faqs = [
    {
      question: 'How do I enroll in a course?',
      answer: 'You can enroll in any of our courses by visiting the course page and clicking the "Enroll Now" button. You\'ll be guided through the payment process and will receive immediate access to online courses or confirmation details for in-person training.'
    },
    {
      question: 'What products do you recommend for beginners?',
      answer: 'For beginners, we recommend starting with our Beginner\'s Acrylic Kit which includes everything you need: primer, acrylic powder, liquid monomer, brushes, and detailed instructions. We also offer online tutorials to help you get started.'
    },
    {
      question: 'Do you offer international shipping?',
      answer: 'Yes, we ship internationally to most countries. Shipping costs and delivery times vary by location. You can see exact shipping costs during checkout. We also offer expedited shipping options for urgent orders.'
    },
    {
      question: 'How long do courses take to complete?',
      answer: 'Course duration varies by program. Online courses range from 4-12 hours and can be completed at your own pace. In-person workshops are typically 1-3 days. Each course page shows the exact duration and schedule.'
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy on unopened products. For courses, we provide a 7-day satisfaction guarantee. If you\'re not completely satisfied, contact us for a full refund or exchange.'
    },
    {
      question: 'Do you provide certificates upon course completion?',
      answer: 'Yes, all our courses include a certificate of completion. Professional certification courses also provide industry-recognized credentials that you can use to advance your career and demonstrate your expertise to clients.'
    },
    {
      question: 'Can I get personalized product recommendations?',
      answer: 'Absolutely! Our expert team can provide personalized product recommendations based on your skill level, preferences, and goals. Contact us via email or phone for a consultation.'
    },
    {
      question: 'Do you offer bulk discounts for salons?',
      answer: 'Yes, we offer wholesale pricing for salons, schools, and bulk orders. Contact our business team at shopblomcosmetics@gmail.com for pricing information and to set up a wholesale account.'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      inquiryType: 'general'
    });
    
    setIsSubmitting(false);
    alert('Thank you for your message! We\'ll get back to you within 24 hours.');
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header showMobileMenu={true} />

      <main>
        {/* Contact Hero Section */}
        <section className="bg-gradient-to-br from-pink-50 to-blue-50 section-padding">
          <Container>
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl font-bold mb-6">Get in Touch</h1>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                We're here to help you succeed in your nail artistry journey. Whether you have 
                questions about our products, need course guidance, or want to explore partnership 
                opportunities, our expert team is ready to assist you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg">Send us a Message</Button>
                <a href="/about#team" className="inline-block" onClick={(e) => {
                  e.preventDefault();
                  try {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    const overlay = document.createElement('div');
                    overlay.className = 'page-transition-overlay';
                    document.body.appendChild(overlay);
                    window.setTimeout(() => { window.location.assign('/about#team'); }, 400);
                  } catch { window.location.assign('/about#team'); }
                }}>
                  <Button size="lg" variant="outline">Meet Our Team</Button>
                </a>
              </div>
            </div>

            {/* Quick Stats removed as requested */}
          </Container>
        </section>

        {/* Contact Options Section */}
        <section className="section-padding">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Multiple Ways to Connect</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Choose the contact method that works best for you. Our team is available 
                through multiple channels to provide the support you need.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {contactMethods.map((method, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow group">
                  <CardContent className="pt-8 pb-6 px-6">
                    <div className="mt-3 w-16 h-16 bg-gradient-to-r from-pink-400 to-blue-300 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <method.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-xl mb-2">{method.title}</h3>
                    <p className="text-gray-600 mb-4">{method.description}</p>
                    <a 
                      href={method.action}
                      className="text-pink-400 font-semibold hover:text-pink-500 transition-colors block mb-2 text-xs md:text-sm whitespace-normal leading-5"
                    >
                      {method.title === 'Email Us' && typeof method.contact === 'string'
                        ? (() => {
                            const [local, domain] = method.contact.split('@');
                            return (
                              <>
                                <span className="break-words">{local}</span>
                                <wbr />
                                <span>@{domain}</span>
                              </>
                            );
                          })()
                        : method.contact}
                    </a>
                    <p className="text-sm text-gray-500">{method.available}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Social Media */}
            <div className="mt-16 text-center">
              <h3 className="text-2xl font-bold mb-8">Follow Us on Social Media</h3>
              <div className="flex justify-center gap-6">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-pink-50 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-blue-300 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <social.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-medium">{social.name}</span>
                    <span className="text-sm text-gray-500">{social.followers} followers</span>
                  </a>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* Contact Form Section */}
        <section className="section-padding bg-gray-50">
          <Container>
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div>
                <h2 className="text-4xl font-bold mb-6">Send Us a Message</h2>
                <p className="text-lg text-gray-600 mb-8">
                  Have a specific question or need personalized assistance? Fill out the form 
                  below and our team will get back to you within 24 hours.
                </p>

                <Card>
                  <CardContent className="pt-10 pb-8 px-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="input-field"
                            placeholder="Your full name"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="input-field"
                            placeholder="your@email.com"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="input-field"
                            placeholder="+27 XX XXX XXXX"
                          />
                        </div>
                        <div>
                          <label htmlFor="inquiryType" className="block text-sm font-medium text-gray-700 mb-2">
                            Inquiry Type *
                          </label>
                          <select
                            id="inquiryType"
                            name="inquiryType"
                            value={formData.inquiryType}
                            onChange={handleInputChange}
                            required
                            className="input-field"
                          >
                            {inquiryTypes.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                          Subject *
                        </label>
                        <input
                          type="text"
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          className="input-field"
                          placeholder="Brief description of your inquiry"
                        />
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                          Message *
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          rows={6}
                          className="input-field resize-none"
                          placeholder="Please provide details about your inquiry..."
                        />
                      </div>

                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full"
                        loading={isSubmitting}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {isSubmitting ? 'Sending Message...' : 'Send Message'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Map & Location Info */}
              <div>
                <h2 className="text-4xl font-bold mb-6">Visit Our Location</h2>
                <p className="text-lg text-gray-600 mb-8">
                  Located in the heart of South Africa, we welcome visitors by appointment. 
                  Contact us to schedule a visit to our facilities.
                </p>

                {/* Location Card */}
                <Card className="mb-8">
                  <CardContent className="pt-10 pb-6 px-6">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="mt-3 w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-6 w-6 text-pink-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">BLOM Cosmetics Headquarters</h3>
                        <p className="text-gray-600 mb-2">South Africa</p>
                        <p className="text-sm text-gray-500">Visits by appointment only</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">Business Hours</p>
                          <p className="text-sm text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM (SAST)</p>
                          <p className="text-sm text-gray-600">Saturday: 10:00 AM - 4:00 PM (SAST)</p>
                          <p className="text-sm text-gray-600">Sunday: Closed</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Map Placeholder */}
                <Card>
                  <div className="aspect-video bg-gradient-to-br from-pink-100 to-blue-100 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-pink-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">Interactive Map</p>
                      <p className="text-sm text-gray-500">Location details available upon appointment</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </Container>
        </section>

        {/* Help Links Section */}
        <section className="section-padding">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Quick Help Links</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Find answers to common questions and access helpful resources quickly
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {helpLinks.map((category, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                      <category.icon className="h-6 w-6 text-pink-400" />
                    </div>
                    <h3 className="font-bold text-lg">{category.title}</h3>
                    <p className="text-gray-600 text-sm">{category.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <a
                            href={link.href}
                            className="text-sm text-gray-600 hover:text-pink-400 transition-colors flex items-center gap-2"
                          >
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {link.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        {/* FAQ Section */}
        <section className="section-padding bg-gray-50">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Find quick answers to the most common questions about our products, 
                courses, and services
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <Card key={index} className="overflow-hidden">
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <HelpCircle className="h-4 w-4 text-pink-400" />
                        </div>
                        <h3 className="font-semibold text-lg">{faq.question}</h3>
                      </div>
                      {expandedFaq === index ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    {expandedFaq === index && (
                      <div className="px-6 pb-6">
                        <div className="pl-12">
                          <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              <div className="text-center mt-12">
                <p className="text-gray-600 mb-4">Can't find what you're looking for?</p>
                <Button size="lg" variant="outline">
                  Contact Our Support Team
                </Button>
              </div>
            </div>
          </Container>
        </section>

        {/* Closing CTA Section */}
        <section className="section-padding bg-gradient-to-r from-pink-400 to-blue-300 text-white">
          <Container>
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
              <p className="text-xl text-pink-100 mb-8 leading-relaxed">
                Whether you're looking to purchase premium products, enroll in professional 
                training, or explore partnership opportunities, we're here to help you succeed. 
                Get in touch today and let's start your journey to excellence.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <a href="/shop" className="inline-block" onClick={(e) => {
                  e.preventDefault();
                  try {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    const overlay = document.createElement('div');
                    overlay.className = 'page-transition-overlay';
                    document.body.appendChild(overlay);
                    window.setTimeout(() => { window.location.assign('/shop'); }, 400);
                  } catch { window.location.assign('/shop'); }
                }}>
                  <Button size="lg" variant="secondary">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Shop Products
                  </Button>
                </a>
                <a href="/courses" className="inline-block" onClick={(e) => {
                  e.preventDefault();
                  try {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    const overlay = document.createElement('div');
                    overlay.className = 'page-transition-overlay';
                    document.body.appendChild(overlay);
                    window.setTimeout(() => { window.location.assign('/courses'); }, 400);
                  } catch { window.location.assign('/courses'); }
                }}>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-pink-400">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Browse Courses
                  </Button>
                </a>
                <a href="/community" className="inline-block" onClick={(e) => {
                  e.preventDefault();
                  try {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    const overlay = document.createElement('div');
                    overlay.className = 'page-transition-overlay';
                    document.body.appendChild(overlay);
                    window.setTimeout(() => { window.location.assign('/community'); }, 400);
                  } catch { window.location.assign('/community'); }
                }}>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-pink-400">
                    <Heart className="h-4 w-4 mr-2" />
                    Join Community
                  </Button>
                </a>
              </div>

              {/* Emergency Contact */}
              <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
                <h3 className="font-bold text-lg mb-4">Need Immediate Assistance?</h3>
                <div className="grid md:grid-cols-2 gap-4 text-center">
                  <div>
                    <Mail className="h-6 w-6 mx-auto mb-2 text-pink-200" />
                    <p className="font-medium">Email Support</p>
                    <p className="text-pink-100 text-sm">shopblomcosmetics@gmail.com</p>
                  </div>
                  <div>
                    <Phone className="h-6 w-6 mx-auto mb-2 text-pink-200" />
                    <p className="font-medium">Phone Support</p>
                    <p className="text-pink-100 text-sm">+27 79 548 3317</p>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
};