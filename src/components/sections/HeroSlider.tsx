import React, { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Droplets, GraduationCap, Sparkles } from 'lucide-react';
import peonyBlushGelPolish from '../../assets/homepage/peony-blush-gel-polish.webp';

interface HeroImage {
  src: string;
  alt: string;
  position?: string;
}
interface HeroSlide {
  id: string;
  eyebrow: string;
  tabLabel: string;
  title: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  kind: 'gel' | 'prep' | 'academy';
  stamp: string;
  layout: 'cascade' | 'split' | 'stack';
  images: HeroImage[];
}

const responsiveSrcSet = (src: string) => {
  if (!src.includes('res.cloudinary.com')) return undefined;

  return [480, 800, 1400]
    .map((width) => `${src.replace(/w_\d+/, `w_${width}`)} ${width}w`)
    .join(', ');
};

const gelImages: HeroImage[] = [
  {
    src: 'https://res.cloudinary.com/drsrbzm2t/image/upload/f_auto,q_auto,w_1400,c_limit/v1785756396/homepage/hero/gel-system-collection-mobile.jpg',
    alt: 'BLOM gel polish collection styled with vivid pink flowers and pearls',
    position: 'center 54%',
  },
  {
    src: peonyBlushGelPolish,
    alt: 'BLOM Peony Blush gel polish from the Fleur de Berry collection',
  },
  {
    src: 'https://res.cloudinary.com/drsrbzm2t/image/upload/f_auto,q_auto,w_1400,c_limit/v1785756402/homepage/hero/gel-system-manicure.png',
    alt: 'Finished BLOM gel manicure in pink, lilac, mint and soft nail-art shades',
    position: 'center 48%',
  },
];

const prepImages: HeroImage[] = [
  {
    src: 'https://res.cloudinary.com/drsrbzm2t/image/upload/f_auto,q_auto,w_1400,c_limit/v1785757915/homepage/hero/prep-finish-system-mobile.png',
    alt: 'BLOM Primer, Top Coat, Nail Liquid and Rainbow Sprinkle professional system',
    position: 'center 52%',
  },
  {
    src: 'https://res.cloudinary.com/drsrbzm2t/image/upload/f_auto,q_auto,w_1400,c_limit/v1785757921/homepage/hero/primer-application.png',
    alt: 'BLOM acid-free primer being applied precisely to a prepared natural nail',
    position: 'center',
  },
  {
    src: 'https://res.cloudinary.com/drsrbzm2t/image/upload/f_auto,q_auto,w_1400,c_limit/v1785757926/homepage/hero/top-coat-result.png',
    alt: 'Finished white shimmer manicure created with BLOM Fairy Dust Top Coat',
    position: 'center',
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
    id: 'gel-system',
    eyebrow: 'New gel system',
    tabLabel: 'Gel system',
    title: 'Fresh colour. Serious performance.',
    description: 'Discover BLOM gel colour, bases and finishes designed to work beautifully from first coat to final shine.',
    primaryCta: { label: 'Shop the gel system', href: '/shop?category=gel-system' },
    secondaryCta: { label: 'See new arrivals', href: '/shop?q=new' },
    kind: 'gel',
    stamp: 'New colour energy',
    layout: 'cascade',
    images: gelImages,
  },
  {
    id: 'prep-and-finish',
    eyebrow: 'Prep & finish',
    tabLabel: 'Prep & finish',
    title: 'The details that make a set last.',
    description: 'Build a dependable routine with professional prep, primers, bases and finishing products from BLOM.',
    primaryCta: { label: 'Shop prep & finish', href: '/shop?category=prep-finishing' },
    secondaryCta: { label: 'Browse all products', href: '/shop' },
    kind: 'prep',
    stamp: 'Made for lasting sets',
    layout: 'split',
    images: prepImages,
  },
  {
    id: 'academy',
    eyebrow: 'BLOM Academy',
    tabLabel: 'Academy',
    title: 'Learn the technique. Build the confidence.',
    description: 'Practical training, focused online lessons and techniques you can take straight to your next client.',
    primaryCta: { label: 'Explore courses', href: '/courses' },
    secondaryCta: { label: 'View online workshops', href: '/courses#online-workshops' },
    kind: 'academy',
    stamp: 'Learn with BLOM',
    layout: 'stack',
    images: academyImages,
  },
];

export const HeroSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const slide = baseSlides[current];

  const next = () => setCurrent((value) => (value + 1) % baseSlides.length);
  const previous = () => setCurrent((value) => (value - 1 + baseSlides.length) % baseSlides.length);
  const handleTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };
  const handleTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null) return;
    const distance = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance) < 45) return;
    if (distance < 0) next();
    else previous();
  };

  const StampIcon = slide.kind === 'academy'
    ? GraduationCap
    : slide.kind === 'prep'
      ? Droplets
      : Sparkles;

  return (
    <section
      className={`home-hero home-hero--${slide.kind} home-hero--layout-${slide.layout}`}
      aria-labelledby={`hero-title-${slide.id}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
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
                style={image.position ? { objectPosition: image.position } : undefined}
              />
            </figure>
          ))}
          <span className="home-hero__stamp" aria-hidden="true">
            <StampIcon />
            {slide.stamp}
          </span>
        </div>
      </div>

      <div className="home-shell home-hero__controls">
        <div className="home-hero__arrows">
          <button type="button" onClick={previous} aria-label="Previous hero slide">
            <ArrowLeft aria-hidden="true" />
          </button>
          <button type="button" onClick={next} aria-label="Next hero slide">
            <ArrowRight aria-hidden="true" />
          </button>
        </div>
        <div className="home-hero__tabs" aria-label="Choose a hero story">
          {baseSlides.map((item, index) => (
            <button
              type="button"
              className={index === current ? 'is-active' : undefined}
              aria-current={index === current ? 'true' : undefined}
              onClick={() => setCurrent(index)}
              key={item.id}
            >
              <span aria-hidden="true">0{index + 1}</span>
              {item.tabLabel}
            </button>
          ))}
        </div>
        <span className="home-hero__count" aria-hidden="true">
          0{current + 1} / 0{baseSlides.length}
        </span>
      </div>
      <p className="sr-only" aria-live="polite">
        Showing slide {current + 1}: {slide.title}
      </p>
    </section>
  );
};
