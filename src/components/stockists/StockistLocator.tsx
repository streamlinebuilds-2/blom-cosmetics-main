import React, { useState } from 'react';
import { Container } from '../layout/Container';
import { StockistMap } from './StockistMap';
import { StockistCard } from './StockistCard';
import { stockists } from '../../data/stockists';

export const StockistLocator: React.FC = () => {
  const mainStore = stockists.find((s) => s.kind === 'main');
  const distributors = stockists.filter((s) => s.kind === 'distributor');
  const [selectedId, setSelectedId] = useState(mainStore?.id ?? stockists[0].id);
  const selected = stockists.find((s) => s.id === selectedId) ?? stockists[0];

  return (
    <section id="stockists" className="section-padding bg-gray-50">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="heading-with-stripe">Find Us</h2>
          <p className="text-gray-600">
            Visit our main store or one of our trusted distributors across South Africa.
          </p>
        </div>

        <div className="max-w-sm mx-auto mb-8">
          <label htmlFor="stockist-select" className="block text-sm font-medium text-gray-700 mb-2">
            Choose a location
          </label>
          <select
            id="stockist-select"
            className="input-field bg-white cursor-pointer"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {mainStore && (
              <option value={mainStore.id}>
                {mainStore.name} - {mainStore.town}
              </option>
            )}
            <optgroup label="Distributors">
              {distributors.map((distributor) => (
                <option key={distributor.id} value={distributor.id}>
                  {distributor.name} - {distributor.town}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        <div className="grid lg:grid-cols-5 gap-6 items-start">
          <StockistMap className="lg:col-span-3" selectedId={selectedId} onSelectId={setSelectedId} />
          <div className="lg:col-span-2">
            <StockistCard stockist={selected} />
          </div>
        </div>
      </Container>
    </section>
  );
};
