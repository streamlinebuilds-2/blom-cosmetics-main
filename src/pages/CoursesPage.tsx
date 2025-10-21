import React, { useEffect, useRef } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Clock, MapPin, DollarSign, Star, Activity, Users } from 'lucide-react';

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

  // Intersection Observer for mobile shimmer effect
  useEffect(() => {
    const observerOptions = {
      threshold: 0.5,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const shimmerElement = entry.target.querySelector('.shimmer');
          if (shimmerElement && !shimmerElement.classList.contains('shimmer-on-scroll')) {
            // Make container visible first
            const shimmerContainer = entry.target.querySelector('.absolute.inset-0');
            if (shimmerContainer) {
              shimmerContainer.style.opacity = '1';
              shimmerContainer.style.pointerEvents = 'none';
            }
            
            shimmerElement.classList.add('shimmer-on-scroll');
            // Remove class after animation to allow re-triggering
            setTimeout(() => {
              shimmerElement.classList.remove('shimmer-on-scroll');
              if (shimmerContainer) {
                shimmerContainer.style.opacity = '0';
              }
            }, 3000);
          }
        } else {
          // When element goes out of view, reset for re-triggering
          const shimmerElement = entry.target.querySelector('.shimmer');
          if (shimmerElement) {
            shimmerElement.classList.remove('shimmer-on-scroll');
            const shimmerContainer = entry.target.querySelector('.absolute.inset-0');
            if (shimmerContainer) {
              shimmerContainer.style.opacity = '0';
            }
          }
        }
      });
    }, observerOptions);

    // Observe all course cards
    const courseCards = document.querySelectorAll('.course-card');
    courseCards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header showMobileMenu={true} />

      <main className="flex-1">
        <Container>
          {/* In-Person Training */}
          <div id="in-person-training" className="py-16">
            <div className="text-center mb-12">
              <h2 className="heading-with-stripe">In-Person Training</h2>
            </div>

            <div className="flex justify-center">
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
                {inPersonCourses.map((course) => (
                <Card key={course.id} className="course-card group overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                  {/* Image with Shimmer */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="shimmer"></div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{course.title}</h3>
                    <p className="text-gray-600 mb-6 text-sm leading-relaxed">{course.description}</p>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-gray-700 text-sm">
                        <Clock className="h-4 w-4 text-pink-500" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 text-sm">
                        <MapPin className="h-4 w-4 text-pink-500" />
                        <span>{course.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 text-sm">
                        <DollarSign className="h-4 w-4 text-pink-500" />
                        <span className="font-semibold">{course.priceLabel}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => window.location.href = `/courses/${course.slug}`}
                      className="w-full bg-pink-400 hover:bg-pink-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                    >
                      SEE MORE DETAILS
                    </button>
                  </CardContent>
                </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Online Workshops */}
          <div id="online-workshops" className="py-16">
            <div className="text-center mb-12">
              <h2 className="heading-with-stripe">Online Workshops</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {onlineCourses.map((course) => (
                <Card key={course.id} className="course-card group overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                  {/* Image with Shimmer */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="shimmer"></div>
                    </div>
                    {/* Sale Badge */}
                    {course.onSale && (
                      <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase shadow-lg">
                        SALE
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{course.title}</h3>
                    <p className="text-gray-600 mb-6 text-sm leading-relaxed">{course.description}</p>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-gray-700 text-sm">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 text-sm">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <span>{course.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 text-sm">
                        <DollarSign className="h-4 w-4 text-blue-500" />
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg text-pink-500">R{course.price}</span>
                          {course.comparePrice && (
                            <>
                              <span className="text-sm text-gray-400 line-through">R{course.comparePrice}</span>
                              <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-bold">
                                {course.discount}% OFF
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => window.location.href = `/courses/${course.slug}`}
                      className="w-full bg-pink-400 hover:bg-pink-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                    >
                      SEE MORE DETAILS
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </Container>

        {/* Why Train with BLOM (card style) */}
        <section className="why-bloom py-16" aria-label="Why Train with BLOM">
          <Container>
            <div className="text-center mb-12">
              <h2 className="heading-with-stripe">Why Train with BLOM</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="why-card">
                <div className="why-icon">
                  <Star width="32" height="32" strokeWidth="2" />
                </div>
                <h3 className="why-heading">Expert-Led Training</h3>
                <p className="why-copy">Learn from industry professionals with years of experience in nail artistry and salon management.</p>
              </div>

              <div className="why-card">
                <div className="why-icon">
                  <Activity width="32" height="32" strokeWidth="2" />
                </div>
                <h3 className="why-heading">Proven Techniques</h3>
                <p className="why-copy">Master salon-grade methods that deliver consistent, professional results every time.</p>
              </div>

              <div className="why-card">
                <div className="why-icon">
                  <Users width="32" height="32" strokeWidth="2" />
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