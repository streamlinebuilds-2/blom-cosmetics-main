import React, { useEffect, useRef } from 'react';
import { motion, useInView, type Variants } from 'framer-motion';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { HeroSlider } from '../components/sections/HeroSlider';
import { FeaturedProducts } from '../components/sections/FeaturedProducts';
import { TrustBadges } from '../components/sections/TrustBadges';
import { ShopByCategory } from '../components/sections/ShopByCategory';
import { MasterYourCraft } from '../components/sections/MasterYourCraft';
import { Container } from '../components/layout/Container';
import { Button } from '../components/ui/Button';
import { CheckCircle, Heart, Star, Zap, Truck } from 'lucide-react';
import { Testimonials } from '../components/sections/Testimonials';
import { updateSEO, trackPageView } from '../lib/seo';

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease } }
};

const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } }
};

export const HomePage: React.FC = () => {
  const visionRef = useRef(null);
  const promiseRef = useRef(null);
  const visionInView = useInView(visionRef, { once: true, margin: '-80px' });
  const promiseInView = useInView(promiseRef, { once: true, margin: '-80px' });

  useEffect(() => {
    updateSEO({
      title: "BLOM Cosmetics - Premium Nail Care Products & Professional Training South Africa",
      description: "Discover BLOM Cosmetics - South Africa's leading provider of premium nail care products, professional acrylic systems, and expert beauty training. Shop cuticle oils, nail files, acrylics, and furniture.",
      keywords: "nail care products, acrylic nails, cuticle oil, nail files, beauty training, nail art, professional cosmetics, South Africa, BLOM, manicure, pedicure, nail salon supplies",
      url: "https://blom-cosmetics.co.za/"
    });
    
    // Track page view
    trackPageView(
      "BLOM Cosmetics - Premium Nail Care Products & Professional Training South Africa",
      "https://blom-cosmetics.co.za/"
    );
  }, []);

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Mitchell',
      role: 'Professional Nail Technician',
      content: 'BLOM products have transformed my nail art business. The quality is unmatched and my clients love the results.',
      rating: 5,
      image: '/sarah.webp'
    },
    {
      id: 2,
      name: 'Jessica Chen',
      role: 'Salon Owner',
      content: 'The training courses are exceptional. My entire team is now certified and our service quality has improved dramatically.',
      rating: 5,
      image: '/testimonial-6.webp'
    },
    {
      id: 3,
      name: 'Michelle Adams',
      role: 'Freelance Artist',
      content: 'From beginner to pro - BLOM\'s educational content and premium products made my journey seamless.',
      rating: 5,
      image: '/michelle.webp'
    },
    {
      id: 4,
      name: 'Jaundré',
      role: 'Pro Nail Artist',
      content: 'Blom\'s acrylic system changed my sets — clarity and strength are unreal.',
      rating: 5,
      image: '/jaundre.webp'
    }
  ];

  const stats: any[] = [];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header showMobileMenu={true} />

      <main className="flex-1">
        {/* Hero Slider */}
        <HeroSlider />

        {/* Trust Badges */}
        <TrustBadges />

        {/* Our Vision Section */}
        <section id="our-vision" ref={visionRef} className="section-padding bg-white border-y border-gray-100">
          <Container>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate={visionInView ? 'show' : 'hidden'}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              <motion.div variants={fadeUp}>
                <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-pink-500 mb-4">Our Vision</span>
                <div className="h-px w-12 bg-pink-300 mb-6" />
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-6">
                  South Africa's most trusted nail care brand.
                </h2>
                <p className="text-base text-gray-500 leading-relaxed mb-8">
                  We empower nail professionals and enthusiasts with the tools, knowledge, and products they need to create exceptional results — every time.
                </p>
                <Button size="lg" onClick={() => window.location.href = '/about'}>
                  Learn More About Us
                </Button>
              </motion.div>
              <motion.div variants={fadeUp} className="hidden md:flex items-center justify-center">
                <div className="relative w-72 h-72">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-100 to-pink-50" />
                  <div className="absolute inset-6 rounded-full bg-gradient-to-br from-pink-200/60 to-white flex items-center justify-center">
                    <div className="text-center">
                      <Zap className="w-12 h-12 text-pink-400 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-gray-700 tracking-wide">Professional Grade</p>
                      <p className="text-xs text-gray-400 mt-1">Since 2019</p>
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-pink-400/40" />
                  <div className="absolute bottom-4 -left-3 w-3 h-3 rounded-full bg-pink-300/60" />
                  <div className="absolute top-1/3 -right-4 w-2 h-2 rounded-full bg-pink-500/30" />
                </div>
              </motion.div>
            </motion.div>
          </Container>
        </section>

        {/* Featured Products */}
        <FeaturedProducts />

        {/* Shop by Category */}
        <ShopByCategory />

        {/* Our Promise Section */}
        <section id="our-promise" ref={promiseRef} className="section-padding bg-gray-50">
          <Container>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={promiseInView ? 'show' : 'hidden'}
              className="text-center mb-12"
            >
              <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-pink-500 mb-3">Our Promise</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">What we stand for</h2>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate={promiseInView ? 'show' : 'hidden'}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {[
                { icon: Heart, title: 'HEMA-Free Formulas', desc: 'Safe for sensitive clients with our carefully formulated, hypoallergenic products' },
                { icon: Star, title: 'Professional Grade', desc: 'Used by leading salons and nail technicians across South Africa' },
                { icon: Truck, title: 'Fast & Reliable', desc: 'Free shipping on orders over R2000 with 2–3 day delivery nationwide' },
                { icon: CheckCircle, title: 'Hassle-Free Returns', desc: '7-day return policy for unopened items. Damaged or incorrect orders replaced free.' },
              ].map(({ icon: Icon, title, desc }) => (
                <motion.div key={title} variants={fadeUp} className="promise-card text-center p-6">
                  <div className="promise-icon">
                    <Icon className="h-7 w-7 text-slate-800" />
                  </div>
                  <h3 className="font-bold text-lg mb-3">{title}</h3>
                  <p className="text-gray-600 text-sm">{desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </Container>
        </section>

        <MasterYourCraft />

        <Testimonials />
      </main>

      <Footer />
    </div>
  );
};




