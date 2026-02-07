import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Button } from '../components/ui/Button';
import { ClickableContact } from '../components/ui/ClickableContact';
import { 
  Clock, 
  MapPin, 
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Calendar,
  Package,
  Ticket,
  Phone,
  Mail,
  Shield,
  CreditCard,
  X
} from 'lucide-react';

export const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const courseSlug = slug || 'professional-acrylic-training';
  // Course data
  const courses = {
    'professional-acrylic-training': {
      id: 'a603be5f-2c56-4e95-9423-8229c8991b40',
      title: 'Professional Acrylic Training',
      description: 'Master the art of acrylic nail application with hands-on training. Choose your kit, book your dates, and secure your spot with a deposit.',
      heroImage: '/professional-acrylic-training-hero.webp',
      duration: '5 Full Days (Intensive Training)',
      price: 'From R7,600',
      numericPrice: 7600,
      depositAmount: 1800,
      isOnline: false,
      location: '34 Horingbek Avenue, Helikonpark, Randfontein, Gauteng',
      instructor: {
        name: 'Avané Crous',
        image: '/avane-crous-headshot.webp',
        bio: 'Professional nail artist and educator with over 8 years of experience in acrylic nail application. Avané specializes in teaching proper techniques, safety protocols, and helping students build confidence in their nail artistry skills.'
      },
      about: [
        'This comprehensive 5-day hands-on training program is designed to give you the skills and confidence to start your career as a professional nail technician. You\'ll master every aspect of acrylic nail application, from preparation to finishing, using professional-grade products and techniques.',
        'Our expert instructors will guide you through proper nail preparation, acrylic application, shaping, and finishing techniques. By the end of this course, you\'ll have the knowledge and practical experience needed to provide professional acrylic nail services to clients.'
      ],
      packages: [
        {
          name: 'Standard',
          price: 'R7,600',
          kitValue: 'R3,200',
          features: [
            'Prep & Primer',
            'Sculpting Forms (x300)',
            'Top Coat',
            'Colour Acrylic 15g',
            'Nude Acrylic 56g',
            'White Acrylic 56g',
            'Crystal Clear Acrylic 56g',
            '250ml Nail Liquid',
            '100% Kolinsky Brush',
            'Dappen Dish',
            'Training Manual',
            'Lint-Free Wipes',
            'Nail Cleanser 30ml',
            'Hand File & Buffer',
            'Cuticle Pusher',
            'Lifelong mentorship and modern techniques'
          ]
        },
        {
          name: 'Deluxe',
          price: 'R9,900',
          kitValue: 'R5,100',
          features: [
            'Prep & Primer',
            'Sculpting Forms (x300)',
            'Top Coat',
            'Colour Acrylic 15g',
            'Nude Acrylic 56g',
            'White Acrylic 56g',
            'Crystal Clear Acrylic 56g',
            '500ml Nail Liquid',
            '100% Kolinsky Brush',
            'Dappen Dish',
            'Training Manual',
            'Lint-Free Wipes',
            'Nail Cleanser 200ml',
            'Hand File & Buffer',
            'Unicorn Cuticle Pusher',
            'LED Lamp (x1)',
            'Electric File (x1)',
            'Safety Bit',
            'Box of Nail Tips',
            'Nail Glue',
            'Lifelong mentorship and modern techniques'
          ],
          popular: true
        }
      ],
      availableDates: [
        'March 2026 (19-23 Mar)',
        'May/June 2026 (29 May-2 Jun)'
      ],
      thingsToBring: [
        'Your own refreshments and lunch (coffee and tea will be provided daily)',
        'A practice hand (preferably a Habbil Hand – this is essential)',
        'An electric file (e-file) and a safety bit',
        'Two hand models: Day 4 model required for practical work; Day 5 model required for assessment'
      ],
      trainingSchedule: [
        {
          title: 'March 2026',
          items: [
            '19 March 2026 (08:30-16:00)',
            '20 March 2026 (08:30-16:00)',
            '21 March 2026 (09:00-15:00)',
            '22 March 2026 (08:30-15:00)',
            '23 March 2026 (08:30-16:00)'
          ]
        },
        {
          title: 'May/June 2026',
          items: [
            '29 May 2026 (08:30-16:00)',
            '30 May 2026 (08:30-16:00)',
            '31 May 2026 (09:00-15:00)',
            '1 June 2026 (08:30-15:00)',
            '2 June 2026 (08:30-16:00)'
          ]
        }
      ],
      studentDiscount: [
        'We have a shop inside the training studio',
        '10% discount on all product purchases during your training'
      ],
      accordionData: [
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
      ]
    },
    'blom-flower-workshop': {
      id: '7c5276c1-9207-4653-89c3-bb4c675db5e2', // Matches Academy "Blom Flower Workshop"
      sku: 'SKU_FLOWER_WORKSHOP',
      title: 'Flower Nail Art Workshop',
      description: 'Learn how to create soft, dreamy flower nail art designs from the comfort of your home with step-by-step videos and detailed guidance.',
      heroImage: '/online-watercolor-card.webp',
      duration: 'Self-Paced',
      price: 'R480',
      numericPrice: 480,
      depositAmount: 0,
      isOnline: true,
      location: 'Online',
      instructor: {
        name: 'Avané Crous',
        image: '/avane-crous-headshot.webp',
        bio: 'Professional nail artist and educator with over 8 years of experience. Avané specializes in teaching proper techniques, safety protocols, and helping students build confidence in their nail artistry skills.'
      },
      about: [
        'This comprehensive online workshop teaches you the fundamentals of watercolor nail art. You\'ll learn how to create soft, dreamy designs that are perfect for any occasion.',
        'Through step-by-step video tutorials and detailed guidance, you\'ll master blending techniques, color theory, and how to create stunning watercolor effects on nails.'
      ],
      packages: [
        {
          name: 'Complete Workshop',
          price: 'R480',
          kitValue: 'Included',
          features: [
            'Lifetime access to video tutorials',
            'Step-by-step guides',
            'Color theory basics',
            'Blending techniques',
            'Certificate after you\'ve completed your exam'
          ]
        }
      ],
      availableDates: ['Available Now'],
      thingsToBring: [],
      trainingSchedule: [],
      studentDiscount: [],
      accordionData: [
        {
          title: 'MODULE 1: INTRODUCTION TO WATERCOLOR',
          content: [
            'Understanding watercolor nail art',
            'Essential tools and materials',
            'Color theory and mixing',
            'Basic techniques overview'
          ]
        },
        {
          title: 'MODULE 2: BLENDING TECHNIQUES',
          content: [
            'Wet-on-wet blending',
            'Gradient creation',
            'Color transitions',
            'Troubleshooting common issues'
          ]
        },
        {
          title: 'MODULE 3: DESIGN CREATION',
          content: [
            'Floral watercolor designs',
            'Abstract patterns',
            'Seasonal themes',
            'Personal style development'
          ]
        },
        {
          title: 'MODULE 4: FINISHING & MAINTENANCE',
          content: [
            'Top coat application',
            'Longevity tips',
            'Touch-up techniques',
            'Client consultation skills'
          ]
        }
      ]
    },
    'online-watercolour-workshop': {
      id: '7c5276c1-9207-4653-89c3-bb4c675db5e2', // Matches Academy "Blom Flower Workshop"
      sku: 'SKU_FLOWER_WORKSHOP',
      title: 'Flower Nail Art Workshop',
      description: 'Learn how to create soft, dreamy flower nail art designs from the comfort of your home with step-by-step videos and detailed guidance.',
      heroImage: '/online-watercolor-card.webp',
      duration: 'Self-Paced',
      price: 'R480',
      numericPrice: 480,
      depositAmount: 0,
      isOnline: true,
      location: 'Online',
      instructor: {
        name: 'Avané Crous',
        image: '/avane-crous-headshot.webp',
        bio: 'Professional nail artist and educator with over 8 years of experience. Avané specializes in teaching proper techniques, safety protocols, and helping students build confidence in their nail artistry skills.'
      },
      about: [
        'This comprehensive online workshop teaches you the fundamentals of watercolor nail art. You\'ll learn how to create soft, dreamy designs that are perfect for any occasion.',
        'Through step-by-step video tutorials and detailed guidance, you\'ll master blending techniques, color theory, and how to create stunning watercolor effects on nails.'
      ],
      packages: [
        {
          name: 'Complete Workshop',
          price: 'R480',
          kitValue: 'Included',
          features: [
            'Lifetime access to video tutorials',
            'Step-by-step guides',
            'Color theory basics',
            'Blending techniques',
            'Certificate after you\'ve completed your exam'
          ]
        }
      ],
      availableDates: ['Available Now'],
      thingsToBring: [],
      trainingSchedule: [],
      studentDiscount: [],
      accordionData: [
        {
          title: 'MODULE 1: INTRODUCTION TO WATERCOLOR',
          content: [
            'Understanding watercolor nail art',
            'Essential tools and materials',
            'Color theory and mixing',
            'Basic techniques overview'
          ]
        },
        {
          title: 'MODULE 2: BLENDING TECHNIQUES',
          content: [
            'Wet-on-wet blending',
            'Gradient creation',
            'Color transitions',
            'Troubleshooting common issues'
          ]
        },
        {
          title: 'MODULE 3: DESIGN CREATION',
          content: [
            'Floral watercolor designs',
            'Abstract patterns',
            'Seasonal themes',
            'Personal style development'
          ]
        },
        {
          title: 'MODULE 4: FINISHING & MAINTENANCE',
          content: [
            'Top coat application',
            'Longevity tips',
            'Touch-up techniques',
            'Client consultation skills'
          ]
        }
      ]
    },
    'christmas-watercolor-workshop': {
      id: 'efe16488-1de6-4522-aeb3-b08cfae3a640', // Matches Academy "Christmas Workshop"
      sku: 'SKU_XMAS_WATERCOLOR',
      title: 'Christmas Watercolor Workshop',
      description: 'Paint festive watercolor nail art for the holidays! Learn Christmas tree designs, snowflakes, and winter wonderland techniques.',
      heroImage: '/christmas-watercolor-card.webp',
      duration: 'Self-Paced',
      price: 'R450',
      originalPrice: 'R650',
      numericPrice: 450,
      depositAmount: 0,
      isOnline: true,
      location: 'Online',
      instructor: {
        name: 'Avané Crous',
        image: '/avane-crous-headshot.webp',
        bio: 'Professional nail artist and educator with over 8 years of experience. Avané brings festive creativity to seasonal nail art and ensures you master techniques with confidence.'
      },
      about: [
        'Get into the holiday spirit with this special Christmas watercolor workshop! Learn to create stunning festive designs including Christmas trees, snowflakes, and winter wonderland scenes.',
        'Perfect for the holiday season, this workshop teaches you seasonal techniques that will make your nail art stand out during Christmas celebrations.'
      ],
      packages: [
        {
          name: 'Christmas Workshop',
          price: 'R450',
          originalPrice: 'R650',
          kitValue: 'Included',
          features: [
            'Lifetime access to Christmas tutorials',
            'Holiday design templates',
            'Seasonal color palettes',
            'Festive techniques guide',
            'Certificate after you\'ve completed your exam'
          ],
          onSale: true
        }
      ],
      availableDates: ['Available Now'],
      thingsToBring: [],
      trainingSchedule: [],
      studentDiscount: [],
      accordionData: [
        {
          title: 'MODULE 1: CHRISTMAS BASICS',
          content: [
            'Holiday color theory',
            'Christmas design elements',
            'Festive tool selection',
            'Seasonal inspiration'
          ]
        },
        {
          title: 'MODULE 2: CHRISTMAS TREE DESIGNS',
          content: [
            'Tree shape creation',
            'Ornament placement',
            'Light effects',
            'Tree variations'
          ]
        },
        {
          title: 'MODULE 3: SNOWFLAKE PATTERNS',
          content: [
            'Snowflake geometry',
            'Crystal effects',
            'Winter textures',
            'Frosted finishes'
          ]
        },
        {
          title: 'MODULE 4: WINTER WONDERLAND',
          content: [
            'Landscape creation',
            'Atmospheric effects',
            'Holiday scenes',
            'Final touches'
          ]
        }
      ]
    }
  };

  const course = courses[courseSlug as keyof typeof courses] || courses['professional-acrylic-training'];
  const depositAmount = !course.isOnline ? (course.depositAmount ?? 1800) : 0;
  const [expandedAccordion, setExpandedAccordion] = useState<number | null>(0);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showComparePackages, setShowComparePackages] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    countryCode: '+27',
    terms: false
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-select package and date if there's only one option
  useEffect(() => {
    if (course.packages.length === 1 && !selectedPackage) {
      setSelectedPackage(course.packages[0].name);
    }
    if (course.availableDates.length === 1 && !selectedDate) {
      setSelectedDate(course.availableDates[0]);
    }
  }, [course, selectedPackage, selectedDate]);

  const toggleAccordion = (index: number) => {
    setExpandedAccordion(expandedAccordion === index ? null : index);
  };

  const scrollToBooking = () => {
    document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const selectPackage = (packageName: string) => {
    setSelectedPackage(packageName);
  };

  const selectDate = (date: string) => {
    setSelectedDate(date);
  };

  const compareFeatures = (() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const pkg of course.packages) {
      for (const f of pkg.features) {
        if (!seen.has(f)) {
          seen.add(f);
          ordered.push(f);
        }
      }
    }
    return ordered;
  })();

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
    const isValid = Object.entries(formData).every(([key, value]) => validateField(key, value));
    if (!isValid || !selectedPackage || !selectedDate) {
      showNotification('Please fill all required fields', 'error');
      setIsSubmitting(false);
      return;
    }

    try {
      const nowBase36 = Date.now().toString(36).toUpperCase();
      const bytes = globalThis.crypto?.getRandomValues?.(new Uint8Array(3));
      const rand = bytes
        ? Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase()
        : Math.random().toString(16).slice(2, 8).toUpperCase();
      const clientPaymentId = `BL-${nowBase36}-${rand}`;

      // Get the selected package price
      const selectedPkg = course.packages.find(pkg => pkg.name === selectedPackage);
      if (!selectedPkg) {
        showNotification('Please select a package', 'error');
        setIsSubmitting(false);
        return;
      }

      // Extract numeric price from package (e.g., "R450" -> 450)
      const priceMatch = selectedPkg.price.match(/[\d,]+/);
      const coursePrice = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : course.numericPrice;
      const paymentAmount = course.isOnline ? coursePrice : depositAmount;
      const paymentAmountCents = Math.round(paymentAmount * 100);
      const paymentLabel = course.isOnline ? 'Purchase' : 'Deposit';
      const paymentKind = course.isOnline ? 'full' : 'deposit';
      const amountOwedCents = course.isOnline ? 0 : Math.max(0, Math.round((coursePrice - depositAmount) * 100));

      // Create order with course as product
      const orderRes = await fetch('/.netlify/functions/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_kind: 'course',
          m_payment_id: clientPaymentId,
          buyer: {
            name: formData.name,
            email: formData.email,
            phone: `${formData.countryCode}${formData.phone}`
          },
          course_booking: {
            course_slug: courseSlug,
            course_title: course.title,
            course_type: course.isOnline ? 'online' : 'in-person',
            selected_package: selectedPackage,
            selected_date: selectedDate,
            amount_paid_cents: paymentAmountCents,
            amount_owed_cents: amountOwedCents,
            payment_kind: paymentKind,
            details: {
              course_id: course.id,
              course_price_cents: Math.round(coursePrice * 100),
              deposit_cents: Math.round(depositAmount * 100)
            }
          },
          items: [{
            product_id: course.id,
            sku: (course as any).sku,
            product_name: `${course.title} - ${selectedPackage} ${paymentLabel}`,
            unit_price: paymentAmountCents,
            quantity: 1
          }],
          totals: {
            subtotal_cents: paymentAmountCents,
            shipping_cents: 0,
            tax_cents: 0
          },
          shipping: {
            method: 'collection'
          }
        })
      });

      if (!orderRes.ok) {
        throw new Error('Failed to create order');
      }

      const orderData = await orderRes.json();
      const orderId = orderData.order_id;
      const merchantPaymentId = orderData.m_payment_id || orderData.merchant_payment_id || clientPaymentId;

      // Redirect to PayFast
      const paymentRes = await fetch('/.netlify/functions/payfast-redirect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          amount: paymentAmount,
          item_name: `${course.title} - ${selectedPackage} ${paymentLabel}`,
          m_payment_id: merchantPaymentId,
          email_address: formData.email,
          name_first: formData.name.split(' ')[0],
          name_last: formData.name.split(' ').slice(1).join(' ') || formData.name.split(' ')[0],
          custom_str1: course.id, // Pass course ID
          custom_str2: courseSlug // Pass course slug
        })
      });

      if (!paymentRes.ok) {
        throw new Error('Failed to initialize payment');
      }

      const contentType = paymentRes.headers.get('content-type') || '';

      if (contentType.includes('text/html')) {
        const html = await paymentRes.text();
        document.open();
        document.write(html);
        document.close();
      } else {
        const pfData = await paymentRes.json();
        const redirectUrl = pfData.redirect || pfData.url;
        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          throw new Error('No redirect URL received from PayFast');
        }
      }

    } catch (error) {
      console.error('Enrollment error:', error);
      showNotification('Something went wrong. Please try again.', 'error');
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
            src={course.heroImage}
            alt={course.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          
          <div className="relative h-full flex items-center justify-center">
            <div className="text-center text-white max-w-4xl mx-auto px-4">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 uppercase tracking-wider text-white" style={{ textShadow: '0 6px 12px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)' }}>
                {course.title}
              </h1>
              <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                {course.description}
              </p>
              
              {/* Detail Pills */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-md" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <Clock className="h-5 w-5" />
                  <span className="font-medium">{course.duration}</span>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-md" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <CreditCard className="h-5 w-5" />
                  <span className="font-medium">{course.price}</span>
                </div>
                {course.isOnline && (
                  <div className="flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-md" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <MapPin className="h-5 w-5" />
                    <span className="font-medium">{course.location}</span>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <button
                onClick={scrollToBooking}
                className="bg-pink-400 hover:bg-transparent text-white hover:text-black font-bold py-5 px-12 rounded-full text-lg uppercase tracking-wide transition-all duration-300 border-2 border-transparent hover:border-black"
                style={{ boxShadow: '0 4px 15px rgba(255,116,164,0.3)' }}
              >
                {course.isOnline ? 'Enroll Now' : 'Book Your Spot'}
              </button>
            </div>
          </div>
        </section>

        {/* Meet Your Instructor */}
        <section className="py-20" style={{ background: 'linear-gradient(135deg, #FFE8F0 0%, #FFF0F6 50%, #FFE8F0 100%)' }}>
          <Container>
            <div className="max-w-5xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 uppercase tracking-wide text-gray-900">
                MEET YOUR INSTRUCTOR
              </h2>
              <div className="w-20 h-1 bg-pink-400 mx-auto mb-12 rounded-full"></div>

              <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl">
                <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
                  <div className="w-48 h-48 flex-shrink-0">
                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-pink-400 shadow-lg">
                      <img
                        src={course.instructor.image}
                        alt={course.instructor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">{course.instructor.name}</h3>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      {course.instructor.bio}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* About This Course */}
        <section className="py-20" style={{ background: 'linear-gradient(135deg, #FFE8F0 0%, #FFF0F6 50%, #FFE8F0 100%)' }}>
          <Container>
            <div className="max-w-5xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 uppercase tracking-wide text-gray-900">
                ABOUT THIS COURSE
              </h2>
              <div className="w-20 h-1 bg-pink-400 mx-auto mb-12 rounded-full"></div>

              <div className="space-y-6 text-lg text-gray-700 leading-relaxed text-center md:text-left">
                {course.about.map((paragraph, index) => (
                  <p key={index} className="max-w-4xl mx-auto">{paragraph}</p>
                ))}
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
                {course.accordionData.map((item, index) => (
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
                          <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: '#CEE5FF' }}>
                            <p className="text-sm font-medium" style={{ color: '#1a5a9a' }}>{item.note}</p>
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
              <div className="flex items-center justify-between gap-4">
                <h2 className="heading-with-stripe">Choose Your Package</h2>
                {course.packages.length > 1 && (
                  <button
                    onClick={() => setShowComparePackages(true)}
                    className="bg-transparent hover:bg-pink-50 text-gray-900 font-semibold py-2 px-4 rounded-full transition-all duration-200 border border-gray-300"
                  >
                    Compare Packages
                  </button>
                )}
              </div>

              {showComparePackages && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div
                    className="absolute inset-0 bg-black/40"
                    onClick={() => setShowComparePackages(false)}
                  />
                  <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b">
                      <div>
                        <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Compare</div>
                        <div className="text-2xl font-bold text-gray-900">Packages</div>
                      </div>
                      <button
                        onClick={() => setShowComparePackages(false)}
                        className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        aria-label="Close"
                      >
                        <X className="h-5 w-5 text-gray-700" />
                      </button>
                    </div>

                    <div className="p-6 overflow-auto max-h-[70vh]">
                      <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-white">
                          <tr className="border-b">
                            <th className="py-3 pr-4 text-sm font-bold text-gray-900">What’s Included</th>
                            {course.packages.map((pkg) => (
                              <th key={pkg.name} className="py-3 px-4 text-sm font-bold text-gray-900 whitespace-nowrap">
                                <div className="flex flex-col gap-1">
                                  <span>{pkg.name}</span>
                                  <span className="text-xs font-semibold text-gray-500">{pkg.price}</span>
                                  <span className="text-xs font-semibold text-gray-500">Kit: {pkg.kitValue}</span>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {compareFeatures.map((feature) => (
                            <tr key={feature} className="border-b last:border-b-0">
                              <td className="py-3 pr-4 text-sm text-gray-700">{feature}</td>
                              {course.packages.map((pkg) => {
                                const has = pkg.features.includes(feature);
                                return (
                                  <td key={pkg.name} className="py-3 px-4">
                                    {has ? (
                                      <div className="inline-flex items-center justify-center h-7 w-7 rounded-full" style={{ backgroundColor: '#CEE5FF' }}>
                                        <CheckCircle className="h-4 w-4" style={{ color: '#1a5a9a' }} />
                                      </div>
                                    ) : (
                                      <span className="text-gray-300">—</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-6 border-t flex justify-end gap-3">
                      <button
                        onClick={() => setShowComparePackages(false)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-full transition-colors"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => {
                          setShowComparePackages(false);
                          scrollToBooking();
                        }}
                        className="bg-pink-400 hover:bg-pink-500 text-white font-semibold py-3 px-6 rounded-full transition-colors"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className={`grid gap-8 ${course.packages.length === 1 ? 'max-w-md mx-auto' : 'md:grid-cols-2'}`}>
                {course.packages.map((pkg, index) => (
                  <div key={index} className={`bg-white border-2 ${pkg.popular ? 'border-pink-400' : 'border-gray-200'} rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative flex flex-col h-full ${pkg.popular ? 'shadow-xl' : ''}`} style={pkg.popular ? { boxShadow: '0 8px 30px rgba(255,116,164,0.2)' } : {}}>
                    {pkg.popular && (
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                        <div className="text-white px-6 py-2 rounded-b-2xl text-sm font-bold uppercase tracking-wide" style={{ backgroundColor: '#CEE5FF', color: '#1a1a1a' }}>
                          Most Popular
                        </div>
                      </div>
                    )}
                    
                    <div className="text-center mb-8 mt-4">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4 uppercase">{pkg.name} Package</h3>
                      <div className="text-4xl font-bold text-pink-400 mb-2">{pkg.price}</div>
                      {pkg.originalPrice && (
                        <div className="text-lg text-gray-500 line-through mb-2">{pkg.originalPrice}</div>
                      )}
                      <div className="text-sm font-semibold text-gray-500 uppercase">Kit Value: {pkg.kitValue}</div>
                    </div>
                    
                    <ul className="space-y-4 mb-8 flex-grow">
                      {pkg.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-3 transition-all duration-300 hover:bg-pink-50 hover:translate-x-2 rounded-lg py-2 px-3 -mx-3 cursor-pointer">
                          <CheckCircle className="h-5 w-5 flex-shrink-0" style={{ color: '#CEE5FF', stroke: '#4A9FFF' }} />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <button
                      onClick={() => selectPackage(pkg.name)}
                      className="w-full bg-pink-400 hover:bg-transparent text-white hover:text-black font-bold py-4 px-6 rounded-full text-lg uppercase tracking-wide transition-all duration-300 border-2 border-transparent hover:border-black"
                      style={{ boxShadow: '0 4px 15px rgba(255,116,164,0.3)' }}
                    >
                      Choose {pkg.name}
                    </button>
                  </div>
                ))}
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
                <div className="p-10 md:p-12 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center" style={{ backgroundColor: '#CEE5FF' }}>
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <MapPin className="h-8 w-8 text-pink-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide">Location</h3>
                  <p className="text-gray-800 text-base md:text-lg leading-relaxed">
                    {course.location}<br />
                    {course.isOnline && (
                      <span className="text-base text-gray-700">Access from anywhere</span>
                    )}
                  </p>
                </div>

                {/* Payment Info */}
                <div className="p-10 md:p-12 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center" style={{ backgroundColor: '#CEE5FF' }}>
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CreditCard className="h-8 w-8 text-pink-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide">{course.isOnline ? 'Payment' : 'Deposit Required'}</h3>
                  <p className="text-gray-800 text-base md:text-lg leading-relaxed">
                    {course.isOnline ? 'Full payment required' : `R${depositAmount.toLocaleString('en-ZA')} to secure your spot`}<br />
                    <span className="text-base text-gray-700">{course.isOnline ? 'Instant access after payment' : 'Balance due on course start date'}</span>
                  </p>
                </div>

                {/* Course Dates */}
                <div className="p-10 md:p-12 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center" style={{ backgroundColor: '#CEE5FF' }}>
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Calendar className="h-8 w-8 text-pink-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide">{course.isOnline ? 'Access' : 'Course Dates'}</h3>
                  <div className="space-y-2">
                    {course.availableDates.map((date, index) => (
                      <button
                        key={index}
                        onClick={() => selectDate(date)}
                        className={`block w-full px-5 py-3 rounded-full text-base font-semibold transition-all duration-300 hover:-translate-y-1`}
                        style={selectedDate === date ? {
                          backgroundColor: '#FF74A4',
                          color: 'white'
                        } : {
                          backgroundColor: '#CEE5FF',
                          color: '#1a1a1a'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedDate !== date) {
                            e.currentTarget.style.backgroundColor = '#FF74A4';
                            e.currentTarget.style.color = 'white';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedDate !== date) {
                            e.currentTarget.style.backgroundColor = '#CEE5FF';
                            e.currentTarget.style.color = '#1a1a1a';
                          }
                        }}
                      >
                        {date}
                      </button>
                    ))}
                  </div>
                </div>

                {!course.isOnline && course.thingsToBring.length > 0 && (
                  <div className="p-10 md:p-12 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center" style={{ backgroundColor: '#CEE5FF' }}>
                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-5">
                      <Package className="h-8 w-8 text-pink-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide">What You Need to Bring</h3>
                    <ul className="text-gray-800 text-base md:text-lg leading-relaxed space-y-3 text-left">
                      {course.thingsToBring.map((item, index) => (
                        <li key={index} className="flex gap-2">
                          <span className="text-pink-400 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {!course.isOnline && course.trainingSchedule.length > 0 && course.trainingSchedule.map((block: any) => (
                  <div key={block.title} className="p-10 md:p-12 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center" style={{ backgroundColor: '#CEE5FF' }}>
                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-5">
                      <Clock className="h-8 w-8 text-pink-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 uppercase tracking-wide">{`Training Times - ${block.title}`}</h3>
                    <ul className="text-gray-800 text-base md:text-lg leading-relaxed space-y-3 text-left mt-4">
                      {block.items.map((t: string, index: number) => (
                        <li key={index} className="flex gap-2">
                          <span className="text-pink-400 mt-0.5">•</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {!course.isOnline && course.studentDiscount.length > 0 && (
                  <div className="p-10 md:p-12 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center" style={{ backgroundColor: '#CEE5FF' }}>
                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-5">
                      <Ticket className="h-8 w-8 text-pink-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide">Exclusive Student Discount</h3>
                    <ul className="text-gray-800 text-base md:text-lg leading-relaxed space-y-3 text-left">
                      {course.studentDiscount.map((item, index) => (
                        <li key={index} className="flex gap-2">
                          <span className="text-pink-400 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Contact */}
                <div className="p-10 md:p-12 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center" style={{ backgroundColor: '#CEE5FF' }}>
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Phone className="h-8 w-8 text-pink-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide">Contact</h3>
                  <div className="space-y-3">
                    <ClickableContact 
                      type="phone" 
                      value="+27 79 548 3317" 
                      className="text-gray-800 text-base md:text-lg"
                    >
                      WhatsApp: +27 79 548 3317
                    </ClickableContact>
                    <ClickableContact 
                      type="email" 
                      value="shopblomcosmetics@gmail.com" 
                      className="text-gray-800 text-base md:text-lg"
                    >
                      Email: shopblomcosmetics@gmail.com
                    </ClickableContact>
                  </div>
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
    <div className="bg-pink-400 p-12 text-center text-white relative" style={{ background: 'linear-gradient(135deg, rgba(244,114,182,0.9) 0%, rgba(236,72,153,0.95) 100%)' }}>
                  <h2 className="text-3xl md:text-4xl font-bold mb-3 uppercase tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    {course.isOnline ? 'Enroll Now' : 'Book Your Spot'}
                  </h2>
                  <p className="text-lg opacity-90" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                    {course.isOnline ? 'Get instant access to this online workshop' : 'Secure your place in this professional training course'}
                  </p>
                        </div>

                {/* Form Body */}
                <div className="p-12">
                  <form onSubmit={handleSubmit} className="space-y-7">
                    {/* Selection Summary */}
                    {(!selectedPackage || !selectedDate) && (
                      <div className="p-4 rounded-xl border-2 border-yellow-400 bg-yellow-50">
                        <p className="text-sm font-semibold text-gray-800 mb-2">Please complete your selections:</p>
                        <ul className="space-y-1 text-sm text-gray-700">
                          {!selectedPackage && (
                            <li className="flex items-center gap-2">
                              <span className="text-yellow-600">●</span>
                              <span>Choose a package</span>
                            </li>
                          )}
                          {!selectedDate && (
                            <li className="flex items-center gap-2">
                              <span className="text-yellow-600">●</span>
                              <span>Select a date</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {(selectedPackage || selectedDate) && (
                      <div className="p-4 rounded-xl bg-green-50 border-2 border-green-200">
                        <p className="text-sm font-semibold text-gray-800 mb-2">Your Selections:</p>
                        <div className="space-y-1 text-sm text-gray-700">
                          {selectedPackage && (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span><strong>Package:</strong> {selectedPackage}</span>
                            </div>
                          )}
                          {selectedDate && (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span><strong>Date:</strong> {selectedDate}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Package & Date Dropdowns */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Package <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={selectedPackage}
                          onChange={(e) => setSelectedPackage(e.target.value)}
                          className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none transition-all text-base bg-white"
                        >
                          <option value="" disabled>
                            Select a package
                          </option>
                          {course.packages.map((pkg) => (
                            <option key={pkg.name} value={pkg.name}>
                              {pkg.name} ({pkg.price})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Date <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none transition-all text-base bg-white"
                        >
                          <option value="" disabled>
                            Select a date
                          </option>
                          {course.availableDates.map((date) => (
                            <option key={date} value={date}>
                              {date}
                            </option>
                          ))}
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
                    <div>
                      <button
                          type="submit"
                        disabled={isSubmitting || !selectedPackage || !selectedDate || !formData.terms}
                        className="w-full bg-pink-400 hover:bg-transparent text-white hover:text-black font-bold py-5 px-6 rounded-full text-lg uppercase tracking-wide transition-all duration-300 border-2 border-transparent hover:border-black disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-pink-400 disabled:hover:text-white disabled:hover:border-transparent"
                        style={{ boxShadow: '0 4px 15px rgba(255,116,164,0.3)' }}
                      >
                        {isSubmitting ? 'Processing...' : course.isOnline ? 'Complete Purchase' : `Pay Deposit & Secure Spot (R${depositAmount.toLocaleString('en-ZA')})`}
                      </button>

                      {/* Help text when button is disabled */}
                      {(!selectedPackage || !selectedDate || !formData.terms) && !isSubmitting && (
                        <div className="mt-3 text-center text-sm text-gray-600">
                          {!selectedPackage && !selectedDate && (
                            <p>Please select a package and date above to continue</p>
                          )}
                          {!selectedPackage && selectedDate && (
                            <p>Please select a package above to continue</p>
                          )}
                          {selectedPackage && !selectedDate && (
                            <p>Please select a date above to continue</p>
                          )}
                          {selectedPackage && selectedDate && !formData.terms && (
                            <p>Please agree to the Terms & Conditions to continue</p>
                          )}
                        </div>
                      )}
                    </div>

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
