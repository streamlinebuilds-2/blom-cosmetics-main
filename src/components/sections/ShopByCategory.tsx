import React from 'react';
import { Container } from '../layout/Container';
import { Sparkles, Droplet, Palette, GraduationCap } from 'lucide-react';

export const ShopByCategory: React.FC = () => {
  const categories = [
    {
      name: 'Acrylic System',
      icon: Sparkles,
      href: '/shop#acrylic-system',
      image: '/acrylic-powder-01.webp',
      description: 'Professional powders & liquids'
    },
    {
      name: 'Cuticle Care',
      icon: Droplet,
      href: '/shop#cuticle-care',
      image: 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
      description: 'Nourishing oils & treatments'
    },
    {
      name: 'Nail Art',
      icon: Palette,
      href: '/shop#nail-art',
      image: 'https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
      description: 'Colors, glitters & finishes'
    },
    {
      name: 'Education',
      icon: GraduationCap,
      href: '/courses',
      image: '/professional-acrylic-training-hero.jpg',
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
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="mb-2">
                  <category.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-1">{category.name}</h3>
                <p className="text-sm text-white/90">{category.description}</p>
              </div>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
};
