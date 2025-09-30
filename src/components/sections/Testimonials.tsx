import React from 'react';
import { Container } from '../layout/Container';

interface TestimonialSlide {
  id: string;
  image: string;
  alt: string;
}

const slides: TestimonialSlide[] = [
  { id: 't1', image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=480&h=853&fit=crop', alt: 'Sarah Mitchell' },
  { id: 't2', image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=480&h=853&fit=crop', alt: 'Jessica Chen' },
  { id: 't3', image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=480&h=853&fit=crop', alt: 'Michelle Adams' },
  { id: 't4', image: 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=480&h=853&fit=crop', alt: 'Pro Nail Artist' }
];

export const Testimonials: React.FC = () => {
  // Duplicate slides to make the loop seamless
  const loopSlides = [...slides, ...slides];

  return (
    <section id="testimonials" className="section-padding">
      <Container>
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-4xl font-bold mb-4">WHAT PEOPLE SAY</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Real reviews from pros & students</p>
        </div>

        <div className="testi__carousel">
          <div className="testi__viewport" tabIndex={0} aria-label="Testimonials carousel">
            <ul className="testi__track" style={{ ['--testi-duration' as any]: '40s' }}>
              {loopSlides.map((s, idx) => (
                <li className="testi__slide" key={`${s.id}_${idx}`}>
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


