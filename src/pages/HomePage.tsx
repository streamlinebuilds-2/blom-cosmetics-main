import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { HeroSlider } from '../components/sections/HeroSlider';
import { FeaturedProducts } from '../components/sections/FeaturedProducts';
import { Container } from '../components/layout/Container';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Star, Award, Users, Sparkles } from 'lucide-react';

export const HomePage: React.FC = () => {

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Mitchell',
      role: 'Professional Nail Technician',
      content: 'BLOM products have transformed my nail art business. The quality is unmatched and my clients love the results.',
      rating: 5,
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      id: 2,
      name: 'Jessica Chen',
      role: 'Salon Owner',
      content: 'The training courses are exceptional. My entire team is now certified and our service quality has improved dramatically.',
      rating: 5,
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      id: 3,
      name: 'Michelle Adams',
      role: 'Freelance Artist',
      content: 'From beginner to pro - BLOM\'s educational content and premium products made my journey seamless.',
      rating: 5,
      image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    }
  ];

  const stats: any[] = [];

  return (
    <div className="min-h-screen bg-white">
      <Header showMobileMenu={true} />

      <main>
        {/* Hero Slider */}
        <HeroSlider />

        {/* Our Vision Section */}
        <section id="our-vision" className="section-padding bg-gradient-to-br from-pink-50 to-blue-50">
          <Container>
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-6">Our Vision</h2>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                At BLOM Cosmetics, we believe every nail technician deserves access to premium products
                and world-class education. Our mission is to empower beauty professionals with the tools
                and knowledge needed to create stunning nail art that inspires confidence.
              </p>
              {/* Stats removed as requested */}
            </div>
          </Container>
        </section>

        {/* Featured Products */}
        <FeaturedProducts />

        {/* Master Your Craft Section */}
        <section id="master-craft" className="section-padding bg-gray-50">
          <Container>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6">Master Your Craft</h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Take your nail artistry to the next level with our comprehensive training programs.
                  From beginner basics to advanced techniques, our expert instructors will guide you
                  every step of the way.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="h-6 w-6 text-pink-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Professional Certification</h4>
                      <p className="text-gray-600">Earn industry-recognized certifications that enhance your credibility and career prospects.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Expert Instructors</h4>
                      <p className="text-gray-600">Learn from industry professionals with years of experience and proven track records.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-6 w-6 text-pink-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Hands-On Learning</h4>
                      <p className="text-gray-600">Practice techniques with premium products and receive personalized feedback.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 animate-slide-up">
                  <a href="/courses" onClick={(e) => {
                    e.preventDefault();
                    try {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      const overlay = document.createElement('div');
                      overlay.className = 'page-transition-overlay';
                      document.body.appendChild(overlay);
                      window.setTimeout(() => { window.location.assign('/courses'); }, 500);
                    } catch {
                      window.location.assign('/courses');
                    }
                  }}>
                    <Button size="lg" className="transition-transform duration-200 hover:scale-[1.03]">Explore Courses</Button>
                  </a>
                </div>
              </div>

              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop"
                  alt="Nail art training"
                  className="rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </Container>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="section-padding">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">What Our Customers Say</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Join thousands of satisfied professionals who trust BLOM for their nail artistry needs
              </p>
            </div>

            <div className="grid-responsive">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id}>
                  <CardContent className="text-center">
                    <div className="flex justify-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-6 leading-relaxed italic">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center justify-center gap-4">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="text-left">
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-gray-500 text-sm">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
};