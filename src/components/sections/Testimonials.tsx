import React, { useEffect, useState } from 'react';
import { Container } from '../layout/Container';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  role?: string;
  quote: string;
  product?: string;
  image?: string; // path under /public (e.g. /testimonials/leah.webp)
}

export const Testimonials: React.FC = () => {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        // Prefer static import, fallback to fetch
        try {
          const mod = await import('../../../content/testimonials/testimonials.json');
          setItems(mod.default || []);
        } catch {
          const res = await fetch('/content/testimonials/testimonials.json');
          const data = await res.json();
          setItems(data || []);
        }
      } catch {}
    })();
  }, []);

  const prev = () => setIndex((i) => (i - 1 + items.length) % Math.max(1, items.length));
  const next = () => setIndex((i) => (i + 1) % Math.max(1, items.length));

  if (!items.length) return null;

  const t = items[index];

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
                  src={t.image || '/testimonials/placeholder.webp'}
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
                <p className="text-xl text-gray-800 leading-relaxed pl-8">{t.quote}</p>
              </div>
              <div className="mt-6">
                <div className="font-semibold text-gray-900">{t.name}</div>
                {t.role && <div className="text-gray-500 text-sm">{t.role}</div>}
                {t.product && <div className="text-pink-400 text-sm mt-1">on {t.product}</div>}
              </div>

              {/* Dots */}
              <div className="mt-6 flex gap-2">
                {items.map((_, i) => (
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

import React, { useState } from 'react';
import { Container } from '../layout/Container';

interface TestimonialSlide {
  id: string;
  image: string;
  alt: string;
}

const slides: TestimonialSlide[] = [
  { id: 't1', image: '/sarah.webp', alt: 'Sarah Mitchell' },
  { id: 't2', image: '/jaundre.webp', alt: 'Jaundré' },
  { id: 't3', image: '/michelle.webp', alt: 'Michelle Adams' },
  { id: 't4', image: '/testimonial-4.webp', alt: 'Pro Nail Artist' },
  { id: 't5', image: '/testimonial-6.webp', alt: 'Beauty Professional' }
];

export const Testimonials: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false);
  
  // Duplicate slides to make the loop seamless
  const loopSlides = [...slides, ...slides];

  const handleClick = () => {
    setIsPaused(!isPaused);
  };

  return (
    <section id="testimonials" className="section-padding">
      <Container>
        <div className="text-center mb-8 md:mb-12">
          <h2 className="heading-with-stripe">WHAT PEOPLE SAY</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real reviews from pros & students
            <span className="text-sm text-gray-400 block mt-2">
              Click to {isPaused ? 'resume' : 'pause'} scrolling
            </span>
          </p>
        </div>

        <div className="testi__carousel cursor-pointer" onClick={handleClick}>
          <div className="testi__viewport" tabIndex={0} aria-label="Testimonials carousel">
            <ul 
              className="testi__track" 
              style={{ 
                ['--testi-duration' as any]: '40s',
                animationPlayState: isPaused ? 'paused' : 'running'
              }}
            >
              {loopSlides.map((s, idx) => (
                <li className="testi__slide" key={`{s.id}_${idx}`}>
                  <figure className="t-card">
                    <div className="t-card--img aspect-9-16">
                      <img src={s.image} alt={s.alt} className="w-full h-full object-cover" />
                    </div>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Testimonials;


