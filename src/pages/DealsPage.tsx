import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Button } from '../components/ui/Button';
import { ArrowRight, Tag, Clock, Star } from 'lucide-react';

interface SpecialDeal {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  link: string;
  badge: string;
  badgeColor: string;
  price: string;
  originalPrice?: string;
  discount?: string;
}

export const DealsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [specials, setSpecials] = useState<SpecialDeal[]>([]);

  useEffect(() => {
    document.title = 'Deals & Specials - BLOM Cosmetics';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Discover amazing deals and special offers on professional nail care products, tools, and salon furniture at BLOM Cosmetics.');
    }
    window.scrollTo({ top: 0 });

    // Load specials
    loadSpecials().then(setSpecials).catch(console.error);

    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const loadSpecials = async (): Promise<SpecialDeal[]> => {
    try {
      // Try to load from static imports first
      const specialsModule = await import('../../content/specials/featured-deals.json');
      return specialsModule.default || [];
    } catch (error) {
      console.warn('Could not load specials from static imports, trying fetch:', error);
      
      // Fallback to fetch if static imports fail
      try {
        const response = await fetch('/content/specials/featured-deals.json');
        if (response.ok) {
          return await response.json();
        }
        return [];
      } catch (fetchError) {
        console.error('Failed to load specials:', fetchError);
        return [];
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-blue-100">
        <Header showMobileMenu={true} />
        <main className="pt-20">
          <Container>
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400"></div>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-blue-100">
      <Header showMobileMenu={true} />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16">
          <Container>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Amazing <span className="text-pink-400">Deals</span> & Specials
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Discover incredible savings on professional nail care products, tools, and salon furniture. 
                Limited time offers you won't want to miss!
              </p>
            </div>
          </Container>
        </section>

        {/* Specials Grid */}
        <section className="pb-20">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {specials.map((deal) => (
                <div
                  key={deal.id}
                  className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={deal.image}
                      alt={deal.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold text-white ${deal.badgeColor}`}>
                        {deal.badge}
                      </span>
                    </div>

                    {/* Discount Badge */}
                    {deal.discount && (
                      <div className="absolute top-4 right-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold text-white bg-red-500">
                          {deal.discount}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-pink-400 transition-colors">
                        {deal.title}
                      </h3>
                      <p className="text-lg text-pink-400 font-semibold mb-3">
                        {deal.subtitle}
                      </p>
                      <p className="text-gray-600 leading-relaxed">
                        {deal.description}
                      </p>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-3xl font-bold text-gray-900">
                        {deal.price}
                      </span>
                      {deal.originalPrice && (
                        <span className="text-xl text-gray-400 line-through">
                          {deal.originalPrice}
                        </span>
                      )}
                    </div>

                    {/* CTA Button */}
                    <Button
                      className="w-full group-hover:bg-pink-500 group-hover:text-white transition-all duration-300"
                      onClick={() => {
                        window.location.href = deal.link;
                      }}
                    >
                      Shop Now
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Call to Action */}
            <div className="text-center mt-16">
              <div className="bg-white rounded-3xl shadow-lg p-8 max-w-2xl mx-auto">
                <Tag className="h-12 w-12 text-pink-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Don't Miss Out!
                </h2>
                <p className="text-gray-600 mb-6">
                  These deals are available for a limited time only. Shop now to secure your savings 
                  on professional nail care products and salon equipment.
                </p>
                <Button
                  size="lg"
                  onClick={() => {
                    window.location.href = '/shop';
                  }}
                >
                  View All Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
};
