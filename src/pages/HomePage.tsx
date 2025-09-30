import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { HeroSlider } from '../components/sections/HeroSlider';
import { FeaturedProducts } from '../components/sections/FeaturedProducts';
import { MasterYourCraft } from '../components/sections/MasterYourCraft';
import { Container } from '../components/layout/Container';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Star, Award, Users, Sparkles, Shield, Truck, RefreshCw } from 'lucide-react';
import { Testimonials } from '../components/sections/Testimonials';

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
            <div className="max-w-3xl">
              <p className="text-slate-900 text-3xl md:text-4xl font-extrabold mb-2 animate-fade-in">
                OUR VISION
              </p>
              <div className="h-1 w-16 bg-pink-400 rounded mb-4"></div>
              <h2 className="text-2xl md:text-3xl font-medium mb-6 text-slate-700">
                To be the most trusted and loved nail care brand in South Africa, empowering our clients with the tools, knowledge, and products to succeed.
              </h2>
              <div className="animate-slide-up">
                <Button size="lg" onClick={() => window.location.href = '/about'}>
                  Learn More About Us
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
              {/* 1 */}
              <div className="promise-card text-center p-6">
                <div className="promise-icon">
                  <Shield className="h-6 w-6 text-gray-700" />
                </div>
                <h3 className="font-bold text-lg mb-3">HEMA-Free Formulas</h3>
                <p className="text-gray-600 text-sm">Safe for sensitive clients with our carefully formulated, hypoallergenic products</p>
              </div>

              {/* 2 */}
              <div className="promise-card text-center p-6">
                <div className="promise-icon">
                  <Award className="h-6 w-6 text-gray-700" />
                </div>
                <h3 className="font-bold text-lg mb-3">Professional Grade</h3>
                <p className="text-gray-600 text-sm">Used by leading salons and nail technicians across South Africa</p>
              </div>

              {/* 3 with gradient hover */}
              <div className="promise-card promise-card--gradient text-center p-6">
                <div className="promise-icon">
                  <Truck className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg mb-3">Fast & Reliable</h3>
                <p className="text-gray-600 group-hover:text-white/90 text-sm">Free shipping on orders over R1500 with 2–3 day delivery nationwide</p>
              </div>

              {/* 4 */}
              <div className="promise-card text-center p-6">
                <div className="promise-icon">
                  <RefreshCw className="h-6 w-6 text-gray-700" />
                </div>
                <h3 className="font-bold text-lg mb-3">Hassle-Free Returns</h3>
                <p className="text-gray-600 text-sm">7-day return policy for unopened items. Damaged or incorrect orders replaced free.</p>
              </div>
            </div>
          </Container>
        </section>

        <MasterYourCraft />

        <Testimonials />
      </main>

      <Footer />
    </div>
  );
};