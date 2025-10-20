import React, { useState } from 'react';
import { Container } from '../layout/Container';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    image: '/sarah.webp'
  },
  {
    id: 2,
    name: 'Jessica Chen',
    image: '/testimonial-6.webp'
  },
  {
    id: 3,
    name: 'Michelle Adams',
    image: '/michelle.webp'
  },
  {
    id: 4,
    name: 'Jaundré',
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
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">What Our Customers Say</h2>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Image */}
          <div className="aspect-video rounded-2xl overflow-hidden bg-gray-50 shadow-lg">
            <img
              src={t.image}
              alt={t.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button 
              onClick={prev} 
              className="p-3 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    i === index ? 'bg-pink-400' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <button 
              onClick={next} 
              className="p-3 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
};



