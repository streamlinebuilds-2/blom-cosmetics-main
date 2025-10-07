import React, { useEffect, useRef } from 'react';
import { Shield, Award, Heart, Leaf, Users } from 'lucide-react';

export const TrustBadges: React.FC = () => {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) el.classList.add('reveal-on-scroll');
        else el.classList.remove('reveal-on-scroll');
      });
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const badges = [
    {
      icon: Shield,
      title: '100% AUTHENTIC',
      description: 'Guaranteed genuine products'
    },
    {
      icon: Award,
      title: 'PROFESSIONAL QUALITY',
      description: 'Salon-grade formulas'
    },
    {
      icon: Heart,
      title: 'CRUELTY-FREE',
      description: 'Never tested on animals'
    },
    {
      icon: Leaf,
      title: 'HEMA-FREE',
      description: 'Safe & gentle formulas'
    },
    {
      icon: Users,
      title: 'TRUSTED BY PROS',
      description: 'Used by professionals nationwide'
    }
  ];

  return (
    <section ref={ref} className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
          {badges.map((badge, index) => (
            <div key={index} className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-pink-200 transition-colors">
                <badge.icon className="h-8 w-8 text-pink-500" />
              </div>
              <h3 className="font-bold text-sm mb-1 text-gray-900">{badge.title}</h3>
              <p className="text-xs text-gray-600">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
