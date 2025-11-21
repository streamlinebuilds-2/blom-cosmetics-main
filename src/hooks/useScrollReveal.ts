import { useEffect, useRef, useState } from 'react';

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  delay?: number;
  triggerOnce?: boolean;
}

export const useScrollReveal = (options: UseScrollRevealOptions = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    delay = 0,
    triggerOnce = true
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Skip animation if triggerOnce is true and has already animated
    if (triggerOnce && hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Add delay before setting visible
          const timeoutId = setTimeout(() => {
            setIsVisible(true);
            if (triggerOnce) {
              setHasAnimated(true);
            }
          }, delay);

          observer.unobserve(entry.target);
          return () => clearTimeout(timeoutId);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, delay, triggerOnce, hasAnimated]);

  // Reset animation state when props change
  useEffect(() => {
    if (!triggerOnce) {
      setIsVisible(false);
    }
  }, [triggerOnce, options.delay]);

  return {
    ref: elementRef,
    isVisible,
    shouldShow: isVisible || (!triggerOnce && !hasAnimated)
  };
};

// Hook for staggered animations
export const useStaggerReveal = (itemCount: number, options: UseScrollRevealOptions = {}) => {
  const items = Array.from({ length: itemCount }, (_, index) => {
    const delay = options.delay ? options.delay + (index * 100) : index * 100;
    return useScrollReveal({ ...options, delay });
  });

  return items;
};

// Hook for fade up animation
export const useFadeUp = (options: UseScrollRevealOptions = {}) => {
  const { ref, isVisible } = useScrollReveal(options);

  const className = `transition-all duration-600 ease-out ${
    isVisible 
      ? 'opacity-100 translate-y-0' 
      : 'opacity-0 translate-y-8'
  }`;

  return { ref, className, isVisible };
};

// Hook for scale animation
export const useScaleIn = (options: UseScrollRevealOptions = {}) => {
  const { ref, isVisible } = useScrollReveal(options);

  const className = `transition-all duration-500 ease-out ${
    isVisible 
      ? 'opacity-100 scale-100' 
      : 'opacity-0 scale-95'
  }`;

  return { ref, className, isVisible };
};