import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Droplets, GraduationCap, Palette, Sparkles } from 'lucide-react';
import acrylicHero from '../../assets/homepage/hero-acrylic-system.webp';
import gelHero from '../../assets/homepage/hero-gel-system.webp';
import prepHero from '../../assets/homepage/hero-prep-finish.webp';

const academyHeroDesktop = 'https://res.cloudinary.com/hmvetruz/image/upload/f_auto,q_auto,w_1200/v1785907284/blom/homepage/hero-academy-desktop.jpg';
const academyHeroMobile = 'https://res.cloudinary.com/hmvetruz/image/upload/f_auto,q_auto,w_900/v1785907309/blom/homepage/hero-academy-mobile.png';

interface HeroImage {
  src: string;
  mobileSrc?: string;
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
  kind: 'gel' | 'acrylic' | 'prep' | 'academy';
  stamp: string;
  image: HeroImage;
}

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
    image: {
      src: gelHero,
      alt: 'BLOM gel polish collection styled with vivid pink flowers and pearls',
      position: 'center',
    },
  },
  {
    id: 'acrylic-system',
    eyebrow: 'Acrylic system',
    tabLabel: 'Acrylic',
    title: 'Bold colour. Endless creativity.',
    description: 'Create standout sets with smooth professional acrylic powders, from saturated colour to high-impact glitter.',
    primaryCta: { label: 'Shop coloured acrylics', href: '/shop?category=coloured-acrylics' },
    secondaryCta: { label: 'Shop glitter acrylics', href: '/shop?category=glitter-acrylics' },
    kind: 'acrylic',
    stamp: 'Made for nail artists',
    image: {
      src: acrylicHero,
      alt: 'Stacked BLOM blue, pink, glitter and red acrylic powders surrounded by flowers',
      position: 'center',
    },
  },
  {
    id: 'prep-and-finish',
    eyebrow: 'Prep & finish',
    tabLabel: 'Prep',
    title: 'The details that make a set last.',
    description: 'Build a dependable routine with professional prep, primers, bases and finishing products from BLOM.',
    primaryCta: { label: 'Shop prep & finish', href: '/shop?category=prep-finishing' },
    secondaryCta: { label: 'Browse all products', href: '/shop' },
    kind: 'prep',
    stamp: 'Made for lasting sets',
    image: {
      src: prepHero,
      alt: 'BLOM Prep and Primer bottles styled with white flowers and powder-blue fabric',
      position: 'center',
    },
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
    image: {
      src: academyHeroDesktop,
      mobileSrc: academyHeroMobile,
      alt: 'BLOM Academy instructor demonstrating acrylic application to a class of nail students',
      position: 'center 20%',
    },
  },
];

export const HeroSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const slide = baseSlides[current];

  useEffect(() => {
    if (isPaused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const interval = window.setInterval(() => {
      setCurrent((value) => (value + 1) % baseSlides.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [isPaused]);

  const next = () => setCurrent((value) => (value + 1) % baseSlides.length);
  const previous = () => setCurrent((value) => (value - 1 + baseSlides.length) % baseSlides.length);
  const handleTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    setIsPaused(true);
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };
  const handleTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null) {
      setIsPaused(false);
      return;
    }
    const distance = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance) >= 45) {
      if (distance < 0) next();
      else previous();
    }
    setIsPaused(false);
  };

  const StampIcon = slide.kind === 'academy'
    ? GraduationCap
    : slide.kind === 'prep'
      ? Droplets
      : slide.kind === 'acrylic'
        ? Palette
        : Sparkles;

  return (
    <section
      className={`home-hero home-hero--${slide.kind}`}
      aria-labelledby={`hero-title-${slide.id}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsPaused(false);
        }
      }}
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

        <div className="home-hero__visual" aria-label={`${slide.eyebrow} feature image`}>
          <figure className="home-hero__image">
            <picture>
              {slide.image.mobileSrc && (
                <source media="(max-width: 700px)" srcSet={slide.image.mobileSrc} />
              )}
              <img
                src={slide.image.src}
                sizes="(max-width: 700px) calc(100vw - 28px), (max-width: 980px) 70vw, 520px"
                alt={slide.image.alt}
                loading={current === 0 ? 'eager' : 'lazy'}
                fetchPriority={current === 0 ? 'high' : 'auto'}
                decoding="async"
                style={slide.image.position ? { objectPosition: slide.image.position } : undefined}
              />
            </picture>
          </figure>
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
