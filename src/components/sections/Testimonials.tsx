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
    name: 'Emma Thompson',
    image: '/testimonial-5.webp'
  },
  {
    id: 6,
    name: 'Lisa Rodriguez',
    image: '/testimonial-4.webp'
  }
];

export const Testimonials: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const carouselRef = React.useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (isPaused) {
      // Resume animation from current position
      setIsPaused(false);
    } else {
      // Pause animation and capture current position
      setIsPaused(true);
    }
  };

  // Update animation progress periodically to track position
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        if (carouselRef.current) {
          const computedStyle = window.getComputedStyle(carouselRef.current);
          const transform = computedStyle.transform;
          if (transform && transform !== 'none') {
            const matrix = new DOMMatrix(transform);
            const translateX = matrix.m41;
            // Calculate progress percentage (0 to 1)
            const progress = Math.abs(translateX) / (320 * 6); // 320px width * 6 items
            setAnimationProgress(progress % 1); // Keep it between 0 and 1
          }
        }
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [isPaused]);

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
            ref={carouselRef}
            className={`flex gap-6 ${isPaused ? 'paused' : 'animate-scroll'}`}
            style={isPaused ? {
              transform: `translateX(-${animationProgress * 50}%)`,
              animationPlayState: 'paused'
            } : {}}
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
          animation: scroll-left 20s linear infinite;
        }
        
        /* Mobile - 50% faster than desktop */
        @media (max-width: 768px) {
          .animate-scroll {
            animation: scroll-left 10s linear infinite;
          }
        }
        
        .paused {
          animation-play-state: paused !important;
        }
      `}</style>
    </section>
  );
};