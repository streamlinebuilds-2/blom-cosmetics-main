import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ReviewSection } from '../components/review/ReviewSection';
import { 
  Clock, 
  Users, 
  Award, 
  Star, 
  Calendar, 
  MapPin, 
  Video, 
  BookOpen,
  CheckCircle,
  Play,
  Download,
  MessageCircle,
  Share2,
  Heart,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  Package,
  Shield,
  Zap,
  Target,
  User,
  CreditCard,
  AlertCircle,
  X,
  Monitor,
  Globe,
  Smartphone
} from 'lucide-react';

interface CourseDetailPageProps {
  courseSlug?: string;
}

export const CourseDetailPage: React.FC<CourseDetailPageProps> = ({ courseSlug = 'online-watercolour-workshop' }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'instructor' | 'reviews'>('overview');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState<number | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    terms: false
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Course data based on slug
  const courseData = {
    'christmas-watercolor-workshop': {
      id: '3',
      title: 'Christmas Watercolor Workshop',
      subtitle: 'Paint festive nail art for the holidays',
      description: 'Create magical holiday nail designs with our beginner-friendly Christmas watercolor workshop. Perfect for the festive season!',
      fullDescription: `Get into the holiday spirit with our special Christmas Watercolor Workshop! This beginner-friendly course teaches you how to create stunning festive nail designs using watercolor techniques.

Learn to paint beautiful Christmas trees, delicate snowflakes, and elegant ornaments on nails. This self-paced workshop is perfect for anyone wanting to add some holiday magic to their nail art skills. No prior experience needed - we'll guide you through every brushstroke!`,
      price: 450,
      originalPrice: 650,
      duration_hours: 0,
      max_students: 100,
      enrolled_students: 67,
      instructor: {
        name: 'Avané Crous',
        bio: 'Festive Nail Art specialist with expertise in seasonal watercolor designs and holiday-themed nail artistry',
        image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
        credentials: ['Festive Nail Art Specialist', 'Watercolor Expert', 'Holiday Design Creator']
      },
      featured_image: 'https://images.pexels.com/photos/3997969/pexels-photo-3997969.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      course_type: 'online',
      difficulty_level: 'beginner',
      format: 'Self-Paced',
      location: 'Online',
      rating: 4.8,
      total_reviews: 89,
      saleEndDate: 'October 31, 2024',
      packages: [
        {
          id: 'workshop',
          name: 'Christmas Workshop Package',
          price: 450,
          originalPrice: 650,
          kitValue: 0,
          popular: true,
          includes: [
            'Step-by-step video tutorials',
            'BLOM Academy app access',
            'Complete materials list',
            'Certificate with festive design',
            'WhatsApp support group',
            'Lifetime access to content'
          ]
        }
      ],
      curriculum: [
        {
          module: 1,
          title: 'Welcome & Materials',
          duration: 'Self-paced',
          lessons: [
            'Welcome to Christmas nail art',
            'Materials overview and setup',
            'Workspace preparation',
            'Color palette introduction'
          ]
        },
        {
          module: 2,
          title: 'Festive Watercolour Basics',
          duration: 'Self-paced',
          lessons: [
            'Holiday color theory',
            'Festive brush techniques',
            'Blending for winter effects',
            'Creating depth and dimension'
          ]
        },
        {
          module: 3,
          title: 'Tutorials (Tree, Snowflakes, Ornaments)',
          duration: 'Self-paced',
          lessons: [
            'Christmas tree watercolor technique',
            'Delicate snowflake patterns',
            'Elegant ornament designs',
            'Combining elements for full sets'
          ]
        },
        {
          module: 4,
          title: 'Sealing & Certification',
          duration: 'Self-paced',
          lessons: [
            'Proper sealing techniques',
            'Photo submission guidelines',
            'Portfolio presentation tips',
            'Certificate completion process'
          ]
        }
      ],
      howItWorks: [
        {
          step: 1,
          title: 'Purchase',
          description: 'Complete your enrollment and payment for the Christmas workshop'
        },
        {
          step: 2,
          title: 'Access',
          description: 'Get instant access to BLOM Academy and festive content'
        },
        {
          step: 3,
          title: 'Get Materials',
          description: 'Download the holiday materials list and gather supplies'
        },
        {
          step: 4,
          title: 'Learn',
          description: 'Follow festive tutorials at your own pace'
        },
        {
          step: 5,
          title: 'Certify',
          description: 'Submit photos and receive your festive certificate'
        }
      ],
      requirements: [
        'Fine Line Brush',
        'Practice Tips',
        'Watercolor Palette',
        'Base Coat',
        'Top Coat',
        'Nail Forms',
        'Clean workspace',
        'Holiday spirit!'
      ],
      modelRequirements: [
        'No models required for online workshop',
        'Practice on yourself or willing friends',
        'Use practice tips for skill development',
        'Submit festive photos for certification'
      ],
      faqs: [
        {
          question: 'Is this suitable for beginners?',
          answer: 'Absolutely! This workshop is designed for beginners. No prior watercolor experience needed - we\'ll guide you through every festive technique.'
        },
        {
          question: 'How long do I have access?',
          answer: 'You have lifetime access to all Christmas workshop materials, so you can create festive nails every holiday season!'
        },
        {
          question: 'When does the sale end?',
          answer: 'The special Christmas pricing ends on October 31st, so enroll now to save R200 on this festive workshop!'
        },
        {
          question: 'How do I get my certificate?',
          answer: 'Complete the tutorials and submit photos of your festive nail art. You\'ll receive a beautiful certificate with a special holiday design!'
        }
      ],
      reviews: [
        {
          id: 1,
          name: 'Sarah M.',
          rating: 5,
          date: '2023-12-20',
          title: 'Perfect for the holidays!',
          comment: 'This workshop got me so excited for Christmas! The snowflake tutorial is absolutely magical and my clients loved their festive nails.',
          verified: true,
          helpful: 15
        },
        {
          id: 2,
          name: 'Jessica L.',
          rating: 5,
          date: '2023-12-15',
          title: 'Beginner-friendly and festive!',
          comment: 'I\'ve never done watercolor nails before but Avané made it so easy. The Christmas tree design is now my signature holiday look!',
          verified: true,
          helpful: 12
        },
        {
          id: 3,
          name: 'Michelle R.',
          rating: 4,
          date: '2023-12-10',
          title: 'Great value with the sale!',
          comment: 'Amazing workshop at an incredible price. The ornament designs are so elegant and the certificate is beautiful!',
          verified: true,
          helpful: 8
        }
      ]
    },
    'online-watercolour-workshop': {
      id: '1',
      title: 'Online Watercolour Workshop',
      subtitle: 'Learn dreamy watercolour nail designs from home',
      description: 'Step-by-step online training with lifetime access and optional kit. Master the beautiful art of watercolor nail design from the comfort of your home.',
      fullDescription: `This comprehensive step-by-step online watercolour workshop provides lifetime access to professional training materials. You'll learn how to create stunning watercolor effects that will set your nail art apart from the competition.

Our expert instructor Avané Crous will guide you through each step of the process, from selecting the right products to mastering the delicate brush techniques required for perfect watercolor nails. With lifetime access, you can learn at your own pace and revisit content anytime.`,
      price: 480,
      originalPrice: null,
      duration_hours: 0,
      max_students: 50,
      enrolled_students: 34,
      instructor: {
        name: 'Avané Crous',
        bio: 'Watercolour Specialist with 10+ years experience in creating dreamy watercolor nail designs and training professionals worldwide',
        image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
        credentials: ['Watercolour Specialist', 'International Nail Art Champion', 'BLOM Lead Instructor']
      },
      featured_image: 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      course_type: 'online',
      difficulty_level: 'beginner',
      format: 'Self-Paced',
      location: 'Online',
      rating: 4.9,
      total_reviews: 127,
      packages: [
        {
          id: 'standard',
          name: 'Standard Package',
          price: 480,
          kitValue: 0,
          popular: false,
          includes: [
            'Lifetime access',
            'Materials list',
            'Certificate',
            'WhatsApp support'
          ]
        },
        {
          id: 'premium',
          name: 'Premium Package',
          price: 680,
          kitValue: 0,
          popular: true,
          includes: [
            'Everything in Standard',
            'Starter kit included',
            'Priority support',
            'Priority WhatsApp support',
            'Bonus techniques'
          ]
        }
      ],
      curriculum: [
        {
          module: 1,
          title: 'Fundamentals',
          duration: 'Self-paced',
          lessons: [
            'Understanding watercolor techniques',
            'Essential tools and products',
            'Color theory basics',
            'Workspace setup'
          ]
        },
        {
          module: 2,
          title: 'Basic Techniques',
          duration: 'Self-paced',
          lessons: [
            'Wet-on-wet blending',
            'Gradient creation',
            'Color mixing fundamentals',
            'Brush control exercises'
          ]
        },
        {
          module: 3,
          title: 'Advanced Designs',
          duration: 'Self-paced',
          lessons: [
            'Floral watercolor designs',
            'Abstract patterns',
            'Texture creation',
            'Layering techniques'
          ]
        },
        {
          module: 4,
          title: 'Professional Application',
          duration: 'Self-paced',
          lessons: [
            'Client consultation',
            'Pricing strategies',
            'Troubleshooting common issues',
            'Portfolio development'
          ]
        }
      ],
      howItWorks: [
        {
          step: 1,
          title: 'Purchase',
          description: 'Complete your enrollment and payment'
        },
        {
          step: 2,
          title: 'Access',
          description: 'Get instant access to BLOM Academy'
        },
        {
          step: 3,
          title: 'Get Materials',
          description: 'Download the materials list and gather supplies'
        },
        {
          step: 4,
          title: 'Learn',
          description: 'Follow step-by-step tutorials at your own pace'
        },
        {
          step: 5,
          title: 'Certify',
          description: 'Complete the course and receive your certificate'
        }
      ],
      requirements: [
        'Fine Line Brush',
        'Practice Tips',
        'Watercolor Palette',
        'Base Coat',
        'Top Coat',
        'Nail Forms',
        'Clean workspace'
      ],
      modelRequirements: [
        'No models required for online courses',
        'Practice on yourself or willing friends',
        'Use practice tips for skill development',
        'Submit photos for feedback'
      ],
      faqs: [
        {
          question: 'How long do I have access to the course?',
          answer: 'You have lifetime access to all course materials, so you can learn at your own pace and revisit content anytime.'
        },
        {
          question: 'Do I need prior experience?',
          answer: 'No prior experience is needed! This course is designed for beginners, though intermediate artists will also benefit from advanced techniques.'
        },
        {
          question: 'What if I need help during the course?',
          answer: 'You have access to WhatsApp support and can ask questions anytime. Premium package includes priority support.'
        },
        {
          question: 'Can I get a refund?',
          answer: 'We offer a 7-day satisfaction guarantee. If you\'re not happy with the course, contact us for a full refund.'
        }
      ]
    },
    'professional-acrylic-training': {
      id: '2',
      title: 'Professional Acrylic Training',
      subtitle: 'Master the art of acrylic nail application with hands-on training',
      description: 'Comprehensive 5-day hands-on acrylic nail training course covering everything from basic application to advanced sculpting techniques.',
      fullDescription: `This intensive 5-day professional acrylic training course will transform you into a confident acrylic nail technician. You'll learn everything from nail preparation to advanced sculpting techniques, with hands-on practice using professional-grade products.

Our expert instructors will guide you through each step of the acrylic process, ensuring you master the fundamentals before moving on to advanced techniques. By the end of this course, you'll be ready to offer professional acrylic services to clients.`,
      price: 7200,
      originalPrice: null,
      duration_hours: 40,
      max_students: 12,
      enrolled_students: 8,
      instructor: {
        name: 'Avané Crous',
        bio: 'Master nail technician with 15+ years experience specializing in acrylic nail application and professional training',
        image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
        credentials: ['Master Nail Technician', 'Certified Acrylic Specialist', 'Professional Educator']
      },
      featured_image: 'https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      course_type: 'in-person',
      difficulty_level: 'beginner',
      format: '5 Days',
      location: 'Randfontein, Gauteng',
      rating: 4.8,
      total_reviews: 89,
      packages: [
        {
          id: 'standard',
          name: 'Standard Package',
          price: 7200,
          kitValue: 3200,
          popular: false,
          includes: [
            '5-day hands-on training',
            'Basic starter kit (R3,200 value)',
            'Certificate of completion',
            'Course materials',
            'Light refreshments',
            'Ongoing support'
          ]
        },
        {
          id: 'deluxe',
          name: 'Deluxe Package',
          price: 9900,
          kitValue: 5100,
          popular: true,
          includes: [
            'Everything in Standard',
            'Premium professional kit (R5,100 value)',
            'Electric e-file',
            'LED lamp',
            'Advanced technique modules',
            'Business startup guide'
          ]
        }
      ],
      curriculum: [
        {
          module: 1,
          title: 'Foundation & Preparation (Day 1)',
          duration: '8 hours',
          lessons: [
            'Nail anatomy and health',
            'Sanitation and safety',
            'Product knowledge',
            'Workspace setup',
            'Client consultation'
          ]
        },
        {
          module: 2,
          title: 'Acrylic Application (Day 2-3)',
          duration: '16 hours',
          lessons: [
            'Nail preparation techniques',
            'Acrylic mixing ratios',
            'Application methods',
            'Sculpting basics',
            'Troubleshooting common issues'
          ]
        },
        {
          module: 3,
          title: 'Shaping & Refinement (Day 4)',
          duration: '8 hours',
          lessons: [
            'Filing techniques',
            'Shape perfection',
            'Surface preparation',
            'Strength testing',
            'Model practice (models required)'
          ]
        },
        {
          module: 4,
          title: 'Finishing & Business (Day 5)',
          duration: '8 hours',
          lessons: [
            'Polish application',
            'Final touches',
            'Client aftercare',
            'Pricing strategies',
            'Business setup',
            'Final assessment (models required)'
          ]
        }
      ],
      howItWorks: [
        {
          step: 1,
          title: 'Book Your Spot',
          description: 'Pay R2,000 deposit to secure your place'
        },
        {
          step: 2,
          title: 'Prepare for Training',
          description: 'Receive pre-course materials and preparation guide'
        },
        {
          step: 3,
          title: 'Attend Training',
          description: '5 days of intensive hands-on learning'
        },
        {
          step: 4,
          title: 'Practice & Perfect',
          description: 'Apply your skills with ongoing support'
        },
        {
          step: 5,
          title: 'Get Certified',
          description: 'Receive your professional certificate'
        }
      ],
      requirements: [
        'Comfortable clothing',
        'Notepad and pen',
        'Lunch (or purchase on-site)',
        'Positive attitude and willingness to learn',
        'Basic nail care knowledge helpful'
      ],
      modelRequirements: [
        'Models required for Day 4 & 5',
        'Bring 2 different models if possible',
        'Models should have healthy natural nails',
        'No recent nail treatments (48 hours prior)',
        'Models must stay for full session duration'
      ],
      availableDates: [
        'March 15-19, 2025',
        'April 12-16, 2025',
        'May 10-14, 2025',
        'June 14-18, 2025'
      ],
      faqs: [
        {
          question: 'Do I need to bring models?',
          answer: 'Yes, you\'ll need to bring models for Day 4 and Day 5 for practical application and assessment.'
        },
        {
          question: 'What\'s included in the kit?',
          answer: 'The standard kit includes acrylic powders, liquid, brushes, files, and basic tools. The deluxe kit adds professional equipment like an e-file and LED lamp.'
        },
        {
          question: 'Can I pay in installments?',
          answer: 'Yes, pay R2,000 deposit to secure your spot, and the balance is due on the first day of training.'
        },
        {
          question: 'What if I miss a day?',
          answer: 'We recommend attending all 5 days for the full experience. Make-up sessions may be available for emergencies.'
        }
      ]
    }
  };

  const course = courseData[courseSlug as keyof typeof courseData] || courseData['online-watercolour-workshop'];

  const toggleAccordion = (index: number) => {
    setExpandedAccordion(expandedAccordion === index ? null : index);
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const selectPackage = (packageId: string) => {
    setSelectedPackage(packageId);
    setShowBookingForm(true);
    setTimeout(() => {
      document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const selectDate = (date: string) => {
    setSelectedDate(date);
    setShowBookingForm(true);
    setTimeout(() => {
      document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const validateField = (name: string, value: string | boolean) => {
    const errors: Record<string, string> = {};
    
    if (name === 'name' && typeof value === 'string' && !value.trim()) {
      errors.name = 'Name is required';
    }
    if (name === 'email' && typeof value === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) {
        errors.email = 'Email is required';
      } else if (!emailRegex.test(value)) {
        errors.email = 'Please enter a valid email';
      }
    }
    if (name === 'phone' && typeof value === 'string' && !value.trim()) {
      errors.phone = 'Phone number is required';
    }
    if (name === 'terms' && !value) {
      errors.terms = 'You must agree to the terms';
    }

    setFormErrors(prev => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
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

    if (!isValid || !selectedPackage) {
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate enrollment process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success notification
      showNotification('Enrollment successful! Check your email for details.', 'success');
      
      // Reset form
      setFormData({ name: '', email: '', phone: '', terms: false });
      setSelectedPackage('');
      setSelectedDate('');
      setShowBookingForm(false);
      
    } catch (error) {
      showNotification('Enrollment failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-x-full ${
      type === 'success' ? 'bg-green-500' : 
      type === 'error' ? 'bg-red-500' : 
      'bg-blue-500'
    }`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  const formatPrice = (price: number) => `R${price.toFixed(2)}`;

  const getCourseTypeIcon = (type: string) => {
    switch (type) {
      case 'online':
        return Video;
      case 'in-person':
        return MapPin;
      case 'hybrid':
        return BookOpen;
      default:
        return BookOpen;
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'text-green-600 bg-green-100';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-100';
      case 'advanced':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const TypeIcon = getCourseTypeIcon(course.course_type);

  return (
    <div className="min-h-screen bg-white">
      <Header showMobileMenu={true} />

      <main>
        {/* Course Hero Section */}
        <section className="relative bg-gradient-to-br from-pink-50 to-blue-50 section-padding overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-400/10 to-blue-300/10"></div>
          <Container>
            <div className="relative grid lg:grid-cols-3 gap-12">
              {/* Course Info */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(course.difficulty_level)}`}>
                      {course.difficulty_level}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                      <TypeIcon className="h-3 w-3 inline mr-1" />
                      {course.course_type}
                    </span>
                  </div>
                  <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                  <p className="text-xl text-gray-600 mb-6">{course.subtitle}</p>
                  
                  {/* Hero Details */}
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
                      <Clock className="h-4 w-4 text-pink-400" />
                      <span className="font-medium">{course.format}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
                      <MapPin className="h-4 w-4 text-pink-400" />
                      <span className="font-medium">{course.location}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
                      <span className="text-lg font-bold text-pink-400">From {formatPrice(course.price)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mb-6">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(course.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 font-medium">{course.rating}</span>
                      <span className="text-gray-500">({course.total_reviews} reviews)</span>
                    </div>
                  </div>

                  <Button 
                    size="lg" 
                    onClick={() => {
                      setShowBookingForm(true);
                      setTimeout(() => {
                        document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                  >
                    Book Your Spot
                  </Button>
                </div>

                {/* Course Image */}
                <div className="relative aspect-video rounded-lg overflow-hidden mb-8">
                  <img
                    src={course.featured_image}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <button className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                      <Play className="h-6 w-6 text-pink-400 ml-1" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Instructor Card */}
              <div className="lg:col-span-1">
                <Card className="sticky top-8">
                  <CardHeader>
                    <h3 className="text-xl font-bold">Your Instructor</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-6">
                      <img
                        src={course.instructor.image}
                        alt={course.instructor.name}
                        className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                      />
                      <h4 className="font-bold text-lg mb-2">{course.instructor.name}</h4>
                      <p className="text-gray-600 text-sm mb-4">{course.instructor.bio}</p>
                      
                      <div className="space-y-2">
                        {course.instructor.credentials.map((credential, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <Award className="h-4 w-4 text-pink-400" />
                            <span>{credential}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </Container>
        </section>

        {/* About This Course */}
        <section className="section-padding">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">About This Course</h2>
              <div className="prose max-w-none text-gray-600 leading-relaxed">
                <p className="text-lg mb-6">{course.description}</p>
                <p>{course.fullDescription}</p>
              </div>
            </div>
          </Container>
        </section>

        {/* Course Curriculum */}
        <section className="section-padding bg-gray-50">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">Course Curriculum</h2>
              <div className="space-y-4">
                {course.curriculum.map((module, index) => (
                  <Card key={index}>
                    <button
                      onClick={() => toggleAccordion(index)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                          <span className="font-bold text-pink-600">{module.module}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{module.title}</h3>
                          <p className="text-gray-500 text-sm">{module.duration}</p>
                        </div>
                      </div>
                      {expandedAccordion === index ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    {expandedAccordion === index && (
                      <div className="px-6 pb-6">
                        <ul className="space-y-2 ml-14">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <li key={lessonIndex} className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span>{lesson}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* Models & What to Bring */}
        <section className="section-padding">
          <Container>
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Users className="h-5 w-5 text-pink-400" />
                      Model Requirements
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {course.modelRequirements.map((requirement, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Package className="h-5 w-5 text-pink-400" />
                      What to Bring
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {course.requirements.map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </Container>
        </section>

        {/* Choose Your Package */}
        <section className="section-padding">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Choose Your Package</h2>
              <p className="text-xl text-gray-600">Select the package that best fits your needs</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {course.packages.map((pkg) => (
                <Card key={pkg.id} className={`relative ${pkg.popular ? 'ring-2 ring-pink-400' : ''}`}>
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-pink-400 text-white px-4 py-1 rounded-full text-sm font-medium">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                      <div className="text-3xl font-bold text-pink-400 mb-2">
                        {formatPrice(pkg.price)}
                      </div>
                      {course.originalPrice && (
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-xl text-gray-400 line-through">R{course.originalPrice}</span>
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                            Save R{course.originalPrice - course.price}
                          </span>
                        </div>
                      )}
                    </div>

                    <ul className="space-y-3 mb-8">
                      {pkg.includes.map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <Button 
                      className="w-full" 
                      variant={pkg.popular ? 'primary' : 'outline'}
                      onClick={() => selectPackage(pkg.id)}
                    >
                      Choose {pkg.name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        {/* How It Works */}
        <section className="section-padding">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <p className="text-xl text-gray-600">Simple steps to start your learning journey</p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                {course.howItWorks.map((step, index) => (
                  <div key={index} className="flex items-start gap-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-blue-300 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* Available Dates (for in-person courses) */}
        {course.course_type === 'in-person' && 'availableDates' in course && (
          <section className="section-padding bg-gray-50">
            <Container>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Available Dates</h2>
                <p className="text-xl text-gray-600">Choose your preferred training dates</p>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                {course.availableDates.map((date, index) => (
                  <button
                    key={index}
                    onClick={() => selectDate(date)}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      selectedDate === date
                        ? 'bg-pink-400 text-white'
                        : 'bg-white text-gray-700 hover:bg-pink-50 border border-gray-200'
                    }`}
                  >
                    {date}
                  </button>
                ))}
              </div>
            </Container>
          </section>
        )}

        {/* Important Information */}
        <section className="section-padding">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Important Information</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <Card className="text-center">
                <CardContent className="p-6">
                  <TypeIcon className="h-8 w-8 text-pink-400 mx-auto mb-4" />
                  <h3 className="font-bold mb-2">Format</h3>
                  <p className="text-gray-600 text-sm">{course.format}</p>
                  <p className="text-gray-600 text-sm">{course.location}</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <CreditCard className="h-8 w-8 text-pink-400 mx-auto mb-4" />
                  <h3 className="font-bold mb-2">Support</h3>
                  <p className="text-gray-600 text-sm">WhatsApp Support</p>
                  <p className="text-gray-600 text-sm">Email Support</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <MessageCircle className="h-8 w-8 text-pink-400 mx-auto mb-4" />
                  <h3 className="font-bold mb-2">Access</h3>
                  <p className="text-gray-600 text-sm">Web Platform</p>
                  <p className="text-gray-600 text-sm">Mobile BLOM Academy</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <Shield className="h-8 w-8 text-pink-400 mx-auto mb-4" />
                  <h3 className="font-bold mb-2">Investment</h3>
                  <p className="text-gray-600 text-sm">From {formatPrice(course.price)}</p>
                  <p className="text-gray-600 text-sm">Lifetime access included</p>
                </CardContent>
              </Card>
            </div>
          </Container>
        </section>

        {/* Booking Form */}
        {showBookingForm && (
          <section id="booking-form" className="section-padding bg-gradient-to-br from-pink-50 to-blue-50">
            <Container>
              <div className="max-w-2xl mx-auto">
                <Card>
                  <CardHeader className="text-center">
                    <h2 className="text-3xl font-bold mb-2">Complete Your Enrollment</h2>
                    <p className="text-gray-600">Secure your spot in this amazing course</p>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Selected Package Display */}
                      {selectedPackage && (
                        <div className="bg-pink-50 p-4 rounded-lg">
                          <h3 className="font-medium mb-2">Selected Package:</h3>
                          <p className="text-pink-600 font-bold">
                            {course.packages.find(p => p.id === selectedPackage)?.name} - 
                            {formatPrice(course.packages.find(p => p.id === selectedPackage)?.price || 0)}
                          </p>
                        </div>
                      )}

                      {/* Selected Date Display */}
                      {selectedDate && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h3 className="font-medium mb-2">Selected Date:</h3>
                          <p className="text-blue-600 font-bold">{selectedDate}</p>
                        </div>
                      )}

                      {/* Package Selection */}
                      {!selectedPackage && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Choose Package *
                          </label>
                          <select
                            value={selectedPackage}
                            onChange={(e) => setSelectedPackage(e.target.value)}
                            className="input-field"
                            required
                          >
                            <option value="">Select a package</option>
                            {course.packages.map((pkg) => (
                              <option key={pkg.id} value={pkg.id}>
                                {pkg.name} - {formatPrice(pkg.price)}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Date Selection for in-person courses */}
                      {course.course_type === 'in-person' && !selectedDate && 'availableDates' in course && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Choose Date *
                          </label>
                          <select
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="input-field"
                            required
                          >
                            <option value="">Select a date</option>
                            {course.availableDates.map((date, index) => (
                              <option key={index} value={date}>
                                {date}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Student Information */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`input-field ${formErrors.name ? 'border-red-500' : ''}`}
                            placeholder="Your full name"
                            required
                          />
                          {formErrors.name && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`input-field ${formErrors.email ? 'border-red-500' : ''}`}
                            placeholder="your@email.com"
                            required
                          />
                          {formErrors.email && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`input-field ${formErrors.phone ? 'border-red-500' : ''}`}
                          placeholder="+27 XX XXX XXXX"
                          required
                        />
                        {formErrors.phone && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                        )}
                      </div>

                      {/* Terms and Conditions */}
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          name="terms"
                          checked={formData.terms}
                          onChange={handleInputChange}
                          className="mt-1"
                          required
                        />
                        <label className="text-sm text-gray-600">
                          I agree to the terms and conditions and privacy policy. I understand the course requirements and refund policy.
                        </label>
                      </div>
                      {formErrors.terms && (
                        <p className="text-red-500 text-sm">{formErrors.terms}</p>
                      )}

                      {/* Security Indicators */}
                      <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Shield className="h-4 w-4 text-green-500" />
                          <span>Secure Payment</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>SSL Encrypted</span>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        loading={isSubmitting}
                        disabled={!selectedPackage || !formData.terms}
                      >
                        {isSubmitting ? 'Processing...' : 
                         `Complete Enrollment & Payment - ${formatPrice(course.packages.find(p => p.id === selectedPackage)?.price || course.price)}`
                        }
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </Container>
          </section>
        )}

        {/* FAQ Section */}
        <section className="section-padding bg-gray-50">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-gray-600">Get answers to common questions about this course</p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="space-y-4">
                {course.faqs.map((faq, index) => (
                  <Card key={index}>
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="font-semibold text-lg pr-4">{faq.question}</h3>
                      {expandedFaq === index ? (
                        <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    {expandedFaq === index && (
                      <div className="px-6 pb-6">
                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* Reviews Section */}
        {'reviews' in course && course.reviews && (
          <ReviewSection
            productName={course.title}
            productImage={course.image}
            productSlug={course.slug}
            averageRating={course.rating || 0}
            reviewCount={course.total_reviews || 0}
            reviews={course.reviews || []}
            onReviewSubmit={(reviewData) => {
              // In a real app, this would submit to your backend
              console.log('New course review submitted:', reviewData);
              // You could add a notification here if needed
            }}
          />
        )}

        {/* Mobile Sticky Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-lg text-pink-400">From {formatPrice(course.price)}</p>
                <p className="text-sm text-gray-600">{course.format} • {course.location}</p>
              </div>
              <Button 
                onClick={() => {
                  setShowBookingForm(true);
                  setTimeout(() => {
                    document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
              >
                Enroll Now
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};