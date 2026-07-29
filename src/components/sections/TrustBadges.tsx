import React from 'react';
import { Award, Heart, ShieldCheck, Truck } from 'lucide-react';

const proofPoints = [
  {
    icon: ShieldCheck,
    title: 'HEMA-free formulas',
    description: 'Considered products for professional services',
  },
  {
    icon: Award,
    title: 'Professional quality',
    description: 'Developed for consistent salon results',
  },
  {
    icon: Truck,
    title: 'Nationwide delivery',
    description: 'Reliable shipping across South Africa',
  },
  {
    icon: Heart,
    title: 'Artist-led education',
    description: 'Practical training by working professionals',
  },
];

export const TrustBadges: React.FC = () => (
  <section className="home-proof" aria-label="Why professionals choose BLOM">
    <div className="home-shell home-proof__grid">
      {proofPoints.map(({ icon: Icon, title, description }) => (
        <article className="home-proof__item" key={title}>
          <Icon aria-hidden="true" />
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        </article>
      ))}
    </div>
  </section>
);
