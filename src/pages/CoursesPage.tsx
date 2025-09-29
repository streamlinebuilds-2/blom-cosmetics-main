import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { queries, Course } from '../lib/supabase';
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
  TrendingUp,
  Target,
  Zap
} from 'lucide-react';

export const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<'all' | 'online' | 'in-person' | 'hybrid'>('all');
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  const trainingBenefits = [
    {
      icon: Award,
      title: 'Professional Certification',
      description: 'Earn industry-recognized certifications that enhance your credibility and open new career opportunities.'
    },
    {
      icon: TrendingUp,
      title: 'Increase Your Income',
      description: 'Skilled nail technicians can charge premium rates. Our training helps you command higher prices for your services.'
    },
    {
      icon: Target,
      title: 'Master Advanced Techniques',
      description: 'Learn cutting-edge nail art techniques and stay ahead of industry trends with expert instruction.'
    },
    {
      icon: Users,
      title: 'Join Our Community',
      description: 'Connect with fellow professionals, share experiences, and build lasting relationships in the industry.'
    },
    {
      icon: Zap,
      title: 'Hands-On Learning',
      description: 'Practice with premium BLOM products and receive personalized feedback from experienced instructors.'
    },
    {
      icon: CheckCircle,
      title: 'Lifetime Support',
      description: 'Get ongoing support and access to updated course materials as techniques and products evolve.'
    }
  ];

  // Fallback courses data
  const fallbackCourses = [
    {
      id: '1',
      title: 'Online Watercolour Workshop',
      slug: 'online-watercolour-workshop',
      short_description: 'Master the art of watercolor nail techniques from the comfort of your home',
      description: 'Learn the beautiful art of watercolor nail design in this comprehensive online workshop. Perfect for beginners and intermediate artists looking to add this stunning technique to their repertoire.',
      price: 899,
      duration_hours: 8,
      max_students: 50,
      instructor_name: 'Sarah Mitchell',
      instructor_bio: 'Professional nail artist with 10+ years experience',
      featured_image: 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
      course_type: 'online' as const,
      difficulty_level: 'beginner' as const,
      is_active: true,
      is_featured: true,
      start_date: '2024-02-15T10:00:00Z',
      end_date: '2024-02-15T18:00:00Z',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      title: 'Professional Acrylic Training',
      slug: 'professional-acrylic-training',
      short_description: 'Comprehensive in-person acrylic nail system training for professionals',
      description: 'Master the complete acrylic nail system with hands-on training from industry experts. This intensive course covers everything from basic application to advanced sculpting techniques.',
      price: 2499,
      duration_hours: 24,
      max_students: 12,
      instructor_name: 'Michelle Adams',
      instructor_bio: 'Master nail technician and BLOM certified trainer',
      featured_image: 'https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
      course_type: 'in-person' as const,
      difficulty_level: 'intermediate' as const,
      is_active: true,
      is_featured: true,
      start_date: '2024-03-01T09:00:00Z',
      end_date: '2024-03-03T17:00:00Z',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      title: 'Christmas Watercolor Workshop',
      slug: 'christmas-watercolor-workshop',
      short_description: 'Festive watercolor nail art perfect for the holiday season',
      description: 'Create stunning Christmas-themed watercolor nail designs. Learn seasonal color palettes, festive patterns, and holiday-inspired techniques.',
      price: 599,
      duration_hours: 4,
      max_students: 30,
      instructor_name: 'Jessica Chen',
      instructor_bio: 'Seasonal nail art specialist',
      featured_image: 'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
      course_type: 'online' as const,
      difficulty_level: 'beginner' as const,
      is_active: true,
      is_featured: false,
      start_date: '2024-12-10T14:00:00Z',
      end_date: '2024-12-10T18:00:00Z',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '4',
      title: 'Advanced Gel System Mastery',
      slug: 'advanced-gel-system-mastery',
      short_description: 'Master advanced gel techniques and troubleshooting',
      description: 'Take your gel nail skills to the next level with advanced techniques, problem-solving, and professional tips for perfect results every time.',
      price: 1299,
      duration_hours: 12,
      max_students: 20,
      instructor_name: 'Sarah Mitchell',
      instructor_bio: 'Professional nail artist with 10+ years experience',
      featured_image: 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
      course_type: 'hybrid' as const,
      difficulty_level: 'advanced' as const,
      is_active: true,
      is_featured: true,
      start_date: '2024-04-15T10:00:00Z',
      end_date: '2024-04-16T16:00:00Z',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await queries.getCourses();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
        // Use fallback data
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = fallbackCourses.filter(course => {
    const matchesType = selectedType === 'all' || course.course_type === selectedType;
    const matchesLevel = selectedLevel === 'all' || course.difficulty_level === selectedLevel;
    return matchesType && matchesLevel;
  });

  const featuredCourses = filteredCourses.filter(course => course.is_featured);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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

  return (
    <div className="min-h-screen bg-white">
      <Header showMobileMenu={false} />

      <main>
        {/* Courses Hero Section */}
        <section className="bg-gradient-to-br from-pink-50 to-blue-50 section-padding">
          <Container>
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl font-bold mb-6">Professional Nail Training</h1>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                Elevate your nail artistry with our comprehensive training programs. 
                Learn from industry experts, master advanced techniques, and earn 
                professional certifications that set you apart.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg">Browse All Courses</Button>
                <Button size="lg" variant="outline">Download Course Catalog</Button>
              </div>
            </div>

            {/* Training Program Overview */}
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-blue-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Online Courses</h3>
                <p className="text-gray-600">Learn at your own pace with our interactive online training programs</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-blue-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">In-Person Training</h3>
                <p className="text-gray-600">Hands-on learning with direct instructor feedback and support</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-blue-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Certification</h3>
                <p className="text-gray-600">Earn industry-recognized certificates upon course completion</p>
              </div>
            </div>
          </Container>
        </section>

        {/* Featured Courses */}
        <section className="section-padding">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Featured Training Programs</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Our most popular courses designed to take your skills to the next level
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCourses.map((course) => {
                const TypeIcon = getCourseTypeIcon(course.course_type);
                return (
                  <Card key={course.id} className="group cursor-pointer overflow-hidden">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={course.featured_image || 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty_level)}`}>
                          {course.difficulty_level}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-white text-gray-700">
                          <TypeIcon className="h-3 w-3 inline mr-1" />
                          {course.course_type}
                        </span>
                      </div>
                    </div>
                    <CardContent>
                      <h3 className="font-bold text-xl mb-2">{course.title}</h3>
                      <p className="text-gray-600 mb-4">{course.short_description}</p>
                      
                      <div className="space-y-2 mb-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{course.duration_hours} hours</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>Max {course.max_students} students</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(course.start_date!)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-pink-400">R{course.price}</span>
                        <Button size="sm">Enroll Now</Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </Container>
        </section>

        {/* Why Train Section */}
        <section id="why-train" className="section-padding bg-gray-50">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Why Train with BLOM?</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Join thousands of professionals who have transformed their careers with our 
                comprehensive training programs and ongoing support system.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trainingBenefits.map((benefit, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-blue-300 rounded-lg flex items-center justify-center mb-4">
                    <benefit.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>

            {/* Success Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-16 text-center">
              <div>
                <div className="text-4xl font-bold text-pink-400 mb-2">500+</div>
                <div className="text-gray-600">Certified Professionals</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-pink-400 mb-2">95%</div>
                <div className="text-gray-600">Course Completion Rate</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-pink-400 mb-2">4.9/5</div>
                <div className="text-gray-600">Average Rating</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-pink-400 mb-2">24/7</div>
                <div className="text-gray-600">Student Support</div>
              </div>
            </div>
          </Container>
        </section>

        {/* All Courses Listing */}
        <section className="section-padding">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">All Training Programs</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Choose from our complete range of professional nail training courses
              </p>
            </div>

            {/* Course Filters */}
            <div className="flex flex-wrap gap-4 justify-center mb-8">
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedType('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedType === 'all'
                      ? 'bg-pink-400 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All Types
                </button>
                <button
                  onClick={() => setSelectedType('online')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedType === 'online'
                      ? 'bg-pink-400 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Online
                </button>
                <button
                  onClick={() => setSelectedType('in-person')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedType === 'in-person'
                      ? 'bg-pink-400 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  In-Person
                </button>
                <button
                  onClick={() => setSelectedType('hybrid')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedType === 'hybrid'
                      ? 'bg-pink-400 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Hybrid
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedLevel('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedLevel === 'all'
                      ? 'bg-blue-400 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All Levels
                </button>
                <button
                  onClick={() => setSelectedLevel('beginner')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedLevel === 'beginner'
                      ? 'bg-blue-400 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Beginner
                </button>
                <button
                  onClick={() => setSelectedLevel('intermediate')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedLevel === 'intermediate'
                      ? 'bg-blue-400 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Intermediate
                </button>
                <button
                  onClick={() => setSelectedLevel('advanced')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedLevel === 'advanced'
                      ? 'bg-blue-400 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Advanced
                </button>
              </div>
            </div>

            {/* Course Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              {filteredCourses.map((course) => {
                const TypeIcon = getCourseTypeIcon(course.course_type);
                return (
                  <Card key={course.id} className="group cursor-pointer">
                    <div className="flex gap-6 p-6">
                      <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg">
                        <img
                          src={course.featured_image || 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(course.difficulty_level)}`}>
                            {course.difficulty_level}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <TypeIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-500 capitalize">{course.course_type}</span>
                        </div>
                        <h3 className="font-bold text-xl mb-2">{course.title}</h3>
                        <p className="text-gray-600 mb-4">{course.short_description}</p>
                        
                        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{course.duration_hours}h</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>Max {course.max_students}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(course.start_date!)}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-pink-400">R{course.price}</span>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Learn More</Button>
                            <Button size="sm">Enroll Now</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
};