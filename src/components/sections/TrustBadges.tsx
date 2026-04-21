import React from 'react';
import { motion, useInView, type Variants } from 'framer-motion';
import { Shield, Award, Heart, Leaf, Users } from 'lucide-react';
import { useRef } from 'react';

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } }
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } }
};

const badges = [
  { icon: Shield, title: '100% AUTHENTIC', description: 'Guaranteed genuine products' },
  { icon: Award, title: 'PROFESSIONAL QUALITY', description: 'Salon-grade formulas' },
  { icon: Heart, title: 'CRUELTY-FREE', description: 'Never tested on animals' },
  { icon: Leaf, title: 'HEMA-FREE', description: 'Safe & gentle formulas' },
  { icon: Users, title: 'TRUSTED BY PROS', description: 'Used by professionals nationwide' },
];

export const TrustBadges: React.FC = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section ref={ref} className="section-padding bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8"
        >
          {badges.map((badge, index) => (
            <motion.div key={index} variants={fadeUp} className="flex flex-col items-center text-center group">
              <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-pink-100 group-hover:scale-105 transition-all duration-300">
                <badge.icon className="h-6 w-6 text-pink-500" />
              </div>
              <h3 className="font-bold text-xs mb-1 text-gray-900 tracking-wide">{badge.title}</h3>
              <p className="text-xs text-gray-400">{badge.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
