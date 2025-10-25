import React, { useState, useEffect, useRef } from 'react';
import { Container } from '../layout/Container';

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
  },
  {
    id: 5,
    name: 'Lisa Rodriguez',
    image: '/testimonial-4.webp'
  },
  {
    id: 6,
    name: 'Review 1',
    image: '/review-1.webp'
  },
  {
    id: 7,
    name: 'Review 2',
    image: '/review-2.webp'
  },
  {
    id: 8,
    name: 'Review 3',
    image: '/review-3.webp'
  }
];

export const Testimonials: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false);

  const handleClick = () => {
    setIsPaused(!isPaused);
  };

  return (
    <section className="py-16">
      <Container>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">What Our Customers Say</h2>
        </div>

        <div 
          className="relative overflow-hidden cursor-pointer"
          onClick={handleClick}
        >
          {/* Infinite scrolling carousel */}
          <div 
            className={`flex gap-6 ${isPaused ? 'paused' : 'animate-scroll'}`}
          >
            {/* First set of testimonials */}
            {testimonials.map((testimonial) => (
              <div key={`first-${testimonial.id}`} className="flex-shrink-0 w-80">
                <div className="aspect-[9/16] rounded-2xl overflow-hidden bg-gray-50 shadow-lg">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {testimonials.map((testimonial) => (
              <div key={`second-${testimonial.id}`} className="flex-shrink-0 w-80">
                <div className="aspect-[9/16] rounded-2xl overflow-hidden bg-gray-50 shadow-lg">
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
      </Container>

      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll {
          animation: scroll-left 30s linear infinite;
        }
        
        /* Mobile - slightly faster than desktop */
        @media (max-width: 768px) {
          .animate-scroll {
            animation: scroll-left 20s linear infinite;
          }
        }
        
        .paused {
          animation-play-state: paused !important;
        }
      `}</style>
    </section>
  );
};