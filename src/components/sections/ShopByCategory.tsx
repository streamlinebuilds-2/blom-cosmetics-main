import React from 'react';
import { Container } from '../layout/Container';
import { Sparkles, Droplet, Palette, GraduationCap } from 'lucide-react';

export const ShopByCategory: React.FC = () => {
  const categories = [
    {
      name: 'Acrylic System',
      icon: Sparkles,
      href: '/shop#acrylic-system',
      image: '/acrylic-category.webp',
      description: 'Professional powders & liquids'
    },
    {
      name: 'Prep & Finish',
      icon: Droplet,
      href: '/shop#prep-finishing',
      image: '/cuticle-category.webp',
      description: 'Nourishing oils & treatments'
    },
    {
      name: 'Tools & Essentials',
      icon: Palette,
      href: '/shop#tools-essentials',
      image: '/nail-essentials-category.webp',
      description: 'Colors, glitters & finishes'
    },
    {
      name: 'Education',
      icon: GraduationCap,
      href: '/courses',
      image: '/education-category.webp',
      description: 'Professional training courses'
    }
  ];

  return (
    <section className="section-padding bg-gray-50">
      <Container>
        <div className="text-center mb-12">
          <h2 className="heading-with-stripe">SHOP BY CATEGORY</h2>
          <p className="section-subheader">
            Find exactly what you need for your nail artistry
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <a
              key={category.name}
              href={category.href}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    // fallback placeholder
                    target.src = `https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=800&auto=format&fit=crop`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="mb-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
                  <category.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-extrabold mb-1 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">{category.name}</h3>
                <p className="text-sm text-white/95 drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">{category.description}</p>
              </div>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
};