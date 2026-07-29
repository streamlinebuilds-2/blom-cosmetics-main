import React, { useRef } from 'react';
import { motion, useInView, type Variants } from 'framer-motion';
import { Container } from '../layout/Container';
import { Sparkles, Droplet, Palette, GraduationCap } from 'lucide-react';

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease } }
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } }
};

const categories = [
  {
    name: 'Acrylic System',
    icon: Sparkles,
    href: '/shop#acrylic-system',
    image: 'https://res.cloudinary.com/drsrbzm2t/image/upload/f_auto,q_auto,w_800,c_fill,g_auto/v1782716390/products/temp/WhatsApp_Image_2026-06-29_at_07.56.58_wocvhi.jpg',
    description: 'Professional powders and liquids',
  },
  {
    name: 'Prep & Finish',
    icon: Droplet,
    href: '/shop#prep-finishing',
    image: 'https://res.cloudinary.com/hmvetruz/image/upload/f_auto,q_auto,w_800,c_fill,g_auto/v1785147071/products/temp/RB001_neciyp.jpg',
    description: 'Prep, protection and lasting shine',
  },
  {
    name: 'Tools & Essentials',
    icon: Palette,
    href: '/shop#tools-essentials',
    image: 'https://res.cloudinary.com/hmvetruz/image/upload/f_auto,q_auto,w_800,c_fill,g_auto/v1785259213/products/temp/PetalPasteWhite_hirzoi.jpg',
    description: 'Everyday artist essentials',
  },
  {
    name: 'Education',
    icon: GraduationCap,
    href: '/courses',
    image: 'https://res.cloudinary.com/dy1gw7dr2/image/upload/f_auto,q_auto,w_800,c_fill,g_auto/v1778573976/WhatsApp_Image_2026-05-12_at_09.20.39_kercfw.jpg',
    description: 'Professional training courses',
  },
];

export const ShopByCategory: React.FC = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="home-categories">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="home-section-heading"
        >
          <p className="home-eyebrow">Explore</p>
          <h2>Find your system.</h2>
          <p>Move quickly to the products, tools and training that support your work.</p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          className="home-categories__grid"
        >
          {categories.map((category) => (
            <motion.a
              key={category.name}
              href={category.href}
              variants={cardVariant}
              className="home-category-card"
            >
              <div className="home-category-card__image">
                <img
                  src={category.image}
                  alt={category.name}
                  loading="lazy"
                />
              </div>
              <div className="home-category-card__content">
                <category.icon aria-hidden="true" />
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </Container>
    </section>
  );
};
