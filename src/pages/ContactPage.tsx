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
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Building,
  ShoppingCart,
  BookOpen,
  Heart,
  CheckCircle,
  Paperclip,
  Upload,
  X,
  FileText,
  Truck,
  RotateCcw
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    countryCode: '+27',
    subject: '',
    message: '',
    inquiryType: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [isMapHovered, setIsMapHovered] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showAllFaqs, setShowAllFaqs] = useState(false);


  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'products', label: 'Product Information' },
    { value: 'courses', label: 'Course Enrollment' },
    { value: 'support', label: 'Technical Support' },
    { value: 'business', label: 'Business Partnership' },
    { value: 'media', label: 'Media & Press' }
  ];

  const countryCodes = [
    { code: '+27', country: 'South Africa', flag: '🇿🇦' },
    { code: '+1', country: 'United States', flag: '🇺🇸' },
    { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+39', country: 'Italy', flag: '🇮🇹' },
    { code: '+34', country: 'Spain', flag: '🇪🇸' },
    { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
    { code: '+32', country: 'Belgium', flag: '🇧🇪' },
    { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
    { code: '+43', country: 'Austria', flag: '🇦🇹' },
    { code: '+46', country: 'Sweden', flag: '🇸🇪' },
    { code: '+47', country: 'Norway', flag: '🇳🇴' },
    { code: '+45', country: 'Denmark', flag: '🇩🇰' },
    { code: '+358', country: 'Finland', flag: '🇫🇮' },
    { code: '+351', country: 'Portugal', flag: '🇵🇹' },
    { code: '+353', country: 'Ireland', flag: '🇮🇪' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+82', country: 'South Korea', flag: '🇰🇷' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷' },
    { code: '+52', country: 'Mexico', flag: '🇲🇽' },
    { code: '+54', country: 'Argentina', flag: '🇦🇷' }
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

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // Remove all non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '');
    // Check if phone has at least 7 digits and max 15 digits
    return cleanPhone.length >= 7 && cleanPhone.length <= 15;
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    // Email validation
    if (formData.email && !validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Phone validation (only if phone is provided)
    if (formData.phone && !validatePhone(formData.phone)) {
      errors.phone = 'Please enter a valid phone number (7-15 digits)';
    }

    // Terms and conditions validation
    if (!agreedToTerms) {
      errors.terms = 'You must agree to the Terms & Conditions and Privacy Policy';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleMapMouseEnter = () => {
    setIsMapHovered(true);
  };

  const handleMapMouseLeave = () => {
    setIsMapHovered(false);
  };

  const scrollToContactForm = () => {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Build multipart/form-data payload
      const fd = new FormData();
      fd.set('source', 'contact_form');
      fd.set('channel', 'website');
      fd.set('full_name', formData.name);
      fd.set('email', formData.email.toLowerCase());
      fd.set('phone', `${formData.countryCode} ${formData.phone}`.trim());
      fd.set('inquiry_type', inquiryTypes.find(i => i.value === formData.inquiryType)?.label || formData.inquiryType);
      fd.set('subject', formData.subject);
      fd.set('message', formData.message);
      fd.set('consent_terms', agreedToTerms ? 'true' : 'false');
      fd.set('user_agent', navigator.userAgent);

      // Context
      const params = new URLSearchParams(window.location.search);
      fd.set('page_url', window.location.href);
      fd.set('referrer', document.referrer || '');
      ['utm_source','utm_medium','utm_campaign','utm_term','utm_content'].forEach(k => fd.set(k, params.get(k) || ''));

      // Attach files (10MB each)
      for (const f of attachedFiles) {
        if (f.size > 10 * 1024 * 1024) {
          alert(`"${f.name}" is over 10MB. Please upload smaller files.`);
          setIsSubmitting(false);
          return;
        }
        fd.append('attachments', f, f.name);
      }

      const WEBHOOK = 'https://dockerfile-1n82.onrender.com/webhook/contact-us-capture';
      const res = await fetch(WEBHOOK, { method: 'POST', body: fd });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Webhook ${res.status}: ${text || 'failed'}`);
      }

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        countryCode: '+27',
        subject: '',
        message: '',
        inquiryType: 'general'
      });
      setAttachedFiles([]);
      setValidationErrors({});
      setAgreedToTerms(false);

      alert("Thanks! We’ll get back to you within 1 business day.");
    } catch (err) {
      console.error(err);
      alert('Couldn’t send right now. Please try again in a minute.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header showMobileMenu={true} />

      <main className="flex-1">
        {/* Contact Hero Section - Original Design */}
        <section className="bg-gradient-to-r from-pink-50 to-blue-50 section-padding">
          <Container>
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="heading-with-stripe">We're Here to Help</h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Questions about orders, products, or courses? Message us on WhatsApp for the fastest reply, or use the form below.
              </p>
            </div>
          </Container>
        </section>

        {/* Contact Methods Section */}
        <section className="section-padding bg-gray-50">
          <Container>
            <div className="grid md:grid-cols-3 gap-8">
              {/* WhatsApp Card */}
              <Card className="text-center p-8 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-pink-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">WhatsApp</h3>
                <p className="text-gray-600 mb-6">Fastest reply - usually within minutes</p>
                <a 
                  href="https://wa.me/27795483317" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  CHAT NOW
                </a>
              </Card>

              {/* Email Card */}
              <Card className="text-center p-8 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-pink-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Email</h3>
                <p className="text-gray-600 mb-6">We reply within 1 business day</p>
                <a 
                  href="mailto:shopblomcosmetics@gmail.com"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Mail className="h-4 w-4" />
                  SEND EMAIL
                </a>
              </Card>

              {/* Phone Card */}
              <Card className="text-center p-8 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-pink-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Phone className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Phone</h3>
                <p className="text-gray-600 mb-6">Mon-Fri 08:00-17:00, Sat 09:00-14:00</p>
                <a 
                  href="tel:+27795483317"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Phone className="h-4 w-4" />
                  CALL NOW
                </a>
              </Card>
            </div>
          </Container>
        </section>

        {/* Contact Form Section */}
        <section id="contact-form" className="section-padding bg-gray-50">
          <Container>
            <div className="max-w-2xl mx-auto">
              {/* Contact Form */}
              <div>
                <Card className="shadow-lg border-0">
                  <CardContent className="pt-10 pb-8 px-8">
                    {/* Form Header */}
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-gray-900 mb-3">Send us a Message</h2>
                      <p className="text-gray-600">
                        Fill out the form below and we'll get back to you within 1 business day.
                      </p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-8">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-2">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="input-field focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className={`input-field focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all ${
                              validationErrors.email ? 'border-red-500' : ''
                            }`}
                            placeholder="your.email@example.com"
                          />
                          {validationErrors.email && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="phone" className="block text-sm font-semibold text-gray-800 mb-2">
                            Phone Number
                          </label>
                          <div className="flex gap-2">
                            <select
                              name="countryCode"
                              value={formData.countryCode}
                              onChange={handleInputChange}
                              className="input-field focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all w-32 flex-shrink-0"
                            >
                              {countryCodes.map((country) => (
                                <option key={country.code} value={country.code}>
                                  {country.flag} {country.code}
                                </option>
                              ))}
                            </select>
                            <input
                              type="tel"
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className={`input-field focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all flex-1 ${
                                validationErrors.phone ? 'border-red-500' : ''
                              }`}
                              placeholder="XX XXX XXXX"
                            />
                          </div>
                          {validationErrors.phone && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="inquiryType" className="block text-sm font-semibold text-gray-800 mb-2">
                            Inquiry Type <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="inquiryType"
                            name="inquiryType"
                            value={formData.inquiryType}
                            onChange={handleInputChange}
                            required
                            className="input-field focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
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
                        <label htmlFor="subject" className="block text-sm font-semibold text-gray-800 mb-2">
                          Subject <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          className="input-field focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                          placeholder="Brief description of your inquiry"
                        />
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-semibold text-gray-800 mb-2">
                          Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          rows={6}
                          className="input-field resize-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                          placeholder="Please provide detailed information about your inquiry. The more specific you are, the better we can assist you."
                        />
                      </div>

                      {/* File Attachment Section */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Attachments <span className="text-gray-500">(Optional)</span>
                        </label>
                        <div 
                          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                            dragActive 
                              ? 'border-pink-400 bg-pink-50' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                        >
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600 mb-2">
                            Drag and drop files here, or 
                            <label className="text-pink-500 hover:text-pink-600 cursor-pointer ml-1">
                              browse
                              <input
                                type="file"
                                multiple
                                onChange={handleFileUpload}
                                className="hidden"
                                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                              />
                            </label>
                          </p>
                          <p className="text-xs text-gray-500">
                            Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG, GIF (Max 10MB per file)
                          </p>
                        </div>

                        {/* Attached Files List */}
                        {attachedFiles.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <p className="text-sm font-medium text-gray-700">Attached Files:</p>
                            {attachedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <FileText className="h-4 w-4 text-gray-500" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFile(index)}
                                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Terms and Conditions Checkbox */}
                      <div className="flex items-start gap-3">
                        <div className="flex items-center h-5">
                          <input
                            id="terms"
                            type="checkbox"
                            checked={agreedToTerms}
                            onChange={(e) => {
                              setAgreedToTerms(e.target.checked);
                              if (validationErrors.terms) {
                                setValidationErrors(prev => ({
                                  ...prev,
                                  terms: ''
                                }));
                              }
                            }}
                            className={`w-4 h-4 rounded-md border-2 focus:ring-2 focus:ring-primary-pink transition-colors ${
                              agreedToTerms 
                                ? 'bg-primary-pink border-primary-pink text-white' 
                                : 'border-gray-300 hover:border-primary-pink'
                            } ${validationErrors.terms ? 'border-red-500' : ''}`}
                            style={{
                              accentColor: '#FF74A4'
                            }}
                          />
                        </div>
                        <div className="text-sm">
                          <label htmlFor="terms" className="text-gray-700 cursor-pointer">
                            I agree to the{' '}
                            <a href="/terms" className="text-primary-pink hover:text-pink-600 underline">
                              Terms & Conditions
                            </a>
                            {' '}and{' '}
                            <a href="/privacy" className="text-primary-pink hover:text-pink-600 underline">
                              Privacy Policy
                            </a>
                            {' '}<span className="text-red-500">*</span>
                          </label>
                          {validationErrors.terms && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.terms}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-center">
                        <Button 
                          type="submit" 
                          size="lg" 
                          className="px-8 py-3 flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
                          loading={isSubmitting}
                        >
                          <Send className="h-4 w-4" />
                          {isSubmitting ? 'Sending Message...' : 'Send Message'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

            </div>
          </Container>
        </section>

        {/* Visit Our Location Section */}
        <section className="section-padding">
          <Container>
            <div className="max-w-2xl mx-auto">
              {/* Location Card */}
              <Card className="mb-8">
                <CardContent className="pt-10 pb-6 px-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="mt-3 w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-pink-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">BLOM Cosmetics Headquarters</h3>
                      <p className="text-gray-600 mb-1">34 Horingbek Avenue</p>
                      <p className="text-gray-600 mb-1">Helikonpark, Randfontein</p>
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

              {/* Google Maps */}
              <Card>
                <div 
                  className="aspect-video overflow-hidden rounded-lg relative"
                  onMouseEnter={handleMapMouseEnter}
                  onMouseLeave={handleMapMouseLeave}
                >
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3580.8!2d27.7!3d-26.15!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s34%20Horingbek%20Avenue%2C%20Helikonpark%2C%20Randfontein!5e0!3m2!1sen!2sza!4v1"
                    width="100%"
                    height="100%"
                    style={{ 
                      border: 0,
                      pointerEvents: isMapHovered ? 'auto' : 'none'
                    }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="BLOM Cosmetics Headquarters - 34 Horingbek Avenue, Helikonpark, Randfontein"
                  ></iframe>
                  {!isMapHovered && (
                    <div className="absolute inset-0 bg-transparent cursor-pointer" />
                  )}
                </div>
              </Card>
            </div>
          </Container>
        </section>

        {/* Quick Help Section - Original Design */}
        <section className="section-padding bg-gradient-to-r from-pink-50 to-blue-50">
          <Container>
            <div className="text-center mb-12">
              <h2 className="heading-with-stripe">Quick Help</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Find answers to common questions and access helpful resources quickly.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Shipping & Delivery Card */}
              <Card className="text-center p-8 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Truck className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Shipping & Delivery</h3>
                <p className="text-gray-600 mb-6">Track your order and delivery options</p>
                <a 
                  href="/shipping" 
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Learn More
                </a>
              </Card>

              {/* Returns & Refunds Card */}
              <Card className="text-center p-8 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <RotateCcw className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Returns & Refunds</h3>
                <p className="text-gray-600 mb-6">Easy returns within 30 days</p>
                <a 
                  href="/returns" 
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Learn More
                </a>
              </Card>

              {/* FAQs Card */}
              <Card className="text-center p-8 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <HelpCircle className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">FAQs</h3>
                <p className="text-gray-600 mb-6">Find answers to common questions</p>
                <a 
                  href="#faq" 
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Learn More
                </a>
              </Card>
            </div>
          </Container>
        </section>

        {/* FAQ Section - Original Design */}
        <section className="section-padding bg-blue-50">
          <Container>
            <div className="text-center mb-12">
              <h2 className="heading-with-stripe">FREQUENTLY ASKED QUESTIONS</h2>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="space-y-4 mb-8">
                {faqs.slice(0, showAllFaqs ? faqs.length : 4).map((faq, index) => (
                  <Card key={index} className="bg-white shadow-sm border-0 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="font-semibold text-lg text-gray-900">{faq.question}</h3>
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {expandedFaq === index ? (
                          <ChevronUp className="h-4 w-4 text-blue-600" />
                        ) : (
                          <span className="text-blue-600 font-bold text-lg">+</span>
                        )}
                      </div>
                    </button>
                    {expandedFaq === index && (
                      <div className="px-6 pb-6">
                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              {/* FAQ Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {!showAllFaqs ? (
                  <Button
                    onClick={() => setShowAllFaqs(true)}
                    className="btn btn-secondary flex items-center gap-2"
                  >
                    <ChevronDown className="h-4 w-4" />
                    Read More
                  </Button>
                ) : (
                  <Button
                    onClick={() => setShowAllFaqs(false)}
                    className="btn btn-secondary flex items-center gap-2"
                  >
                    <ChevronUp className="h-4 w-4" />
                    Show Less
                  </Button>
                )}
                <Button
                  onClick={scrollToContactForm}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Ask Your Own Question
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