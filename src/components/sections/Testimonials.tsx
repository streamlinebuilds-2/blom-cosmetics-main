import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Container } from '../layout/Container';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    image: '/sarah.webp'
  },
  {
    id: 2,
    name: 'Michelle Adams',
    image: '/michelle.webp'
  },
  {
    id: 3,
    name: 'Jaundré',
    image: '/jaundre.webp'
  },
  {
    id: 4,
    name: 'Lisa Rodriguez',
    image: '/testimonial-4.webp'
  },
  {
    id: 5,
    name: 'Review 1',
    image: '/review-1.webp'
  },
  {
    id: 6,
    name: 'Review 2',
    image: '/review-2.webp'
  },
  {
    id: 7,
    name: 'Review 3',
    image: '/review-3.webp'
  }
];

export const Testimonials: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350; // Width of card (320px) + gap (24px)
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-16">
      <Container>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">What Our Customers Say</h2>
        </div>

        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 hidden md:flex items-center justify-center"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6 text-gray-800" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 hidden md:flex items-center justify-center"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6 text-gray-800" />
          </button>

          {/* Scrollable container */}
          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex gap-6 px-4 md:px-0">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="flex-shrink-0 w-80">
                  <div className="aspect-[9/16] rounded-2xl overflow-hidden bg-gray-50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile scroll indicators */}
          <div className="flex md:hidden justify-center gap-2 mt-6">
            <button
              onClick={() => scroll('left')}
              className="bg-pink-400 hover:bg-pink-500 text-white rounded-full p-2 shadow-md transition-all duration-200"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="bg-pink-400 hover:bg-pink-500 text-white rounded-full p-2 shadow-md transition-all duration-200"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Container>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};
