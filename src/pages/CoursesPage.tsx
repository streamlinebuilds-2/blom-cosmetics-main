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
            <h2 className="uppercase text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-3">Our Training Programs</h2>
            <div className="h-1 w-24 bg-blue-200 rounded-full mx-auto mb-6"></div>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">In-Person Training</h3>
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
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">Online Workshops</h2>
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

        {/* Additional Info Section */}
        <div className="py-16 bg-white rounded-lg">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Courses?</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Flexible Learning</h3>
              <p className="text-gray-600">
                Choose from in-person intensive courses or self-paced online workshops that fit your schedule.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Monitor className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Instruction</h3>
              <p className="text-gray-600">
                Learn from certified nail artists with years of professional experience and industry recognition.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Lifetime Access</h3>
              <p className="text-gray-600">
                Get lifetime access to course materials and ongoing support from our community of artists.
              </p>
            </div>
          </div>
        </div>
      </Container>
      </main>

      <Footer />
    </div>
  );
};

export default CoursesPage;