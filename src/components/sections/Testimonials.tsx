import React, { useState } from 'react';
import { Container } from '../layout/Container';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
  image: string;
}

const testimonials: Testimonial[] = [
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

export const Testimonials: React.FC = () => {
  const [index, setIndex] = useState(0);

  const prev = () => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
  const next = () => setIndex((i) => (i + 1) % testimonials.length);

  const t = testimonials[index];

  return (
    <section className="py-16">
      <Container>
        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">What Customers Say</h2>
            <div className="flex items-center gap-2">
              <button aria-label="Previous" onClick={prev} className="p-2 rounded-full hover:bg-gray-100">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button aria-label="Next" onClick={next} className="p-2 rounded-full hover:bg-gray-100">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Image */}
            <div className="md:col-span-1">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Quote */}
            <div className="md:col-span-2">
              <div className="relative">
                <Quote className="absolute -top-2 -left-2 h-8 w-8 text-pink-300" />
                <p className="text-xl text-gray-800 leading-relaxed pl-8">"{t.content}"</p>
              </div>
              <div className="mt-6">
                <div className="font-semibold text-gray-900">{t.name}</div>
                <div className="text-gray-500 text-sm">{t.role}</div>
              </div>

              {/* Dots */}
              <div className="mt-6 flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    className={`w-2.5 h-2.5 rounded-full ${i === index ? 'bg-pink-400' : 'bg-gray-300'}`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};



