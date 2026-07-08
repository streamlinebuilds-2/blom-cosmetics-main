import React from 'react';
import { Container } from '../layout/Container';
import { StockistMap } from './StockistMap';
import { StockistCard } from './StockistCard';
import { stockists } from '../../data/stockists';

export const StockistLocator: React.FC = () => {
  const mainStore = stockists.find((s) => s.kind === 'main');
  const distributors = stockists.filter((s) => s.kind === 'distributor');

  return (
    <section id="stockists" className="section-padding bg-gray-50">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="heading-with-stripe">Find Us</h2>
          <p className="text-gray-600">
            Visit our main store or one of our trusted stockists across South Africa.
          </p>
        </div>

        <StockistMap className="mb-10" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mainStore && <StockistCard stockist={mainStore} />}
          {distributors.map((distributor) => (
            <StockistCard key={distributor.id} stockist={distributor} />
          ))}
        </div>
      </Container>
    </section>
  );
};
