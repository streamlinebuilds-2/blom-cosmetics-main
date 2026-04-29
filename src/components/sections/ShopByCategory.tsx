import React, { useRef } from 'react';
import { motion, useInView, type Variants } from 'framer-motion';
import { Container } from '../layout/Container';
import { Sparkles, Droplet, Palette, GraduationCap } from 'lucide-react';

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease } }
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } }
};

const categories = [
  { name: 'Acrylic System', icon: Sparkles, href: '/shop#acrylic-system', image: '/acrylic-category.webp', description: 'Professional powders & liquids' },
  { name: 'Prep & Finish', icon: Droplet, href: '/shop#prep-finishing', image: '/cuticle-category.webp', description: 'Nourishing oils & treatments' },
  { name: 'Tools & Essentials', icon: Palette, href: '/shop#tools-essentials', image: '/nail-essentials-category.webp', description: 'Colors, glitters & finishes' },
  { name: 'Education', icon: GraduationCap, href: '/courses', image: '/education-category.webp', description: 'Professional training courses' },
];

export const ShopByCategory: React.FC = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="section-padding bg-gray-50">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-pink-500 mb-3">Explore</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Shop by Category</h2>
          <p className="text-gray-400 mt-3 text-sm">Find exactly what you need for your nail artistry</p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {categories.map((category) => (
            <motion.a
              key={category.name}
              href={category.href}
              variants={cardVariant}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=800&auto=format&fit=crop`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="mb-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
                  <category.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-extrabold mb-1 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">{category.name}</h3>
                <p className="text-sm text-white/95 drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">{category.description}</p>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </Container>
    </section>
  );
};
