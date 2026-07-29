import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface HeroImage { src: string; alt: string }
interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  kind: 'products' | 'academy';
  images: HeroImage[];
}

const responsiveSrcSet = (src: string) =>
  [480, 800, 1400]
    .map((width) => `${src.replace(/w_\d+/, `w_${width}`)} ${width}w`)
    .join(', ');

const productImages: HeroImage[] = [
  {
    src: 'https://res.cloudinary.com/hmvetruz/image/upload/f_auto,q_auto,w_1400,c_limit/v1785259213/products/temp/PetalPasteWhite_hirzoi.jpg',
    alt: 'BLOM White Petal Paste',
  },
  {
    src: 'https://res.cloudinary.com/hmvetruz/image/upload/f_auto,q_auto,w_900,c_limit/v1785259046/products/temp/PetalPasteClear_qh62r2.jpg',
    alt: 'BLOM Clear Petal Paste',
  },
  {
    src: 'https://res.cloudinary.com/hmvetruz/image/upload/f_auto,q_auto,w_900,c_limit/v1785147071/products/temp/RB001_neciyp.jpg',
    alt: 'BLOM Peony Blush gel polish',
  },
];

const academyImages: HeroImage[] = [
  {
    src: 'https://res.cloudinary.com/dnlgohkcc/image/upload/f_auto,q_auto,w_1200,c_limit/v1785314350/Trendy-Ring-Cover_mdc3dy.jpg',
    alt: 'Trendy Ring Nail Art Course',
  },
  {
    src: 'https://res.cloudinary.com/dnlgohkcc/image/upload/f_auto,q_auto,w_900,c_limit/v1775453928/WhatsApp_Image_2026-04-03_at_12.34.07_uelxcc.jpg',
    alt: 'Faded Flowers nail art course',
  },
  {
    src: 'https://res.cloudinary.com/dy1gw7dr2/image/upload/f_auto,q_auto,w_900,c_limit/v1778573976/WhatsApp_Image_2026-05-11_at_14.38.55_ojc1qq.jpg',
    alt: 'Hands-on BLOM nail training',
  },
];

const baseSlides: HeroSlide[] = [
  {
    id: 'professional-products',
    eyebrow: 'BLOM Professional',
    title: 'Professional products. Made to perform.',
    description: 'Reliable systems, refined finishes and artist-led education for nail professionals who care about every detail.',
    primaryCta: { label: 'Shop best sellers', href: '/shop' },
    secondaryCta: { label: 'Discover new arrivals', href: '/shop?q=new' },
    kind: 'products',
    images: productImages,
  },
  {
    id: 'academy',
    eyebrow: 'BLOM Academy',
    title: 'Learn the technique. Build the confidence.',
    description: 'Practical training, focused online lessons and techniques you can take straight to your next client.',
    primaryCta: { label: 'Explore courses', href: '/courses' },
    secondaryCta: { label: 'View online workshops', href: '/courses#online-workshops' },
    kind: 'academy',
    images: academyImages,
  },
];

export const HeroSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const slide = baseSlides[current];

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const interval = window.setInterval(() => {
      setCurrent((value) => (value + 1) % baseSlides.length);
    }, 8500);
    return () => window.clearInterval(interval);
  }, []);

  const next = () => setCurrent((value) => (value + 1) % baseSlides.length);
  const previous = () => setCurrent((value) => (value - 1 + baseSlides.length) % baseSlides.length);

  return (
    <section className={`home-hero home-hero--${slide.kind}`} aria-labelledby={`hero-title-${slide.id}`}>
      <div className="home-hero__wash" aria-hidden="true" />
      <div className="home-shell home-hero__layout" key={slide.id}>
        <div className="home-hero__copy">
          <p className="home-eyebrow">{slide.eyebrow}</p>
          <h1 id={`hero-title-${slide.id}`}>{slide.title}</h1>
          <p className="home-hero__description">{slide.description}</p>
          <div className="home-hero__actions">
            <a className="home-button home-button--primary" href={slide.primaryCta.href}>
              {slide.primaryCta.label}
            </a>
            {slide.secondaryCta && (
              <a className="home-button home-button--secondary" href={slide.secondaryCta.href}>
                {slide.secondaryCta.label}
              </a>
            )}
          </div>
        </div>

        <div className="home-hero__visual" aria-label={`${slide.eyebrow} highlights`}>
          {slide.images.map((image, index) => (
            <figure
              className={`home-hero__image home-hero__image--${
                index === 0 ? 'main' : index === 1 ? 'top' : 'bottom'
              }`}
              key={image.src}
            >
              <img
                src={image.src}
                srcSet={responsiveSrcSet(image.src)}
                sizes={index === 0
                  ? '(max-width: 860px) 92vw, 44vw'
                  : '(max-width: 860px) 42vw, 18vw'}
                alt={image.alt}
                loading={current === 0 && index === 0 ? 'eager' : 'lazy'}
                fetchPriority={current === 0 && index === 0 ? 'high' : 'auto'}
              />
            </figure>
          ))}
        </div>
      </div>

      <div className="home-shell home-hero__controls">
        <div>
          <button type="button" onClick={previous} aria-label="Previous hero slide">
            <ArrowLeft aria-hidden="true" />
          </button>
          <button type="button" onClick={next} aria-label="Next hero slide">
            <ArrowRight aria-hidden="true" />
          </button>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        Showing slide {current + 1}: {slide.title}
      </p>
    </section>
  );
};
