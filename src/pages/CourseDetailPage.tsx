import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Button } from '../ui/Button';
import { 
  Clock, 
  MapPin, 
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Calendar,
  Phone,
  Mail,
  Shield,
  CreditCard
} from 'lucide-react';

interface CourseDetailPageProps {
  courseSlug?: string;
}

export const CourseDetailPage: React.FC<CourseDetailPageProps> = ({ courseSlug = 'professional-acrylic-training' }) => {
  const [expandedAccordion, setExpandedAccordion] = useState<number | null>(0);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    countryCode: '+27',
    terms: false
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleAccordion = (index: number) => {
    setExpandedAccordion(expandedAccordion === index ? null : index);
  };

  const scrollToBooking = () => {
    document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const selectPackage = (packageName: string) => {
    setSelectedPackage(packageName);
    setTimeout(() => {
      document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const selectDate = (date: string) => {
    setSelectedDate(date);
    setTimeout(() => {
      document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const validateField = (name: string, value: string | boolean) => {
    const errors: Record<string, string> = {};
    
    if (name === 'name' && typeof value === 'string' && value.trim().length < 2) {
      errors.name = 'Please enter your full name (minimum 2 characters)';
    }
    if (name === 'email' && typeof value === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) {
        errors.email = 'Please enter a valid email address';
      } else if (!emailRegex.test(value)) {
        errors.email = 'Please enter a valid email address';
      }
    }
    if (name === 'phone' && typeof value === 'string') {
      const phoneRegex = /^[0-9\s\-\(\)]{7,15}$/;
      if (!value.trim()) {
        errors.phone = 'Please enter a valid phone number';
      } else if (!phoneRegex.test(value)) {
        errors.phone = 'Please enter a valid phone number';
      }
    }
    if (name === 'terms' && !value) {
      errors.terms = 'Please agree to the Terms & Conditions';
    }

    setFormErrors(prev => ({ ...prev, [name]: errors[name] || '' }));
    return !errors[name];
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const fieldValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({ ...prev, [name]: fieldValue }));
    validateField(name, fieldValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate all fields
    const isValid = Object.entries(formData).every(([key, value]) => 
      validateField(key, value)
    );

    if (!isValid || !selectedPackage || !selectedDate) {
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate booking process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success notification
      showNotification('Booking successful! Check your email for confirmation.', 'success');
      
      // Reset form
      setFormData({ name: '', email: '', phone: '', countryCode: '+27', terms: false });
      setSelectedPackage('');
      setSelectedDate('');
      
    } catch (error) {
      showNotification('Booking failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-x-full ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);

    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  const accordionData = [
    {
      title: 'DAY 1: FOUNDATION & PREPARATION',
      content: [
        'Nail anatomy and health assessment',
        'Proper sanitation and safety protocols',
        'Nail preparation techniques',
        'Product knowledge and selection'
      ]
    },
    {
      title: 'DAY 2-3: ACRYLIC APPLICATION',
      content: [
        'Mixing ratios and consistency control',
        'Brush techniques and maintenance',
        'Application methods for different nail shapes',
        'Building structure and strength'
      ]
    },
    {
      title: 'DAY 4: SHAPING & REFINEMENT',
      content: [
        'Filing techniques for different nail shapes',
        'Surface preparation and smoothing',
        'Problem-solving and corrections',
        'Quality control standards'
      ],
      note: 'Note: Models are required for Day 4. Please arrange one model in advance.'
    },
    {
      title: 'DAY 5: FINISHING & BUSINESS',
      content: [
        'Buffing and polishing techniques',
        'Cuticle care and finishing touches',
        'Client consultation and aftercare',
        'Pricing strategies and business basics'
      ],
      note: 'Note: Models are required for Day 5. Please arrange one model in advance.'
    }
  ];

  const availableDates = [
    'March 15-19, 2025',
    'April 12-16, 2025',
    'May 10-14, 2025'
  ];

  const countryCodes = [
    { code: '+27', country: '🇿🇦 ZA' },
    { code: '+264', country: '🇳🇦 NA' },
    { code: '+353', country: '🇮🇪 IE' },
    { code: '+44', country: '🇬🇧 GB' },
    { code: '+1', country: '🇺🇸 US' },
    { code: '+971', country: '🇦🇪 AE' }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header showMobileMenu={true} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
          <img
            src="/professional-acrylic-training-hero.webp"
            alt="Professional Acrylic Training"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          
          <div className="relative h-full flex items-center justify-center">
            <div className="text-center text-white max-w-4xl mx-auto px-4">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 uppercase tracking-wider" style={{ textShadow: '0 4px 8px rgba(0,0,0,0.3)' }}>
                Professional Acrylic Training
              </h1>
              <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                Master the art of acrylic nail application with hands-on training in Randfontein.
              </p>
              
              {/* Detail Pills */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-md" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <Clock className="h-5 w-5" />
                  <span className="font-medium">5 Days</span>
                    </div>
                <div className="flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-md" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <CreditCard className="h-5 w-5" />
                  <span className="font-medium">From R7,200</span>
                    </div>
                  </div>

              {/* CTA Button */}
              <button
                onClick={scrollToBooking}
                className="bg-pink-400 hover:bg-transparent text-white hover:text-black font-bold py-5 px-12 rounded-full text-lg uppercase tracking-wide transition-all duration-300 border-2 border-transparent hover:border-black"
                style={{ boxShadow: '0 4px 15px rgba(255,116,164,0.3)' }}
                  >
                    Book Your Spot
                    </button>
                  </div>
                </div>
        </section>

        {/* Meet Your Instructor */}
        <section className="py-20 bg-white">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="heading-with-stripe">Meet Your Instructor</h2>
              
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-48 h-48 flex-shrink-0">
                    <img
                      src="/avane-crous-headshot.webp"
                      alt="Avané Crous"
                      className="w-full h-full object-cover rounded-xl shadow-lg"
                    />
                          </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Avané Crous</h3>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      Professional nail artist and educator with over 8 years of experience in acrylic nail application. Avané specializes in teaching proper techniques, safety protocols, and helping students build confidence in their nail artistry skills.
                    </p>
                      </div>
                    </div>
              </div>
            </div>
          </Container>
        </section>

        {/* About This Course */}
        <section className="py-20 bg-white">
          <Container>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-12 uppercase tracking-wide text-gray-900">
                About This Course
              </h2>
              
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  This comprehensive 5-day hands-on training program is designed to give you the skills and confidence to start your career as a professional nail technician. You'll master every aspect of acrylic nail application, from preparation to finishing, using professional-grade products and techniques.
                </p>
                <p>
                  Our expert instructors will guide you through proper nail preparation, acrylic application, shaping, and finishing techniques. By the end of this course, you'll have the knowledge and practical experience needed to provide professional acrylic nail services to clients.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* What You'll Learn - Accordion */}
        <section className="py-20 bg-gray-50">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="heading-with-stripe">What You'll Learn</h2>
              
              <div className="space-y-4">
                {accordionData.map((item, index) => (
                  <div key={index} className="bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:border-blue-200 hover:shadow-md transition-all duration-300">
                    <button
                      onClick={() => toggleAccordion(index)}
                      className="w-full p-6 md:p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 uppercase tracking-wide">
                        {item.title}
                      </h3>
                      {expandedAccordion === index ? (
                        <ChevronUp className="h-6 w-6 text-pink-400" />
                      ) : (
                        <ChevronDown className="h-6 w-6 text-pink-400" />
                      )}
                    </button>
                    
                    {expandedAccordion === index && (
                      <div className="px-6 md:px-8 pb-6 md:pb-8 bg-gray-50">
                        <ul className="space-y-3">
                          {item.content.map((lesson, lessonIndex) => (
                            <li key={lessonIndex} className="flex items-center gap-3">
                              <CheckCircle className="h-5 w-5 text-pink-400 flex-shrink-0" />
                              <span className="text-gray-700">{lesson}</span>
                            </li>
                          ))}
                        </ul>
                        {item.note && (
                          <div className="mt-4 p-4 bg-blue-100 rounded-lg">
                            <p className="text-blue-800 text-sm font-medium">{item.note}</p>
                      </div>
                    )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* Choose Your Package */}
        <section className="py-20 bg-white">
          <Container>
            <div className="max-w-5xl mx-auto">
              <h2 className="heading-with-stripe">Choose Your Package</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Standard Package */}
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 uppercase">Standard Package</h3>
                    <div className="text-4xl font-bold text-pink-400 mb-2">R7,200</div>
                    <div className="text-sm font-semibold text-gray-500 uppercase">Kit Value: R3,200</div>
                  </div>
                  
                  <ul className="space-y-4 mb-8 flex-grow">
                    {[
                      '5-day comprehensive training',
                      'Basic starter kit included',
                      'Certificate of completion',
                      'Course materials and handouts'
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  
                  <button
                    onClick={() => selectPackage('Standard')}
                    className="w-full bg-pink-400 hover:bg-transparent text-white hover:text-black font-bold py-4 px-6 rounded-full text-lg uppercase tracking-wide transition-all duration-300 border-2 border-transparent hover:border-black"
                    style={{ boxShadow: '0 4px 15px rgba(255,116,164,0.3)' }}
                  >
                    Choose Standard
                  </button>
            </div>

                {/* Deluxe Package */}
                <div className="bg-white border-2 border-pink-400 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative flex flex-col h-full" style={{ boxShadow: '0 8px 30px rgba(255,116,164,0.2)' }}>
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                    <div className="bg-blue-400 text-white px-6 py-2 rounded-b-2xl text-sm font-bold uppercase tracking-wide">
                      Most Popular
                    </div>
                      </div>
                  
                  <div className="text-center mb-8 mt-4">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 uppercase">Deluxe Package</h3>
                    <div className="text-4xl font-bold text-pink-400 mb-2">R9,900</div>
                    <div className="text-sm font-semibold text-gray-500 uppercase">Kit Value: R5,100</div>
                    </div>

                  <ul className="space-y-4 mb-8 flex-grow">
                    {[
                      '5-day comprehensive training',
                      'Premium professional kit included',
                      'Certificate of completion',
                      'Course materials and handouts',
                      'Bigger kit — electric e-file & LED lamp included'
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>

                  <button
                    onClick={() => selectPackage('Deluxe')}
                    className="w-full bg-pink-400 hover:bg-transparent text-white hover:text-black font-bold py-5 px-6 rounded-full text-lg uppercase tracking-wide transition-all duration-300 border-2 border-transparent hover:border-black"
                    style={{ boxShadow: '0 4px 15px rgba(255,116,164,0.3)' }}
                  >
                    Choose Deluxe
                  </button>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Important Information */}
        <section className="py-20 bg-gray-50">
          <Container>
            <div className="max-w-5xl mx-auto">
              <h2 className="heading-with-stripe">Important Information</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Location */}
                <div className="bg-blue-50 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center">
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <MapPin className="h-8 w-8 text-pink-400" />
                    </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">Location</h3>
                  <p className="text-gray-600">
                    Randfontein, Gauteng<br />
                    <span className="text-sm text-gray-500">Detailed address provided upon booking</span>
                  </p>
                    </div>

                {/* Deposit Required */}
                <div className="bg-blue-50 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center">
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CreditCard className="h-8 w-8 text-pink-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">Deposit Required</h3>
                  <p className="text-gray-600">
                    R2,000 to secure your spot<br />
                    <span className="text-sm text-gray-500">Balance due on course start date</span>
                  </p>
              </div>

                {/* Available Dates */}
                <div className="bg-blue-50 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center">
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Calendar className="h-8 w-8 text-pink-400" />
              </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">Available Dates</h3>
                  <div className="space-y-2">
                    {availableDates.map((date, index) => (
                  <button
                    key={index}
                    onClick={() => selectDate(date)}
                        className={`block w-full px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:-translate-y-1 ${
                      selectedDate === date
                        ? 'bg-pink-400 text-white'
                            : 'bg-blue-200 text-gray-900 hover:bg-pink-400 hover:text-white'
                    }`}
                  >
                    {date}
                  </button>
                ))}
              </div>
            </div>

                {/* Contact */}
                <div className="bg-blue-50 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center">
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Phone className="h-8 w-8 text-pink-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">Contact</h3>
                  <p className="text-gray-600">
                    WhatsApp: +27 79 548 3317<br />
                    <span className="text-sm text-gray-500">Email: shopblomcosmetics@gmail.com</span>
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Booking Form */}
        <section id="booking-form" className="py-20 bg-white">
            <Container>
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Form Header */}
                <div className="bg-pink-400 p-12 text-center text-white relative" style={{ background: 'linear-gradient(135deg, rgba(206,229,255,0.1) 0%, rgba(255,116,164,0.1) 100%)' }}>
                  <h2 className="text-3xl md:text-4xl font-bold mb-3 uppercase tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    Book Your Spot
                  </h2>
                  <p className="text-lg opacity-90" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                    Secure your place in this professional training course
                          </p>
                        </div>

                {/* Form Body */}
                <div className="p-12">
                  <form onSubmit={handleSubmit} className="space-y-7">
                    {/* Row 1: Date & Package */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Select Date <span className="text-red-500">*</span>
                          </label>
                          <select
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none transition-all text-base"
                            required
                          >
                          <option value="">Choose a date...</option>
                          {availableDates.map((date, index) => (
                            <option key={index} value={date}>{date}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Select Package <span className="text-red-500">*</span>
                          </label>
                          <select
                          value={selectedPackage}
                          onChange={(e) => setSelectedPackage(e.target.value)}
                          className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none transition-all text-base"
                            required
                          >
                          <option value="">Choose a package...</option>
                          <option value="Standard">Standard Package - R7,200</option>
                          <option value="Deluxe">Deluxe Package - R9,900</option>
                          </select>
                        </div>
                    </div>

                    {/* Row 2: Name & Email */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                          className={`w-full px-4 py-4 border rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none transition-all text-base ${
                            formErrors.name ? 'border-red-500' : 'border-gray-300'
                          }`}
                            required
                          />
                          {formErrors.name && (
                          <p className="text-red-500 text-sm mt-2">{formErrors.name}</p>
                          )}
                        </div>

                        <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Email Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                          className={`w-full px-4 py-4 border rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none transition-all text-base ${
                            formErrors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                            required
                          />
                          {formErrors.email && (
                          <p className="text-red-500 text-sm mt-2">{formErrors.email}</p>
                          )}
                        </div>
                      </div>

                    {/* Row 3: Phone Number */}
                      <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        Phone Number <span className="text-red-500">*</span>
                        </label>
                      <div className="flex gap-3">
                        <select
                          name="countryCode"
                          value={formData.countryCode}
                          onChange={handleInputChange}
                          className="w-32 px-3 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none transition-all text-base"
                        >
                          {countryCodes.map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.country}
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="123456789"
                          className={`flex-1 px-4 py-4 border rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none transition-all text-base ${
                            formErrors.phone ? 'border-red-500' : 'border-gray-300'
                          }`}
                          required
                        />
                      </div>
                        {formErrors.phone && (
                        <p className="text-red-500 text-sm mt-2">{formErrors.phone}</p>
                        )}
                      </div>

                    {/* Terms & Conditions */}
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          name="terms"
                          checked={formData.terms}
                          onChange={handleInputChange}
                        className="mt-1 rounded border-gray-300 text-pink-400 focus:ring-pink-300 w-5 h-5"
                          required
                        />
                      <label className="text-sm text-gray-600 leading-relaxed">
                        I agree to the <a href="/terms" className="text-pink-500 hover:text-pink-600 underline">Terms & Conditions</a>
                        </label>
                      </div>
                      {formErrors.terms && (
                        <p className="text-red-500 text-sm">{formErrors.terms}</p>
                      )}

                      {/* Submit Button */}
                    <button
                        type="submit"
                      disabled={isSubmitting || !selectedPackage || !selectedDate || !formData.terms}
                      className="w-full bg-pink-400 hover:bg-transparent text-white hover:text-black font-bold py-5 px-6 rounded-full text-lg uppercase tracking-wide transition-all duration-300 border-2 border-transparent hover:border-black disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-pink-400 disabled:hover:text-white disabled:hover:border-transparent"
                      style={{ boxShadow: '0 4px 15px rgba(255,116,164,0.3)' }}
                    >
                      {isSubmitting ? 'Processing...' : 'Pay Deposit & Secure Spot (R2,000)'}
                    </button>

                    {/* Security Icons */}
                    <div className="flex items-center justify-center gap-8 pt-6 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-green-600">
                        <Shield className="h-5 w-5" />
                        <span className="text-sm font-semibold">Secure Payment</span>
            </div>
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-sm font-semibold">Instant Confirmation</span>
                      </div>
              </div>
                  </form>
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

export default CourseDetailPage;