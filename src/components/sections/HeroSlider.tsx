import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  backgroundImage: string;
  textPosition: 'left' | 'center' | 'right';
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'Bloom, Blossom, Believe',
    subtitle: 'Professional Nail Artistry Begins Here',
    description: 'Discover our premium collection of nail products designed for professionals who demand excellence.',
    ctaText: 'Shop the Collection',
    ctaHref: '/shop',
    backgroundImage: 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
    textPosition: 'left'
  },
  {
    id: 2,
    title: 'Master the Acrylic System',
    subtitle: 'Professional Grade Products',
    description: 'From powders to liquids, sculpting forms to brushes - everything you need for perfect acrylic nails.',
    ctaText: 'Explore Acrylic',
    ctaHref: '/shop#acrylic-system',
    backgroundImage: 'https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
    textPosition: 'right'
  },
  {
    id: 3,
    title: 'Learn from the Best',
    subtitle: 'Online & In-Person Courses',
    description: 'Elevate your skills with our comprehensive training programs taught by industry experts.',
    ctaText: 'View Courses',
    ctaHref: '/courses',
    backgroundImage: 'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
    textPosition: 'center'
  }
];

export const HeroSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

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
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  const slide = slides[currentSlide];

  const textPositionClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end'
  };

  return (
    <section
      id="heroSlider"
      className="relative h-screen min-h-[600px] overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Images */}
      <div className="absolute inset-0">
        {slides.map((slideItem, index) => (
          <div
            key={slideItem.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slideItem.backgroundImage}
              alt={slideItem.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container-custom w-full">
          <div className={`flex flex-col justify-center h-full max-w-2xl ${textPositionClasses[slide.textPosition]} ${slide.textPosition === 'right' ? 'ml-auto' : slide.textPosition === 'center' ? 'mx-auto' : ''}`}>
            <div className="text-white space-y-6">
              <div>
                <p className="text-pink-300 text-lg font-medium mb-2 animate-fade-in">
                  {slide.subtitle}
                </p>
                <h1 className="text-4xl md:text-6xl font-bold leading-tight animate-slide-up">
                  {slide.title}
                </h1>
              </div>

              <p className="text-xl text-gray-200 leading-relaxed animate-slide-up animation-delay-200">
                {slide.description}
              </p>

              <div className="animate-slide-up animation-delay-400">
                <Button
                  size="lg"
                  className="bg-pink-400 hover:bg-pink-500 text-white px-8 py-4"
                  onClick={() => window.location.href = slide.ctaHref}
                >
                  {slide.ctaText}
                </Button>
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

      {/* Dot Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-pink-400 scale-110'
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-black bg-opacity-20">
        <div
          className="h-full bg-pink-400 transition-all duration-5000 ease-linear"
          style={{
            width: isAutoPlaying ? '100%' : `${((currentSlide + 1) / slides.length) * 100}%`,
            transitionDuration: isAutoPlaying ? '5000ms' : '300ms'
          }}
        />
      </div>
    </section>
  );
};