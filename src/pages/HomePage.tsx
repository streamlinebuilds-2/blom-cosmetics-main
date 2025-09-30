import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { HeroSlider } from '../components/sections/HeroSlider';
import { FeaturedProducts } from '../components/sections/FeaturedProducts';
import { Container } from '../components/layout/Container';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Star, Award, Users, Sparkles, Shield, Truck, RefreshCw } from 'lucide-react';

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
    },
    {
      id: 4,
      name: 'Jaundré',
      role: 'Pro Nail Artist',
      content: 'Blom\'s acrylic system changed my sets — clarity and strength are unreal.',
      rating: 5,
      image: null
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
              <p className="text-pink-400 text-lg font-medium mb-2 animate-fade-in">
                OUR VISION
              </p>
              <h2 className="text-4xl font-bold mb-6">To be the most trusted and loved nail care brand in South Africa, empowering our clients with the tools, knowledge, and products to succeed.</h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
                <Button size="lg" onClick={() => window.location.href = '/about'}>
                  Learn More About Us
                </Button>
                <Button size="lg" variant="outline" onClick={() => window.location.href = '/shop'}>
                  Explore the Collection
                </Button>
              </div>
            </div>
          </Container>
        </section>

        {/* Featured Products */}
        <FeaturedProducts />

        {/* Our Promise Section */}
        <section id="our-promise" className="section-padding bg-gradient-to-br from-pink-50 to-blue-50">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Our Promise</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Why Choose BLOM Cosmetics?
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-6 flex flex-col items-center">
                  <div className="mt-2 w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-6 w-6 text-pink-400" />
                  </div>
                  <h3 className="font-bold text-lg mb-3">HEMA-Free Formulas</h3>
                  <p className="text-gray-600 text-sm">Safe for sensitive clients with our carefully formulated, hypoallergenic products</p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-6 flex flex-col items-center">
                  <div className="mt-2 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Award className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="font-bold text-lg mb-3">Professional Grade</h3>
                  <p className="text-gray-600 text-sm">Used by leading salons and nail technicians across South Africa</p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-6 flex flex-col items-center">
                  <div className="mt-2 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Truck className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="font-bold text-lg mb-3">Fast & Reliable</h3>
                  <p className="text-gray-600 text-sm">Free shipping on orders over R1500 with 2–3 day delivery nationwide</p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-6 flex flex-col items-center">
                  <div className="mt-2 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <RefreshCw className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="font-bold text-lg mb-3">Hassle-Free Returns</h3>
                  <p className="text-gray-600 text-sm">7-day return policy for unopened items. Damaged or incorrect orders replaced free.</p>
                </CardContent>
              </Card>
            </div>
          </Container>
        </section>

        {/* Master Your Craft Section */}
        <section id="master-craft" className="section-padding bg-gray-50">
          <Container>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6">MASTER YOUR CRAFT</h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Professional training to help you build skills, speed, and confidence — in-class or online.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="h-6 w-6 text-pink-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">In-Class Professional Courses</h4>
                      <p className="text-gray-600">Hands-on learning with expert guidance and real-world techniques.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Creative Online Workshops</h4>
                      <p className="text-gray-600">Flexible, self-paced lessons with downloadable resources.</p>
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
                    <Button size="lg" className="transition-transform duration-200 hover:scale-[1.03]">Explore All Courses</Button>
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
              <h2 className="text-4xl font-bold mb-4">WHAT PEOPLE SAY</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Real reviews from pros & students
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