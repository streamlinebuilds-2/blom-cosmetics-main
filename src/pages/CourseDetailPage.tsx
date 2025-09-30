import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  Clock, 
  Users, 
  Award, 
  CheckCircle, 
  Star, 
  Play, 
  Download,
  MessageCircle,
  Globe,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  Monitor,
  User,
  Mail,
  Phone,
  Gift,
  Sparkles
} from 'lucide-react';

interface CourseDetailPageProps {
  courseSlug?: string;
}

export const CourseDetailPage: React.FC<CourseDetailPageProps> = ({ courseSlug = 'christmas-watercolor-workshop' }) => {
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [expandedSection, setExpandedSection] = useState<string | null>('curriculum');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: 'beginner'
  });

  // Course data based on slug
  const courseData = {
    'christmas-watercolor-workshop': {
      id: 'christmas-watercolor-workshop',
      title: 'Christmas Watercolor Workshop',
      subtitle: 'Paint festive nail art for the holidays',
      description: 'Create magical holiday nail designs with our beginner-friendly Christmas watercolor workshop. Learn festive techniques perfect for the holiday season.',
      price: 450,
      originalPrice: 650,
      saleEndDate: '2024-10-31',
      duration: 'Self-Paced',
      format: 'Online',
      level: 'Beginner',
      students: 1200,
      rating: 4.9,
      reviews: 89,
      image: 'https://images.pexels.com/photos/3997969/pexels-photo-3997969.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
      instructor: {
        name: 'Avané Crous',
        title: 'Festive Nail Art Specialist',
        bio: 'Avané is a certified nail artist specializing in watercolor techniques and festive designs. With over 8 years of experience, she has helped thousands of students create beautiful holiday nail art.',
        image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
        credentials: ['Certified Nail Artist', 'Watercolor Specialist', 'Holiday Design Expert']
      },
      curriculum: [
        {
          title: 'Welcome & Materials',
          duration: 'Self-paced',
          lessons: ['Course introduction', 'Materials overview', 'Workspace setup'],
          description: 'Get started with your festive nail art journey'
        },
        {
          title: 'Festive Watercolour Basics',
          duration: 'Self-paced',
          lessons: ['Color theory for holidays', 'Brush techniques', 'Water control'],
          description: 'Master the fundamentals of watercolor nail art'
        },
        {
          title: 'Tutorials (Tree, Snowflakes, Ornaments)',
          duration: 'Self-paced',
          lessons: ['Christmas tree designs', 'Snowflake patterns', 'Ornament effects', 'Holly and berries'],
          description: 'Step-by-step festive design tutorials'
        },
        {
          title: 'Sealing & Certification',
          duration: 'Self-paced',
          lessons: ['Proper sealing techniques', 'Photo submission', 'Certificate process'],
          description: 'Complete your festive nail art certification'
        }
      ],
      packages: [
        {
          id: 'workshop',
          name: 'Christmas Workshop',
          price: 450,
          originalPrice: 650,
          popular: true,
          features: [
            'All festive tutorials',
            'BLOM Academy app access',
            'Materials list included',
            'Certificate with festive design',
            'WhatsApp support group',
            'Lifetime access'
          ]
        }
      ],
      materials: [
        'Fine Line Brush (size 0 or 00)',
        'Practice Tips (clear or natural)',
        'Mixing Palette',
        'Water containers',
        'Paper towels',
        'Watercolor paints (red, green, gold, silver)',
        'Base and top coat',
        'Holiday spirit!'
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
          description: 'Gather your supplies using our materials list'
        },
        {
          step: 4,
          title: 'Learn',
          description: 'Follow along with festive tutorials at your own pace'
        },
        {
          step: 5,
          title: 'Certify',
          description: 'Submit photos and receive your festive certificate'
        }
      ],
      importantInfo: [
        {
          title: 'Format',
          value: 'Self-paced online learning'
        },
        {
          title: 'Certification',
          value: 'Submit photos → receive certificate with festive design'
        },
        {
          title: 'Support',
          value: 'WhatsApp + Email support'
        },
        {
          title: 'Access',
          value: 'Web + Mobile BLOM Academy'
        },
        {
          title: 'Investment',
          value: 'R450 (Save R200!)'
        }
      ]
    },
    'online-watercolour-workshop': {
      id: 'online-watercolour-workshop',
      title: 'Online Watercolour Workshop',
      subtitle: 'Learn dreamy watercolour nail designs from home',
      description: 'Master the art of watercolour nail designs with step-by-step online training, lifetime access, and optional kit.',
      price: 480,
      duration: 'Self-Paced',
      format: 'Online',
      level: 'Intermediate',
      students: 850,
      rating: 4.8,
      reviews: 67,
      image: 'https://images.pexels.com/photos/3997982/pexels-photo-3997982.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
      instructor: {
        name: 'Avané Crous',
        title: 'Watercolour Specialist',
        bio: 'Avané is a master watercolour nail artist with over 10 years of experience. She has developed unique techniques that create stunning, dreamy effects.',
        image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
        credentials: ['Master Watercolour Artist', 'Online Education Specialist', 'BLOM Certified Trainer']
      },
      curriculum: [
        {
          title: 'Fundamentals',
          duration: 'Self-paced',
          lessons: ['Watercolour basics', 'Color theory', 'Brush selection'],
          description: 'Build your foundation in watercolour techniques'
        },
        {
          title: 'Basic Techniques',
          duration: 'Self-paced',
          lessons: ['Wet-on-wet', 'Gradient effects', 'Blending methods'],
          description: 'Learn essential watercolour application methods'
        },
        {
          title: 'Advanced Designs',
          duration: 'Self-paced',
          lessons: ['Complex patterns', 'Layering techniques', 'Special effects'],
          description: 'Create sophisticated watercolour nail art'
        },
        {
          title: 'Professional Application',
          duration: 'Self-paced',
          lessons: ['Client consultation', 'Pricing strategies', 'Portfolio building'],
          description: 'Turn your skills into a professional service'
        }
      ],
      packages: [
        {
          id: 'standard',
          name: 'Standard',
          price: 480,
          features: [
            'Lifetime access to course',
            'Complete materials list',
            'Certificate of completion',
            'WhatsApp support group'
          ]
        },
        {
          id: 'premium',
          name: 'Premium',
          price: 680,
          popular: true,
          features: [
            'Everything in Standard',
            'Watercolour starter kit included',
            'Priority support',
            '1-on-1 feedback session'
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
          description: 'Get instant access to course materials'
        },
        {
          step: 3,
          title: 'Get Materials',
          description: 'Receive your kit or gather supplies'
        },
        {
          step: 4,
          title: 'Learn',
          description: 'Follow step-by-step video tutorials'
        },
        {
          step: 5,
          title: 'Certify',
          description: 'Complete assignments and get certified'
        }
      ],
      importantInfo: [
        {
          title: 'Format',
          value: 'Self-paced online course'
        },
        {
          title: 'Support',
          value: 'WhatsApp + Email support'
        },
        {
          title: 'Access',
          value: 'Web + Mobile BLOM Academy'
        },
        {
          title: 'Investment',
          value: 'From R480'
        }
      ]
    }
  };

  const course = courseData[courseSlug as keyof typeof courseData] || courseData['christmas-watercolor-workshop'];

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle enrollment
    console.log('Enrollment submitted:', { selectedPackage, formData });
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const formatPrice = (price: number) => `R${price}`;

  const calculateSavings = (original: number, current: number) => original - current;

  const reviews = [
    {
      id: 1,
      name: 'Sarah M.',
      rating: 5,
      comment: 'The Christmas designs are absolutely magical! Perfect for the holiday season.',
      date: '2024-01-15',
      verified: true
    },
    {
      id: 2,
      name: 'Jessica L.',
      rating: 5,
      comment: 'Avané\'s festive tutorials made my holiday nails the talk of every party!',
      date: '2024-01-10',
      verified: true
    },
    {
      id: 3,
      name: 'Michelle R.',
      rating: 4,
      comment: 'Beautiful holiday techniques. The snowflake tutorial is my favorite!',
      date: '2024-01-05',
      verified: true
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header showMobileMenu={false} />

      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-pink-50 to-blue-50 section-padding overflow-hidden">
          <Container>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                {/* Course Pills */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {course.format}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {course.duration}
                  </span>
                  {course.originalPrice && (
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium flex items-center gap-1">
                      <Gift className="h-3 w-3" />
                      Save R{calculateSavings(course.originalPrice, course.price)}
                    </span>
                  )}
                </div>

                <h1 className="text-4xl md:text-5xl font-bold mb-4">{course.title}</h1>
                <p className="text-xl text-gray-600 mb-6">{course.subtitle}</p>
                <p className="text-gray-600 leading-relaxed mb-8">{course.description}</p>

                {/* Pricing */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-pink-400">{formatPrice(course.price)}</span>
                    {course.originalPrice && (
                      <span className="text-xl text-gray-400 line-through">{formatPrice(course.originalPrice)}</span>
                    )}
                  </div>
                  {course.saleEndDate && (
                    <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                      Sale ends Oct 31
                    </div>
                  )}
                </div>

                {/* Course Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{course.students}</div>
                    <div className="text-gray-600 text-sm">Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{course.rating}</div>
                    <div className="text-gray-600 text-sm">Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{course.reviews}</div>
                    <div className="text-gray-600 text-sm">Reviews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">∞</div>
                    <div className="text-gray-600 text-sm">Access</div>
                  </div>
                </div>

                <Button size="lg" className="w-full md:w-auto">
                  Complete Enrollment & Payment - {formatPrice(course.price)}
                </Button>
              </div>

              <div className="relative">
                <img
                  src={course.image}
                  alt={course.title}
                  className="rounded-2xl shadow-2xl w-full"
                />
                {course.originalPrice && (
                  <div className="absolute -top-4 -right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                    Save R{calculateSavings(course.originalPrice, course.price)}!
                  </div>
                )}
              </div>
            </div>
          </Container>
        </section>

        {/* Instructor Section */}
        <section className="section-padding">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Meet Your Instructor</h2>
              
              <Card className="overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/3">
                    <img
                      src={course.instructor.image}
                      alt={course.instructor.name}
                      className="w-full h-64 md:h-full object-cover"
                    />
                  </div>
                  <div className="md:w-2/3 p-8">
                    <h3 className="text-2xl font-bold mb-2">{course.instructor.name}</h3>
                    <p className="text-pink-400 font-medium mb-4">{course.instructor.title}</p>
                    <p className="text-gray-600 leading-relaxed mb-6">{course.instructor.bio}</p>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold">Credentials:</h4>
                      {course.instructor.credentials.map((credential, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{credential}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </Container>
        </section>

        {/* Course Content Sections */}
        <section className="section-padding bg-gray-50">
          <Container>
            <div className="max-w-4xl mx-auto">
              <div className="space-y-4">
                {/* Curriculum */}
                <Card>
                  <button
                    onClick={() => toggleSection('curriculum')}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Play className="h-5 w-5 text-pink-400" />
                      <h3 className="font-semibold text-lg">Course Curriculum</h3>
                    </div>
                    {expandedSection === 'curriculum' ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {expandedSection === 'curriculum' && (
                    <div className="px-6 pb-6">
                      <div className="space-y-4">
                        {course.curriculum.map((module, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{module.title}</h4>
                              <span className="text-sm text-gray-500">{module.duration}</span>
                            </div>
                            <p className="text-gray-600 text-sm mb-3">{module.description}</p>
                            <ul className="space-y-1">
                              {module.lessons.map((lesson, lessonIndex) => (
                                <li key={lessonIndex} className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  <span>{lesson}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>

                {/* Materials List */}
                {course.materials && (
                  <Card>
                    <button
                      onClick={() => toggleSection('materials')}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Download className="h-5 w-5 text-pink-400" />
                        <h3 className="font-semibold text-lg">Materials List</h3>
                      </div>
                      {expandedSection === 'materials' ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    {expandedSection === 'materials' && (
                      <div className="px-6 pb-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          {course.materials.map((material, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span className="text-sm">{material}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                )}

                {/* How It Works */}
                <Card>
                  <button
                    onClick={() => toggleSection('how-it-works')}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-5 w-5 text-pink-400" />
                      <h3 className="font-semibold text-lg">How It Works</h3>
                    </div>
                    {expandedSection === 'how-it-works' ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {expandedSection === 'how-it-works' && (
                    <div className="px-6 pb-6">
                      <div className="grid md:grid-cols-5 gap-4">
                        {course.howItWorks.map((step, index) => (
                          <div key={index} className="text-center">
                            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <span className="font-bold text-pink-600">{step.step}</span>
                            </div>
                            <h4 className="font-medium mb-2">{step.title}</h4>
                            <p className="text-sm text-gray-600">{step.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>

                {/* Important Information */}
                <Card>
                  <button
                    onClick={() => toggleSection('important-info')}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-pink-400" />
                      <h3 className="font-semibold text-lg">Important Information</h3>
                    </div>
                    {expandedSection === 'important-info' ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {expandedSection === 'important-info' && (
                    <div className="px-6 pb-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        {course.importantInfo.map((info, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium">{info.title}:</span>
                            <span className="text-gray-600">{info.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </Container>
        </section>

        {/* Packages Section */}
        <section className="section-padding">
          <Container>
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Choose Your Package</h2>
                <p className="text-xl text-gray-600">
                  Select the perfect option for your learning journey
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {course.packages.map((pkg) => (
                  <Card key={pkg.id} className={`relative overflow-hidden ${selectedPackage === pkg.id ? 'ring-2 ring-pink-400' : ''}`}>
                    {pkg.popular && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-pink-400 text-white px-4 py-1 rounded-b-lg text-sm font-medium">
                        MOST POPULAR
                      </div>
                    )}
                    <CardContent className="p-8 pt-12">
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <span className="text-4xl font-bold text-pink-400">{formatPrice(pkg.price)}</span>
                          {pkg.originalPrice && (
                            <span className="text-xl text-gray-400 line-through">{formatPrice(pkg.originalPrice)}</span>
                          )}
                        </div>
                      </div>

                      <ul className="space-y-3 mb-8">
                        {pkg.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        variant={selectedPackage === pkg.id ? 'primary' : 'outline'}
                        className="w-full"
                        onClick={() => handlePackageSelect(pkg.id)}
                      >
                        Choose {pkg.name}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* Reviews Section */}
        <section className="section-padding bg-gray-50">
          <Container>
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Student Reviews</h2>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="font-medium">{course.rating} out of 5</span>
                  <span className="text-gray-500">({course.reviews} reviews)</span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-600 mb-4">"{review.comment}"</p>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{review.name}</span>
                        {review.verified && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            Verified
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* Enrollment Form */}
        <section className="section-padding">
          <Container>
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <h2 className="text-2xl font-bold text-center">Complete Your Enrollment</h2>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="input-field"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="input-field"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="input-field"
                          placeholder="+27 XX XXX XXXX"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Experience Level
                        </label>
                        <select
                          value={formData.experience}
                          onChange={(e) => setFormData({...formData, experience: e.target.value})}
                          className="input-field"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                    </div>

                    <Button type="submit" size="lg" className="w-full">
                      Complete Enrollment & Payment - {formatPrice(course.price)}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </Container>
        </section>

        {/* Mobile Sticky Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-pink-400">{formatPrice(course.price)}</span>
                  {course.originalPrice && (
                    <span className="text-lg text-gray-400 line-through">{formatPrice(course.originalPrice)}</span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{course.title}</p>
              </div>
            </div>
            <Button className="w-full" size="lg">
              Complete Enrollment & Payment
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};