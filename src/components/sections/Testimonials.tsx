import React, { useState, useEffect } from 'react';
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
  const [isPaused, setIsPaused] = useState(false);

  const prev = () => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
  const next = () => setIndex((i) => (i + 1) % testimonials.length);

  // Auto-scroll effect
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section className="py-16">
      <Container>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">What Our Customers Say</h2>
        </div>

        <div 
          className="relative max-w-4xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Mobile: Single image carousel */}
          <div className="block md:hidden">
            <div className="aspect-[9/16] rounded-2xl overflow-hidden bg-gray-50 shadow-lg max-w-sm mx-auto">
              <img
                src={testimonials[index].image}
                alt={testimonials[index].name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          {/* Desktop: Circular rotating carousel */}
          <div className="hidden md:block relative w-96 h-96 mx-auto">
            {testimonials.map((testimonial, i) => {
              const angle = (i * 90) - (index * 90); // 90 degrees apart, rotated by current index
              const radius = 150; // Distance from center
              const x = Math.cos((angle * Math.PI) / 180) * radius;
              const y = Math.sin((angle * Math.PI) / 180) * radius;
              
              return (
                <div
                  key={testimonial.id}
                  className="absolute transition-all duration-1000 ease-in-out"
                  style={{
                    left: `calc(50% + ${x}px - 75px)`, // 75px is half the image width
                    top: `calc(50% + ${y}px - 100px)`, // 100px is half the image height
                    transform: 'translate(-50%, -50%)',
                    zIndex: i === index ? 10 : 1,
                  }}
                >
                  <div className="aspect-[9/16] w-32 rounded-xl overflow-hidden bg-gray-50 shadow-lg">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              );
            })}
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



