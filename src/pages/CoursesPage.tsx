import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Calendar, Clock, MapPin, Monitor } from 'lucide-react';
import { Container } from '../components/layout/Container';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const CoursesPage: React.FC = () => {
  const courses = [
    {
      id: 1,
      title: 'Professional Acrylic Training',
      subtitle: '5-day hands-on training in Randfontein',
      price: 7200,
      pricePrefix: 'From',
      duration: '5 Days',
      type: 'in-person',
      image: 'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=800',
      link: '/courses/professional-acrylic-training',
      featured: true
    },
    {
      id: 2,
      title: 'Online Watercolour Workshop',
      subtitle: 'Soft, dreamy watercolour nail art from home',
      price: 480,
      duration: 'Self-Paced Online',
      type: 'online',
      image: 'https://images.pexels.com/photos/3997982/pexels-photo-3997982.jpeg?auto=compress&cs=tinysrgb&w=800',
      link: '/courses/online-watercolour-workshop',
      featured: true
    },
    {
      id: 3,
      title: 'Christmas Watercolor Workshop',
      subtitle: 'Festive holiday nail art, step-by-step',
      price: 450,
      originalPrice: 650,
      duration: 'Self-Paced Online',
      type: 'online',
      image: 'https://images.pexels.com/photos/3997969/pexels-photo-3997969.jpeg?auto=compress&cs=tinysrgb&w=800',
      link: '/courses/christmas-watercolor-workshop',
      featured: true,
      onSale: true
    }
  ];

  const featuredCourses = courses.filter(course => course.featured);
  const inPersonCourses = courses.filter(course => course.type === 'in-person');
  const onlineCourses = courses.filter(course => course.type === 'online');

  return (
    <div className="min-h-screen bg-white">
      <Header showMobileMenu={true} />

      <main className="bg-gray-50">
      <Container>
        {/* Hero Section */}
        <div className="py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Elevate Your Artistry. Grow Your Business.
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our expert-led workshops and courses, designed to give professional nail technicians the skills and confidence to succeed.
          </p>
        </div>

        {/* In-Person Training (Featured) */}
        <div className="py-16">
          <div className="text-center mb-12">
            <h2 className="uppercase text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-3">Our Training Programs</h2>
            <div className="h-1 w-24 bg-blue-200 rounded-full mx-auto mb-6"></div>
            <h3 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2">In-Person Training</h3>
            <div className="h-1 w-16 bg-pink-400 rounded-full mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {inPersonCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {course.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4">
                    {course.subtitle}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      {course.type === 'online' ? (
                        <Monitor className="w-4 h-4 mr-1" />
                      ) : (
                        <MapPin className="w-4 h-4 mr-1" />
                      )}
                      <span>{course.duration}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div className="text-lg font-bold text-gray-900">
                      {course.pricePrefix && (
                        <span className="text-sm font-normal text-gray-500 mr-1">
                          {course.pricePrefix}
                        </span>
                      )}
                      {course.onSale && course.originalPrice ? (
                        <div className="flex items-center gap-2">
                          <span>R{course.price.toLocaleString()}</span>
                          <span className="text-sm text-gray-500 line-through">
                            R{course.originalPrice.toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span>R{course.price.toLocaleString()}</span>
                      )}
                    </div>
                    
                    {course.onSale && (
                      <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
                        Sale
                      </span>
                    )}
                  </div>

                  <Button 
                    variant="primary" 
                    className="w-full"
                    onClick={() => window.location.href = course.link}
                  >
                    View Course
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Online Workshops */}
        <div className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-2">Online Workshops</h2>
            <div className="h-1 w-16 bg-pink-400 rounded-full mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {onlineCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4">{course.subtitle}</p>
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-lg font-bold text-gray-900">R{course.price.toLocaleString()}</div>
                    {course.onSale && (
                      <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">Sale</span>
                    )}
                  </div>
                  <Button 
                    variant="primary" 
                    className="w-full"
                    onClick={() => window.location.href = course.link}
                  >
                    View Course
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Why Train with BLOM (original style) */}
        <section className="why-bloom" aria-label="Why Train with BLOM">
          <div className="container">
            <h2 className="why-title">Why Train with BLOM</h2>

            <div className="why-grid">
              <div className="why-card">
                <div className="why-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <h3 className="why-heading">Expert-Led Training</h3>
                <p className="why-copy">Learn from industry professionals with years of experience in nail artistry and salon management.</p>
              </div>

              <div className="why-card">
                <div className="why-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <h3 className="why-heading">Proven Techniques</h3>
                <p className="why-copy">Master salon-grade methods that deliver consistent, professional results every time.</p>
              </div>

              <div className="why-card">
                <div className="why-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className="why-heading">Community Support</h3>
                <p className="why-copy">Join a network of passionate nail artists and get ongoing support throughout your journey.</p>
              </div>
            </div>
          </div>
        </section>
      </Container>
      </main>

      <Footer />
    </div>
  );
};

export default CoursesPage;