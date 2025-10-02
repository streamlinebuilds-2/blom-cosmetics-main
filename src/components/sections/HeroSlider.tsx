import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  backgroundImageDesktop: string;
  backgroundImageMobile: string;
  textPosition: 'left' | 'center' | 'right';
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'Bloom\nBlossom\nBelieve',
    subtitle: '',
    description: '',
    ctaText: 'Shop the Collection',
    ctaHref: '/shop',
    backgroundImageDesktop: '/hero-desktop-1.webp',
    backgroundImageMobile: '/hero-mobile-1.webp',
    textPosition: 'left'
  },
  {
    id: 2,
    title: 'The Professional\nAcrylic System',
    subtitle: '',
    description: '',
    ctaText: 'Explore Acrylics',
    ctaHref: '/shop#acrylic-system',
    backgroundImageDesktop: '/hero-desktop-2.webp',
    backgroundImageMobile: '/hero-mobile-2.webp',
    textPosition: 'right'
  },
  {
    id: 3,
    title: 'Learn\nCreate\nGrow',
    subtitle: '',
    description: '',
    ctaText: 'Explore Courses',
    ctaHref: '/courses',
    backgroundImageDesktop: '/hero-desktop-3.webp',
    backgroundImageMobile: '/hero-mobile-3.webp',
    textPosition: 'center'
  }
];

export const HeroSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    // Start auto-scroll immediately
    const startAutoScroll = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      intervalRef.current = window.setInterval(() => {
        nextSlide();
      }, 6000);
    };

    // Start immediately
    startAutoScroll();

    // Also start on any user interaction (in case browser blocks auto-play)
    const handleUserInteraction = () => {
      if (!intervalRef.current) {
        startAutoScroll();
      }
    };

    // Add event listeners for user interaction
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  const slide = slides[currentSlide];

  const textPositionClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end'
  };

  return (
    <section
      id="heroSlider"
      className="relative h-screen min-h-[600px] max-h-[800px] md:max-h-none overflow-hidden"
    >
      {/* Background Images */}
      <div className="absolute inset-0">
        {slides.map((slideItem, index) => (
          <div
            key={slideItem.id}
            id={`slide-${slideItem.id}`}
            aria-hidden={index === currentSlide ? false : true}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <picture>
              <source media="(min-width: 768px)" srcSet={slideItem.backgroundImageDesktop} />
              <img
                src={slideItem.backgroundImageMobile}
                alt={slideItem.title}
                className={`w-full h-full object-cover transition-transform duration-[12000ms] ease-out ${index === currentSlide ? 'md:scale-110 scale-105' : 'scale-100'}`}
              />
            </picture>
            {/* Overlay removed for a cleaner image presentation */}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container-custom w-full">
          <div className={`flex flex-col justify-center items-center text-center h-full max-w-3xl mx-auto`}>
            <div className="text-white space-y-6">
              <div>
                {slide.subtitle && (
                  <p className="text-pink-200/90 text-lg font-medium mb-2 animate-fade-in">
                    {slide.subtitle}
                  </p>
                )}
                <h1 className="hero-slogan whitespace-pre-line animate-slide-up">
                  {slide.title}
                </h1>
              </div>

              {slide.description && (
                <p className="text-xl text-white/95 leading-[1.6] tracking-wide animate-slide-up animation-delay-200">
                  {slide.description}
                </p>
              )}

              <div className="animate-slide-up animation-delay-400 mt-4 flex justify-center">
                <a
                  href={slide.ctaHref}
                  className="btn btn-pink px-10 py-5 text-lg"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = slide.ctaHref;
                  }}
                >
                  {slide.ctaText}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all duration-200 text-white hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all duration-200 text-white hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>


    </section>
  );
};
