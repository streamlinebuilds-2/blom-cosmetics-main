import React from 'react';
import { Container } from '../layout/Container';
import { ArrowUpRight, Sparkles, Droplet, Palette, GraduationCap } from 'lucide-react';

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
  return (
    <section className="home-categories" aria-labelledby="categories-heading">
      <Container>
        <div className="home-section-heading">
          <p className="home-eyebrow">Shop by system</p>
          <h2 id="categories-heading">Everything for your next set.</h2>
          <p>Find the products, tools and training that support the way you work.</p>
        </div>

        <div className="home-categories__grid">
          {categories.map((category) => (
            <a
              key={category.name}
              href={category.href}
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
                <span className="home-category-card__arrow" aria-hidden="true">
                  <ArrowUpRight />
                </span>
              </div>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
};
