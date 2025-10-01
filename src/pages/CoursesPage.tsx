import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Clock, MapPin, DollarSign } from 'lucide-react';

const CoursesPage: React.FC = () => {
  const inPersonCourses = [
    {
      id: 1,
      slug: 'professional-acrylic-training',
      title: 'Professional Acrylic Training',
      description: 'Hands-on, career-start acrylic training in Randfontein. Master prep, application, structure & finishing in 5 days.',
      image: '/professional-acrylic-training-hero.webp',
      duration: '5 Days',
      location: 'Randfontein',
      priceLabel: 'From R7,200'
    }
  ];

  const onlineCourses = [
    {
      id: 2,
      slug: 'online-watercolour-workshop',
      title: 'Online Watercolour Workshop',
      description: 'Learn how to create soft, dreamy watercolour designs from the comfort of your home with step-by-step videos and detailed guidance. Let your creativity bloom with BLOM.',
      image: '/online-watercolor-card.webp',
      duration: 'Self-Paced',
      location: 'Online',
      price: 480,
      onSale: false
    },
    {
      id: 3,
      slug: 'christmas-watercolor-workshop',
      title: 'Christmas Watercolor Workshop',
      description: 'Paint festive watercolor nail art for the holidays! Learn Christmas tree designs, snowflakes, and winter wonderland techniques in this special seasonal workshop.',
      image: '/christmas-watercolor-card.webp',
      duration: 'Self-Paced',
      location: 'Online',
      price: 450,
      comparePrice: 650,
      onSale: true,
      discount: 31
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header showMobileMenu={true} />

      <main>
        <Container>
          {/* In-Person Training */}
          <div className="py-16">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-2">In-Person Training</h2>
              <div className="h-1 w-16 bg-pink-400 rounded-full mx-auto"></div>
            </div>

            <div className="max-w-2xl mx-auto">
              {inPersonCourses.map((course) => (
                <Card key={course.id} className="group overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  {/* Image with Shimmer */}
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                      <div className="shimmer-effect"></div>
                    </div>
                  </div>

                  <CardContent className="p-8">
                    <h3 className="text-3xl font-bold text-slate-900 mb-4">{course.title}</h3>
                    <p className="text-slate-600 mb-6 leading-relaxed">{course.description}</p>

                    <div className="space-y-3 mb-8">
                      <div className="flex items-center gap-3 text-slate-700">
                        <Clock className="h-5 w-5 text-pink-400" />
                        <span className="font-medium">{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-700">
                        <MapPin className="h-5 w-5 text-pink-400" />
                        <span className="font-medium">{course.location}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-700">
                        <DollarSign className="h-5 w-5 text-pink-400" />
                        <span className="font-bold text-2xl text-pink-500">{course.priceLabel}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => window.location.href = `/courses/${course.slug}`}
                      className="w-full btn btn-primary btn-lg"
                    >
                      SEE MORE DETAILS
                    </button>
                  </CardContent>
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

            <div className="grid md:grid-cols-2 gap-8">
              {onlineCourses.map((course) => (
                <Card key={course.id} className="group overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  {/* Image with Shimmer */}
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                      <div className="shimmer-effect"></div>
                    </div>
                    {/* Sale Badge */}
                    {course.onSale && (
                      <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase shadow-lg">
                        SALE
                      </div>
                    )}
                  </div>

                  <CardContent className="p-8">
                    <h3 className="text-3xl font-bold text-slate-900 mb-4">{course.title}</h3>
                    <p className="text-slate-600 text-base mb-8 leading-relaxed">{course.description}</p>

                    <div className="space-y-3 mb-8">
                      <div className="flex items-center gap-3 text-slate-700">
                        <Clock className="h-5 w-5 text-pink-400" />
                        <span className="font-medium">{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-700">
                        <MapPin className="h-5 w-5 text-pink-400" />
                        <span className="font-medium">{course.location}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-pink-400" />
                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-3xl text-pink-500">R{course.price}</span>
                          {course.comparePrice && (
                            <>
                              <span className="text-lg text-slate-400 line-through">R{course.comparePrice}</span>
                              <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold">
                                {course.discount}% OFF
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => window.location.href = `/courses/${course.slug}`}
                      className="w-full btn btn-primary btn-lg"
                    >
                      SEE MORE DETAILS
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

        {/* Why Train with BLOM (card style) */}
        <section className="why-bloom py-16" aria-label="Why Train with BLOM">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Why Train with BLOM</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
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
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CoursesPage;